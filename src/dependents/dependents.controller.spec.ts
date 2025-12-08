import { Test, TestingModule } from '@nestjs/testing';
import { DependentsController } from './dependents.controller';
import { DependentsService } from './dependents.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DependentsController', () => {
  let controller: DependentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DependentsController],
      providers: [
        DependentsService,
        {
          provide: PrismaService,
          useValue: {
            dependent: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            $transaction: jest.fn((callback) => callback(this)),
          },
        },
      ],
    }).compile();

    controller = module.get<DependentsController>(DependentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
