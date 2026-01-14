import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

describe('Tasks (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let pgContainer: StartedPostgreSqlContainer;

  beforeAll(async () => {
    pgContainer = await new PostgreSqlContainer('postgres:16-alpine').start();

    process.env.POSTGRES_HOST = pgContainer.getHost();
    process.env.POSTGRES_PORT = pgContainer.getPort().toString();
    process.env.POSTGRES_USER = pgContainer.getUsername();
    process.env.POSTGRES_PASSWORD = pgContainer.getPassword();
    process.env.POSTGRES_DB = pgContainer.getDatabase();

    const { AppModule } = await import('../src/app.module');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get(DataSource);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (pgContainer) {
      await pgContainer.stop();
    }
  });

  beforeEach(async () => {
    await dataSource.query('DELETE FROM tasks');
  });

  describe('POST /tasks', () => {
    const createCases = [
      {
        name: 'with full payload',
        payload: {
          title: 'Write tests',
          description: 'Add coverage for create task',
          isCompleted: false,
        },
        expectedIsCompleted: false,
        expectedDescription: 'Add coverage for create task',
      },
      {
        name: 'without description',
        payload: { title: 'No description', isCompleted: true },
        expectedIsCompleted: true,
        expectedDescription: null,
      },
      {
        name: 'without isCompleted',
        payload: { title: 'Default completion', description: 'Check default' },
        expectedIsCompleted: false,
        expectedDescription: 'Check default',
      },
    ];

    it.each(createCases)(
      'should create a task ($name)',
      ({ payload, expectedIsCompleted, expectedDescription }) => {
        return request(app.getHttpServer())
          .post('/tasks')
          .send(payload)
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('id');
            expect(res.body.title).toBe(payload.title);
            expect(res.body.isCompleted).toBe(expectedIsCompleted);
            expect(res.body.description).toBe(expectedDescription);
          });
      },
    );

    it('should return 400 for empty title', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({ title: '' })
        .expect(400);
    });
  });
});
