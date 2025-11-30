import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

const mockPrismaService = {
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const dto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        role: UserRole.FAMILY,
      };

      const resultUser = {
        id: 'uuid',
        ...dto,
        password: 'hashedPassword',
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(resultUser);

      const result = await service.create(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { ...dto, password: 'hashedPassword' },
      });
      expect(result.id).toEqual('uuid');
      expect(result.email).toEqual(dto.email);
    });

    it('should throw ConflictException if user already exists', async () => {
      const dto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        role: UserRole.FAMILY,
      };

      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const resultUsers = [
        {
          id: 'uuid',
          email: 'test@example.com',
          name: 'Test User',
          password: 'hashedPassword',
          role: UserRole.FAMILY,
          phone: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(resultUsers);

      const result = await service.findAll();

      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toEqual('uuid');
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const resultUser = {
        id: 'uuid',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        role: UserRole.FAMILY,
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(resultUser);

      const result = await service.findOne('uuid');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid' },
      });
      expect(result).toBeDefined();
      expect(result?.id).toEqual('uuid');
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findOne('uuid');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const dto = { name: 'Updated Name' };
      const resultUser = {
        id: 'uuid',
        email: 'test@example.com',
        name: 'Updated Name',
        password: 'hashedPassword',
        role: UserRole.FAMILY,
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(resultUser);

      const result = await service.update('uuid', dto);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'uuid' },
        data: dto,
      });
      expect(result.name).toEqual('Updated Name');
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const resultUser = {
        id: 'uuid',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        role: UserRole.FAMILY,
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.delete.mockResolvedValue(resultUser);

      const result = await service.remove('uuid');

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'uuid' },
      });
      expect(result.id).toEqual('uuid');
    });
  });
});
