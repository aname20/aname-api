import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from '@prisma/client';

const mockUsersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        role: UserRole.FAMILY,
      };
      const result = { id: 'uuid', ...dto };

      mockUsersService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = [{ id: 'uuid', name: 'Test User' }];
      mockUsersService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const result = { id: 'uuid', name: 'Test User' };
      mockUsersService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('uuid')).toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith('uuid');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const dto = { name: 'Updated Name' };
      const result = { id: 'uuid', name: 'Updated Name' };
      mockUsersService.update.mockResolvedValue(result);

      expect(await controller.update('uuid', dto)).toEqual(result);
      expect(service.update).toHaveBeenCalledWith('uuid', dto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const result = { id: 'uuid', name: 'Test User' };
      mockUsersService.remove.mockResolvedValue(result);

      expect(await controller.remove('uuid')).toEqual(result);
      expect(service.remove).toHaveBeenCalledWith('uuid');
    });
  });
});
