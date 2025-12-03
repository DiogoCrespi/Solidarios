import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Item, ItemStatus } from '../items/entities/item.entity';
import { Distribution } from '../distributions/entities/distribution.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Category } from '../categories/entities/category.entity';
import { AnalyticsFilterDto } from './dto/analytics-filter.dto';
import { LoggingService } from '../../common/logging/logging.service';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
    @InjectRepository(Distribution)
    private distributionsRepository: Repository<Distribution>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    private readonly logger: LoggingService,
  ) {
    this.logger.setContext('AnalyticsService');
  }

  async getDashboardStats() {
    this.logger.log('Buscando estatísticas gerais do dashboard');

    try {
      const [
        totalUsers,
        totalDonors,
        totalBeneficiaries,
        totalItems,
        availableItems,
        totalDistributions,
        totalCategories,
        lowStockItems,
        recentDistributions,
      ] = await Promise.all([
        this.usersRepository.count(),
        this.usersRepository.count({ where: { role: UserRole.DOADOR } }),
        this.usersRepository.count({ where: { role: UserRole.BENEFICIARIO } }),
        this.itemsRepository.count(),
        this.itemsRepository
          .createQueryBuilder('item')
          .where('item.status = :status', { status: ItemStatus.DISPONIVEL })
          .getCount(),
        this.distributionsRepository.count(),
        this.categoriesRepository.count(),
        this.inventoryRepository.count({
          where: { quantity: LessThanOrEqual(5) },
        }),
        this.distributionsRepository
          .createQueryBuilder('distribution')
          .orderBy('distribution.date', 'DESC')
          .take(5)
          .getCount(),
      ]);

      return {
        totalUsers,
        totalDonors,
        totalBeneficiaries,
        totalItems,
        availableItems,
        totalDistributions,
        totalCategories,
        lowStockItems,
        recentDistributions,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao buscar estatísticas do dashboard: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getUsersStats() {
    this.logger.log('Buscando estatísticas de usuários');

    try {
      const usersByRole = await this.usersRepository
        .createQueryBuilder('user')
        .select('user.role', 'role')
        .addSelect('COUNT(user.id)', 'count')
        .groupBy('user.role')
        .getRawMany();

      const activeUsers = await this.usersRepository.count({
        where: { isActive: true },
      });

      const inactiveUsers = await this.usersRepository.count({
        where: { isActive: false },
      });

      const recentUsers = await this.usersRepository
        .createQueryBuilder('user')
        .where('user.createdAt >= :date', {
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 dias
        })
        .getCount();

      return {
        usersByRole,
        activeUsers,
        inactiveUsers,
        recentUsers,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao buscar estatísticas de usuários: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getItemsStats(filters: AnalyticsFilterDto) {
    this.logger.log('Buscando estatísticas de itens');

    try {
      const queryBuilder = this.itemsRepository.createQueryBuilder('item');

      if (filters.startDate) {
        queryBuilder.andWhere('item.receivedDate >= :startDate', {
          startDate: filters.startDate,
        });
      }

      if (filters.endDate) {
        queryBuilder.andWhere('item.receivedDate <= :endDate', {
          endDate: filters.endDate,
        });
      }

      if (filters.categoryId) {
        queryBuilder.andWhere('item.categoryId = :categoryId', {
          categoryId: filters.categoryId,
        });
      }

      if (filters.status) {
        queryBuilder.andWhere('item.status = :status', {
          status: filters.status,
        });
      }

      const [totalItems, itemsByStatus, itemsByType] = await Promise.all([
        queryBuilder.getCount(),
        this.itemsRepository
          .createQueryBuilder('item')
          .select('item.status', 'status')
          .addSelect('COUNT(item.id)', 'count')
          .groupBy('item.status')
          .getRawMany(),
        this.itemsRepository
          .createQueryBuilder('item')
          .select('item.type', 'type')
          .addSelect('COUNT(item.id)', 'count')
          .groupBy('item.type')
          .getRawMany(),
      ]);

      return {
        totalItems,
        itemsByStatus,
        itemsByType,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao buscar estatísticas de itens: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getDistributionsStats(filters: AnalyticsFilterDto) {
    this.logger.log('Buscando estatísticas de distribuições');

    try {
      const queryBuilder = this.distributionsRepository.createQueryBuilder('distribution');

      if (filters.startDate) {
        queryBuilder.andWhere('distribution.date >= :startDate', {
          startDate: filters.startDate,
        });
      }

      if (filters.endDate) {
        queryBuilder.andWhere('distribution.date <= :endDate', {
          endDate: filters.endDate,
        });
      }

      const [totalDistributions, distributionsByMonth] = await Promise.all([
        queryBuilder.getCount(),
        this.distributionsRepository
          .createQueryBuilder('distribution')
          .select("TO_CHAR(distribution.date, 'YYYY-MM')", 'month')
          .addSelect('COUNT(distribution.id)', 'count')
          .groupBy('month')
          .orderBy('month', 'DESC')
          .limit(12)
          .getRawMany(),
      ]);

      return {
        totalDistributions,
        distributionsByMonth,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao buscar estatísticas de distribuições: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getInventoryStats() {
    this.logger.log('Buscando estatísticas de estoque');

    try {
      const [totalInventoryItems, lowStockItems, totalQuantity] =
        await Promise.all([
          this.inventoryRepository.count(),
          this.inventoryRepository.count({
            where: { quantity: LessThanOrEqual(5) },
          }),
          this.inventoryRepository
            .createQueryBuilder('inventory')
            .select('SUM(inventory.quantity)', 'total')
            .getRawOne(),
        ]);

      const itemsByLocation = await this.inventoryRepository
        .createQueryBuilder('inventory')
        .select('inventory.location', 'location')
        .addSelect('COUNT(inventory.id)', 'count')
        .addSelect('SUM(inventory.quantity)', 'totalQuantity')
        .groupBy('inventory.location')
        .getRawMany();

      return {
        totalInventoryItems,
        lowStockItems,
        totalQuantity: parseInt(totalQuantity.total) || 0,
        itemsByLocation,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao buscar estatísticas de estoque: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getTrends(period: string = 'month') {
    this.logger.log(`Buscando tendências para período: ${period}`);

    try {
      let dateFormat = 'YYYY-MM';
      let dateInterval = '1 month';

      switch (period) {
        case 'day':
          dateFormat = 'YYYY-MM-DD';
          dateInterval = '1 day';
          break;
        case 'week':
          dateFormat = 'YYYY-WW';
          dateInterval = '1 week';
          break;
        case 'year':
          dateFormat = 'YYYY';
          dateInterval = '1 year';
          break;
      }

      const [itemsTrend, distributionsTrend, usersTrend] = await Promise.all([
        this.itemsRepository
          .createQueryBuilder('item')
          .select(`TO_CHAR(item.receivedDate, '${dateFormat}')`, 'period')
          .addSelect('COUNT(item.id)', 'count')
          .groupBy('period')
          .orderBy('period', 'DESC')
          .limit(12)
          .getRawMany(),
        this.distributionsRepository
          .createQueryBuilder('distribution')
          .select(`TO_CHAR(distribution.date, '${dateFormat}')`, 'period')
          .addSelect('COUNT(distribution.id)', 'count')
          .groupBy('period')
          .orderBy('period', 'DESC')
          .limit(12)
          .getRawMany(),
        this.usersRepository
          .createQueryBuilder('user')
          .select(`TO_CHAR(user.createdAt, '${dateFormat}')`, 'period')
          .addSelect('COUNT(user.id)', 'count')
          .groupBy('period')
          .orderBy('period', 'DESC')
          .limit(12)
          .getRawMany(),
      ]);

      return {
        itemsTrend,
        distributionsTrend,
        usersTrend,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao buscar tendências: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getTopDonors(limit: number = 10) {
    this.logger.log(`Buscando top ${limit} doadores`);

    try {
      const topDonors = await this.itemsRepository
        .createQueryBuilder('item')
        .leftJoin('item.donor', 'donor')
        .select('donor.id', 'donorId')
        .addSelect('donor.name', 'donorName')
        .addSelect('COUNT(item.id)', 'totalDonations') // Sem aspas
        .where('donor.id IS NOT NULL') // Apenas itens com doador
        .groupBy('donor.id')
        .addGroupBy('donor.name')
        .orderBy('COUNT(item.id)', 'DESC') // Usar a função COUNT diretamente
        .limit(limit)
        .getRawMany();

      return topDonors;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar top doadores: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getCategoriesDistribution() {
    this.logger.log('Buscando distribuição por categorias');

    try {
      const categoriesDistribution = await this.itemsRepository
        .createQueryBuilder('item')
        .leftJoin('item.category', 'category')
        .select('category.id', 'categoryId')
        .addSelect('category.name', 'categoryName')
        .addSelect('COUNT(item.id)', 'count')
        .groupBy('category.id')
        .addGroupBy('category.name')
        .orderBy('count', 'DESC')
        .getRawMany();

      return categoriesDistribution;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar distribuição por categorias: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Métodos auxiliares para buscar listas completas para relatórios
  async getAllUsers() {
    return this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getAllItems() {
    return this.itemsRepository.find({
      relations: ['donor', 'category'],
      order: { receivedDate: 'DESC' },
    });
  }

  async getAllDistributions() {
    return this.distributionsRepository.find({
      relations: ['beneficiary', 'employee', 'items'],
      order: { date: 'DESC' },
    });
  }

  async getAllCategories() {
    return this.categoriesRepository.find({
      order: { name: 'ASC' },
    });
  }

  async getLowStockInventoryItems() {
    return this.inventoryRepository.find({
      where: { quantity: LessThanOrEqual(5) },
      relations: ['item', 'item.category'],
    });
  }
}

