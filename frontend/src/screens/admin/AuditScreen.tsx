import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {
  Typography,
  Card,
  Loading,
  ErrorState,
  Button,
  Select,
  TextField,
} from '../../components/barrelComponents';
import { SimpleBarChart, SimplePieChart } from '../../components/charts';
import { useTheme } from '../../hooks/useTheme';
import AuditService, {
  AuditLog,
  AuditLogFilter,
  AuditAction,
  AuditResource,
  AuditStats,
} from '../../api/audit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// Função simples de formatação de data (sem dependência externa)
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} às ${hours}:${minutes}:${seconds}`;
  } catch {
    return dateString;
  }
};

const AuditScreen: React.FC = () => {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  
  // Determinar se é desktop (largura maior que 1024px)
  const isDesktop = width > 1024;
  const isTablet = width > 600 && width <= 1024;
  const maxContentWidth = isDesktop ? 1400 : undefined;
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [showStats, setShowStats] = useState(true);

  // Filtros
  const [filters, setFilters] = useState<AuditLogFilter>({
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    loadAuditLogs();
  }, [filters]);

  const loadAuditLogs = async () => {
    try {
      setError(null);
      const [response, statsData] = await Promise.all([
        AuditService.getAll(filters),
        AuditService.getStats({
          startDate: filters.startDate,
          endDate: filters.endDate,
        }),
      ]);
      
      // AuditService.getAll já extrai os dados corretamente, então response é { data: AuditLog[], total: number, page: number, limit: number, totalPages: number }
      setLogs(Array.isArray(response.data) ? response.data : []);
      setPagination({
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || 20,
        totalPages: response.totalPages || 0,
      });
      setStats(statsData);
    } catch (err: any) {
      console.error('Erro ao carregar logs de auditoria:', err);
      setError('Não foi possível carregar os logs de auditoria.');
      setLogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAuditLogs();
  };

  const handleApplyFilters = () => {
    // Os filtros são aplicados automaticamente via state
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 20 });
    setShowFilters(false);
  };

  const updateFilter = (key: keyof AuditLogFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      page: 1, // Resetar página ao filtrar
    }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters({ ...filters, page: newPage });
    }
  };

  const getActionColor = (action: AuditAction): string => {
    switch (action) {
      case AuditAction.CREATE:
        return theme.colors.status.success;
      case AuditAction.UPDATE:
        return theme.colors.status.info;
      case AuditAction.DELETE:
        return theme.colors.status.error;
      case AuditAction.LOGIN:
      case AuditAction.LOGOUT:
        return theme.colors.primary.main;
      default:
        return theme.colors.neutral.darkGray;
    }
  };

  const getActionLabel = (action: AuditAction): string => {
    const labels = {
      [AuditAction.CREATE]: 'Criar',
      [AuditAction.UPDATE]: 'Atualizar',
      [AuditAction.DELETE]: 'Deletar',
      [AuditAction.LOGIN]: 'Login',
      [AuditAction.LOGOUT]: 'Logout',
      [AuditAction.VIEW]: 'Visualizar',
    };
    return labels[action] || action;
  };

  const getResourceLabel = (resourceType: AuditResource): string => {
    const labels = {
      [AuditResource.USER]: 'Usuário',
      [AuditResource.ITEM]: 'Item',
      [AuditResource.CATEGORY]: 'Categoria',
      [AuditResource.INVENTORY]: 'Inventário',
      [AuditResource.DISTRIBUTION]: 'Distribuição',
      [AuditResource.AUTH]: 'Autenticação',
    };
    return labels[resourceType] || resourceType;
  };


  if (loading && logs.length === 0) {
    return <Loading />;
  }

  if (error && logs.length === 0) {
    return (
      <ErrorState
        title="Erro ao carregar logs"
        description={error}
        onAction={loadAuditLogs}
      />
    );
  }

  const actionOptions = [
    { label: 'Todas', value: '' },
    ...Object.values(AuditAction).map((action) => ({
      label: getActionLabel(action),
      value: action,
    })),
  ];

  const resourceOptions = [
    { label: 'Todos', value: '' },
    ...Object.values(AuditResource).map((resource) => ({
      label: getResourceLabel(resource),
      value: resource,
    })),
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.neutral.lightGray }]}>
      {/* Header */}
      <View style={[styles.header, isDesktop && styles.headerDesktop, { backgroundColor: theme.colors.neutral.white, borderBottomColor: theme.colors.neutral.lightGray }]}>
        <View style={styles.headerContent}>
          <View>
            <Typography variant="h2" color={theme.colors.primary.main}>
              Logs de Auditoria
            </Typography>
            <Typography variant="body" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
              Registro de todas as alterações no sistema
            </Typography>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: theme.colors.neutral.lightGray }]}
              onPress={() => setShowStats(!showStats)}
            >
              <MaterialCommunityIcons
                name={showStats ? "chart-line" : "chart-line-variant"}
                size={20}
                color={theme.colors.primary.main}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, isDesktop && styles.filterButtonDesktop, { backgroundColor: theme.colors.neutral.lightGray }]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <MaterialCommunityIcons
                name="filter-variant"
                size={24}
                color={theme.colors.primary.main}
              />
              <Typography variant="body" color={theme.colors.primary.main}>
                Filtros
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Filtros */}
      {showFilters && (
        <Card style={[styles.filtersCard, isDesktop && styles.filtersCardDesktop]}>
          <View style={[styles.filtersRow, isDesktop && styles.filtersRowDesktop]}>
            <View style={[styles.filterField, isDesktop && styles.filterFieldDesktop]}>
              <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
                Ação
              </Typography>
              <Select
                selectedValue={filters.action || ''}
                onSelect={(value) => updateFilter('action', value ? value as AuditAction : undefined)}
                options={actionOptions}
                placeholder="Todas as ações"
                selectStyle={styles.select}
              />
            </View>

            <View style={[styles.filterField, isDesktop && styles.filterFieldDesktop]}>
              <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
                Tipo de Recurso
              </Typography>
              <Select
                selectedValue={filters.resourceType || ''}
                onSelect={(value) => updateFilter('resourceType', value ? value as AuditResource : undefined)}
                options={resourceOptions}
                placeholder="Todos os recursos"
                selectStyle={styles.select}
              />
            </View>

            <View style={[styles.filterField, isDesktop && styles.filterFieldDesktop]}>
              <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
                Data Inicial
              </Typography>
              <TextField
                value={filters.startDate || ''}
                onChangeText={(value) => updateFilter('startDate', value || undefined)}
                placeholder="AAAA-MM-DD"
                style={styles.input}
              />
            </View>

            <View style={[styles.filterField, isDesktop && styles.filterFieldDesktop]}>
              <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
                Data Final
              </Typography>
              <TextField
                value={filters.endDate || ''}
                onChangeText={(value) => updateFilter('endDate', value || undefined)}
                placeholder="AAAA-MM-DD"
                style={styles.input}
              />
            </View>

            <View style={[styles.filterField, isDesktop && styles.filterFieldDesktop, isDesktop && { minWidth: '100%' }]}>
              <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
                Buscar
              </Typography>
              <TextField
                value={filters.search || ''}
                onChangeText={(value) => updateFilter('search', value || undefined)}
                placeholder="Usuário, recurso, descrição..."
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.filterActions}>
            <Button
              title="Limpar"
              onPress={handleClearFilters}
              variant="secondary"
              style={styles.filterActionButton}
            />
            <Button
              title="Aplicar"
              onPress={handleApplyFilters}
              style={styles.filterActionButton}
            />
          </View>
        </Card>
      )}

      {/* Lista de Logs */}
      <ScrollView
        style={[styles.content, isDesktop && styles.contentDesktop, maxContentWidth && { maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Estatísticas e Gráficos */}
        {showStats && stats && (
          <>
            {/* Cards de Estatísticas Rápidas */}
            <View style={[styles.statsCardsContainer, isDesktop && styles.statsCardsContainerDesktop]}>
              <Card style={[styles.statCard, isDesktop && styles.statCardDesktop]}>
                <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
                  Total de Logs
                </Typography>
                <Typography variant="h2" color={theme.colors.primary.main}>
                  {stats.total}
                </Typography>
              </Card>
              <Card style={styles.statCard}>
                <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
                  Últimas 24h
                </Typography>
                <Typography variant="h2" color={theme.colors.status.info}>
                  {stats.last24Hours}
                </Typography>
              </Card>
              <Card style={styles.statCard}>
                <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
                  Últimos 7 dias
                </Typography>
                <Typography variant="h2" color={theme.colors.status.success}>
                  {stats.last7Days}
                </Typography>
              </Card>
              <Card style={styles.statCard}>
                <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
                  Últimos 30 dias
                </Typography>
                <Typography variant="h2" color={theme.colors.status.warning}>
                  {stats.last30Days}
                </Typography>
              </Card>
            </View>

            {/* Gráfico de Ações */}
            {stats.byAction && stats.byAction.length > 0 && (
              <Card style={[styles.chartCard, isDesktop && styles.chartCardDesktop]}>
                <SimpleBarChart
                  title="Ações por Tipo"
                  data={stats.byAction.map((item) => ({
                    label: getActionLabel(item.action as AuditAction),
                    value: item.count,
                    color: getActionColor(item.action as AuditAction),
                  }))}
                  height={200}
                />
              </Card>
            )}

            {/* Gráfico de Recursos */}
            {stats.byResource && stats.byResource.length > 0 && (
              <Card style={[styles.chartCard, isDesktop && styles.chartCardDesktop]}>
                <SimplePieChart
                  title="Distribuição por Recurso"
                  data={stats.byResource.map((item, index) => ({
                    label: getResourceLabel(item.resourceType as AuditResource),
                    value: item.count,
                    color: [
                      theme.colors.primary.main,
                      theme.colors.status.success,
                      theme.colors.status.info,
                      theme.colors.status.warning,
                      theme.colors.status.error,
                      theme.colors.primary.accent,
                    ][index % 6] || theme.colors.primary.main,
                  }))}
                />
              </Card>
            )}

            {/* Gráfico de Tendências (Período) - Usando barras verticais */}
            {stats.byPeriod && stats.byPeriod.length > 0 && (
              <Card style={[styles.chartCard, isDesktop && styles.chartCardDesktop]}>
                <SimpleBarChart
                  title="Tendências (Últimos 30 dias)"
                  data={stats.byPeriod.slice(-30).map((item) => {
                    try {
                      // Formato: YYYY-MM-DD
                      const [year, month, day] = item.period.split('-');
                      return {
                        label: `${day}/${month}`,
                        value: item.count,
                        color: theme.colors.primary.main,
                      };
                    } catch {
                      return {
                        label: item.period,
                        value: item.count,
                        color: theme.colors.primary.main,
                      };
                    }
                  })}
                  height={200}
                />
              </Card>
            )}

            {/* Top Usuários */}
            {stats.byUser && stats.byUser.length > 0 && (
              <Card style={[styles.chartCard, isDesktop && styles.chartCardDesktop]}>
                <Typography variant="h3" color={theme.isDark ? theme.colors.neutral.black : theme.colors.neutral.darkGray} style={styles.chartTitle}>
                  Top 10 Usuários Mais Ativos
                </Typography>
                <View style={styles.usersList}>
                  {stats.byUser.slice(0, 10).map((user, index) => (
                    <View key={user.userId} style={[styles.userItem, { borderBottomColor: theme.colors.neutral.mediumGray }]}>
                      <View style={styles.userRank}>
                        <Typography variant="body" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
                          #{index + 1}
                        </Typography>
                      </View>
                      <View style={styles.userInfo}>
                        <Typography variant="body" color={theme.isDark ? theme.colors.neutral.black : theme.colors.neutral.darkGray}>
                          {user.userName}
                        </Typography>
                      </View>
                      <View style={styles.userCount}>
                        <Typography variant="body" color={theme.colors.primary.main}>
                          {user.count}
                        </Typography>
                      </View>
                    </View>
                  ))}
                </View>
              </Card>
            )}
          </>
        )}

        {/* Estatísticas Simples (se não houver gráficos) */}
        {(!showStats || !stats) && (
          <Card style={styles.statsCard}>
            <Typography variant="body" color={theme.isDark ? theme.colors.neutral.black : theme.colors.neutral.darkGray}>
              Total de logs: {pagination.total}
            </Typography>
          </Card>
        )}

        {/* Logs */}
        {logs.map((log) => (
          <Card key={log.id} style={[styles.logCard, isDesktop && styles.logCardDesktop]}>
            <View style={styles.logHeader}>
              <View style={styles.logHeaderLeft}>
                <View
                  style={[
                    styles.actionBadge,
                    { backgroundColor: getActionColor(log.action) },
                  ]}
                >
                  <Typography variant="small" color={theme.colors.neutral.white}>
                    {getActionLabel(log.action)}
                  </Typography>
                </View>
                <View style={[styles.resourceBadge, { borderColor: theme.colors.neutral.mediumGray }]}>
                  <Typography variant="small" color={theme.colors.primary.main}>
                    {getResourceLabel(log.resourceType)}
                  </Typography>
                </View>
              </View>
              <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
                {formatDate(log.createdAt)}
              </Typography>
            </View>

            {log.description && (
              <Typography variant="body" color={theme.isDark ? theme.colors.neutral.black : theme.colors.neutral.darkGray} style={styles.description}>
                {log.description}
              </Typography>
            )}

            <View style={styles.logDetails}>
              {log.userName && (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons
                    name="account"
                    size={16}
                    color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}
                  />
                  <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
                    {log.userName} {log.userEmail && `(${log.userEmail})`}
                  </Typography>
                </View>
              )}

              {log.resourceName && (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons
                    name="file-document"
                    size={16}
                    color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}
                  />
                  <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
                    {log.resourceName}
                  </Typography>
                </View>
              )}

              {log.endpoint && (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons
                    name="web"
                    size={16}
                    color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}
                  />
                  <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
                    {log.method} {log.endpoint}
                  </Typography>
                </View>
              )}

              {log.ipAddress && (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons
                    name="ip-network"
                    size={16}
                    color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}
                  />
                  <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
                    {log.ipAddress}
                  </Typography>
                </View>
              )}
            </View>

            {/* Valores Antigos e Novos */}
            {(log.oldValues || log.newValues) && (
              <View style={styles.valuesContainer}>
                {log.oldValues && Object.keys(log.oldValues).length > 0 && (
                  <View style={[styles.valuesSection, { backgroundColor: theme.isDark ? theme.colors.neutral.mediumGray : theme.colors.neutral.lightGray }]}>
                    <Typography variant="small" color={theme.colors.status.error}>
                      Valores Antigos:
                    </Typography>
                    <Typography variant="small" color={theme.isDark ? theme.colors.neutral.black : theme.colors.neutral.darkGray} style={styles.valuesText}>
                      {JSON.stringify(log.oldValues, null, 2)}
                    </Typography>
                  </View>
                )}

                {log.newValues && Object.keys(log.newValues).length > 0 && (
                  <View style={[styles.valuesSection, { backgroundColor: theme.isDark ? theme.colors.neutral.mediumGray : theme.colors.neutral.lightGray }]}>
                    <Typography variant="small" color={theme.colors.status.success}>
                      Valores Novos:
                    </Typography>
                    <Typography variant="small" color={theme.isDark ? theme.colors.neutral.black : theme.colors.neutral.darkGray} style={styles.valuesText}>
                      {JSON.stringify(log.newValues, null, 2)}
                    </Typography>
                  </View>
                )}
              </View>
            )}
          </Card>
        ))}

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <View style={styles.pagination}>
            <Button
              title="Anterior"
              onPress={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              variant="secondary"
              style={styles.paginationButton}
            />
            <Typography variant="body" color={theme.isDark ? theme.colors.neutral.black : theme.colors.neutral.darkGray}>
              Página {pagination.page} de {pagination.totalPages}
            </Typography>
            <Button
              title="Próxima"
              onPress={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              variant="secondary"
              style={styles.paginationButton}
            />
          </View>
        )}

        {logs.length === 0 && (
          <Card style={styles.emptyCard}>
            <Typography variant="body" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
              Nenhum log de auditoria encontrado
            </Typography>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Platform.OS === 'android' ? 20 : 32,
    borderBottomWidth: 1,
  },
  headerDesktop: {
    paddingHorizontal: 48,
    paddingVertical: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 12,
    borderRadius: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: Platform.OS === 'android' ? 12 : 24,
    borderRadius: Platform.OS === 'android' ? 8 : 16,
  },
  filterButtonDesktop: {
    padding: 12,
    borderRadius: 8,
  },
  statsCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statsCardsContainerDesktop: {
    gap: 20,
  },
  statCard: {
    flex: 1,
    minWidth: Platform.OS === 'android' ? '48%' : '45%',
    padding: Platform.OS === 'android' ? 16 : 24,
    alignItems: 'center',
  },
  statCardDesktop: {
    minWidth: '22%',
    maxWidth: '22%',
    padding: 20,
  },
  chartCard: {
    marginBottom: Platform.OS === 'android' ? 16 : 24,
    padding: Platform.OS === 'android' ? 16 : 24,
  },
  chartCardDesktop: {
    padding: 32,
  },
  chartTitle: {
    marginBottom: 16,
  },
  usersList: {
    marginTop: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  userRank: {
    width: 40,
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userCount: {
    alignItems: 'flex-end',
  },
  filtersCard: {
    margin: Platform.OS === 'android' ? 16 : 24,
    padding: Platform.OS === 'android' ? 20 : 32,
  },
  filtersCardDesktop: {
    marginHorizontal: 'auto',
    maxWidth: 1400,
    padding: 40,
  },
  filtersRow: {
    gap: 24,
  },
  filtersRowDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  filterField: {
    marginBottom: 24,
  },
  filterFieldDesktop: {
    flex: 1,
    minWidth: '30%',
    marginBottom: 0,
  },
  select: {
    marginTop: 8,
  },
  input: {
    marginTop: 8,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 24,
  },
  filterActionButton: {
    minWidth: 100,
  },
  content: {
    flex: 1,
    padding: Platform.OS === 'android' ? 16 : 24,
  },
  contentDesktop: {
    paddingHorizontal: 48,
    paddingVertical: 32,
  },
  statsCard: {
    marginBottom: 24,
    padding: 24,
  },
  logCard: {
    marginBottom: Platform.OS === 'android' ? 16 : 24,
    padding: Platform.OS === 'android' ? 16 : 24,
  },
  logCardDesktop: {
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
    padding: 28,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logHeaderLeft: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resourceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  description: {
    marginBottom: 16,
  },
  logDetails: {
    gap: 8,
    marginTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valuesContainer: {
    marginTop: 16,
    gap: 16,
  },
  valuesSection: {
    padding: 16,
    borderRadius: 8,
    // backgroundColor será aplicado dinamicamente via style inline
  },
  valuesText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 8,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  paginationButton: {
    minWidth: 100,
  },
  emptyCard: {
    padding: 48,
    alignItems: 'center',
  },
});

export default AuditScreen;

