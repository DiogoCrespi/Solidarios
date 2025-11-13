import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { AuditLog, AuditAction, AuditResource } from './entities/audit-log.entity';
import { AuditLogFilterDto } from './dto/audit-log-filter.dto';
import { User } from '../users/entities/user.entity';

export interface CreateAuditLogDto {
  userId?: string;
  userName?: string;
  userEmail?: string;
  action: AuditAction;
  resourceType: AuditResource;
  resourceId?: string;
  resourceName?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Cria um novo registro de auditoria
   */
  async create(dto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(dto);
    return await this.auditLogRepository.save(auditLog);
  }

  /**
   * Registra uma ação de auditoria
   */
  async log(
    action: AuditAction,
    resourceType: AuditResource,
    user: User | null,
    options: {
      resourceId?: string;
      resourceName?: string;
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
      description?: string;
      ipAddress?: string;
      userAgent?: string;
      endpoint?: string;
      method?: string;
    } = {},
  ): Promise<AuditLog> {
    return await this.create({
      userId: user?.id,
      userName: user?.name,
      userEmail: user?.email,
      action,
      resourceType,
      resourceId: options.resourceId,
      resourceName: options.resourceName,
      oldValues: options.oldValues,
      newValues: options.newValues,
      description: options.description,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      endpoint: options.endpoint,
      method: options.method,
    });
  }

  /**
   * Busca logs de auditoria com filtros e paginação
   */
  async findAll(filters: AuditLogFilterDto): Promise<{
    data: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, ...filterOptions } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    // Aplicar filtros
    if (filterOptions.userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId: filterOptions.userId });
    }

    if (filterOptions.action) {
      queryBuilder.andWhere('audit.action = :action', { action: filterOptions.action });
    }

    if (filterOptions.resourceType) {
      queryBuilder.andWhere('audit.resourceType = :resourceType', {
        resourceType: filterOptions.resourceType,
      });
    }

    if (filterOptions.resourceId) {
      queryBuilder.andWhere('audit.resourceId = :resourceId', {
        resourceId: filterOptions.resourceId,
      });
    }

    if (filterOptions.startDate) {
      queryBuilder.andWhere('audit.createdAt >= :startDate', {
        startDate: filterOptions.startDate,
      });
    }

    if (filterOptions.endDate) {
      queryBuilder.andWhere('audit.createdAt <= :endDate', {
        endDate: filterOptions.endDate,
      });
    }

    if (filterOptions.search) {
      queryBuilder.andWhere(
        '(audit.userName ILIKE :search OR audit.userEmail ILIKE :search OR audit.resourceName ILIKE :search OR audit.description ILIKE :search)',
        { search: `%${filterOptions.search}%` },
      );
    }

    // Ordenar por data mais recente primeiro
    queryBuilder.orderBy('audit.createdAt', 'DESC');

    // Contar total
    const total = await queryBuilder.getCount();

    // Aplicar paginação
    queryBuilder.skip(skip).take(limit);

    // Executar query
    const data = await queryBuilder.getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Busca um log de auditoria por ID
   */
  async findOne(id: string): Promise<AuditLog> {
    const log = await this.auditLogRepository.findOne({
      where: { id },
    });
    if (!log) {
      throw new NotFoundException(`Log de auditoria com ID ${id} não encontrado`);
    }
    return log;
  }

  /**
   * Busca logs de auditoria de um recurso específico
   */
  async findByResource(
    resourceType: AuditResource,
    resourceId: string,
  ): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: {
        resourceType,
        resourceId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Busca logs de auditoria de um usuário específico
   */
  async findByUser(userId: string): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: {
        userId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Busca estatísticas de auditoria
   */
  async getStats(filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    total: number;
    byAction: Array<{ action: string; count: number }>;
    byResource: Array<{ resourceType: string; count: number }>;
    byPeriod: Array<{ period: string; count: number }>;
    byUser: Array<{ userId: string; userName: string; count: number }>;
    last24Hours: number;
    last7Days: number;
    last30Days: number;
  }> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    // Aplicar filtros de data se fornecidos
    if (filters?.startDate) {
      queryBuilder.andWhere('audit.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere('audit.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    // Total de logs
    const total = await queryBuilder.getCount();

    // Estatísticas por ação
    const byActionQuery = this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.action')
      .orderBy('count', 'DESC');

    if (filters?.startDate) {
      byActionQuery.andWhere('audit.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      byActionQuery.andWhere('audit.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    const byAction = await byActionQuery.getRawMany();

    // Estatísticas por recurso
    const byResourceQuery = this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.resourceType', 'resourceType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.resourceType')
      .orderBy('count', 'DESC');

    if (filters?.startDate) {
      byResourceQuery.andWhere('audit.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      byResourceQuery.andWhere('audit.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    const byResource = await byResourceQuery.getRawMany();

    // Estatísticas por período (últimos 30 dias, agrupados por dia)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const byPeriodQuery = this.auditLogRepository
      .createQueryBuilder('audit')
      .select(`TO_CHAR(audit.createdAt, 'YYYY-MM-DD')`, 'period')
      .addSelect('COUNT(*)', 'count')
      .where('audit.createdAt >= :thirtyDaysAgo', { thirtyDaysAgo })
      .groupBy(`TO_CHAR(audit.createdAt, 'YYYY-MM-DD')`)
      .orderBy('period', 'ASC');

    if (filters?.startDate) {
      byPeriodQuery.andWhere('audit.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      byPeriodQuery.andWhere('audit.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    const byPeriod = await byPeriodQuery.getRawMany();

    // Estatísticas por usuário (top 10)
    const byUserQuery = this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.userId', 'userId')
      .addSelect('audit.userName', 'userName')
      .addSelect('COUNT(*)', 'count')
      .where('audit.userId IS NOT NULL')
      .groupBy('audit.userId')
      .addGroupBy('audit.userName')
      .orderBy('count', 'DESC')
      .limit(10);

    if (filters?.startDate) {
      byUserQuery.andWhere('audit.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      byUserQuery.andWhere('audit.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    const byUser = await byUserQuery.getRawMany();

    // Contadores por período
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Usar query builder para contagens por período
    const last24HoursQuery = this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.createdAt >= :date', { date: last24Hours });
    const last24HoursResult = await last24HoursQuery.getCount();

    const last7DaysQuery = this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.createdAt >= :date', { date: last7Days });
    const last7DaysResult = await last7DaysQuery.getCount();

    const last30DaysQuery = this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.createdAt >= :date', { date: last30Days });
    const last30DaysResult = await last30DaysQuery.getCount();

    return {
      total,
      byAction: byAction.map((item) => ({
        action: item.action,
        count: parseInt(item.count, 10),
      })),
      byResource: byResource.map((item) => ({
        resourceType: item.resourceType,
        count: parseInt(item.count, 10),
      })),
      byPeriod: byPeriod.map((item) => ({
        period: item.period,
        count: parseInt(item.count, 10),
      })),
      byUser: byUser.map((item) => ({
        userId: item.userId,
        userName: item.userName || 'Desconhecido',
        count: parseInt(item.count, 10),
      })),
      last24Hours: last24HoursResult || 0,
      last7Days: last7DaysResult || 0,
      last30Days: last30DaysResult || 0,
    };
  }
}

