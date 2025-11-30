import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserRole } from '@prisma/client';
import { UserEntity } from '../users/entities/user.entity';
import { AuthResponseDto } from './dto/auth-response.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    signup: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should call authService.signup and return AuthResponseDto', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        role: UserRole.FAMILY,
      };

      const userEntity = new UserEntity({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.FAMILY,
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const expectedResponse = new AuthResponseDto('jwt_token', userEntity);

      mockAuthService.signup.mockResolvedValue(expectedResponse);

      const result = await controller.signup(createUserDto);

      expect(service.signup).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResponse);
      expect(result.user.password).toBeUndefined();
    });
  });
});
