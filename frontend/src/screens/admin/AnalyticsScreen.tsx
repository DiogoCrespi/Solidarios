import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Typography,
  Card,
  Loading,
  ErrorState,
  Button,
} from '../../components/barrelComponents';
import { SimpleStatsCard } from '../../components/cards/barrelCards';
import theme from '../../theme';
import AnalyticsService, {
  DashboardStats,
  UsersStats,
  ItemsStats,
  TrendsData,
  TopDonor,
  CategoryDistribution,
} from '../../api/analytics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AnalyticsFilters, { AnalyticsFiltersValues } from '../../components/filters/AnalyticsFilters';
import ReportGenerator, { ReportConfig } from '../../components/reports/ReportGenerator';

const { width: screenWidth } = Dimensions.get('window');

const AnalyticsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Estados para diferentes tipos de dados
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [usersStats, setUsersStats] = useState<UsersStats | null>(null);
  const [itemsStats, setItemsStats] = useState<ItemsStats | null>(null);
  const [topDonors, setTopDonors] = useState<TopDonor[]>([]);
  const [categoriesDistribution, setCategoriesDistribution] = useState<
    CategoryDistribution[]
  >([]);
  const [trends, setTrends] = useState<TrendsData | null>(null);

  // Filtros
  const [filters, setFilters] = useState<AnalyticsFiltersValues>({
    period: 'month',
  });

  useEffect(() => {
    loadAnalytics();
  }, [filters]);

  const loadAnalytics = async () => {
    try {
      setError(null);

      // Separar filtros por endpoint
      const { period, ...itemFilters } = filters;
      
      const [
        dashboard,
        users,
        items,
        donors,
        categories,
        trendsData,
      ] = await Promise.all([
        AnalyticsService.getDashboardStats(),
        AnalyticsService.getUsersStats(),
        AnalyticsService.getItemsStats(itemFilters), // Sem period
        AnalyticsService.getTopDonors(5),
        AnalyticsService.getCategoriesDistribution(),
        AnalyticsService.getTrends(period || 'month'), // Period apenas para trends
      ]);

      setDashboardStats(dashboard);
      setUsersStats(users);
      setItemsStats(items);
      setTopDonors(donors);
      setCategoriesDistribution(categories);
      setTrends(trendsData);
    } catch (err) {
      console.error('Erro ao carregar analytics:', err);
      setError('Não foi possível carregar as estatísticas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };

  const handleApplyFilters = (newFilters: AnalyticsFiltersValues) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({ period: 'month' });
  };

  const handleGenerateReport = async (config: ReportConfig) => {
    // Por enquanto, apenas simula a geração do relatório
    // Em produção, isso chamaria um endpoint do backend para gerar o arquivo
    console.log('Gerando relatório:', config);
    
    // Simular delay de geração
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Aqui você pode adicionar a lógica para baixar o arquivo gerado
    // Por exemplo, usando expo-file-system ou react-native-fs
  };

  if (loading && !dashboardStats) {
    return <Loading />;
  }

  if (error && !dashboardStats) {
    return (
      <ErrorState
        title="Erro ao carregar dados"
        description={error}
        onAction={loadAnalytics}
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Typography variant="h2" color={theme.colors.primary.main}>
              Analytics & Relatórios
            </Typography>
            <Typography variant="body" color={theme.colors.neutral.mediumGray}>
              Visão geral do sistema
            </Typography>
          </View>
          <TouchableOpacity
            style={styles.filterButton}
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

      {/* Filtros */}
      {showFilters && (
        <AnalyticsFilters
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
      )}

      {/* Cards de Estatísticas Principais */}
      {dashboardStats && (
        <View style={styles.statsGrid}>
          <SimpleStatsCard
            title="Total de Usuários"
            value={dashboardStats.totalUsers}
            icon="account-group"
            color={theme.colors.primary.main}
            iconFamily="MaterialCommunityIcons"
          />
          <SimpleStatsCard
            title="Doadores"
            value={dashboardStats.totalDonors}
            icon="hand-heart"
            color={theme.colors.status.success}
            iconFamily="MaterialCommunityIcons"
          />
          <SimpleStatsCard
            title="Beneficiários"
            value={dashboardStats.totalBeneficiaries}
            icon="account-heart"
            color={theme.colors.status.info}
            iconFamily="MaterialCommunityIcons"
          />
          <SimpleStatsCard
            title="Total de Itens"
            value={dashboardStats.totalItems}
            icon="package-variant"
            color={theme.colors.status.warning}
            iconFamily="MaterialCommunityIcons"
          />
          <SimpleStatsCard
            title="Distribuições"
            value={dashboardStats.totalDistributions}
            icon="truck-delivery"
            color={theme.colors.primary.secondary}
            iconFamily="MaterialCommunityIcons"
          />
          <SimpleStatsCard
            title="Estoque Baixo"
            value={dashboardStats.lowStockItems}
            icon="alert"
            color={theme.colors.status.error}
            iconFamily="MaterialCommunityIcons"
          />
        </View>
      )}

      {/* Estatísticas de Usuários */}
      {usersStats && (
        <Card style={styles.card}>
          <Typography variant="h4" color={theme.colors.neutral.darkGray}>
            Usuários por Tipo
          </Typography>
          <View style={styles.listContainer}>
            {usersStats.usersByRole.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Typography variant="body">{item.role}</Typography>
                <Typography variant="body" color={theme.colors.primary.main}>
                  {item.count}
                </Typography>
              </View>
            ))}
          </View>
          <View style={styles.divider} />
          <View style={styles.listItem}>
            <Typography variant="body">Usuários Ativos</Typography>
            <Typography variant="body" color={theme.colors.status.success}>
              {usersStats.activeUsers}
            </Typography>
          </View>
          <View style={styles.listItem}>
            <Typography variant="body">Novos (30 dias)</Typography>
            <Typography variant="body" color={theme.colors.status.info}>
              {usersStats.recentUsers}
            </Typography>
          </View>
        </Card>
      )}

      {/* Estatísticas de Itens */}
      {itemsStats && (
        <Card style={styles.card}>
          <Typography variant="h4" color={theme.colors.neutral.darkGray}>
            Itens por Status
          </Typography>
          <View style={styles.listContainer}>
            {itemsStats.itemsByStatus.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Typography variant="body">{item.status}</Typography>
                <Typography variant="body" color={theme.colors.primary.main}>
                  {item.count}
                </Typography>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Top Doadores */}
      {topDonors.length > 0 && (
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="trophy"
              size={24}
              color={theme.colors.primary.accent}
            />
            <Typography variant="h4" color={theme.colors.neutral.darkGray} style={styles.cardTitle}>
              Top 5 Doadores
            </Typography>
          </View>
          <View style={styles.listContainer}>
            {topDonors.map((donor, index) => (
              <View key={donor.donorId} style={styles.topDonorItem}>
                <View style={styles.rankBadge}>
                  <Typography variant="small" color={theme.colors.neutral.white}>
                    {index + 1}º
                  </Typography>
                </View>
                <View style={styles.donorInfo}>
                  <Typography variant="body">{donor.donorName}</Typography>
                  <Typography variant="small" color={theme.colors.neutral.mediumGray}>
                    {donor.totalDonations} doações
                  </Typography>
                </View>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Distribuição por Categorias */}
      {categoriesDistribution.length > 0 && (
        <Card style={styles.card}>
          <Typography variant="h4" color={theme.colors.neutral.darkGray}>
            Itens por Categoria
          </Typography>
          <View style={styles.listContainer}>
            {categoriesDistribution.map((category) => (
              <View key={category.categoryId} style={styles.categoryItem}>
                <Typography variant="body">{category.categoryName}</Typography>
                <View style={styles.categoryCount}>
                  <Typography variant="body" color={theme.colors.primary.main}>
                    {category.count}
                  </Typography>
                  <Typography variant="small" color={theme.colors.neutral.mediumGray}>
                    itens
                  </Typography>
                </View>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Gerador de Relatórios */}
      <ReportGenerator onGenerate={handleGenerateReport} />

      {/* Espaço final */}
      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral.lightGray,
  },
  header: {
    padding: theme.spacing.l,
    backgroundColor: theme.colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral.lightGray,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.m,
    borderRadius: theme.spacing.s,
    backgroundColor: theme.colors.neutral.lightGray,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.m,
    justifyContent: 'space-between',
  },
  card: {
    margin: theme.spacing.m,
    padding: theme.spacing.l,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  cardTitle: {
    marginLeft: theme.spacing.s,
  },
  listContainer: {
    marginTop: theme.spacing.m,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral.lightGray,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.neutral.mediumGray,
    marginVertical: theme.spacing.m,
  },
  topDonorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral.lightGray,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  donorInfo: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral.lightGray,
  },
  categoryCount: {
    alignItems: 'flex-end',
  },
  footer: {
    height: theme.spacing.xl,
  },
});

export default AnalyticsScreen;

