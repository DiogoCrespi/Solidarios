import { UserRole } from '../../src/modules/users/entities/user.entity';
import { ItemType, ItemStatus } from '../../src/modules/items/entities/item.entity';

/**
 * Factory para criar dados de teste
 * Usa identificadores únicos (timestamps) para evitar conflitos com dados de desenvolvimento
 */
export class TestFactory {
  private static getUniqueId(): string {
    return Date.now().toString();
  }

  /**
   * Cria dados de usuário para testes
   * Por padrão, retorna apenas campos aceitos pelo RegisterDto
   * Use overrides para adicionar campos extras quando necessário (ex: para atualização)
   */
  static createUser(overrides?: Partial<any>) {
    const uniqueId = this.getUniqueId();
    return {
      name: `Test User ${uniqueId}`,
      email: `test-${uniqueId}@example.com`,
      password: 'Test123!@#',
      role: UserRole.DOADOR,
      ...overrides,
    };
  }

  static createItem(overrides?: Partial<any>) {
    return {
      type: ItemType.ROUPA,
      description: `[TEST] Test Item ${this.getUniqueId()}`,
      conservationState: 'Bom',
      size: 'M',
      status: ItemStatus.DISPONIVEL,
      ...overrides,
    };
  }

  static createCategory(overrides?: Partial<any>) {
    const uniqueId = this.getUniqueId();
    return {
      name: `Test Category ${uniqueId}`,
      description: 'Test Category Description',
      ...overrides,
    };
  }

  static createDistribution(overrides?: Partial<any>) {
    return {
      beneficiaryId: '',
      items: [],
      ...overrides,
    };
  }
}

