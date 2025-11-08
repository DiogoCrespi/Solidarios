import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportType {
  DASHBOARD = 'dashboard',
  USERS = 'users',
  ITEMS = 'items',
  DISTRIBUTIONS = 'distributions',
  INVENTORY = 'inventory',
  DONORS = 'donors',
}

export enum ReportFormat {
  PDF = 'pdf',
  XLSX = 'xlsx',
  CSV = 'csv',
}

export class GenerateReportDto {
  @ApiProperty({
    description: 'Tipo de relatório',
    enum: ReportType,
    example: ReportType.DASHBOARD,
  })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({
    description: 'Formato do relatório',
    enum: ReportFormat,
    example: ReportFormat.PDF,
  })
  @IsEnum(ReportFormat)
  format: ReportFormat;

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
}

