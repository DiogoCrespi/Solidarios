# Testes E2E - Backend

Esta pasta contém os testes end-to-end (E2E) para o backend da aplicação.

## 📁 Estrutura

```
test/
├── jest-e2e.json          # Configuração do Jest para testes E2E
├── setup.ts               # Setup global dos testes
├── helpers/                # Helpers e utilities
│   ├── auth.helper.ts     # Funções de autenticação
│   ├── database.helper.ts # Funções de limpeza e seeds
│   ├── factory.helper.ts  # Factory para criar dados de teste
│   └── api.helper.ts      # Helper para requisições HTTP
├── fixtures/              # Dados fixos para testes
└── e2e/                   # Testes E2E organizados por módulo
    └── auth/
        └── login.e2e-spec.ts
```

## 🚀 Como Executar

```bash
# Executar todos os testes E2E
npm run test:e2e

# Executar com cobertura
npm run test:e2e -- --coverage

# Executar um arquivo específico
npm run test:e2e -- login.e2e-spec.ts

# Executar em modo watch
npm run test:e2e -- --watch
```

## ⚠️ Importante

**Ambiente de Desenvolvimento:**
- Os testes usam o mesmo ambiente de desenvolvimento (Docker, .env, banco de dados)
- Os dados de teste são identificados por padrões específicos:
  - Usuários: emails contendo `@example.com` ou `@test.`
  - Itens: descrição contendo `[TEST]`
  - Categorias: nome começando com `Test Category`
- A limpeza de dados é feita automaticamente antes e depois dos testes

## 📝 Escrevendo Testes

### Exemplo Básico

```typescript
import * as request from 'supertest';
import { app } from '../../setup';
import { registerUser, loginAs } from '../../helpers/auth.helper';
import { TestFactory } from '../../helpers/factory.helper';

describe('Meu Módulo (e2e)', () => {
  it('deve fazer algo', async () => {
    // Arrange
    const userData = TestFactory.createUser();
    await registerUser(app, userData);

    // Act
    const response = await request(app.getHttpServer())
      .get('/endpoint')
      .set('Authorization', `Bearer ${token}`);

    // Assert
    expect(response.status).toBe(200);
  });
});
```

### Helpers Disponíveis

- **TestFactory**: Cria dados de teste com identificadores únicos
- **auth.helper**: Funções de login, registro, tokens
- **database.helper**: Limpeza de dados de teste
- **api.helper**: Wrapper para requisições HTTP

## 🔧 Configuração

O arquivo `jest-e2e.json` configura:
- Pattern de arquivos de teste: `*.e2e-spec.ts`
- Setup global: `setup.ts`
- Timeout: 30 segundos
- Transformação TypeScript

## 📚 Documentação Completa

Consulte a documentação completa em `docs/testes-e2e/`:
- `PLANO_TESTES_E2E.md` - Plano completo de implementação
- `TEMPLATES_E_EXEMPLOS.md` - Templates e exemplos práticos


