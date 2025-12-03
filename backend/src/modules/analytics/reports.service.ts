import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import PDFDocument = require('pdfkit');
import { AnalyticsService } from './analytics.service';
import { GenerateReportDto, ReportType, ReportFormat } from './dto/generate-report.dto';
import { LoggingService } from '../../common/logging/logging.service';
import { UserRole } from '../users/entities/user.entity';
import { LessThanOrEqual } from 'typeorm';

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

  // Helper para quebrar texto longo em múltiplas linhas
  private addTextWithWrap(
    doc: PDFDocumentType,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
  ): number {
    const height = doc.heightOfString(text, {
      width: maxWidth,
    });
    doc.text(text, x, y, {
      width: maxWidth,
      align: 'left',
    });
    return y + height;
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
    const usersStats = await this.analyticsService.getUsersStats();
    const itemsStats = await this.analyticsService.getItemsStats({});
    const topDonors = await this.analyticsService.getTopDonors(5);
    const categoriesDistribution = await this.analyticsService.getCategoriesDistribution();
    
    // Buscar listas completas de dados
    const allUsers = await this.analyticsService.getAllUsers();
    const allDoadores = allUsers.filter((u) => u.role === UserRole.DOADOR);
    const allBeneficiarios = allUsers.filter((u) => u.role === UserRole.BENEFICIARIO);
    const allItems = await this.analyticsService.getAllItems();
    const allDistributions = await this.analyticsService.getAllDistributions();
    const allCategories = await this.analyticsService.getAllCategories();
    const lowStockInventory = await this.analyticsService.getLowStockInventoryItems();
    const recentDistributions = allDistributions.slice(0, 5);
    
    let y = yPosition;

    // Estatísticas Gerais
    doc.fontSize(18).font('Helvetica-Bold').text('Estatísticas Gerais', 50, y);
    y += 30;

    doc.fontSize(12).font('Helvetica');

    const statsData = [
      ['Total de Usuários', stats.totalUsers.toString()],
      ['Doadores', stats.totalDonors.toString()],
      ['Beneficiários', stats.totalBeneficiaries.toString()],
      ['Total de Itens', stats.totalItems.toString()],
      ['Itens Disponíveis', stats.availableItems?.toString() || '0'],
      ['Total de Distribuições', stats.totalDistributions.toString()],
      ['Total de Categorias', stats.totalCategories.toString()],
      ['Itens com Estoque Baixo', stats.lowStockItems.toString()],
    ];

    // Total de Usuários com lista
    if (y > doc.page.height - 100) {
      doc.addPage();
      y = 50;
    }
    doc.text('Total de Usuários:', 70, y);
    doc.font('Helvetica-Bold').text(stats.totalUsers.toString(), 250, y);
    doc.font('Helvetica');
    y += 25;
    
    // Lista de todos os usuários
    if (allUsers.length > 0) {
      doc.fontSize(10).font('Helvetica');
      allUsers.forEach((user, index) => {
        if (y > doc.page.height - 80) {
          doc.addPage();
          y = 50;
        }
        const userInfo = `${index + 1}. ${user.name} (${user.email}) - ${user.role}${user.isActive ? '' : ' [Inativo]'}`;
        y = this.addTextWithWrap(doc, userInfo, 90, y, 450);
        y += 5;
      });
      y += 10;
    }

    // Doadores com lista
    if (y > doc.page.height - 100) {
      doc.addPage();
      y = 50;
    }
    doc.fontSize(12).font('Helvetica');
    doc.text('Doadores:', 70, y);
    doc.font('Helvetica-Bold').text(stats.totalDonors.toString(), 250, y);
    doc.font('Helvetica');
    y += 25;
    
    // Lista de doadores
    if (allDoadores.length > 0) {
      doc.fontSize(10).font('Helvetica');
      allDoadores.forEach((doador, index) => {
        if (y > doc.page.height - 80) {
          doc.addPage();
          y = 50;
        }
        const doadorInfo = `${index + 1}. ${doador.name} (${doador.email})${doador.phone ? ` - Tel: ${doador.phone}` : ''}`;
        y = this.addTextWithWrap(doc, doadorInfo, 90, y, 450);
        y += 5;
      });
      y += 10;
    }

    // Beneficiários com lista
    if (y > doc.page.height - 100) {
      doc.addPage();
      y = 50;
    }
    doc.fontSize(12).font('Helvetica');
    doc.text('Beneficiários:', 70, y);
    doc.font('Helvetica-Bold').text(stats.totalBeneficiaries.toString(), 250, y);
    doc.font('Helvetica');
    y += 25;
    
    // Lista de beneficiários
    if (allBeneficiarios.length > 0) {
      doc.fontSize(10).font('Helvetica');
      allBeneficiarios.forEach((beneficiario, index) => {
        if (y > doc.page.height - 80) {
          doc.addPage();
          y = 50;
        }
        const beneficiarioInfo = `${index + 1}. ${beneficiario.name} (${beneficiario.email})${beneficiario.phone ? ` - Tel: ${beneficiario.phone}` : ''}`;
        y = this.addTextWithWrap(doc, beneficiarioInfo, 90, y, 450);
        y += 5;
      });
      y += 10;
    }

    // Total de Itens com lista
    if (y > doc.page.height - 100) {
      doc.addPage();
      y = 50;
    }
    doc.fontSize(12).font('Helvetica');
    doc.text('Total de Itens:', 70, y);
    doc.font('Helvetica-Bold').text(stats.totalItems.toString(), 250, y);
    doc.font('Helvetica');
    y += 25;
    
    // Lista de itens
    if (allItems.length > 0) {
      doc.fontSize(10).font('Helvetica');
      allItems.forEach((item, index) => {
        if (y > doc.page.height - 80) {
          doc.addPage();
          y = 50;
        }
        const itemInfo = `${index + 1}. ${item.description} - ${item.type} - ${item.status}${item.donor ? ` (Doador: ${item.donor.name})` : ''}${item.category ? ` - Categoria: ${item.category.name}` : ''}`;
        y = this.addTextWithWrap(doc, itemInfo, 90, y, 450);
        y += 5;
      });
      y += 10;
    }

    // Total de Distribuições com lista
    if (y > doc.page.height - 100) {
      doc.addPage();
      y = 50;
    }
    doc.fontSize(12).font('Helvetica');
    doc.text('Total de Distribuições:', 70, y);
    doc.font('Helvetica-Bold').text(stats.totalDistributions.toString(), 250, y);
    doc.font('Helvetica');
    y += 25;
    
    // Lista de distribuições
    if (allDistributions.length > 0) {
      doc.fontSize(10).font('Helvetica');
      allDistributions.forEach((dist, index) => {
        if (y > doc.page.height - 80) {
          doc.addPage();
          y = 50;
        }
        const distInfo = `${index + 1}. Data: ${new Date(dist.date).toLocaleDateString('pt-BR')} - Beneficiário: ${dist.beneficiary?.name || 'N/A'} - Itens: ${dist.items?.length || 0}${dist.observations ? ` - Obs: ${dist.observations}` : ''}`;
        y = this.addTextWithWrap(doc, distInfo, 90, y, 450);
        y += 5;
      });
      y += 10;
    }

    // Total de Categorias com lista
    if (y > doc.page.height - 100) {
      doc.addPage();
      y = 50;
    }
    doc.fontSize(12).font('Helvetica');
    doc.text('Total de Categorias:', 70, y);
    doc.font('Helvetica-Bold').text(stats.totalCategories.toString(), 250, y);
    doc.font('Helvetica');
    y += 25;
    
    // Lista de categorias
    if (allCategories.length > 0) {
      doc.fontSize(10).font('Helvetica');
      allCategories.forEach((category, index) => {
        if (y > doc.page.height - 80) {
          doc.addPage();
          y = 50;
        }
        const categoryInfo = `${index + 1}. ${category.name}${category.description ? ` - ${category.description}` : ''}`;
        y = this.addTextWithWrap(doc, categoryInfo, 90, y, 450);
        y += 5;
      });
      y += 10;
    }

    // Itens com Estoque Baixo com lista
    if (y > doc.page.height - 100) {
      doc.addPage();
      y = 50;
    }
    doc.fontSize(12).font('Helvetica');
    doc.text('Itens com Estoque Baixo:', 70, y);
    doc.font('Helvetica-Bold').text(stats.lowStockItems.toString(), 250, y);
    doc.font('Helvetica');
    y += 25;
    
    // Lista de itens com estoque baixo
    if (lowStockInventory.length > 0) {
      doc.fontSize(10).font('Helvetica');
      lowStockInventory.forEach((inv, index) => {
        if (y > doc.page.height - 80) {
          doc.addPage();
          y = 50;
        }
        const invInfo = `${index + 1}. ${inv.item?.description || 'Item sem descrição'} - Quantidade: ${inv.quantity}${inv.alertLevel ? ` (Alerta: ${inv.alertLevel})` : ''}${inv.location ? ` - Local: ${inv.location}` : ''}`;
        y = this.addTextWithWrap(doc, invInfo, 90, y, 450);
        y += 5;
      });
      y += 10;
    }

    // Distribuições Recentes com lista
    if (y > doc.page.height - 100) {
      doc.addPage();
      y = 50;
    }
    doc.fontSize(12).font('Helvetica');
    doc.text('Distribuições Recentes:', 70, y);
    doc.font('Helvetica-Bold').text(recentDistributions.length.toString(), 250, y);
    doc.font('Helvetica');
    y += 25;
    
    // Lista de distribuições recentes
    if (recentDistributions.length > 0) {
      doc.fontSize(10).font('Helvetica');
      recentDistributions.forEach((dist, index) => {
        if (y > doc.page.height - 80) {
          doc.addPage();
          y = 50;
        }
        const distInfo = `${index + 1}. Data: ${new Date(dist.date).toLocaleDateString('pt-BR')} - Beneficiário: ${dist.beneficiary?.name || 'N/A'} - Itens: ${dist.items?.length || 0}${dist.observations ? ` - Obs: ${dist.observations}` : ''}`;
        y = this.addTextWithWrap(doc, distInfo, 90, y, 450);
        y += 5;
      });
      y += 10;
    }

    y += 20;

    // Estatísticas de Usuários
    if (y > doc.page.height - 120) {
      doc.addPage();
      y = 50;
    }
    doc.fontSize(16).font('Helvetica-Bold').text('Estatísticas de Usuários', 50, y);
    y += 25;

    doc.fontSize(12).font('Helvetica');
    doc.text(`Usuários Ativos: ${usersStats.activeUsers}`, 70, y);
    y += 20;
    doc.text(`Usuários Inativos: ${usersStats.inactiveUsers}`, 70, y);
    y += 20;
    doc.text(`Novos Usuários (30 dias): ${usersStats.recentUsers}`, 70, y);
    y += 25;

    doc.font('Helvetica-Bold').text('Usuários por Tipo:', 70, y);
    y += 20;
    doc.font('Helvetica');

    usersStats.usersByRole.forEach((role) => {
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }
      doc.text(`${role.role}: ${role.count}`, 90, y);
      y += 20;
    });

    y += 20;

    // Estatísticas de Itens
    if (y > doc.page.height - 120) {
      doc.addPage();
      y = 50;
    }
    doc.fontSize(16).font('Helvetica-Bold').text('Estatísticas de Itens', 50, y);
    y += 25;

    doc.fontSize(12).font('Helvetica');
    doc.font('Helvetica-Bold').text('Itens por Status:', 70, y);
    y += 20;
    doc.font('Helvetica');

    itemsStats.itemsByStatus.forEach((status) => {
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

    itemsStats.itemsByType.forEach((type) => {
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }
      doc.text(`${type.type}: ${type.count}`, 90, y);
      y += 20;
    });

    y += 20;

    // Top Doadores
    if (topDonors.length > 0) {
      if (y > doc.page.height - 120) {
        doc.addPage();
        y = 50;
      }
      doc.fontSize(16).font('Helvetica-Bold').text('Top 5 Doadores', 50, y);
      y += 25;

      doc.fontSize(12).font('Helvetica');

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

      y += 20;
    }

    // Distribuição por Categorias
    if (categoriesDistribution.length > 0) {
      if (y > doc.page.height - 120) {
        doc.addPage();
        y = 50;
      }
      doc.fontSize(16).font('Helvetica-Bold').text('Distribuição por Categorias', 50, y);
      y += 25;

      doc.fontSize(12).font('Helvetica');

      categoriesDistribution.forEach((category) => {
        if (y > doc.page.height - 100) {
          doc.addPage();
          y = 50;
        }
        doc.text(`${category.categoryName}:`, 70, y);
        doc.font('Helvetica-Bold').text(`${category.count} itens`, 250, y);
        doc.font('Helvetica');
        y += 20;
      });
    }

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
      categoryId: dto.categoryId,
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

