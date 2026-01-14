import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';

describe('TasksService', () => {
  let service: TasksService;
  let createMock: jest.Mock;
  let saveMock: jest.Mock;

  beforeEach(async () => {
    createMock = jest.fn();
    saveMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            create: createMock,
            save: saveMock,
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    createMock.mockReset();
    saveMock.mockReset();
  });

  it('creates and saves a task', async () => {
    const payload = {
      title: 'Buy milk',
      description: '2% if possible',
      isCompleted: false,
    };
    createMock.mockImplementation((data) => data);
    saveMock.mockImplementation(async (data) => ({ id: 1, ...data }));

    const result = await service.create(payload);

    expect(createMock).toHaveBeenCalledWith(payload);
    expect(saveMock).toHaveBeenCalledWith(payload);
    expect(result).toMatchObject({ id: 1, ...payload });
  });
});
