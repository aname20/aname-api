import { Injectable } from '@nestjs/common';
import { UploadParams } from 'src/auth/interfaces/uploader';
import { ConfigService } from '@nestjs/config';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import axios from 'axios';

@Injectable()
export class StorageService {
  private client: S3Client;

  constructor(private configService: ConfigService) {
    const accountId = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID');
    const bucketName = this.configService.get<string>(
      'AWS_BUCKET_NAME',
    ) as string;

    this.client = new S3Client({
      endpoint: `https://${accountId}.r2.cloudflarestorage.com/${bucketName}`,
      region: 'auto',
      credentials: {
        accessKeyId: this.configService.get<string>(
          'AWS_ACCESS_KEY_ID',
        ) as string,
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ) as string,
      },
    });
  }

  async upload({ fileName, fileType, body, size }: UploadParams): Promise<{
    key: string;
    url: string;
    size: number;
    fileType: string;
    fileName: string;
  }> {
    const uploadId = randomUUID();

    const uniqueFileName = `${uploadId}-${fileName}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
        Key: uniqueFileName,
        ContentType: fileType,
        Body: body,
      }),
    );

    return {
      key: uniqueFileName,
      url: await this.getSignedImageUrlByPath(uniqueFileName),
      size,
      fileType,
      fileName,
    };
  }

  async getSignedImageUrl(fileUrl: string): Promise<string> {
    const unsignedUrl = fileUrl.split('?')[0];

    const parts = unsignedUrl.split('/');

    const path = parts.pop();

    if (!path) {
      return '';
    }

    return this.getSignedImageUrlByPath(path);
  }

  getSignedImageUrlByPath(path: string): Promise<string> {
    const bucketName = this.configService.get<string>('AWS_BUCKET_NAME');

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: path,
    });

    return getSignedUrl(this.client, command, { expiresIn: 3600 });
  }

  async downloadAndUploadImage(url: string): Promise<{ url: string }> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    const mimeType = response.headers['content-type'];

    const uploadedFileKey = await this.upload({
      fileType: mimeType,
      fileName: 'image.jpg',
      body: response.data,
      size: response.data.length,
    });

    const signedUrl = await this.getSignedImageUrlByPath(uploadedFileKey.key);

    return {
      url: signedUrl,
    };
  }
}
