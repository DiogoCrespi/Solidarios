import * as request from 'supertest';
import { app } from '../../setup';
import { registerUser, loginAs, getAuthHeaders } from '../../helpers/auth.helper';
import { TestFactory } from '../../helpers/factory.helper';

describe('Auth - Middleware (e2e)', () => {
  describe('Middleware de Autenticação', () => {
    it('deve permitir acesso a rotas públicas sem token', async () => {
      const userData = TestFactory.createUser({
        email: `public-route-${Date.now()}@example.com`,
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
    });

    it('deve bloquear acesso a rotas protegidas sem token', async () => {
      const response = await request(app.getHttpServer())
        .get('/users');

      expect(response.status).toBe(401);
    });

    it('deve bloquear acesso a rotas protegidas com token inválido', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', 'Bearer token-invalido');

      expect(response.status).toBe(401);
    });

    it('deve bloquear acesso a rotas protegidas com token malformado', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', 'Bearer invalid.format.token');

      expect(response.status).toBe(401);
    });

    it('deve bloquear acesso a rotas protegidas sem prefixo Bearer', async () => {
      const userData = TestFactory.createUser({
        email: `no-bearer-${Date.now()}@example.com`,
      });
      const loginResponse = await loginAs(app, userData.email, userData.password);

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', loginResponse.accessToken);

      expect(response.status).toBe(401);
    });

    it('deve permitir acesso a rotas protegidas com token válido', async () => {
      const userData = TestFactory.createUser({
        email: `valid-token-${Date.now()}@example.com`,
        role: 'ADMIN' as any,
      });
      await registerUser(app, userData);
      const loginResponse = await loginAs(app, userData.email, userData.password);

      const response = await request(app.getHttpServer())
        .get('/users')
        .set(await getAuthHeaders(loginResponse.accessToken));

      expect(response.status).toBe(200);
    });

    it('deve bloquear acesso com token expirado', async () => {
      // Usar um token JWT expirado (simulado)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });

    it('deve validar formato correto do header Authorization', async () => {
      const userData = TestFactory.createUser({
        email: `header-format-${Date.now()}@example.com`,
      });
      const loginResponse = await loginAs(app, userData.email, userData.password);

      // Formato correto: Bearer <token>
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${loginResponse.accessToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Validação de Token JWT', () => {
    it('deve extrair informações do usuário do token JWT', async () => {
      const userData = TestFactory.createUser({
        email: `jwt-extract-${Date.now()}@example.com`,
      });
      await registerUser(app, userData);
      const loginResponse = await loginAs(app, userData.email, userData.password);

      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set(await getAuthHeaders(loginResponse.accessToken));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', userData.email);
    });

    it('deve rejeitar token com assinatura inválida', async () => {
      // Token com assinatura inválida
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid-signature';

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
    });
  });
});


