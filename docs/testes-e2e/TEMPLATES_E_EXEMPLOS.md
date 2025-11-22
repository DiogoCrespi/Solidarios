# Templates e Exemplos de Testes E2E
## Guia Prático para Implementação

Este documento contém templates e exemplos práticos para facilitar a implementação dos testes E2E conforme o plano principal.

> **⚠️ Nota Importante:** Durante a fase de desenvolvimento, estamos usando o ambiente de desenvolvimento existente (mesmo Docker, .env e banco de dados). Os testes devem ser cuidadosos para não interferir com dados de desenvolvimento. Use identificadores únicos (timestamps, prefixos) para dados de teste e limpe apenas esses dados ao final dos testes.

---

## 📋 Índice

1. [Estrutura de Arquivos](#estrutura-de-arquivos)
2. [Templates Backend (Jest + Supertest)](#templates-backend-jest--supertest)
3. [Templates Frontend (Detox/Maestro)](#templates-frontend-detoxmaestro)
4. [Helpers e Utilities](#helpers-e-utilities)
5. [Exemplos Práticos](#exemplos-práticos)

---

## 📁 Estrutura de Arquivos

### Backend

```
backend/
├── test/
│   ├── jest-e2e.json
│   ├── setup.ts
│   ├── teardown.ts
│   ├── helpers/
│   │   ├── auth.helper.ts
│   │   ├── database.helper.ts
│   │   ├── factory.helper.ts
│   │   └── api.helper.ts
│   ├── fixtures/
│   │   └── users.fixture.ts
│   └── e2e/
│       ├── auth/
│       │   ├── login.e2e-spec.ts
│       │   └── register.e2e-spec.ts
│       ├── users/
│       │   └── users.e2e-spec.ts
│       └── items/
│           └── items.e2e-spec.ts
```

### Frontend

```
frontend/
├── e2e/
│   ├── config/
│   │   └── detox.config.js
│   ├── helpers/
│   │   ├── auth.helper.ts
│   │   └── navigation.helper.ts
│   └── specs/
│       ├── auth/
│       │   └── login.spec.ts
│       └── flows/
│           └── donation-flow.spec.ts
```

---

## 🔧 Templates Backend (Jest + Supertest)

### Configuração Base (jest-e2e.json)

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "moduleNameMapper": {
    "^src/(.*)$": "<rootDir>/../src/$1"
  },
  "setupFilesAfterEnv": ["<rootDir>/setup.ts"]
}
```

### Setup Global (setup.ts)

```typescript
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { cleanTestData, seedTestData } from './helpers/database.helper';

let app: INestApplication;
let dataSource: DataSource;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();
  await app.init();

  dataSource = app.get(DataSource);
  
  // Limpar apenas dados de teste anteriores (não limpar todo o banco)
  await cleanTestData(dataSource);
  
  // Garantir dados básicos necessários para testes (se não existirem)
  await seedTestData(dataSource);
});

afterAll(async () => {
  // Limpar dados de teste ao final de todos os testes
  await cleanTestData(dataSource);
  await app.close();
});

afterEach(async () => {
  // Limpar dados específicos entre testes se necessário
  // (opcional - pode ser feito por teste individual se preferir)
});

export { app, dataSource };
```

### Helper de Autenticação (helpers/auth.helper.ts)

```typescript
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { UserRole } from '../../src/modules/users/entities/user.entity';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export async function loginAs(
  app: INestApplication,
  email: string,
  password: string,
): Promise<AuthTokens> {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(200);

  return {
    accessToken: response.body.accessToken,
    refreshToken: response.body.refreshToken,
  };
}

export async function registerUser(
  app: INestApplication,
  userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  },
): Promise<any> {
  const response = await request(app.getHttpServer())
    .post('/auth/register')
    .send(userData)
    .expect(201);

  return response.body;
}

export async function getAuthHeaders(
  app: INestApplication,
  accessToken: string,
): Promise<Record<string, string>> {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}
```

### Helper de Database (helpers/database.helper.ts)

```typescript
import { DataSource } from 'typeorm';

/**
 * Limpa apenas dados criados pelos testes
 * Como estamos usando o ambiente de desenvolvimento, não devemos limpar tudo,
 * apenas os dados criados durante os testes (identificados por prefixos ou timestamps)
 */
export async function cleanTestData(dataSource: DataSource): Promise<void> {
  // Exemplo: Limpar apenas usuários de teste (com email contendo '@test.' ou '@example.com')
  const userRepository = dataSource.getRepository('User');
  await userRepository.delete({ email: /@test\.|@example\.com/ });
  
  // Limpar itens de teste (com descrição contendo '[TEST]')
  const itemRepository = dataSource.getRepository('Item');
  await itemRepository.delete({ description: /\[TEST\]/ });
  
  // Limpar categorias de teste
  const categoryRepository = dataSource.getRepository('Category');
  await categoryRepository.delete({ name: /^Test Category|^Category \d+$/ });
  
  // Adicionar outras limpezas conforme necessário
}

export async function seedTestData(dataSource: DataSource): Promise<void> {
  // Criar dados iniciais necessários para testes
  // Ex: usuário admin padrão (se não existir), categorias básicas, etc.
  // Usar verificação de existência antes de criar
}

/**
 * Alternativa: Usar transações para isolar dados de teste
 * (mais seguro, mas requer configuração adicional)
 */
export async function withTransaction<T>(
  dataSource: DataSource,
  callback: (queryRunner: any) => Promise<T>
): Promise<T> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  
  try {
    const result = await callback(queryRunner);
    await queryRunner.rollbackTransaction(); // Sempre faz rollback em testes
    return result;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

### Factory Helper (helpers/factory.helper.ts)

```typescript
import { UserRole } from '../../src/modules/users/entities/user.entity';
import { ItemType, ItemStatus } from '../../src/modules/items/entities/item.entity';

export class TestFactory {
  static createUser(overrides?: Partial<any>) {
    return {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'Test123!@#',
      role: UserRole.DOADOR,
      phone: '(11) 99999-9999',
      address: 'Test Address',
      ...overrides,
    };
  }

  static createItem(overrides?: Partial<any>) {
    return {
      type: ItemType.roupa,
      description: 'Test Item',
      conservationState: 'Bom',
      size: 'M',
      status: ItemStatus.disponivel,
      ...overrides,
    };
  }

  static createCategory(overrides?: Partial<any>) {
    return {
      name: `Category ${Date.now()}`,
      description: 'Test Category',
      ...overrides,
    };
  }
}
```

### Template de Teste - Autenticação (auth/login.e2e-spec.ts)

```typescript
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { loginAs, registerUser } from '../helpers/auth.helper';
import { TestFactory } from '../helpers/factory.helper';
import { UserRole } from '../../src/modules/users/entities/user.entity';

describe('Auth - Login (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: 'login-test@example.com',
        password: 'Test123!@#',
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
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.accessToken).toBeDefined();
    });

    it('deve falhar com email inexistente', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'inexistente@example.com',
          password: 'Test123!@#',
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.message).toContain('credenciais');
    });

    it('deve falhar com senha incorreta', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: 'wrong-password@example.com',
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
    });

    it('deve falhar com usuário inativo', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: 'inactive@example.com',
      });
      const user = await registerUser(app, userData);
      
      // Desativar usuário (implementar endpoint ou diretamente no banco)
      // await deactivateUser(app, user.id);

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
  });
});
```

### Template de Teste - CRUD (users/users.e2e-spec.ts)

```typescript
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { loginAs, getAuthHeaders } from '../helpers/auth.helper';
import { TestFactory } from '../helpers/factory.helper';
import { UserRole } from '../../src/modules/users/entities/user.entity';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Login como admin
    const auth = await loginAs(app, 'admin@sanem.com', 'admin123');
    adminToken = auth.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    it('deve criar usuário como ADMIN', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: 'new-user@example.com',
        role: UserRole.FUNCIONARIO,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/users')
        .set(await getAuthHeaders(app, adminToken))
        .send(userData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(userData.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('deve falhar ao criar usuário com email duplicado', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: 'duplicate@example.com',
      });
      await request(app.getHttpServer())
        .post('/users')
        .set(await getAuthHeaders(app, adminToken))
        .send(userData);

      // Act
      const response = await request(app.getHttpServer())
        .post('/users')
        .set(await getAuthHeaders(app, adminToken))
        .send(userData);

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe('GET /users', () => {
    it('deve listar usuários com paginação', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/users')
        .set(await getAuthHeaders(app, adminToken))
        .query({ page: 1, limit: 10 });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /users/:id', () => {
    it('deve retornar detalhes do usuário', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: 'detail-test@example.com',
      });
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .set(await getAuthHeaders(app, adminToken))
        .send(userData);
      const userId = createResponse.body.id;

      // Act
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set(await getAuthHeaders(app, adminToken));

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(userId);
      expect(response.body).not.toHaveProperty('password');
    });
  });

  describe('PATCH /users/:id', () => {
    it('deve atualizar usuário', async () => {
      // Arrange
      const userData = TestFactory.createUser({
        email: 'update-test@example.com',
      });
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .set(await getAuthHeaders(app, adminToken))
        .send(userData);
      const userId = createResponse.body.id;

      // Act
      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set(await getAuthHeaders(app, adminToken))
        .send({ name: 'Updated Name' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
    });
  });
});
```

---

## 📱 Templates Frontend (Detox/Maestro)

### Configuração Detox (config/detox.config.js)

```javascript
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js'
    },
    jest: {
      setupTimeout: 120000
    }
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/Solidarios.app',
      build: 'xcodebuild -workspace ios/Solidarios.xcworkspace -scheme Solidarios -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_4_API_30'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug'
    }
  }
};
```

### Helper de Autenticação Frontend (helpers/auth.helper.ts)

```typescript
import { by, element, waitFor } from 'detox';

export async function login(email: string, password: string) {
  await waitFor(element(by.id('email-input')))
    .toBeVisible()
    .withTimeout(5000);
  
  await element(by.id('email-input')).typeText(email);
  await element(by.id('password-input')).typeText(password);
  await element(by.id('login-button')).tap();
  
  // Aguardar navegação
  await waitFor(element(by.id('dashboard')))
    .toBeVisible()
    .withTimeout(10000);
}

export async function logout() {
  await element(by.id('profile-tab')).tap();
  await element(by.id('logout-button')).tap();
  
  // Aguardar voltar para tela de login
  await waitFor(element(by.id('login-screen')))
    .toBeVisible()
    .withTimeout(5000);
}
```

### Template de Teste Frontend - Login (specs/auth/login.spec.ts)

```typescript
import { by, device, element, waitFor } from 'detox';
import { login, logout } from '../../helpers/auth.helper';

describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Login Screen', () => {
    it('deve exibir tela de login', async () => {
      await waitFor(element(by.id('login-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      await expect(element(by.id('email-input'))).toBeVisible();
      await expect(element(by.id('password-input'))).toBeVisible();
      await expect(element(by.id('login-button'))).toBeVisible();
    });

    it('deve fazer login com credenciais válidas', async () => {
      await login('admin@sanem.com', 'admin123');
      
      await expect(element(by.id('dashboard'))).toBeVisible();
    });

    it('deve exibir erro com credenciais inválidas', async () => {
      await element(by.id('email-input')).typeText('wrong@example.com');
      await element(by.id('password-input')).typeText('wrongpassword');
      await element(by.id('login-button')).tap();
      
      await waitFor(element(by.id('error-message')))
        .toBeVisible()
        .withTimeout(5000);
      
      await expect(element(by.id('error-message'))).toHaveText(
        'Credenciais inválidas'
      );
    });
  });
});
```

### Template de Teste - Fluxo Completo (specs/flows/donation-flow.spec.ts)

```typescript
import { by, device, element, waitFor } from 'detox';
import { login } from '../../helpers/auth.helper';

describe('Fluxo Completo de Doação', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('deve completar fluxo: login → criar doação → visualizar histórico', async () => {
    // 1. Login como doador
    await login('doador@example.com', 'password123');
    
    // 2. Navegar para nova doação
    await element(by.id('new-donation-tab')).tap();
    await waitFor(element(by.id('create-donation-screen')))
      .toBeVisible()
      .withTimeout(5000);
    
    // 3. Preencher formulário de doação
    await element(by.id('item-type-picker')).tap();
    await element(by.text('Roupa')).tap();
    
    await element(by.id('description-input')).typeText('Camiseta nova');
    await element(by.id('size-input')).typeText('M');
    await element(by.id('conservation-state-input')).typeText('Bom');
    
    // 4. Submeter doação
    await element(by.id('submit-button')).tap();
    
    // 5. Verificar sucesso
    await waitFor(element(by.id('success-message')))
      .toBeVisible()
      .withTimeout(5000);
    
    // 6. Navegar para histórico
    await element(by.id('my-donations-tab')).tap();
    await waitFor(element(by.id('donations-list')))
      .toBeVisible()
      .withTimeout(5000);
    
    // 7. Verificar que a doação aparece na lista
    await expect(element(by.text('Camiseta nova'))).toBeVisible();
  });
});
```

---

## 🛠️ Helpers e Utilities

### API Helper (helpers/api.helper.ts)

```typescript
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

export class ApiHelper {
  constructor(private app: INestApplication) {}

  async get(endpoint: string, token?: string) {
    const req = request(this.app.getHttpServer()).get(endpoint);
    if (token) {
      req.set('Authorization', `Bearer ${token}`);
    }
    return req;
  }

  async post(endpoint: string, data: any, token?: string) {
    const req = request(this.app.getHttpServer())
      .post(endpoint)
      .send(data);
    if (token) {
      req.set('Authorization', `Bearer ${token}`);
    }
    return req;
  }

  async patch(endpoint: string, data: any, token?: string) {
    const req = request(this.app.getHttpServer())
      .patch(endpoint)
      .send(data);
    if (token) {
      req.set('Authorization', `Bearer ${token}`);
    }
    return req;
  }

  async delete(endpoint: string, token?: string) {
    const req = request(this.app.getHttpServer()).delete(endpoint);
    if (token) {
      req.set('Authorization', `Bearer ${token}`);
    }
    return req;
  }
}
```

---

## 📝 Exemplos Práticos

### Exemplo 1: Teste de Fluxo Completo Backend

```typescript
describe('Fluxo Completo: Doação → Inventário → Distribuição', () => {
  let app: INestApplication;
  let doadorToken: string;
  let funcionarioToken: string;
  let beneficiarioId: string;
  let itemId: string;

  beforeAll(async () => {
    // Setup...
    const doadorAuth = await loginAs(app, 'doador@example.com', 'pass123');
    doadorToken = doadorAuth.accessToken;
    
    const funcionarioAuth = await loginAs(app, 'funcionario@example.com', 'pass123');
    funcionarioToken = funcionarioAuth.accessToken;
  });

  it('deve completar fluxo completo', async () => {
    // 1. DOADOR cria doação
    const itemData = TestFactory.createItem();
    const createItemResponse = await request(app.getHttpServer())
      .post('/items')
      .set('Authorization', `Bearer ${doadorToken}`)
      .send(itemData)
      .expect(201);
    
    itemId = createItemResponse.body.id;
    expect(createItemResponse.body.status).toBe('disponivel');

    // 2. FUNCIONARIO visualiza item no inventário
    const inventoryResponse = await request(app.getHttpServer())
      .get('/inventory')
      .set('Authorization', `Bearer ${funcionarioToken}`)
      .expect(200);
    
    const itemInInventory = inventoryResponse.body.data.find(
      (item: any) => item.id === itemId
    );
    expect(itemInInventory).toBeDefined();

    // 3. FUNCIONARIO cria distribuição
    const distributionData = {
      beneficiaryId: beneficiarioId,
      items: [{ itemId, quantity: 1 }],
    };
    
    const distributionResponse = await request(app.getHttpServer())
      .post('/distributions')
      .set('Authorization', `Bearer ${funcionarioToken}`)
      .send(distributionData)
      .expect(201);

    // 4. Verificar que item mudou de status
    const itemResponse = await request(app.getHttpServer())
      .get(`/items/${itemId}`)
      .set('Authorization', `Bearer ${funcionarioToken}`)
      .expect(200);
    
    expect(itemResponse.body.status).toBe('distribuido');
  });
});
```

### Exemplo 2: Teste de Permissões

```typescript
describe('Permissões por Role', () => {
  let app: INestApplication;
  let adminToken: string;
  let doadorToken: string;
  let beneficiarioToken: string;

  beforeAll(async () => {
    // Setup e login...
  });

  it('ADMIN deve acessar todas as rotas', async () => {
    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    
    await request(app.getHttpServer())
      .get('/analytics')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('DOADOR não deve acessar rota de usuários', async () => {
    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${doadorToken}`)
      .expect(403);
  });

  it('BENEFICIARIO não deve criar distribuições', async () => {
    await request(app.getHttpServer())
      .post('/distributions')
      .set('Authorization', `Bearer ${beneficiarioToken}`)
      .send({})
      .expect(403);
  });
});
```

---

## 📚 Recursos Adicionais

### Comandos Úteis

```bash
# Backend - Executar testes E2E
npm run test:e2e

# Backend - Executar com cobertura
npm run test:e2e -- --coverage

# Frontend - Executar testes Detox
detox test --configuration ios.sim.debug

# Frontend - Executar testes em modo debug
detox test --configuration android.emu.debug --loglevel trace
```

### Boas Práticas

1. **Isolamento**: Cada teste deve ser independente
2. **Limpeza**: Limpar dados entre testes
3. **Asserções**: Ser específico e verificar múltiplos aspectos
4. **Nomenclatura**: Usar nomes descritivos (deve fazer X quando Y)
5. **Organização**: Agrupar testes relacionados
6. **Performance**: Evitar testes lentos desnecessários

---

**Documento criado em:** 2025-11-19  
**Última atualização:** 2025-11-19  
**Versão:** 1.0

