import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;
  let createSpy: jest.Mock;

  beforeEach(async () => {
    createSpy = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: {
            create: createSpy,
          },
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    createSpy.mockReset();
  });

  it('should create a task via the service', async () => {
    const dto: CreateTaskDto = {
      title: 'My Test Task Title',
      description: 'My Test Task Description',
      isCompleted: false,
    };
    const expected = {
      id: 1,
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    createSpy.mockResolvedValue(expected);
    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });
});
