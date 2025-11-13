import { ApiProperty } from '@nestjs/swagger';

export class AuditStatsByActionDto {
  @ApiProperty({ description: 'Tipo de ação', example: 'CREATE' })
  action: string;

  @ApiProperty({ description: 'Quantidade de logs', example: 150 })
  count: number;
}

export class AuditStatsByResourceDto {
  @ApiProperty({ description: 'Tipo de recurso', example: 'USER' })
  resourceType: string;

  @ApiProperty({ description: 'Quantidade de logs', example: 200 })
  count: number;
}

export class AuditStatsByPeriodDto {
  @ApiProperty({ description: 'Período (data)', example: '2024-01-01' })
  period: string;

  @ApiProperty({ description: 'Quantidade de logs', example: 50 })
  count: number;
}

export class AuditStatsByUserDto {
  @ApiProperty({ description: 'ID do usuário', example: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'Nome do usuário', example: 'João Silva' })
  userName: string;

  @ApiProperty({ description: 'Quantidade de ações', example: 30 })
  count: number;
}

export class AuditStatsDto {
  @ApiProperty({ description: 'Total de logs de auditoria', example: 1000 })
  total: number;

  @ApiProperty({ description: 'Logs por ação', type: [AuditStatsByActionDto] })
  byAction: AuditStatsByActionDto[];

  @ApiProperty({ description: 'Logs por recurso', type: [AuditStatsByResourceDto] })
  byResource: AuditStatsByResourceDto[];

  @ApiProperty({ description: 'Logs por período', type: [AuditStatsByPeriodDto] })
  byPeriod: AuditStatsByPeriodDto[];

  @ApiProperty({ description: 'Logs por usuário', type: [AuditStatsByUserDto] })
  byUser: AuditStatsByUserDto[];

  @ApiProperty({ description: 'Ações mais frequentes (últimas 24h)', example: 150 })
  last24Hours: number;

  @ApiProperty({ description: 'Ações mais frequentes (últimos 7 dias)', example: 500 })
  last7Days: number;

  @ApiProperty({ description: 'Ações mais frequentes (últimos 30 dias)', example: 1000 })
  last30Days: number;
}

