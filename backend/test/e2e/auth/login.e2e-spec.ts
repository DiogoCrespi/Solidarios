import * as request from 'supertest';
import { app } from '../../setup';
import { registerUser, loginAs } from '../../helpers/auth.helper';
import { TestFactory } from '../../helpers/factory.helper';
import { UserRole } from '../../../src/modules/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { User } from '../../../src/modules/users/entities/user.entity';
import { dataSource } from '../../setup';

describe('Auth - Login (e2e)', () => {
  describe('POST /auth/login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: `login-test-${Date.now()}@example.com`,
        password: 'Test123!@#',
      });
      await registerUser(app, userData);

      // Pequeno delay para garantir que o usuário foi salvo no banco
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Act
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        });

      // Assert
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('accessToken');
      expect(loginResponse.body).toHaveProperty('refreshToken');
      expect(loginResponse.body).toHaveProperty('user');
      expect(loginResponse.body.accessToken).toBeDefined();
      expect(loginResponse.body.refreshToken).toBeDefined();
      expect(typeof loginResponse.body.accessToken).toBe('string');
      expect(typeof loginResponse.body.refreshToken).toBe('string');
    });

    it('deve retornar token JWT válido no login', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: `jwt-test-${Date.now()}@example.com`,
      });
      await registerUser(app, userData);

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        });

      // Assert
      expect(response.status).toBe(200);
      const token = response.body.accessToken;
      expect(token).toBeDefined();
      // JWT tem 3 partes separadas por ponto
      expect(token.split('.').length).toBe(3);
    });

    it('deve retornar refresh token no login', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: `refresh-test-${Date.now()}@example.com`,
      });
      await registerUser(app, userData);

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.refreshToken).toBeDefined();
      expect(typeof response.body.refreshToken).toBe('string');
    });

    it('deve falhar com email inexistente', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: `inexistente-${Date.now()}@example.com`,
          password: 'Test123!@#',
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Credenciais');
    });

    it('deve falhar com senha incorreta', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: `wrong-password-${Date.now()}@example.com`,
      });
      await registerUser(app, userData);

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userData.email,
          password: 'WrongPassword123!',
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Credenciais');
    });

    it('deve falhar com usuário inativo', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: `inactive-${Date.now()}@example.com`,
      });
      const registeredUser = await registerUser(app, userData);

      // Desativar usuário
      const userRepository = dataSource.getRepository(User);
      await userRepository.update(
        { id: registeredUser.user.id },
        { isActive: false },
      );

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        });

      // Assert
      expect(response.status).toBe(401);
    });

    it('deve falhar com email vazio', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: '',
          password: 'Test123!@#',
        });

      // Assert
      expect(response.status).toBe(400);
    });

    it('deve falhar com senha vazia', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: `empty-password-${Date.now()}@example.com`,
      });
      await registerUser(app, userData);

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userData.email,
          password: '',
        });

      // Assert
      expect(response.status).toBe(400);
    });
  });
});

