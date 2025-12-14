import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

describe('Users (e2e)', () => {
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
    await dataSource.query('DELETE FROM users');
  });

  describe('POST /users', () => {
    it('should create a user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: 'testuser', password: 'password123' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('testuser');
        });
    });

    it('should return 400 for duplicate username', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'testuser', password: 'password123' })
        .expect(201);

      return request(app.getHttpServer())
        .post('/users')
        .send({ name: 'testuser', password: 'password456' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain(
            'User with this name already exists',
          );
        });
    });

    it('should return 400 for empty name', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: '', password: 'password123' })
        .expect(400);
    });

    it('should return 400 for short password', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: 'testuser', password: '12345' })
        .expect(400);
    });
  });
});
