import {
  Controller,
  Get,
  Query,
  UseGuards,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AnalyticsFilterDto } from './dto/analytics-filter.dto';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Obter estatísticas gerais do dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas gerais retornadas com sucesso.',
  })
  @Roles(UserRole.ADMIN, UserRole.FUNCIONARIO)
  getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('users-stats')
  @ApiOperation({ summary: 'Obter estatísticas de usuários' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas de usuários retornadas com sucesso.',
  })
  @Roles(UserRole.ADMIN)
  getUsersStats() {
    return this.analyticsService.getUsersStats();
  }

  @Get('items-stats')
  @ApiOperation({ summary: 'Obter estatísticas de itens/doações' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas de itens retornadas com sucesso.',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Data inicial para filtro',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Data final para filtro',
  })
  @Roles(UserRole.ADMIN, UserRole.FUNCIONARIO)
  @UsePipes(new ValidationPipe({ transform: true }))
  getItemsStats(@Query() filters: AnalyticsFilterDto) {
    return this.analyticsService.getItemsStats(filters);
  }

  @Get('distributions-stats')
  @ApiOperation({ summary: 'Obter estatísticas de distribuições' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas de distribuições retornadas com sucesso.',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Data inicial para filtro',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Data final para filtro',
  })
  @Roles(UserRole.ADMIN, UserRole.FUNCIONARIO)
  @UsePipes(new ValidationPipe({ transform: true }))
  getDistributionsStats(@Query() filters: AnalyticsFilterDto) {
    return this.analyticsService.getDistributionsStats(filters);
  }

  @Get('inventory-stats')
  @ApiOperation({ summary: 'Obter estatísticas de estoque' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas de estoque retornadas com sucesso.',
  })
  @Roles(UserRole.ADMIN, UserRole.FUNCIONARIO)
  getInventoryStats() {
    return this.analyticsService.getInventoryStats();
  }

  @Get('trends')
  @ApiOperation({ summary: 'Obter tendências ao longo do tempo' })
  @ApiResponse({
    status: 200,
    description: 'Tendências retornadas com sucesso.',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Período (day, week, month, year)',
  })
  @Roles(UserRole.ADMIN, UserRole.FUNCIONARIO)
  getTrends(@Query('period') period?: string) {
    return this.analyticsService.getTrends(period);
  }

  @Get('top-donors')
  @ApiOperation({ summary: 'Obter top doadores' })
  @ApiResponse({
    status: 200,
    description: 'Top doadores retornados com sucesso.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limite de resultados',
  })
  @Roles(UserRole.ADMIN, UserRole.FUNCIONARIO)
  getTopDonors(@Query('limit') limit?: number) {
    return this.analyticsService.getTopDonors(limit || 10);
  }

  @Get('categories-distribution')
  @ApiOperation({ summary: 'Obter distribuição por categorias' })
  @ApiResponse({
    status: 200,
    description: 'Distribuição por categorias retornada com sucesso.',
  })
  @Roles(UserRole.ADMIN, UserRole.FUNCIONARIO)
  getCategoriesDistribution() {
    return this.analyticsService.getCategoriesDistribution();
  }
}

