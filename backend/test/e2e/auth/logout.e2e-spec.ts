import * as request from 'supertest';
import { app } from '../../setup';
import { registerUser, loginAs, getAuthHeaders } from '../../helpers/auth.helper';
import { TestFactory } from '../../helpers/factory.helper';

describe('Auth - Logout (e2e)', () => {
  describe('POST /auth/logout', () => {
    it('deve fazer logout com token válido', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: `logout-valid-${Date.now()}@example.com`,
      });
      const loginResponse = await loginAs(app, userData.email, userData.password);
      const accessToken = loginResponse.accessToken;

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set(await getAuthHeaders(accessToken));

      // Assert - Logout retorna 204 (No Content) ou 200 dependendo da implementação
      expect([200, 204]).toContain(response.status);
    });

    it('deve invalidar refresh token após logout', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: `logout-refresh-${Date.now()}@example.com`,
      });
      const loginResponse = await loginAs(app, userData.email, userData.password);
      const accessToken = loginResponse.accessToken;
      const refreshToken = loginResponse.refreshToken;

      // Act - fazer logout
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set(await getAuthHeaders(accessToken));

      // Tentar usar o refresh token após logout (deve falhar)
      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken });

      // Assert
      expect(refreshResponse.status).toBe(401);
    });

    it('deve falhar logout sem token', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/logout');

      // Assert
      expect(response.status).toBe(401);
    });

    it('deve falhar logout com token inválido', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer token-invalido-12345');

      // Assert
      expect(response.status).toBe(401);
    });

    it('deve falhar logout com token expirado', async () => {
      // Arrange - usar um token JWT inválido/expirado
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${expiredToken}`);

      // Assert
      expect(response.status).toBe(401);
    });
  });
});

