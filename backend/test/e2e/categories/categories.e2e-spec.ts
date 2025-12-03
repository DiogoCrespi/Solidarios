import * as request from 'supertest';
import { app } from '../../setup';
import { registerUser, loginAs, getAuthHeaders } from '../../helpers/auth.helper';
import { TestFactory } from '../../helpers/factory.helper';
import { UserRole } from '../../../src/modules/users/entities/user.entity';

describe('Categories (e2e)', () => {
  let adminToken: string;
  let funcionarioToken: string;
  let adminUser: any;
  let funcionarioUser: any;

  beforeAll(async () => {
    // Criar usuário admin
    adminUser = TestFactory.createUser({ role: UserRole.ADMIN });
    const adminRegister = await registerUser(app, adminUser);
    adminUser.id = adminRegister.user?.id || adminRegister.data?.user?.id;
    const adminTokens = await loginAs(app, adminUser.email, adminUser.password);
    adminToken = adminTokens.accessToken;

    // Criar usuário funcionário
    funcionarioUser = TestFactory.createUser({ role: UserRole.FUNCIONARIO });
    const funcionarioRegister = await registerUser(app, funcionarioUser);
    funcionarioUser.id = funcionarioRegister.user?.id || funcionarioRegister.data?.user?.id;
    const funcionarioTokens = await loginAs(app, funcionarioUser.email, funcionarioUser.password);
    funcionarioToken = funcionarioTokens.accessToken;
  });

  describe('POST /categories', () => {
    it('deve criar uma nova categoria como admin', async () => {
      const categoryData = TestFactory.createCategory();
      
      const response = await request(app.getHttpServer())
        .post('/categories')
        .set(await getAuthHeaders(adminToken))
        .send(categoryData)
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(categoryData.name);
    });

    it('deve criar uma nova categoria como funcionário', async () => {
      const categoryData = TestFactory.createCategory();
      
      const response = await request(app.getHttpServer())
        .post('/categories')
        .set(await getAuthHeaders(funcionarioToken))
        .send(categoryData)
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(categoryData.name);
    });

    it('não deve criar categoria com nome duplicado', async () => {
      const categoryData = TestFactory.createCategory();
      
      // Criar primeira categoria
      await request(app.getHttpServer())
        .post('/categories')
        .set(await getAuthHeaders(adminToken))
        .send(categoryData)
        .expect(201);

      // Tentar criar com mesmo nome
      await request(app.getHttpServer())
        .post('/categories')
        .set(await getAuthHeaders(adminToken))
        .send(categoryData)
        .expect(409);
    });

    it('não deve criar categoria sem autenticação', async () => {
      const categoryData = TestFactory.createCategory();
      
      await request(app.getHttpServer())
        .post('/categories')
        .send(categoryData)
        .expect(401);
    });
  });

  describe('GET /categories', () => {
    it('deve listar categorias (público)', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('deve listar categorias com paginação', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body).toHaveProperty('meta');
    });
  });

  describe('GET /categories/:id', () => {
    it('deve retornar uma categoria específica', async () => {
      const categoryData = TestFactory.createCategory();
      const createResponse = await request(app.getHttpServer())
        .post('/categories')
        .set(await getAuthHeaders(adminToken))
        .send(categoryData)
        .expect(201);

      const categoryId = createResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .get(`/categories/${categoryId}`)
        .expect(200);

      expect(response.body.data.id).toBe(categoryId);
      expect(response.body.data.name).toBe(categoryData.name);
    });

    it('deve retornar 404 para categoria inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      await request(app.getHttpServer())
        .get(`/categories/${fakeId}`)
        .expect(404);
    });
  });

  describe('PATCH /categories/:id', () => {
    it('deve atualizar uma categoria', async () => {
      const categoryData = TestFactory.createCategory();
      const createResponse = await request(app.getHttpServer())
        .post('/categories')
        .set(await getAuthHeaders(adminToken))
        .send(categoryData)
        .expect(201);

      const categoryId = createResponse.body.data.id;
      const updateData = { name: 'Categoria Atualizada' };

      const response = await request(app.getHttpServer())
        .patch(`/categories/${categoryId}`)
        .set(await getAuthHeaders(adminToken))
        .send(updateData)
        .expect(200);

      expect(response.body.data.name).toBe(updateData.name);
    });
  });

  describe('DELETE /categories/:id', () => {
    it('deve deletar uma categoria', async () => {
      const categoryData = TestFactory.createCategory();
      const createResponse = await request(app.getHttpServer())
        .post('/categories')
        .set(await getAuthHeaders(adminToken))
        .send(categoryData)
        .expect(201);

      const categoryId = createResponse.body.data.id;

      await request(app.getHttpServer())
        .delete(`/categories/${categoryId}`)
        .set(await getAuthHeaders(adminToken))
        .expect(200);

      // Verificar que a categoria foi deletada
      await request(app.getHttpServer())
        .get(`/categories/${categoryId}`)
        .expect(404);
    });
  });
});

