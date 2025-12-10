import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = moduleFixture.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
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
