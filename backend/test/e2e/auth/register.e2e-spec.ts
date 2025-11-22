import * as request from 'supertest';
import { app } from '../../setup';
import { registerUser } from '../../helpers/auth.helper';
import { TestFactory } from '../../helpers/factory.helper';
import { UserRole } from '../../../src/modules/users/entities/user.entity';

describe('Auth - Register (e2e)', () => {
  describe('POST /auth/register', () => {
    it('deve registrar usuário com dados válidos - DOADOR', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: `doador-${Date.now()}@example.com`,
        role: UserRole.DOADOR,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.role).toBe(UserRole.DOADOR);
      // Verificar que senha não está exposta (pode estar como [REDACTED] ou não estar presente)
      expect(response.body.user.password).not.toBe(userData.password);
    });

    it('deve registrar usuário com dados válidos - BENEFICIARIO', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: `beneficiario-${Date.now()}@example.com`,
        role: UserRole.BENEFICIARIO,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.user.role).toBe(UserRole.BENEFICIARIO);
    });

    it('deve usar DOADOR como role padrão quando não especificado', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: `default-role-${Date.now()}@example.com`,
      });
      // Criar objeto sem role para testar padrão
      const { role, ...userDataWithoutRole } = userData;

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userDataWithoutRole);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.user.role).toBe(UserRole.DOADOR);
    });

    it('deve falhar ao registrar com email duplicado', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: `duplicate-${Date.now()}@example.com`,
      });
      await registerUser(app, userData);

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData);

      // Assert
      expect(response.status).toBe(409);
      expect(response.body.message.toLowerCase()).toContain('email');
    });

    it('deve falhar ao registrar com email inválido', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: 'email-invalido',
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('deve falhar ao registrar com senha muito curta', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: `short-password-${Date.now()}@example.com`,
        password: '12345', // Menos de 6 caracteres
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('deve falhar ao registrar sem nome', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: `no-name-${Date.now()}@example.com`,
      });
      const { name, ...userDataWithoutName } = userData;

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userDataWithoutName);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('deve falhar ao registrar sem email', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: `no-email-${Date.now()}@example.com`,
      });
      const { email, ...userDataWithoutEmail } = userData;

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userDataWithoutEmail);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('deve falhar ao registrar sem senha', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: `no-password-${Date.now()}@example.com`,
      });
      const { password, ...userDataWithoutPassword } = userData;

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userDataWithoutPassword);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });
});

