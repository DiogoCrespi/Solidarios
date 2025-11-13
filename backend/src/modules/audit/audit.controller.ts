import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditLogFilterDto } from './dto/audit-log-filter.dto';
import { AuditStatsDto } from './dto/audit-stats.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AuditResource } from './entities/audit-log.entity';

@ApiTags('Audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('stats/summary')
  @ApiOperation({ summary: 'Obter estatísticas de auditoria' })
  @ApiResponse({ status: 200, description: 'Estatísticas de auditoria', type: AuditStatsDto })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Data inicial (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Data final (YYYY-MM-DD)' })
  async getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.auditService.getStats({ startDate, endDate });
  }

  @Get('resource/:resourceType/:resourceId')
  @ApiOperation({ summary: 'Buscar logs de auditoria de um recurso específico' })
  @ApiResponse({ status: 200, description: 'Logs de auditoria do recurso' })
  async findByResource(
    @Param('resourceType') resourceType: AuditResource,
    @Param('resourceId') resourceId: string,
  ) {
    return await this.auditService.findByResource(resourceType, resourceId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Buscar logs de auditoria de um usuário específico' })
  @ApiResponse({ status: 200, description: 'Logs de auditoria do usuário' })
  async findByUser(@Param('userId') userId: string) {
    return await this.auditService.findByUser(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar logs de auditoria' })
  @ApiResponse({ status: 200, description: 'Lista de logs de auditoria' })
  async findAll(@Query() filters: AuditLogFilterDto) {
    return await this.auditService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um log de auditoria por ID' })
  @ApiResponse({ status: 200, description: 'Log de auditoria encontrado' })
  async findOne(@Param('id') id: string) {
    return await this.auditService.findOne(id);
  }
}

