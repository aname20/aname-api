import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserRole } from '@prisma/client';
import { UserEntity } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should create a user and return access token', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
        role: UserRole.FAMILY,
      };

      const userEntity: UserEntity = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.FAMILY,
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const accessToken = 'jwt_token';

      mockUsersService.create.mockResolvedValue(userEntity);
      mockJwtService.sign.mockReturnValue(accessToken);

      const result = await service.signup(createUserDto);

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: userEntity.email,
        sub: userEntity.id,
        role: userEntity.role,
      });
      expect(result).toEqual({
        accessToken,
        user: userEntity,
      });
    });

    it('should propagate error if usersService.create fails', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
        role: UserRole.FAMILY,
      };

      const error = new Error('Some error');
      mockUsersService.create.mockRejectedValue(error);

      await expect(service.signup(createUserDto)).rejects.toThrow(error);
    });

    it('should correctly generate token payload for different user roles', async () => {
      const roles = [UserRole.CAREGIVER, UserRole.FAMILY];

      for (const role of roles) {
        const createUserDto: CreateUserDto = {
          email: `test_${role}@example.com`,
          name: 'Test User',
          password: 'password',
          role: role,
        };

        const userEntity: UserEntity = {
          id: '1',
          email: createUserDto.email,
          name: createUserDto.name,
          role: role,
          phone: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockUsersService.create.mockResolvedValue(userEntity);
        mockJwtService.sign.mockReturnValue('token');

        await service.signup(createUserDto);

        expect(jwtService.sign).toHaveBeenCalledWith({
          email: userEntity.email,
          sub: userEntity.id,
          role: userEntity.role,
        });
      }
    });

    it('should pass optional fields to usersService', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
        role: UserRole.FAMILY,
        phone: '1234567890',
      };

      const userEntity: UserEntity = {
        id: '1',
        ...createUserDto,
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.create.mockResolvedValue(userEntity);
      mockJwtService.sign.mockReturnValue('token');

      await service.signup(createUserDto);

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should propagate error if jwtService.sign fails', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
        role: UserRole.FAMILY,
      };

      const userEntity: UserEntity = {
        id: '1',
        ...createUserDto,
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const error = new Error('JWT Error');
      mockUsersService.create.mockResolvedValue(userEntity);
      mockJwtService.sign.mockImplementation(() => {
        throw error;
      });

      await expect(service.signup(createUserDto)).rejects.toThrow(error);
    });

    it('should propagate ConflictException when email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        name: 'Test User',
        password: 'password',
        role: UserRole.FAMILY,
      };

      const conflictError = new Error('Email already exists');
      conflictError.name = 'ConflictException';
      mockUsersService.create.mockRejectedValue(conflictError);

      await expect(service.signup(createUserDto)).rejects.toThrow(conflictError);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle user with special characters in name', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: "O'Brien-Smith (José)",
        password: 'password123',
        role: UserRole.CAREGIVER,
      };

      const userEntity: UserEntity = {
        id: '1',
        email: createUserDto.email,
        name: createUserDto.name,
        role: UserRole.CAREGIVER,
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.create.mockResolvedValue(userEntity);
      mockJwtService.sign.mockReturnValue('token');

      const result = await service.signup(createUserDto);

      expect(result.user.name).toBe("O'Brien-Smith (José)");
    });

    it('should handle very long but valid email addresses', async () => {
      const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com';
      const createUserDto: CreateUserDto = {
        email: longEmail,
        name: 'Test User',
        password: 'password',
        role: UserRole.FAMILY,
      };

      const userEntity: UserEntity = {
        id: '1',
        email: longEmail,
        name: 'Test User',
        role: UserRole.FAMILY,
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.create.mockResolvedValue(userEntity);
      mockJwtService.sign.mockReturnValue('token');

      const result = await service.signup(createUserDto);

      expect(result.user.email).toBe(longEmail);
    });

    it('should ensure password is not exposed in returned user entity', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'secretPassword123',
        role: UserRole.FAMILY,
      };

      const userEntity: UserEntity = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.FAMILY,
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.create.mockResolvedValue(userEntity);
      mockJwtService.sign.mockReturnValue('token');

      const result = await service.signup(createUserDto);

      expect(result.user).not.toHaveProperty('password');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should handle minimum password length (6 characters)', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: '123456',
        role: UserRole.FAMILY,
      };

      const userEntity: UserEntity = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.FAMILY,
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.create.mockResolvedValue(userEntity);
      mockJwtService.sign.mockReturnValue('token');

      const result = await service.signup(createUserDto);

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result.accessToken).toBeDefined();
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const userFromDb = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        role: UserRole.FAMILY,
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const userEntity: UserEntity = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.FAMILY,
        phone: null,
        createdAt: userFromDb.createdAt,
        updatedAt: userFromDb.updatedAt,
      };

      mockUsersService.findByEmail = jest.fn().mockResolvedValue(userFromDb);
      const bcryptCompare = jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt_token');

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcryptCompare).toHaveBeenCalledWith(loginDto.password, userFromDb.password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: userEntity.email,
        sub: userEntity.id,
        role: userEntity.role,
      });
      expect(result.accessToken).toBe('jwt_token');
      expect(result.user.email).toBe(userEntity.email);
      expect(result.user).not.toHaveProperty('password');

      bcryptCompare.mockRestore();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUsersService.findByEmail = jest.fn().mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };

      const userFromDb = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        role: UserRole.FAMILY,
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findByEmail = jest.fn().mockResolvedValue(userFromDb);
      const bcryptCompare = jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcryptCompare).toHaveBeenCalledWith(loginDto.password, userFromDb.password);

      bcryptCompare.mockRestore();
    });

    it('should handle login for different user roles', async () => {
      const roles = [UserRole.CAREGIVER, UserRole.FAMILY];

      for (const role of roles) {
        const loginDto = {
          email: `test_${role}@example.com`,
          password: 'password123',
        };

        const userFromDb = {
          id: '1',
          email: loginDto.email,
          name: 'Test User',
          password: 'hashedPassword',
          role: role,
          phone: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockUsersService.findByEmail = jest.fn().mockResolvedValue(userFromDb);
        const bcryptCompare = jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);
        mockJwtService.sign.mockReturnValue('token');

        const result = await service.login(loginDto);

        expect(result.user.role).toBe(role);
        expect(jwtService.sign).toHaveBeenCalledWith({
          email: userFromDb.email,
          sub: userFromDb.id,
          role: role,
        });

        bcryptCompare.mockRestore();
      }
    });

    it('should ensure password is not exposed in login response', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const userFromDb = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        role: UserRole.FAMILY,
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findByEmail = jest.fn().mockResolvedValue(userFromDb);
      const bcryptCompare = jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('token');

      const result = await service.login(loginDto);

      expect(result.user.password).toBeUndefined();

      bcryptCompare.mockRestore();
    });
  });
});
