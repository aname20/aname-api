import { Test, TestingModule } from '@nestjs/testing';
import { DependentsController } from './dependents.controller';
import { DependentsService } from './dependents.service';

describe('DependentsController', () => {
  let controller: DependentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DependentsController],
      providers: [DependentsService],
    }).compile();

    controller = module.get<DependentsController>(DependentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
