/**
 * Serviço de analytics - comunicação com as rotas de analytics do backend
 */
import api from "./api";

export interface DashboardStats {
  totalUsers: number;
  totalDonors: number;
  totalBeneficiaries: number;
  totalItems: number;
  totalDistributions: number;
  totalCategories: number;
  lowStockItems: number;
  recentDistributions: number;
}

export interface UsersStats {
  usersByRole: Array<{ role: string; count: string }>;
  activeUsers: number;
  inactiveUsers: number;
  recentUsers: number;
}

export interface ItemsStats {
  totalItems: number;
  itemsByStatus: Array<{ status: string; count: string }>;
  itemsByType: Array<{ type: string; count: string }>;
}

export interface DistributionsStats {
  totalDistributions: number;
  distributionsByMonth: Array<{ month: string; count: string }>;
}

export interface InventoryStats {
  totalInventoryItems: number;
  lowStockItems: number;
  totalQuantity: number;
  itemsByLocation: Array<{
    location: string;
    count: string;
    totalQuantity: string;
  }>;
}

export interface TrendsData {
  itemsTrend: Array<{ period: string; count: string }>;
  distributionsTrend: Array<{ period: string; count: string }>;
  usersTrend: Array<{ period: string; count: string }>;
}

export interface TopDonor {
  donorId: string;
  donorName: string;
  totalDonations: string;
}

export interface CategoryDistribution {
  categoryId: string;
  categoryName: string;
  count: string;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  status?: string;
}

// Namespace para agrupar as funções do serviço
const AnalyticsService = {
  /**
   * Obter estatísticas gerais do dashboard
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>("/analytics/dashboard");
    return response.data;
  },

  /**
   * Obter estatísticas de usuários
   */
  getUsersStats: async (): Promise<UsersStats> => {
    const response = await api.get<UsersStats>("/analytics/users-stats");
    return response.data;
  },

  /**
   * Obter estatísticas de itens
   */
  getItemsStats: async (filters?: AnalyticsFilters): Promise<ItemsStats> => {
    const response = await api.get<ItemsStats>("/analytics/items-stats", {
      params: filters,
    });
    return response.data;
  },

  /**
   * Obter estatísticas de distribuições
   */
  getDistributionsStats: async (
    filters?: AnalyticsFilters
  ): Promise<DistributionsStats> => {
    const response = await api.get<DistributionsStats>(
      "/analytics/distributions-stats",
      {
        params: filters,
      }
    );
    return response.data;
  },

  /**
   * Obter estatísticas de estoque
   */
  getInventoryStats: async (): Promise<InventoryStats> => {
    const response = await api.get<InventoryStats>("/analytics/inventory-stats");
    return response.data;
  },

  /**
   * Obter tendências ao longo do tempo
   */
  getTrends: async (period?: string): Promise<TrendsData> => {
    const response = await api.get<TrendsData>("/analytics/trends", {
      params: { period },
    });
    return response.data;
  },

  /**
   * Obter top doadores
   */
  getTopDonors: async (limit?: number): Promise<TopDonor[]> => {
    const response = await api.get<TopDonor[]>("/analytics/top-donors", {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Obter distribuição por categorias
   */
  getCategoriesDistribution: async (): Promise<CategoryDistribution[]> => {
    const response = await api.get<CategoryDistribution[]>(
      "/analytics/categories-distribution"
    );
    return response.data;
  },
};

export default AnalyticsService;

