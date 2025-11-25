import { UserRole } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  password?: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
