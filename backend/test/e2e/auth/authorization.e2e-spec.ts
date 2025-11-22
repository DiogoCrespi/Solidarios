import * as request from 'supertest';
import { app } from '../../setup';
import { registerUser, loginAs, getAuthHeaders } from '../../helpers/auth.helper';
import { TestFactory } from '../../helpers/factory.helper';
import { UserRole } from '../../../src/modules/users/entities/user.entity';

describe('Auth - Authorization (e2e)', () => {
  let adminToken: string;
  let funcionarioToken: string;
  let doadorToken: string;
  let beneficiarioToken: string;

  beforeAll(async () => {
    // Criar e fazer login com cada role
    const adminData = TestFactory.createUser({
      email: `admin-auth-${Date.now()}@example.com`,
      role: UserRole.ADMIN,
    });
    await registerUser(app, adminData);
    const adminAuth = await loginAs(app, adminData.email, adminData.password);
    adminToken = adminAuth.accessToken;

    const funcionarioData = TestFactory.createUser({
      email: `funcionario-auth-${Date.now()}@example.com`,
      role: UserRole.FUNCIONARIO,
    });
    await registerUser(app, funcionarioData);
    const funcionarioAuth = await loginAs(app, funcionarioData.email, funcionarioData.password);
    funcionarioToken = funcionarioAuth.accessToken;

    const doadorData = TestFactory.createUser({
      email: `doador-auth-${Date.now()}@example.com`,
      role: UserRole.DOADOR,
    });
    await registerUser(app, doadorData);
    const doadorAuth = await loginAs(app, doadorData.email, doadorData.password);
    doadorToken = doadorAuth.accessToken;

    const beneficiarioData = TestFactory.createUser({
      email: `beneficiario-auth-${Date.now()}@example.com`,
      role: UserRole.BENEFICIARIO,
    });
    await registerUser(app, beneficiarioData);
    const beneficiarioAuth = await loginAs(app, beneficiarioData.email, beneficiarioData.password);
    beneficiarioToken = beneficiarioAuth.accessToken;
  });

  describe('Acesso ADMIN', () => {
    it('deve acessar rota de usuários (apenas ADMIN)', async () => {
      // Verificar se o token está funcionando primeiro
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/profile')
        .set(await getAuthHeaders(adminToken));
      
      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.role).toBe(UserRole.ADMIN);
      
      const response = await request(app.getHttpServer())
        .get('/users')
        .set(await getAuthHeaders(adminToken));

      expect(response.status).toBe(200);
    });

    it('deve acessar rota de analytics (apenas ADMIN)', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/dashboard')
        .set(await getAuthHeaders(adminToken));

      expect(response.status).toBe(200);
    });

    it('deve acessar rota de auditoria (apenas ADMIN)', async () => {
      const response = await request(app.getHttpServer())
        .get('/audit')
        .set(await getAuthHeaders(adminToken));

      expect(response.status).toBe(200);
    });
  });

  describe('Acesso FUNCIONARIO', () => {
    it('deve acessar rota de inventário (ADMIN/FUNCIONARIO)', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory')
        .set(await getAuthHeaders(funcionarioToken));

      expect(response.status).toBe(200);
    });

    it('deve acessar rota de distribuições (ADMIN/FUNCIONARIO)', async () => {
      const response = await request(app.getHttpServer())
        .get('/distributions')
        .set(await getAuthHeaders(funcionarioToken));

      expect(response.status).toBe(200);
    });

    it('deve acessar rota de categorias (ADMIN/FUNCIONARIO)', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .set(await getAuthHeaders(funcionarioToken));

      expect(response.status).toBe(200);
    });

    it('NÃO deve acessar rota de usuários (apenas ADMIN)', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set(await getAuthHeaders(funcionarioToken));

      expect(response.status).toBe(403);
    });

    it('NÃO deve acessar rota de auditoria (apenas ADMIN)', async () => {
      const response = await request(app.getHttpServer())
        .get('/audit')
        .set(await getAuthHeaders(funcionarioToken));

      expect(response.status).toBe(403);
    });
  });

  describe('Acesso DOADOR', () => {
    it('deve acessar rota de criar item (ADMIN/FUNCIONARIO/DOADOR)', async () => {
      // Obter ID do doador do token
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/profile')
        .set(await getAuthHeaders(doadorToken));
      
      const doadorId = profileResponse.body.id;
      
      const itemData = {
        ...TestFactory.createItem(),
        donorId: doadorId, // Adicionar donorId obrigatório
      };
      
      const response = await request(app.getHttpServer())
        .post('/items')
        .set(await getAuthHeaders(doadorToken))
        .send(itemData);

      expect(response.status).toBe(201);
    });

    it('deve acessar próprio perfil', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set(await getAuthHeaders(doadorToken));

      expect(response.status).toBe(200);
    });

    it('NÃO deve acessar rota de usuários (apenas ADMIN)', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set(await getAuthHeaders(doadorToken));

      expect(response.status).toBe(403);
    });

    it('NÃO deve acessar rota de inventário (apenas ADMIN/FUNCIONARIO)', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory')
        .set(await getAuthHeaders(doadorToken));

      expect(response.status).toBe(403);
    });

    it('NÃO deve criar distribuições (apenas ADMIN/FUNCIONARIO)', async () => {
      const response = await request(app.getHttpServer())
        .post('/distributions')
        .set(await getAuthHeaders(doadorToken))
        .send({});

      expect(response.status).toBe(403);
    });
  });

  describe('Acesso BENEFICIARIO', () => {
    it('deve acessar próprio perfil', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set(await getAuthHeaders(beneficiarioToken));

      expect(response.status).toBe(200);
    });

    it('deve acessar próprias distribuições', async () => {
      const response = await request(app.getHttpServer())
        .get('/distributions')
        .set(await getAuthHeaders(beneficiarioToken));

      expect(response.status).toBe(200);
    });

    it('NÃO deve acessar rota de usuários (apenas ADMIN)', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set(await getAuthHeaders(beneficiarioToken));

      expect(response.status).toBe(403);
    });

    it('NÃO deve criar itens (apenas ADMIN/FUNCIONARIO/DOADOR)', async () => {
      const itemData = TestFactory.createItem();
      const response = await request(app.getHttpServer())
        .post('/items')
        .set(await getAuthHeaders(beneficiarioToken))
        .send(itemData);

      expect(response.status).toBe(403);
    });

    it('NÃO deve criar distribuições (apenas ADMIN/FUNCIONARIO)', async () => {
      const response = await request(app.getHttpServer())
        .post('/distributions')
        .set(await getAuthHeaders(beneficiarioToken))
        .send({});

      expect(response.status).toBe(403);
    });
  });

  describe('Acesso sem autenticação', () => {
    it('deve retornar 401 ao acessar rota protegida sem token', async () => {
      const response = await request(app.getHttpServer())
        .get('/users');

      expect(response.status).toBe(401);
    });

    it('deve retornar 401 ao acessar rota protegida com token inválido', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', 'Bearer token-invalido-12345');

      expect(response.status).toBe(401);
    });

    it('deve retornar 401 ao acessar rota protegida com token malformado', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', 'Bearer invalid.token.format');

      expect(response.status).toBe(401);
    });
  });

  describe('Rotas públicas', () => {
    it('deve acessar rota de login sem autenticação', async () => {
      const userData = TestFactory.createUser({
        email: `public-login-${Date.now()}@example.com`,
      });
      await registerUser(app, userData);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        });

      expect(response.status).toBe(200);
    });

    it('deve acessar rota de registro sem autenticação', async () => {
      const userData = TestFactory.createUser({
        email: `public-register-${Date.now()}@example.com`,
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
    });
  });
});

