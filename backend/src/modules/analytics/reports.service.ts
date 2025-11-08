import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import PDFDocument = require('pdfkit');
import { AnalyticsService } from './analytics.service';
import { GenerateReportDto, ReportType, ReportFormat } from './dto/generate-report.dto';
import { LoggingService } from '../../common/logging/logging.service';

// Tipo para PDFDocument - InstanceType do PDFDocument constructor
type PDFDocumentType = InstanceType<typeof PDFDocument>;

@Injectable()
export class ReportsService {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly logger: LoggingService,
  ) {
    this.logger.setContext('ReportsService');
  }

  async generateReport(dto: GenerateReportDto, res: Response): Promise<void> {
    this.logger.log(`Gerando relatório: ${dto.type} em formato ${dto.format}`);

    try {
      switch (dto.format) {
        case ReportFormat.PDF:
          await this.generatePDF(dto, res);
          break;
        case ReportFormat.CSV:
          await this.generateCSV(dto, res);
          break;
        case ReportFormat.XLSX:
          throw new Error('Formato XLSX ainda não implementado');
        default:
          throw new Error(`Formato ${dto.format} não suportado`);
      }
    } catch (error) {
      this.logger.error(`Erro ao gerar relatório: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async generatePDF(dto: GenerateReportDto, res: Response): Promise<void> {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    // Configurar headers para download
    const filename = `relatorio_${dto.type}_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe do PDF para a resposta
    doc.pipe(res);

    // Cabeçalho
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('Relatório Solidários', 50, 50, { align: 'center' });

    doc
      .fontSize(14)
      .font('Helvetica')
      .text(`Tipo: ${this.getReportTypeLabel(dto.type)}`, 50, 100);

    doc.text(`Data de geração: ${new Date().toLocaleString('pt-BR')}`, 50, 120);

    if (dto.startDate || dto.endDate) {
      doc.text(
        `Período: ${dto.startDate || 'Início'} até ${dto.endDate || 'Fim'}`,
        50,
        140,
      );
    }

    let yPosition = 180;

    // Gerar conteúdo baseado no tipo
    switch (dto.type) {
      case ReportType.DASHBOARD:
        yPosition = await this.generateDashboardPDF(doc, yPosition);
        break;
      case ReportType.USERS:
        yPosition = await this.generateUsersPDF(doc, yPosition);
        break;
      case ReportType.ITEMS:
        yPosition = await this.generateItemsPDF(doc, yPosition, dto);
        break;
      case ReportType.DISTRIBUTIONS:
        yPosition = await this.generateDistributionsPDF(doc, yPosition, dto);
        break;
      case ReportType.INVENTORY:
        yPosition = await this.generateInventoryPDF(doc, yPosition);
        break;
      case ReportType.DONORS:
        yPosition = await this.generateDonorsPDF(doc, yPosition);
        break;
    }

    // Rodapé
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(
        `Gerado pelo sistema Solidários - Página ${doc.bufferedPageRange().count}`,
        50,
        doc.page.height - 50,
        { align: 'center' },
      );

    doc.end();
  }

  private async generateDashboardPDF(doc: PDFDocumentType, yPosition: number): Promise<number> {
    const stats = await this.analyticsService.getDashboardStats();
    let y = yPosition;

    doc.fontSize(18).font('Helvetica-Bold').text('Estatísticas Gerais', 50, y);
    y += 30;

    doc.fontSize(12).font('Helvetica');

    const statsData = [
      ['Total de Usuários', stats.totalUsers.toString()],
      ['Total de Doadores', stats.totalDonors.toString()],
      ['Total de Beneficiários', stats.totalBeneficiaries.toString()],
      ['Total de Itens', stats.totalItems.toString()],
      ['Total de Distribuições', stats.totalDistributions.toString()],
      ['Total de Categorias', stats.totalCategories.toString()],
      ['Itens com Estoque Baixo', stats.lowStockItems.toString()],
      ['Distribuições Recentes', stats.recentDistributions.toString()],
    ];

    statsData.forEach(([label, value]) => {
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }
      doc.text(`${label}:`, 70, y);
      doc.font('Helvetica-Bold').text(value, 250, y);
      doc.font('Helvetica');
      y += 20;
    });

    return y + 20;
  }

  private async generateUsersPDF(doc: PDFDocumentType, yPosition: number): Promise<number> {
    const stats = await this.analyticsService.getUsersStats();
    let y = yPosition;

    doc.fontSize(18).font('Helvetica-Bold').text('Estatísticas de Usuários', 50, y);
    y += 30;

    doc.fontSize(12).font('Helvetica');
    doc.text(`Usuários Ativos: ${stats.activeUsers}`, 70, y);
    y += 20;
    doc.text(`Usuários Inativos: ${stats.inactiveUsers}`, 70, y);
    y += 20;
    doc.text(`Usuários Recentes: ${stats.recentUsers}`, 70, y);
    y += 30;

    doc.font('Helvetica-Bold').text('Usuários por Função:', 70, y);
    y += 20;
    doc.font('Helvetica');

    stats.usersByRole.forEach((role) => {
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }
      doc.text(`${role.role}: ${role.count}`, 90, y);
      y += 20;
    });

    return y + 20;
  }

  private async generateItemsPDF(
    doc: PDFDocumentType,
    yPosition: number,
    dto: GenerateReportDto,
  ): Promise<number> {
    const stats = await this.analyticsService.getItemsStats({
      startDate: dto.startDate,
      endDate: dto.endDate,
    });
    let y = yPosition;

    doc.fontSize(18).font('Helvetica-Bold').text('Estatísticas de Itens', 50, y);
    y += 30;

    doc.fontSize(12).font('Helvetica');
    doc.text(`Total de Itens: ${stats.totalItems}`, 70, y);
    y += 30;

    doc.font('Helvetica-Bold').text('Itens por Status:', 70, y);
    y += 20;
    doc.font('Helvetica');

    stats.itemsByStatus.forEach((status) => {
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }
      doc.text(`${status.status}: ${status.count}`, 90, y);
      y += 20;
    });

    y += 10;
    doc.font('Helvetica-Bold').text('Itens por Tipo:', 70, y);
    y += 20;
    doc.font('Helvetica');

    stats.itemsByType.forEach((type) => {
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }
      doc.text(`${type.type}: ${type.count}`, 90, y);
      y += 20;
    });

    return y + 20;
  }

  private async generateDistributionsPDF(
    doc: PDFDocumentType,
    yPosition: number,
    dto: GenerateReportDto,
  ): Promise<number> {
    const stats = await this.analyticsService.getDistributionsStats({
      startDate: dto.startDate,
      endDate: dto.endDate,
    });
    let y = yPosition;

    doc.fontSize(18).font('Helvetica-Bold').text('Estatísticas de Distribuições', 50, y);
    y += 30;

    doc.fontSize(12).font('Helvetica');
    doc.text(`Total de Distribuições: ${stats.totalDistributions}`, 70, y);
    y += 30;

    if (stats.distributionsByMonth && stats.distributionsByMonth.length > 0) {
      doc.font('Helvetica-Bold').text('Distribuições por Mês:', 70, y);
      y += 20;
      doc.font('Helvetica');

      stats.distributionsByMonth.forEach((month) => {
        if (y > doc.page.height - 100) {
          doc.addPage();
          y = 50;
        }
        doc.text(`${month.month}: ${month.count}`, 90, y);
        y += 20;
      });
    }

    return y + 20;
  }

  private async generateInventoryPDF(doc: PDFDocumentType, yPosition: number): Promise<number> {
    const stats = await this.analyticsService.getInventoryStats();
    let y = yPosition;

    doc.fontSize(18).font('Helvetica-Bold').text('Estatísticas de Estoque', 50, y);
    y += 30;

    doc.fontSize(12).font('Helvetica');
    doc.text(`Total de Itens no Estoque: ${stats.totalInventoryItems}`, 70, y);
    y += 20;
    doc.text(`Itens com Estoque Baixo: ${stats.lowStockItems}`, 70, y);
    y += 20;
    doc.text(`Quantidade Total: ${stats.totalQuantity}`, 70, y);
    y += 30;

    if (stats.itemsByLocation && stats.itemsByLocation.length > 0) {
      doc.font('Helvetica-Bold').text('Itens por Localização:', 70, y);
      y += 20;
      doc.font('Helvetica');

      stats.itemsByLocation.forEach((location) => {
        if (y > doc.page.height - 100) {
          doc.addPage();
          y = 50;
        }
        doc.text(
          `${location.location}: ${location.count} itens (${location.totalQuantity} unidades)`,
          90,
          y,
        );
        y += 20;
      });
    }

    return y + 20;
  }

  private async generateDonorsPDF(doc: PDFDocumentType, yPosition: number): Promise<number> {
    const topDonors = await this.analyticsService.getTopDonors(10);
    let y = yPosition;

    doc.fontSize(18).font('Helvetica-Bold').text('Top Doadores', 50, y);
    y += 30;

    doc.fontSize(12).font('Helvetica');

    if (topDonors.length === 0) {
      doc.text('Nenhum doador encontrado.', 70, y);
      return y + 20;
    }

    topDonors.forEach((donor, index) => {
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }
      doc.text(`${index + 1}. ${donor.donorName}`, 70, y);
      doc.font('Helvetica-Bold').text(`${donor.totalDonations} doações`, 400, y);
      doc.font('Helvetica');
      y += 25;
    });

    return y + 20;
  }

  private async generateCSV(dto: GenerateReportDto, res: Response): Promise<void> {
    // Implementação de CSV seria similar, mas retornando texto CSV
    // Por enquanto, vamos focar no PDF
    throw new Error('Formato CSV ainda não implementado');
  }

  private getReportTypeLabel(type: ReportType): string {
    const labels = {
      [ReportType.DASHBOARD]: 'Relatório Geral',
      [ReportType.USERS]: 'Relatório de Usuários',
      [ReportType.ITEMS]: 'Relatório de Itens',
      [ReportType.DISTRIBUTIONS]: 'Relatório de Distribuições',
      [ReportType.INVENTORY]: 'Relatório de Estoque',
      [ReportType.DONORS]: 'Relatório de Doadores',
    };
    return labels[type] || type;
  }
}

