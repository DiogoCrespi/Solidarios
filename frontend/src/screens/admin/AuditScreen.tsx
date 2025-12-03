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
import { SimplePieChart } from '../../components/charts';
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
      <View style={[styles.header, isDesktop && styles.headerDesktop, { backgroundColor: theme.colors.neutral.white, borderBottomWidth: 1, borderBottomColor: theme.colors.neutral.lightGray }]}>
        <View style={[styles.headerContent, isDesktop && styles.headerContentDesktop]}>
          <View style={styles.headerText}>
            <Typography variant="h2" color={theme.colors.primary.main} style={styles.headerTitle}>
              Logs de Auditoria
            </Typography>
            <Typography variant="body" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray} style={styles.headerSubtitle}>
              Registro de todas as alterações no sistema
            </Typography>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: showStats ? theme.colors.primary.main + '15' : theme.colors.neutral.lightGray }]}
              onPress={() => setShowStats(!showStats)}
            >
              <MaterialCommunityIcons
                name={showStats ? "chart-line" : "chart-line-variant"}
                size={20}
                color={showStats ? theme.colors.primary.main : theme.colors.neutral.mediumGray}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, isDesktop && styles.filterButtonDesktop, { backgroundColor: showFilters ? theme.colors.primary.main + '15' : theme.colors.neutral.lightGray }]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <MaterialCommunityIcons
                name="filter-variant"
                size={20}
                color={showFilters ? theme.colors.primary.main : theme.colors.neutral.mediumGray}
              />
              <Typography variant="body" color={showFilters ? theme.colors.primary.main : theme.colors.neutral.mediumGray} style={styles.filterButtonText}>
                Filtros
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Filtros */}
      {showFilters && (
        <View style={[styles.filtersContainer, isDesktop && styles.filtersContainerDesktop]}>
          <Card style={[styles.filtersCard, isDesktop && styles.filtersCardDesktop]}>
            <View style={styles.filtersHeader}>
              <Typography variant="h4" color={theme.colors.primary.main}>
                Filtros de Busca
              </Typography>
            </View>
            <View style={[styles.filtersRow, isDesktop && styles.filtersRowDesktop]}>
              <View style={[styles.filterField, isDesktop && styles.filterFieldDesktop]}>
                <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray} style={styles.filterLabel}>
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
                <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray} style={styles.filterLabel}>
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
                <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray} style={styles.filterLabel}>
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
                <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray} style={styles.filterLabel}>
                  Data Final
                </Typography>
                <TextField
                  value={filters.endDate || ''}
                  onChangeText={(value) => updateFilter('endDate', value || undefined)}
                  placeholder="AAAA-MM-DD"
                  style={styles.input}
                />
              </View>

              <View style={[styles.filterField, isDesktop && styles.filterFieldDesktop, isDesktop && styles.filterFieldFullWidth]}>
                <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray} style={styles.filterLabel}>
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
                title="Limpar Filtros"
                onPress={handleClearFilters}
                variant="secondary"
                style={styles.filterActionButton}
              />
              <Button
                title="Aplicar Filtros"
                onPress={handleApplyFilters}
                style={styles.filterActionButton}
              />
            </View>
          </Card>
        </View>
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
                <View style={styles.statCardContent}>
                  <MaterialCommunityIcons name="file-document-multiple" size={24} color={theme.colors.primary.main} />
                  <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray} style={styles.statLabel}>
                    Total de Logs
                  </Typography>
                  <Typography variant="h2" color={theme.colors.primary.main} style={styles.statValue}>
                    {stats.total.toLocaleString('pt-BR')}
                  </Typography>
                </View>
              </Card>
              <Card style={[styles.statCard, isDesktop && styles.statCardDesktop]}>
                <View style={styles.statCardContent}>
                  <MaterialCommunityIcons name="clock-outline" size={24} color={theme.colors.status.info} />
                  <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray} style={styles.statLabel}>
                    Últimas 24h
                  </Typography>
                  <Typography variant="h2" color={theme.colors.status.info} style={styles.statValue}>
                    {stats.last24Hours.toLocaleString('pt-BR')}
                  </Typography>
                </View>
              </Card>
              <Card style={[styles.statCard, isDesktop && styles.statCardDesktop]}>
                <View style={styles.statCardContent}>
                  <MaterialCommunityIcons name="calendar-week" size={24} color={theme.colors.status.success} />
                  <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray} style={styles.statLabel}>
                    Últimos 7 dias
                  </Typography>
                  <Typography variant="h2" color={theme.colors.status.success} style={styles.statValue}>
                    {stats.last7Days.toLocaleString('pt-BR')}
                  </Typography>
                </View>
              </Card>
              <Card style={[styles.statCard, isDesktop && styles.statCardDesktop]}>
                <View style={styles.statCardContent}>
                  <MaterialCommunityIcons name="calendar-month" size={24} color={theme.colors.status.warning} />
                  <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray} style={styles.statLabel}>
                    Últimos 30 dias
                  </Typography>
                  <Typography variant="h2" color={theme.colors.status.warning} style={styles.statValue}>
                    {stats.last30Days.toLocaleString('pt-BR')}
                  </Typography>
                </View>
              </Card>
            </View>

            {/* Ações por Tipo - Lista */}
            {stats.byAction && stats.byAction.length > 0 && (
              <Card style={[styles.chartCard, isDesktop && styles.chartCardDesktop]}>
                <Typography variant="h3" color={theme.isDark ? theme.colors.neutral.black : theme.colors.neutral.darkGray} style={styles.chartTitle}>
                  Ações por Tipo
                </Typography>
                <View style={styles.statsList}>
                  {stats.byAction.map((item, index) => (
                    <View key={index} style={[styles.statsListItem, { borderBottomColor: theme.colors.neutral.mediumGray }]}>
                      <View style={styles.statsListLeft}>
                        <View style={[styles.statsListDot, { backgroundColor: getActionColor(item.action as AuditAction) }]} />
                        <Typography variant="body" color={theme.isDark ? theme.colors.neutral.black : theme.colors.neutral.darkGray}>
                          {getActionLabel(item.action as AuditAction)}
                        </Typography>
                      </View>
                      <Typography variant="body" color={theme.colors.primary.main} style={styles.statsListValue}>
                        {item.count.toLocaleString('pt-BR')}
                      </Typography>
                    </View>
                  ))}
                </View>
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

            {/* Tendências (Período) - Lista */}
            {stats.byPeriod && stats.byPeriod.length > 0 && (
              <Card style={[styles.chartCard, isDesktop && styles.chartCardDesktop]}>
                <Typography variant="h3" color={theme.isDark ? theme.colors.neutral.black : theme.colors.neutral.darkGray} style={styles.chartTitle}>
                  Tendências (Últimos 30 dias)
                </Typography>
                <View style={styles.statsList}>
                  {stats.byPeriod.slice(-30).map((item, index) => {
                    try {
                      const [year, month, day] = item.period.split('-');
                      const label = `${day}/${month}/${year}`;
                      return (
                        <View key={index} style={[styles.statsListItem, { borderBottomColor: theme.colors.neutral.mediumGray }]}>
                          <View style={styles.statsListLeft}>
                            <MaterialCommunityIcons name="calendar" size={16} color={theme.colors.primary.main} />
                            <Typography variant="body" color={theme.isDark ? theme.colors.neutral.black : theme.colors.neutral.darkGray}>
                              {label}
                            </Typography>
                          </View>
                          <Typography variant="body" color={theme.colors.primary.main} style={styles.statsListValue}>
                            {item.count.toLocaleString('pt-BR')}
                          </Typography>
                        </View>
                      );
                    } catch {
                      return (
                        <View key={index} style={[styles.statsListItem, { borderBottomColor: theme.colors.neutral.mediumGray }]}>
                          <View style={styles.statsListLeft}>
                            <MaterialCommunityIcons name="calendar" size={16} color={theme.colors.primary.main} />
                            <Typography variant="body" color={theme.isDark ? theme.colors.neutral.black : theme.colors.neutral.darkGray}>
                              {item.period}
                            </Typography>
                          </View>
                          <Typography variant="body" color={theme.colors.primary.main} style={styles.statsListValue}>
                            {item.count.toLocaleString('pt-BR')}
                          </Typography>
                        </View>
                      );
                    }
                  })}
                </View>
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
                  <Typography variant="small" color={theme.colors.neutral.white} style={styles.badgeText}>
                    {getActionLabel(log.action)}
                  </Typography>
                </View>
                <View style={[styles.resourceBadge, { borderColor: theme.colors.neutral.mediumGray }]}>
                  <Typography variant="small" color={theme.colors.primary.main} style={styles.badgeText}>
                    {getResourceLabel(log.resourceType)}
                  </Typography>
                </View>
              </View>
              <View style={styles.logDateContainer}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={14}
                  color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}
                />
                <Typography variant="small" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray} style={styles.logDate}>
                  {formatDate(log.createdAt)}
                </Typography>
              </View>
            </View>

            {log.description && (
              <View style={[styles.descriptionContainer, { backgroundColor: theme.isDark ? theme.colors.neutral.mediumGray + '20' : '#F9FAFB' }]}>
                <Typography variant="body" color={theme.isDark ? theme.colors.neutral.black : theme.colors.neutral.darkGray} style={styles.description}>
                  {log.description}
                </Typography>
              </View>
            )}

            <View style={styles.logDetails}>
              {log.userName && (
                <View style={styles.detailRow}>
                  <View style={[styles.detailIconContainer, { backgroundColor: theme.colors.primary.main + '15' }]}>
                    <MaterialCommunityIcons
                      name="account"
                      size={16}
                      color={theme.colors.primary.main}
                    />
                  </View>
                  <View style={styles.detailTextContainer}>
                    <Typography variant="caption" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray} style={styles.detailLabel}>
                      Usuário
                    </Typography>
                    <Typography variant="small" color={theme.isDark ? theme.colors.neutral.black : theme.colors.neutral.darkGray} style={styles.detailValue}>
                      {log.userName} {log.userEmail && `(${log.userEmail})`}
                    </Typography>
                  </View>
                </View>
              )}

              {log.resourceName && (
                <View style={styles.detailRow}>
                  <View style={[styles.detailIconContainer, { backgroundColor: theme.colors.status.info + '20' }]}>
                    <MaterialCommunityIcons
                      name="file-document"
                      size={16}
                      color={theme.colors.status.info}
                    />
                  </View>
                  <View style={styles.detailTextContainer}>
                    <Typography variant="caption" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray} style={styles.detailLabel}>
                      Recurso
                    </Typography>
                    <Typography variant="small" color={theme.isDark ? theme.colors.neutral.black : theme.colors.neutral.darkGray} style={styles.detailValue}>
                      {log.resourceName}
                    </Typography>
                  </View>
                </View>
              )}

              {log.endpoint && (
                <View style={styles.detailRow}>
                  <View style={[styles.detailIconContainer, { backgroundColor: theme.colors.status.warning + '20' }]}>
                    <MaterialCommunityIcons
                      name="web"
                      size={16}
                      color={theme.colors.status.warning}
                    />
                  </View>
                  <View style={styles.detailTextContainer}>
                    <Typography variant="caption" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray} style={styles.detailLabel}>
                      Endpoint
                    </Typography>
                    <Typography variant="small" color={theme.isDark ? theme.colors.neutral.black : theme.colors.neutral.darkGray} style={styles.detailValue}>
                      {log.method} {log.endpoint}
                    </Typography>
                  </View>
                </View>
              )}

              {log.ipAddress && (
                <View style={styles.detailRow}>
                  <View style={[styles.detailIconContainer, { backgroundColor: theme.colors.neutral.mediumGray + '20' }]}>
                    <MaterialCommunityIcons
                      name="ip-network"
                      size={16}
                      color={theme.colors.neutral.mediumGray}
                    />
                  </View>
                  <View style={styles.detailTextContainer}>
                    <Typography variant="caption" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray} style={styles.detailLabel}>
                      IP Address
                    </Typography>
                    <Typography variant="small" color={theme.isDark ? theme.colors.neutral.black : theme.colors.neutral.darkGray} style={styles.detailValue}>
                      {log.ipAddress}
                    </Typography>
                  </View>
                </View>
              )}
            </View>

            {/* Valores Antigos e Novos */}
            {(log.oldValues || log.newValues) && (
              <View style={styles.valuesContainer}>
                {log.oldValues && Object.keys(log.oldValues).length > 0 && (
                  <View style={[styles.valuesSection, { backgroundColor: theme.colors.status.error + '10', borderLeftWidth: 3, borderLeftColor: theme.colors.status.error }]}>
                    <View style={styles.valuesHeader}>
                      <MaterialCommunityIcons name="arrow-down" size={16} color={theme.colors.status.error} />
                      <Typography variant="small" color={theme.colors.status.error} style={styles.valuesTitle}>
                        Valores Antigos
                      </Typography>
                    </View>
                    <Typography variant="small" color={theme.isDark ? theme.colors.neutral.black : theme.colors.neutral.darkGray} style={styles.valuesText}>
                      {JSON.stringify(log.oldValues, null, 2)}
                    </Typography>
                  </View>
                )}

                {log.newValues && Object.keys(log.newValues).length > 0 && (
                  <View style={[styles.valuesSection, { backgroundColor: theme.colors.status.success + '10', borderLeftWidth: 3, borderLeftColor: theme.colors.status.success }]}>
                    <View style={styles.valuesHeader}>
                      <MaterialCommunityIcons name="arrow-up" size={16} color={theme.colors.status.success} />
                      <Typography variant="small" color={theme.colors.status.success} style={styles.valuesTitle}>
                        Valores Novos
                      </Typography>
                    </View>
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
          <Card style={styles.paginationCard}>
            <View style={styles.pagination}>
              <Button
                title="Anterior"
                onPress={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                variant="secondary"
                style={styles.paginationButton}
              />
              <View style={styles.paginationInfo}>
                <Typography variant="body" color={theme.isDark ? theme.colors.neutral.black : theme.colors.neutral.darkGray} style={styles.paginationText}>
                  Página {pagination.page} de {pagination.totalPages}
                </Typography>
                <Typography variant="caption" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
                  Total: {pagination.total.toLocaleString('pt-BR')} logs
                </Typography>
              </View>
              <Button
                title="Próxima"
                onPress={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                variant="secondary"
                style={styles.paginationButton}
              />
            </View>
          </Card>
        )}

        {logs.length === 0 && !loading && (
          <Card style={styles.emptyCard}>
            <MaterialCommunityIcons 
              name="file-document-remove" 
              size={48} 
              color={theme.colors.neutral.mediumGray} 
              style={styles.emptyIcon}
            />
            <Typography variant="h4" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray} style={styles.emptyTitle}>
              Nenhum log encontrado
            </Typography>
            <Typography variant="body" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray} style={styles.emptyDescription}>
              Não há logs de auditoria que correspondam aos filtros aplicados.
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
    padding: 20,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerDesktop: {
    paddingHorizontal: 48,
    paddingVertical: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  headerContentDesktop: {
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    marginBottom: 4,
  },
  headerSubtitle: {
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 40,
  },
  filterButtonDesktop: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterButtonText: {
    fontWeight: '500',
  },
  statsCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statsCardsContainerDesktop: {
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    padding: 20,
  },
  statCardDesktop: {
    minWidth: '22%',
    maxWidth: '22%',
    padding: 24,
  },
  statCardContent: {
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    marginTop: 4,
    textAlign: 'center',
  },
  statValue: {
    marginTop: 4,
    fontWeight: '600',
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
  filtersContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0,
  },
  filtersContainerDesktop: {
    paddingHorizontal: 48,
    paddingTop: 24,
  },
  filtersCard: {
    padding: 20,
  },
  filtersCardDesktop: {
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
    padding: 32,
  },
  filtersHeader: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filtersRow: {
    gap: 20,
  },
  filtersRowDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  filterField: {
    marginBottom: 20,
  },
  filterFieldDesktop: {
    flex: 1,
    minWidth: '30%',
    marginBottom: 16,
  },
  filterFieldFullWidth: {
    minWidth: '100%',
    flexBasis: '100%',
  },
  filterLabel: {
    marginBottom: 8,
    fontWeight: '500',
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
    marginBottom: 16,
    padding: 20,
  },
  logCardDesktop: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    padding: 24,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logHeaderLeft: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
  },
  logDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  logDate: {
    fontWeight: '500',
  },
  actionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minHeight: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    minHeight: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontWeight: '600',
    fontSize: 11,
  },
  descriptionContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  description: {
    lineHeight: 20,
    color: undefined, // Será aplicado dinamicamente via Typography
  },
  logDetails: {
    gap: 12,
    marginTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  detailTextContainer: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    color: undefined, // Será aplicado dinamicamente via Typography
  },
  valuesContainer: {
    marginTop: 20,
    gap: 12,
  },
  valuesSection: {
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  valuesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  valuesTitle: {
    fontWeight: '600',
    fontSize: 12,
  },
  valuesText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    lineHeight: 18,
  },
  paginationCard: {
    marginTop: 24,
    marginBottom: 24,
    padding: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  paginationInfo: {
    alignItems: 'center',
    gap: 4,
  },
  paginationText: {
    fontWeight: '600',
  },
  paginationButton: {
    minWidth: 120,
  },
  emptyCard: {
    padding: 48,
    alignItems: 'center',
    marginTop: 24,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  emptyDescription: {
    textAlign: 'center',
    maxWidth: 400,
  },
  statsList: {
    marginTop: 16,
    gap: 0,
  },
  statsListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  statsListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statsListDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statsListValue: {
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AuditScreen;

