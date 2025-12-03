import * as request from 'supertest';
import { app } from '../../setup';
import { registerUser, loginAs, getAuthHeaders } from '../../helpers/auth.helper';
import { TestFactory } from '../../helpers/factory.helper';
import { UserRole } from '../../../src/modules/users/entities/user.entity';
import { ItemStatus, ItemType } from '../../../src/modules/items/entities/item.entity';

describe('Items (e2e)', () => {
  let adminToken: string;
  let doadorToken: string;
  let adminUser: any;
  let doadorUser: any;
  let categoryId: string;

  beforeAll(async () => {
    // Criar usuário admin
    adminUser = TestFactory.createUser({ role: UserRole.ADMIN });
    const adminRegister = await registerUser(app, adminUser);
    adminUser.id = adminRegister.user?.id || adminRegister.data?.user?.id;
    const adminTokens = await loginAs(app, adminUser.email, adminUser.password);
    adminToken = adminTokens.accessToken;

    // Criar usuário doador
    doadorUser = TestFactory.createUser({ role: UserRole.DOADOR });
    const doadorRegister = await registerUser(app, doadorUser);
    doadorUser.id = doadorRegister.user?.id || doadorRegister.data?.user?.id;
    const doadorTokens = await loginAs(app, doadorUser.email, doadorUser.password);
    doadorToken = doadorTokens.accessToken;

    // Criar uma categoria para os testes
    const categoryData = TestFactory.createCategory();
    const categoryResponse = await request(app.getHttpServer())
      .post('/categories')
      .set(await getAuthHeaders(adminToken))
      .send(categoryData)
      .expect(201);
    categoryId = categoryResponse.body.data?.id || categoryResponse.body.id;
  });

  describe('POST /items', () => {
    it('deve criar um novo item como admin', async () => {
      const itemData = {
        ...TestFactory.createItem(),
        donorId: doadorUser.id,
        categoryId: categoryId,
      };
      
      const response = await request(app.getHttpServer())
        .post('/items')
        .set(await getAuthHeaders(adminToken))
        .send(itemData)
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.description).toContain('[TEST]');
      expect(response.body.data.donorId).toBe(doadorUser.id);
    });

    it('deve criar um novo item como doador', async () => {
      const itemData = {
        ...TestFactory.createItem(),
        donorId: doadorUser.id,
        categoryId: categoryId,
      };
      
      const response = await request(app.getHttpServer())
        .post('/items')
        .set(await getAuthHeaders(doadorToken))
        .send(itemData)
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.donorId).toBe(doadorUser.id);
    });

    it('não deve criar item sem autenticação', async () => {
      const itemData = {
        ...TestFactory.createItem(),
        donorId: doadorUser.id,
        categoryId: categoryId,
      };
      
      await request(app.getHttpServer())
        .post('/items')
        .send(itemData)
        .expect(401);
    });

    it('não deve criar item com doador inexistente', async () => {
      const itemData = {
        ...TestFactory.createItem(),
        donorId: '00000000-0000-0000-0000-000000000000',
        categoryId: categoryId,
      };
      
      await request(app.getHttpServer())
        .post('/items')
        .set(await getAuthHeaders(adminToken))
        .send(itemData)
        .expect(404);
    });
  });

  describe('GET /items', () => {
    it('deve listar itens com paginação', async () => {
      const response = await request(app.getHttpServer())
        .get('/items')
        .set(await getAuthHeaders(adminToken))
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body).toHaveProperty('meta');
    });

    it('não deve listar itens sem autenticação', async () => {
      await request(app.getHttpServer())
        .get('/items')
        .expect(401);
    });
  });

  describe('GET /items/:id', () => {
    it('deve retornar um item específico', async () => {
      const itemData = {
        ...TestFactory.createItem(),
        donorId: doadorUser.id,
        categoryId: categoryId,
      };
      const createResponse = await request(app.getHttpServer())
        .post('/items')
        .set(await getAuthHeaders(adminToken))
        .send(itemData)
        .expect(201);

      const itemId = createResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .get(`/items/${itemId}`)
        .set(await getAuthHeaders(adminToken))
        .expect(200);

      expect(response.body.data.id).toBe(itemId);
    });

    it('deve retornar 404 para item inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      await request(app.getHttpServer())
        .get(`/items/${fakeId}`)
        .set(await getAuthHeaders(adminToken))
        .expect(404);
    });
  });

  describe('PATCH /items/:id', () => {
    it('deve atualizar um item', async () => {
      const itemData = {
        ...TestFactory.createItem(),
        donorId: doadorUser.id,
        categoryId: categoryId,
      };
      const createResponse = await request(app.getHttpServer())
        .post('/items')
        .set(await getAuthHeaders(adminToken))
        .send(itemData)
        .expect(201);

      const itemId = createResponse.body.data.id;
      const updateData = { description: '[TEST] Item Atualizado' };

      const response = await request(app.getHttpServer())
        .patch(`/items/${itemId}`)
        .set(await getAuthHeaders(adminToken))
        .send(updateData)
        .expect(200);

      expect(response.body.data.description).toBe(updateData.description);
    });
  });

  describe('DELETE /items/:id', () => {
    it('deve deletar um item', async () => {
      const itemData = {
        ...TestFactory.createItem(),
        donorId: doadorUser.id,
        categoryId: categoryId,
      };
      const createResponse = await request(app.getHttpServer())
        .post('/items')
        .set(await getAuthHeaders(adminToken))
        .send(itemData)
        .expect(201);

      const itemId = createResponse.body.data.id;

      await request(app.getHttpServer())
        .delete(`/items/${itemId}`)
        .set(await getAuthHeaders(adminToken))
        .expect(200);

      // Verificar que o item foi deletado
      await request(app.getHttpServer())
        .get(`/items/${itemId}`)
        .set(await getAuthHeaders(adminToken))
        .expect(404);
    });
  });
});

