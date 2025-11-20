import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
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
  
  // Aplicar validação global (como no main.ts)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  dataSource = app.get(DataSource);
  
  // Limpar apenas dados de teste anteriores (não limpar todo o banco)
  await cleanTestData(dataSource);
  
  // Garantir dados básicos necessários para testes (se não existirem)
  await seedTestData(dataSource);
}, 30000); // Timeout de 30 segundos para inicialização

afterAll(async () => {
  // Limpar dados de teste ao final de todos os testes
  try {
    if (dataSource && dataSource.isInitialized) {
      await cleanTestData(dataSource);
      await dataSource.destroy();
    }
  } catch (error) {
    console.error('Erro ao limpar dados de teste:', error);
  }
  
  try {
    if (app) {
      await app.close();
    }
  } catch (error) {
    console.error('Erro ao fechar aplicação:', error);
  }
  
  // Aguardar um pouco para garantir que todas as conexões sejam fechadas
  await new Promise((resolve) => setTimeout(resolve, 1000));
}, 15000);

afterEach(async () => {
  // Limpar dados específicos entre testes se necessário
  // (opcional - pode ser feito por teste individual se preferir)
});

export { app, dataSource };

