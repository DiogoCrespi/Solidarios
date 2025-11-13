/**
 * Serviço de auditoria - comunicação com as rotas de audit do backend
 */
import api from "./api";

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  VIEW = "VIEW",
}

export enum AuditResource {
  USER = "USER",
  ITEM = "ITEM",
  CATEGORY = "CATEGORY",
  INVENTORY = "INVENTORY",
  DISTRIBUTION = "DISTRIBUTION",
  AUTH = "AUTH",
}

export interface AuditLog {
  id: string;
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
  createdAt: string;
}

export interface AuditLogFilter {
  userId?: string;
  action?: AuditAction;
  resourceType?: AuditResource;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogPage {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const AuditService = {
  /**
   * Listar logs de auditoria com filtros e paginação
   */
  getAll: async (filters?: AuditLogFilter): Promise<AuditLogPage> => {
    const response = await api.get<{ data: AuditLogPage }>("/audit", {
      params: filters,
    });
    // O TransformResponseInterceptor envolve a resposta em { data: ..., statusCode: ..., message: ..., timestamp: ... }
    // Então response.data já é { data: AuditLogPage, statusCode: ..., message: ..., timestamp: ... }
    // E precisamos extrair o AuditLogPage de response.data.data
    return response.data.data || response.data;
  },

  /**
   * Buscar um log de auditoria por ID
   */
  getById: async (id: string): Promise<AuditLog> => {
    const response = await api.get<{ data: AuditLog }>(`/audit/${id}`);
    // O TransformResponseInterceptor envolve a resposta em { data: ..., statusCode: ..., message: ..., timestamp: ... }
    return response.data.data || response.data;
  },

  /**
   * Buscar logs de auditoria de um recurso específico
   */
  getByResource: async (
    resourceType: AuditResource,
    resourceId: string
  ): Promise<AuditLog[]> => {
    const response = await api.get<{ data: AuditLog[] }>(
      `/audit/resource/${resourceType}/${resourceId}`
    );
    // O TransformResponseInterceptor envolve a resposta em { data: ..., statusCode: ..., message: ..., timestamp: ... }
    return response.data.data || response.data;
  },

  /**
   * Buscar logs de auditoria de um usuário específico
   */
  getByUser: async (userId: string): Promise<AuditLog[]> => {
    const response = await api.get<{ data: AuditLog[] }>(
      `/audit/user/${userId}`
    );
    // O TransformResponseInterceptor envolve a resposta em { data: ..., statusCode: ..., message: ..., timestamp: ... }
    return response.data.data || response.data;
  },

  /**
   * Obter estatísticas de auditoria
   */
  getStats: async (filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<AuditStats> => {
    const response = await api.get<{ data: AuditStats }>('/audit/stats/summary', {
      params: filters,
    });
    // O TransformResponseInterceptor envolve a resposta em { data: ..., statusCode: ..., message: ..., timestamp: ... }
    // Então response.data já é { data: AuditStats, statusCode: ..., message: ..., timestamp: ... }
    // E precisamos extrair o AuditStats de response.data.data
    return response.data.data || response.data;
  },
};

export interface AuditStats {
  total: number;
  byAction: Array<{ action: string; count: number }>;
  byResource: Array<{ resourceType: string; count: number }>;
  byPeriod: Array<{ period: string; count: number }>;
  byUser: Array<{ userId: string; userName: string; count: number }>;
  last24Hours: number;
  last7Days: number;
  last30Days: number;
}

export default AuditService;

