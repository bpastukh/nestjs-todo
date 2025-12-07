import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { PasswordService } from './password.service';

describe('UsersService', () => {
  let service: UsersService;
  let passwordService: PasswordService;
  let createMock: jest.Mock;
  let saveMock: jest.Mock;

  beforeEach(async () => {
    createMock = jest.fn();
    saveMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        PasswordService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: createMock,
            save: saveMock,
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    passwordService = module.get<PasswordService>(PasswordService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    createMock.mockReset();
    saveMock.mockReset();
  });

  it('creates and saves a user', async () => {
    const payload = { name: 'alice', password: 'secret' };
    jest
      .spyOn(passwordService, 'hash')
      .mockImplementation(async () => 'hashed-password');
    createMock.mockImplementation((data) => data);
    saveMock.mockImplementation(async (data) => ({ id: 1, ...data }));

    const result = await service.create(payload);

    expect(passwordService.hash).toHaveBeenCalledWith('secret');
    expect(createMock).toHaveBeenCalledWith({
      name: 'alice',
      password: 'hashed-password',
    });
    expect(saveMock).toHaveBeenCalledWith({
      name: 'alice',
      password: 'hashed-password',
    });
    expect(result).toMatchObject({
      id: 1,
      name: 'alice',
      password: 'hashed-password',
    });
  });
});
