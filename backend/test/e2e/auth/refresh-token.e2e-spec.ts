import * as request from 'supertest';
import { app } from '../../setup';
import { registerUser, loginAs } from '../../helpers/auth.helper';
import { TestFactory } from '../../helpers/factory.helper';

describe('Auth - Refresh Token (e2e)', () => {
  describe('POST /auth/refresh', () => {
    it('deve renovar token com refresh token válido', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: `refresh-valid-${Date.now()}@example.com`,
      });
      const registeredUser = await registerUser(app, userData);
      const originalRefreshToken = registeredUser.refreshToken;

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: originalRefreshToken,
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      // O novo refresh token deve ser diferente do original
      expect(response.body.refreshToken).not.toBe(originalRefreshToken);
    });

    it('deve retornar novos tokens diferentes após refresh', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: `refresh-new-tokens-${Date.now()}@example.com`,
      });
      await registerUser(app, userData);
      const loginResponse = await loginAs(app, userData.email, userData.password);
      const originalAccessToken = loginResponse.accessToken;
      const originalRefreshToken = loginResponse.refreshToken;

      // Act
      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: originalRefreshToken,
        });

      // Assert
      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body.accessToken).not.toBe(originalAccessToken);
      expect(refreshResponse.body.refreshToken).not.toBe(originalRefreshToken);
    });

    it('deve falhar com refresh token inválido', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: 'token-invalido-12345',
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.message).toContain('inválido');
    });

    it('deve falhar com refresh token expirado/inválido', async () => {
      // Arrange - usar um token JWT inválido que simula um token expirado
      // (não é um refresh token válido do sistema, então será rejeitado)
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: 'token-invalido-expirado-12345',
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.message).toBeDefined();
    });

    it('deve falhar sem refresh token', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({});

      // Assert
      expect(response.status).toBe(400);
    });

    it('deve invalidar refresh token após uso (rotação de tokens)', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: `refresh-rotation-${Date.now()}@example.com`,
      });
      const loginResponse = await loginAs(app, userData.email, userData.password);
      const refreshToken = loginResponse.refreshToken;

      // Act - usar o refresh token pela primeira vez
      const firstRefresh = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken });

      expect(firstRefresh.status).toBe(200);

      // Tentar usar o mesmo refresh token novamente (deve falhar)
      const secondRefresh = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken });

      // Assert
      expect(secondRefresh.status).toBe(401);
      expect(secondRefresh.body.message).toContain('inválido');
    });
  });
});

