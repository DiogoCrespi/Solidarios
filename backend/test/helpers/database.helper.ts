import { DataSource } from 'typeorm';
import { User } from '../../src/modules/users/entities/user.entity';
import { Item } from '../../src/modules/items/entities/item.entity';
import { Category } from '../../src/modules/categories/entities/category.entity';
import { Distribution } from '../../src/modules/distributions/entities/distribution.entity';
import { Inventory } from '../../src/modules/inventory/entities/inventory.entity';
import { RefreshToken } from '../../src/modules/auth/entities/refresh-token.entity';

/**
 * Limpa apenas dados criados pelos testes
 * Como estamos usando o ambiente de desenvolvimento, não devemos limpar tudo,
 * apenas os dados criados durante os testes (identificados por prefixos ou padrões)
 * 
 * IMPORTANTE: Ordem de limpeza deve respeitar foreign keys:
 * 1. Distributions (tem FK para users e items)
 * 2. Inventory (tem FK para items)
 * 3. Items (tem FK para users e categories)
 * 4. RefreshTokens (tem FK para users)
 * 5. Users
 * 6. Categories
 */
export async function cleanTestData(dataSource: DataSource): Promise<void> {
  try {
    // 1. Limpar distribuições de teste primeiro (tem FK para users e items)
    const distributionRepository = dataSource.getRepository(Distribution);
    // Limpar distribuições que referenciam usuários de teste
    await distributionRepository
      .createQueryBuilder()
      .delete()
      .where(
        `"beneficiaryId" IN (SELECT id FROM users WHERE email LIKE '%@example.com' OR email LIKE '%@test.%') OR ` +
        `"employeeId" IN (SELECT id FROM users WHERE email LIKE '%@example.com' OR email LIKE '%@test.%')`
      )
      .execute();

    // 2. Limpar inventory de teste (tem FK para items)
    const inventoryRepository = dataSource.getRepository(Inventory);
    await inventoryRepository
      .createQueryBuilder()
      .delete()
      .where(
        `"itemId" IN (SELECT id FROM items WHERE description LIKE '%[TEST]%')`
      )
      .execute();

    // 3. Limpar itens de teste (tem FK para users e categories)
    const itemRepository = dataSource.getRepository(Item);
    await itemRepository
      .createQueryBuilder()
      .delete()
      .where("description LIKE '%[TEST]%'")
      .execute();

    // 4. Limpar refresh tokens de teste (tem FK para users)
    const refreshTokenRepository = dataSource.getRepository(RefreshToken);
    await refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where(
        `"userId" IN (SELECT id FROM users WHERE email LIKE '%@example.com' OR email LIKE '%@test.%')`
      )
      .execute();

    // 5. Limpar usuários de teste (email contendo '@example.com' ou '@test.')
    const userRepository = dataSource.getRepository(User);
    await userRepository
      .createQueryBuilder()
      .delete()
      .where("email LIKE '%@example.com' OR email LIKE '%@test.%'")
      .execute();

    // 6. Limpar categorias de teste (nome começando com 'Test Category')
    const categoryRepository = dataSource.getRepository(Category);
    await categoryRepository
      .createQueryBuilder()
      .delete()
      .where("name LIKE 'Test Category%'")
      .execute();
  } catch (error) {
    console.error('Erro ao limpar dados de teste:', error);
    // Não lançar erro para não quebrar os testes
  }
}

/**
 * Garante que dados básicos necessários para testes existam
 * (ex: usuário admin padrão, categorias básicas)
 */
export async function seedTestData(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  const categoryRepository = dataSource.getRepository(Category);

  // Verificar se usuário admin padrão existe (usar o do ambiente de dev)
  // Não criar se já existir para não interferir com dados de desenvolvimento
  const adminExists = await userRepository.findOne({
    where: { email: 'admin@sanem.com' },
  });

  if (!adminExists) {
    // Se não existir, criar um admin de teste (mas isso não deve acontecer em dev)
    console.warn('Usuário admin padrão não encontrado. Certifique-se de que existe no ambiente de desenvolvimento.');
  }
}

/**
 * Alternativa: Usar transações para isolar dados de teste
 * (mais seguro, mas requer configuração adicional)
 */
export async function withTransaction<T>(
  dataSource: DataSource,
  callback: (queryRunner: any) => Promise<T>,
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

