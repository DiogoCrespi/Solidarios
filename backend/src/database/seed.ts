import { DataSource } from 'typeorm';
import { User, UserRole } from '../modules/users/entities/user.entity';
import { Category } from '../modules/categories/entities/category.entity';
import { Item, ItemType, ItemStatus } from '../modules/items/entities/item.entity';
import { Distribution } from '../modules/distributions/entities/distribution.entity';
import { Inventory } from '../modules/inventory/entities/inventory.entity';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../config/typeorm.config';

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...');

  const dataSource = AppDataSource;

  try {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    console.log('✅ Conexão com banco de dados estabelecida');

    const userRepository = dataSource.getRepository(User);
    const categoryRepository = dataSource.getRepository(Category);
    const itemRepository = dataSource.getRepository(Item);
    const distributionRepository = dataSource.getRepository(Distribution);
    const inventoryRepository = dataSource.getRepository(Inventory);

    // 1. Criar Usuários
    console.log('👥 Criando usuários...');
    const hashedPassword = await bcrypt.hash('senha123', 10);

    const users = [
      {
        name: 'Administrador',
        email: 'admin@sanem.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
      },
      {
        name: 'João Funcionário',
        email: 'funcionario@sanem.com',
        password: hashedPassword,
        role: UserRole.FUNCIONARIO,
        isActive: true,
      },
      {
        name: 'Maria Doadora',
        email: 'maria.doadora@email.com',
        password: hashedPassword,
        role: UserRole.DOADOR,
        isActive: true,
        phone: '(45) 99999-1111',
        address: 'Rua das Flores, 123',
      },
      {
        name: 'Pedro Doador',
        email: 'pedro.doador@email.com',
        password: hashedPassword,
        role: UserRole.DOADOR,
        isActive: true,
        phone: '(45) 99999-2222',
        address: 'Av. Principal, 456',
      },
      {
        name: 'Ana Beneficiária',
        email: 'ana.beneficiaria@email.com',
        password: hashedPassword,
        role: UserRole.BENEFICIARIO,
        isActive: true,
        phone: '(45) 99999-3333',
        address: 'Rua da Esperança, 789',
      },
      {
        name: 'Carlos Beneficiário',
        email: 'carlos.beneficiario@email.com',
        password: hashedPassword,
        role: UserRole.BENEFICIARIO,
        isActive: true,
        phone: '(45) 99999-4444',
        address: 'Rua da Paz, 321',
      },
    ];

    const savedUsers: User[] = [];
    for (const userData of users) {
      const existingUser = await userRepository.findOne({
        where: { email: userData.email },
      });
      if (!existingUser) {
        const user = userRepository.create(userData);
        const saved = await userRepository.save(user);
        savedUsers.push(saved);
        console.log(`  ✅ Usuário criado: ${userData.name} (${userData.email})`);
      } else {
        savedUsers.push(existingUser);
        console.log(`  ⏭️  Usuário já existe: ${userData.name} (${userData.email})`);
      }
    }

    const admin = savedUsers.find((u) => u.role === UserRole.ADMIN)!;
    const funcionario = savedUsers.find((u) => u.role === UserRole.FUNCIONARIO)!;
    const doadores = savedUsers.filter((u) => u.role === UserRole.DOADOR);
    const beneficiarios = savedUsers.filter((u) => u.role === UserRole.BENEFICIARIO);

    // 2. Criar Categorias
    console.log('📁 Criando categorias...');
    const categories = [
      {
        name: 'Roupas',
        description: 'Roupas em geral (camisetas, calças, blusas, etc.)',
      },
      {
        name: 'Calçados',
        description: 'Sapatos, tênis, chinelos, botas',
      },
      {
        name: 'Utensílios Domésticos',
        description: 'Panelas, pratos, talheres, eletrodomésticos',
      },
      {
        name: 'Móveis',
        description: 'Cadeiras, mesas, camas, armários',
      },
      {
        name: 'Livros',
        description: 'Livros didáticos, literatura, revistas',
      },
      {
        name: 'Brinquedos',
        description: 'Brinquedos para crianças',
      },
    ];

    const savedCategories: Category[] = [];
    for (const categoryData of categories) {
      const existingCategory = await categoryRepository.findOne({
        where: { name: categoryData.name },
      });
      if (!existingCategory) {
        const category = categoryRepository.create(categoryData);
        const saved = await categoryRepository.save(category);
        savedCategories.push(saved);
        console.log(`  ✅ Categoria criada: ${categoryData.name}`);
      } else {
        savedCategories.push(existingCategory);
        console.log(`  ⏭️  Categoria já existe: ${categoryData.name}`);
      }
    }

    const categoriaRoupas = savedCategories.find((c) => c.name === 'Roupas')!;
    const categoriaCalcados = savedCategories.find((c) => c.name === 'Calçados')!;
    const categoriaUtensilios = savedCategories.find((c) => c.name === 'Utensílios Domésticos')!;
    const categoriaMoveis = savedCategories.find((c) => c.name === 'Móveis')!;

    // 3. Criar Itens
    console.log('📦 Criando itens...');
    const items = [
      {
        type: ItemType.ROUPA,
        description: 'Camiseta masculina tamanho M - azul',
        conservationState: 'Bom',
        size: 'M',
        status: ItemStatus.DISPONIVEL,
        donorId: doadores[0].id,
        categoryId: categoriaRoupas.id,
        receivedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 dias atrás
      },
      {
        type: ItemType.ROUPA,
        description: 'Calça jeans feminina tamanho 38',
        conservationState: 'Ótimo',
        size: '38',
        status: ItemStatus.DISPONIVEL,
        donorId: doadores[0].id,
        categoryId: categoriaRoupas.id,
        receivedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        type: ItemType.ROUPA,
        description: 'Blusa de lã tamanho P - vermelha',
        conservationState: 'Bom',
        size: 'P',
        status: ItemStatus.DISPONIVEL,
        donorId: doadores[1].id,
        categoryId: categoriaRoupas.id,
        receivedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        type: ItemType.CALCADO,
        description: 'Tênis esportivo número 40',
        conservationState: 'Ótimo',
        size: '40',
        status: ItemStatus.DISPONIVEL,
        donorId: doadores[0].id,
        categoryId: categoriaCalcados.id,
        receivedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        type: ItemType.CALCADO,
        description: 'Sapato social número 42',
        conservationState: 'Bom',
        size: '42',
        status: ItemStatus.DISPONIVEL,
        donorId: doadores[1].id,
        categoryId: categoriaCalcados.id,
        receivedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        type: ItemType.UTENSILIO,
        description: 'Conjunto de panelas antiaderentes',
        conservationState: 'Ótimo',
        size: undefined,
        status: ItemStatus.DISPONIVEL,
        donorId: doadores[0].id,
        categoryId: categoriaUtensilios.id,
        receivedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        type: ItemType.UTENSILIO,
        description: 'Jogo de pratos e talheres',
        conservationState: 'Bom',
        size: undefined,
        status: ItemStatus.DISPONIVEL,
        donorId: doadores[1].id,
        categoryId: categoriaUtensilios.id,
        receivedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        type: ItemType.OUTRO,
        description: 'Cadeira de escritório',
        conservationState: 'Bom',
        size: undefined,
        status: ItemStatus.DISPONIVEL,
        donorId: doadores[0].id,
        categoryId: categoriaMoveis.id,
        receivedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        type: ItemType.ROUPA,
        description: 'Vestido tamanho G - estampado',
        conservationState: 'Ótimo',
        size: 'G',
        status: ItemStatus.RESERVADO,
        donorId: doadores[1].id,
        categoryId: categoriaRoupas.id,
        receivedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        type: ItemType.CALCADO,
        description: 'Sandália número 36',
        conservationState: 'Bom',
        size: '36',
        status: ItemStatus.DISPONIVEL,
        donorId: doadores[0].id,
        categoryId: categoriaCalcados.id,
        receivedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    const savedItems: Item[] = [];
    for (const itemData of items) {
      const itemDataFixed = {
        ...itemData,
        size: itemData.size || undefined,
      };
      const item = itemRepository.create(itemDataFixed);
      const saved: Item = await itemRepository.save(item);
      savedItems.push(saved);
      console.log(`  ✅ Item criado: ${itemData.description}`);
    }

    // 4. Criar Distribuições
    console.log('📋 Criando distribuições...');
    const availableItems = savedItems.filter((i) => i.status === ItemStatus.DISPONIVEL);
    const distributedItems = availableItems.slice(0, 3);

    // Atualizar status dos itens distribuídos
    for (const item of distributedItems) {
      item.status = ItemStatus.DISTRIBUIDO;
      await itemRepository.save(item);
    }

    const distributions = [
      {
        beneficiaryId: beneficiarios[0].id,
        employeeId: funcionario.id,
        items: distributedItems.slice(0, 2),
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        observations: 'Distribuição realizada com sucesso',
      },
      {
        beneficiaryId: beneficiarios[1].id,
        employeeId: funcionario.id,
        items: [distributedItems[2]],
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        observations: 'Item entregue em bom estado',
      },
    ];

    const savedDistributions: Distribution[] = [];
    for (const distData of distributions) {
      const distribution = distributionRepository.create({
        beneficiaryId: distData.beneficiaryId,
        employeeId: distData.employeeId,
        date: distData.date,
        observations: distData.observations,
        items: distData.items,
      });
      const saved = await distributionRepository.save(distribution);
      savedDistributions.push(saved);
      console.log(`  ✅ Distribuição criada para beneficiário ${distData.beneficiaryId} com ${distData.items.length} item(ns)`);
    }

    // 5. Criar Inventory
    console.log('📊 Criando registros de inventory...');
    const availableItemsForInventory = savedItems.filter(
      (item) => item.status === ItemStatus.DISPONIVEL || item.status === ItemStatus.RESERVADO
    );

    const inventoryData = [
      {
        itemId: availableItemsForInventory[0]?.id,
        quantity: 5,
        location: 'Prateleira A1',
        alertLevel: 3,
      },
      {
        itemId: availableItemsForInventory[1]?.id,
        quantity: 3,
        location: 'Prateleira A2',
        alertLevel: 2,
      },
      {
        itemId: availableItemsForInventory[2]?.id,
        quantity: 8,
        location: 'Prateleira B1',
        alertLevel: 5,
      },
      {
        itemId: availableItemsForInventory[3]?.id,
        quantity: 2,
        location: 'Prateleira B2',
        alertLevel: 3, // Estoque baixo (quantity <= alertLevel)
      },
      {
        itemId: availableItemsForInventory[4]?.id,
        quantity: 1,
        location: 'Prateleira C1',
        alertLevel: 2, // Estoque baixo
      },
      {
        itemId: availableItemsForInventory[5]?.id,
        quantity: 10,
        location: 'Prateleira C2',
        alertLevel: 5,
      },
      {
        itemId: availableItemsForInventory[6]?.id,
        quantity: 4,
        location: 'Prateleira D1',
        alertLevel: 3,
      },
      {
        itemId: availableItemsForInventory[7]?.id,
        quantity: 6,
        location: 'Prateleira D2',
        alertLevel: 4,
      },
    ];

    const savedInventory: Inventory[] = [];
    for (const invData of inventoryData) {
      if (!invData.itemId) continue; // Pular se não houver item disponível
      
      // Verificar se já existe inventory para este item
      const existingInventory = await inventoryRepository.findOne({
        where: { itemId: invData.itemId },
      });
      
      if (!existingInventory) {
        const inventory = inventoryRepository.create(invData);
        const saved = await inventoryRepository.save(inventory);
        savedInventory.push(saved);
        const item = savedItems.find((i) => i.id === invData.itemId);
        console.log(`  ✅ Inventory criado: ${item?.description || invData.itemId} (Qtd: ${invData.quantity})`);
      } else {
        savedInventory.push(existingInventory);
        console.log(`  ⏭️  Inventory já existe para item ${invData.itemId}`);
      }
    }

    console.log('\n✅ Seed concluído com sucesso!');
    console.log(`\n📊 Resumo:`);
    console.log(`  - Usuários: ${savedUsers.length}`);
    console.log(`  - Categorias: ${savedCategories.length}`);
    console.log(`  - Itens: ${savedItems.length}`);
    console.log(`  - Distribuições: ${savedDistributions.length}`);
    console.log(`  - Inventory: ${savedInventory.length}`);
    console.log(`\n🔑 Credenciais padrão:`);
    console.log(`  - Admin: admin@sanem.com / senha123`);
    console.log(`  - Funcionário: funcionario@sanem.com / senha123`);
    console.log(`  - Doadores/Beneficiários: [email] / senha123`);
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    throw error;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Conexão com banco de dados fechada');
    }
  }
}

// Executar seed
seed()
  .then(() => {
    console.log('✨ Processo de seed finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal no seed:', error);
    process.exit(1);
  });

