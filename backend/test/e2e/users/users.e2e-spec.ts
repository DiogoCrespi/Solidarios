import * as request from 'supertest';
import { app } from '../../setup';
import { registerUser, loginAs, getAuthHeaders } from '../../helpers/auth.helper';
import { TestFactory } from '../../helpers/factory.helper';
import { UserRole } from '../../../src/modules/users/entities/user.entity';

describe('Users (e2e)', () => {
  let adminToken: string;
  let adminUser: any;

  beforeAll(async () => {
    // Criar um usuário admin para os testes
    adminUser = TestFactory.createUser({ role: UserRole.ADMIN });
    const registerResponse = await registerUser(app, adminUser);
    // Auth retorna diretamente user, não dentro de data
    adminUser.id = registerResponse.user?.id || registerResponse.data?.user?.id;
    
    const tokens = await loginAs(app, adminUser.email, adminUser.password);
    adminToken = tokens.accessToken;
  });

  describe('POST /users', () => {
    it('deve criar um novo usuário como admin', async () => {
      const userData = TestFactory.createUser({ role: UserRole.DOADOR });
      
      const response = await request(app.getHttpServer())
        .post('/users')
        .set(await getAuthHeaders(adminToken))
        .send(userData)
        .expect(201);

      const user = response.body.data || response.body;
      expect(user).toHaveProperty('id');
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.role).toBe(userData.role);
    });

    it('não deve criar usuário com email duplicado', async () => {
      const userData = TestFactory.createUser();
      
      // Criar primeiro usuário
      await request(app.getHttpServer())
        .post('/users')
        .set(await getAuthHeaders(adminToken))
        .send(userData)
        .expect(201);

      // Tentar criar com mesmo email
      await request(app.getHttpServer())
        .post('/users')
        .set(await getAuthHeaders(adminToken))
        .send(userData)
        .expect(409);
    });

    it('não deve criar usuário sem autenticação', async () => {
      const userData = TestFactory.createUser();
      
      await request(app.getHttpServer())
        .post('/users')
        .send(userData)
        .expect(401);
    });
  });

  describe('GET /users', () => {
    it('deve listar usuários com paginação', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set(await getAuthHeaders(adminToken))
        .query({ page: '1', limit: '10' })
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('total');
    });

    it('não deve listar usuários sem autenticação', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .expect(401);
    });
  });

  describe('GET /users/:id', () => {
    it('deve retornar um usuário específico', async () => {
      const userData = TestFactory.createUser();
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .set(await getAuthHeaders(adminToken))
        .send(userData)
        .expect(201);

      const userId = createResponse.body.data?.id || createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set(await getAuthHeaders(adminToken))
        .expect(200);

      const user = response.body.data || response.body;
      expect(user.id).toBe(userId);
      expect(user.email).toBe(userData.email);
    });

    it('deve retornar 404 para usuário inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      await request(app.getHttpServer())
        .get(`/users/${fakeId}`)
        .set(await getAuthHeaders(adminToken))
        .expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('deve atualizar um usuário', async () => {
      const userData = TestFactory.createUser();
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .set(await getAuthHeaders(adminToken))
        .send(userData)
        .expect(201);

      const userId = createResponse.body.data?.id || createResponse.body.id;
      const updateData = { name: 'Nome Atualizado' };

      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set(await getAuthHeaders(adminToken))
        .send(updateData)
        .expect(200);

      const user = response.body.data || response.body;
      expect(user.name).toBe(updateData.name);
    });
  });

  describe('DELETE /users/:id', () => {
    it('deve deletar um usuário', async () => {
      const userData = TestFactory.createUser();
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .set(await getAuthHeaders(adminToken))
        .send(userData)
        .expect(201);

      const userId = createResponse.body.data?.id || createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set(await getAuthHeaders(adminToken))
        .expect(200);

      // Verificar que o usuário foi deletado
      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set(await getAuthHeaders(adminToken))
        .expect(404);
    });
  });
});

