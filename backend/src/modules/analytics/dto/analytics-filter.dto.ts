import { IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyticsFilterDto {
  @ApiPropertyOptional({
    description: 'Data inicial para filtro',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Data final para filtro',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'ID da categoria para filtro',
  })
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Status para filtro',
  })
  @IsOptional()
  status?: string;
}

