import * as request from 'supertest';
import { app } from '../../setup';
import { registerUser, loginAs, getAuthHeaders } from '../../helpers/auth.helper';
import { TestFactory } from '../../helpers/factory.helper';
import { UserRole } from '../../../src/modules/users/entities/user.entity';
import { ItemStatus } from '../../../src/modules/items/entities/item.entity';

describe('Distributions (e2e)', () => {
  let adminToken: string;
  let funcionarioToken: string;
  let adminUser: any;
  let funcionarioUser: any;
  let beneficiarioUser: any;
  let doadorUser: any;
  let categoryId: string;
  let itemId: string;

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

    // Criar usuário beneficiário
    beneficiarioUser = TestFactory.createUser({ role: UserRole.BENEFICIARIO });
    const beneficiarioRegister = await registerUser(app, beneficiarioUser);
    beneficiarioUser.id = beneficiarioRegister.user?.id || beneficiarioRegister.data?.user?.id;

    // Criar usuário doador
    doadorUser = TestFactory.createUser({ role: UserRole.DOADOR });
    const doadorRegister = await registerUser(app, doadorUser);
    doadorUser.id = doadorRegister.user?.id || doadorRegister.data?.user?.id;
    const doadorTokens = await loginAs(app, doadorUser.email, doadorUser.password);
    const doadorToken = doadorTokens.accessToken;

    // Criar uma categoria
    const categoryData = TestFactory.createCategory();
    const categoryResponse = await request(app.getHttpServer())
      .post('/categories')
      .set(await getAuthHeaders(adminToken))
      .send(categoryData)
      .expect(201);
    categoryId = categoryResponse.body.data?.id || categoryResponse.body.id;

    // Criar um item disponível
    const itemData = {
      ...TestFactory.createItem(),
      donorId: doadorUser.id,
      categoryId: categoryId,
      status: ItemStatus.DISPONIVEL,
    };
    const itemResponse = await request(app.getHttpServer())
      .post('/items')
      .set(await getAuthHeaders(doadorToken))
      .send(itemData)
      .expect(201);
    itemId = itemResponse.body.data?.id || itemResponse.body.id;
  });

  describe('POST /distributions', () => {
    it('deve criar uma nova distribuição como admin', async () => {
      const distributionData = {
        beneficiaryId: beneficiarioUser.id,
        itemIds: [itemId],
        observations: 'Distribuição de teste',
      };
      
      const response = await request(app.getHttpServer())
        .post('/distributions')
        .set(await getAuthHeaders(adminToken))
        .send(distributionData)
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.beneficiaryId).toBe(beneficiarioUser.id);
    });

    it('deve criar uma nova distribuição como funcionário', async () => {
      // Criar outro item disponível
      const doadorTokens = await loginAs(app, doadorUser.email, doadorUser.password);
      const itemData = {
        ...TestFactory.createItem(),
        donorId: doadorUser.id,
        categoryId: categoryId,
        status: ItemStatus.DISPONIVEL,
      };
      const itemResponse = await request(app.getHttpServer())
        .post('/items')
        .set(await getAuthHeaders(doadorTokens.accessToken))
        .send(itemData)
        .expect(201);

      const distributionData = {
        beneficiaryId: beneficiarioUser.id,
        itemIds: [itemResponse.body.data.id],
        observations: 'Distribuição de teste por funcionário',
      };
      
      const response = await request(app.getHttpServer())
        .post('/distributions')
        .set(await getAuthHeaders(funcionarioToken))
        .send(distributionData)
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
    });

    it('não deve criar distribuição sem autenticação', async () => {
      const distributionData = {
        beneficiaryId: beneficiarioUser.id,
        itemIds: [itemId],
      };
      
      await request(app.getHttpServer())
        .post('/distributions')
        .send(distributionData)
        .expect(401);
    });

    it('não deve criar distribuição com beneficiário inexistente', async () => {
      const fakeBeneficiaryId = '00000000-0000-0000-0000-000000000000';
      const distributionData = {
        beneficiaryId: fakeBeneficiaryId,
        itemIds: [itemId],
      };
      
      await request(app.getHttpServer())
        .post('/distributions')
        .set(await getAuthHeaders(adminToken))
        .send(distributionData)
        .expect(404);
    });
  });

  describe('GET /distributions', () => {
    it('deve listar distribuições com paginação', async () => {
      const response = await request(app.getHttpServer())
        .get('/distributions')
        .set(await getAuthHeaders(adminToken))
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body).toHaveProperty('meta');
    });

    it('não deve listar distribuições sem autenticação', async () => {
      await request(app.getHttpServer())
        .get('/distributions')
        .expect(401);
    });
  });

  describe('GET /distributions/:id', () => {
    it('deve retornar uma distribuição específica', async () => {
      // Criar distribuição primeiro
      const doadorTokens = await loginAs(app, doadorUser.email, doadorUser.password);
      const itemData = {
        ...TestFactory.createItem(),
        donorId: doadorUser.id,
        categoryId: categoryId,
        status: ItemStatus.DISPONIVEL,
      };
      const itemResponse = await request(app.getHttpServer())
        .post('/items')
        .set(await getAuthHeaders(doadorTokens.accessToken))
        .send(itemData)
        .expect(201);

      const distributionData = {
        beneficiaryId: beneficiarioUser.id,
        itemIds: [itemResponse.body.data.id],
      };
      const createResponse = await request(app.getHttpServer())
        .post('/distributions')
        .set(await getAuthHeaders(adminToken))
        .send(distributionData)
        .expect(201);

      const distributionId = createResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .get(`/distributions/${distributionId}`)
        .set(await getAuthHeaders(adminToken))
        .expect(200);

      expect(response.body.data.id).toBe(distributionId);
    });

    it('deve retornar 404 para distribuição inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      await request(app.getHttpServer())
        .get(`/distributions/${fakeId}`)
        .set(await getAuthHeaders(adminToken))
        .expect(404);
    });
  });

  describe('PATCH /distributions/:id', () => {
    it('deve atualizar uma distribuição', async () => {
      // Criar distribuição primeiro
      const doadorTokens = await loginAs(app, doadorUser.email, doadorUser.password);
      const itemData = {
        ...TestFactory.createItem(),
        donorId: doadorUser.id,
        categoryId: categoryId,
        status: ItemStatus.DISPONIVEL,
      };
      const itemResponse = await request(app.getHttpServer())
        .post('/items')
        .set(await getAuthHeaders(doadorTokens.accessToken))
        .send(itemData)
        .expect(201);

      const distributionData = {
        beneficiaryId: beneficiarioUser.id,
        itemIds: [itemResponse.body.data.id],
      };
      const createResponse = await request(app.getHttpServer())
        .post('/distributions')
        .set(await getAuthHeaders(adminToken))
        .send(distributionData)
        .expect(201);

      const distributionId = createResponse.body.data.id;
      const updateData = { observations: 'Observações atualizadas' };

      const response = await request(app.getHttpServer())
        .patch(`/distributions/${distributionId}`)
        .set(await getAuthHeaders(adminToken))
        .send(updateData)
        .expect(200);

      expect(response.body.data.observations).toBe(updateData.observations);
    });
  });

  describe('DELETE /distributions/:id', () => {
    it('deve deletar uma distribuição', async () => {
      // Criar distribuição primeiro
      const doadorTokens = await loginAs(app, doadorUser.email, doadorUser.password);
      const itemData = {
        ...TestFactory.createItem(),
        donorId: doadorUser.id,
        categoryId: categoryId,
        status: ItemStatus.DISPONIVEL,
      };
      const itemResponse = await request(app.getHttpServer())
        .post('/items')
        .set(await getAuthHeaders(doadorTokens.accessToken))
        .send(itemData)
        .expect(201);

      const distributionData = {
        beneficiaryId: beneficiarioUser.id,
        itemIds: [itemResponse.body.data.id],
      };
      const createResponse = await request(app.getHttpServer())
        .post('/distributions')
        .set(await getAuthHeaders(adminToken))
        .send(distributionData)
        .expect(201);

      const distributionId = createResponse.body.data.id;

      await request(app.getHttpServer())
        .delete(`/distributions/${distributionId}`)
        .set(await getAuthHeaders(adminToken))
        .expect(200);

      // Verificar que a distribuição foi deletada
      await request(app.getHttpServer())
        .get(`/distributions/${distributionId}`)
        .set(await getAuthHeaders(adminToken))
        .expect(404);
    });
  });
});

