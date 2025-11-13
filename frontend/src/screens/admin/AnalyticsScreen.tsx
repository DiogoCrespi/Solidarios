import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import {
  Typography,
  Card,
  Loading,
  ErrorState,
  Button,
} from '../../components/barrelComponents';
import { SimpleStatsCard } from '../../components/cards/barrelCards';
import { useTheme } from '../../hooks/useTheme';
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

const AnalyticsScreen: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

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

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    return () => subscription?.remove();
  }, []);

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
    try {
      setLoading(true);
      console.log('Gerando relatório:', config);
      
      // Chamar o endpoint de geração de relatório
      const blob = await AnalyticsService.generateReport({
        type: config.type,
        format: config.format,
        startDate: config.startDate || filters.startDate,
        endDate: config.endDate || filters.endDate,
        categoryId: config.categoryId || filters.categoryId,
      });

      // Download baseado na plataforma
      if (Platform.OS === 'web') {
        // Para web, usar download direto
        const url = (window as any).URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio_${config.type}_${new Date().toISOString().split('T')[0]}.${config.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        (window as any).URL.revokeObjectURL(url);
        Alert.alert('Sucesso', 'Relatório gerado e baixado com sucesso!');
      } else {
        // Para mobile, seria necessário usar expo-file-system ou similar
        // Por enquanto, apenas mostra mensagem
        Alert.alert(
          'Sucesso',
          'Relatório gerado com sucesso! Em dispositivos móveis, o download será implementado em breve.'
        );
      }

      console.log('Relatório gerado e baixado com sucesso');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      setError('Não foi possível gerar o relatório.');
      Alert.alert('Erro', 'Não foi possível gerar o relatório. Verifique sua conexão e tente novamente.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (loading && !dashboardStats) {
    return <Loading />;
  }

  // Calcular largura do card para o carrossel (responsivo)
  const getCardWidth = (): number => {
    const width = screenData.width;
    if (width < 600) {
      // Mobile: card ocupa ~85% da largura
      return width * 0.85;
    } else if (width < 1024) {
      // Tablet: card menor
      return 280;
    } else {
      // Desktop: card fixo
      return 220;
    }
  };

  const cardWidth = getCardWidth();

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
      style={[styles.container, { backgroundColor: theme.colors.neutral.lightGray }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.neutral.white, borderBottomColor: theme.colors.neutral.lightGray }]}>
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
            style={[styles.filterButton, { backgroundColor: theme.colors.neutral.lightGray }]}
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

      {/* Cards de Estatísticas Principais - Carrossel */}
      {dashboardStats && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.statsCarousel, { paddingRight: theme.spacing.l }]}
          style={styles.carouselContainer}
        >
          <SimpleStatsCard
            title="Total de Usuários"
            value={dashboardStats.totalUsers}
            icon="account-group"
            color={theme.colors.primary.main}
            iconFamily="MaterialCommunityIcons"
            style={[styles.statCard, { width: cardWidth }]}
          />
          <SimpleStatsCard
            title="Doadores"
            value={dashboardStats.totalDonors}
            icon="hand-heart"
            color={theme.colors.status.success}
            iconFamily="MaterialCommunityIcons"
            style={[styles.statCard, { width: cardWidth }]}
          />
          <SimpleStatsCard
            title="Beneficiários"
            value={dashboardStats.totalBeneficiaries}
            icon="account-heart"
            color={theme.colors.status.info}
            iconFamily="MaterialCommunityIcons"
            style={[styles.statCard, { width: cardWidth }]}
          />
          <SimpleStatsCard
            title="Total de Itens"
            value={dashboardStats.totalItems}
            icon="package-variant"
            color={theme.colors.status.warning}
            iconFamily="MaterialCommunityIcons"
            style={[styles.statCard, { width: cardWidth }]}
          />
          <SimpleStatsCard
            title="Distribuições"
            value={dashboardStats.totalDistributions}
            icon="truck-delivery"
            color={theme.colors.primary.secondary}
            iconFamily="MaterialCommunityIcons"
            style={[styles.statCard, { width: cardWidth }]}
          />
          <SimpleStatsCard
            title="Estoque Baixo"
            value={dashboardStats.lowStockItems}
            icon="alert"
            color={theme.colors.status.error}
            iconFamily="MaterialCommunityIcons"
            style={[styles.statCard, { width: cardWidth }]}
          />
        </ScrollView>
      )}

      {/* Estatísticas de Usuários */}
      {usersStats && (
        <Card style={styles.card}>
          <Typography variant="h4" color={theme.colors.neutral.darkGray}>
            Usuários por Tipo
          </Typography>
          <View style={styles.listContainer}>
            {usersStats.usersByRole.map((item, index) => (
              <View key={index} style={[styles.listItem, { borderBottomColor: theme.colors.neutral.lightGray }]}>
                <Typography variant="body" color={theme.colors.neutral.black}>{item.role}</Typography>
                <Typography variant="body" color={theme.colors.primary.main}>
                  {item.count}
                </Typography>
              </View>
            ))}
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.neutral.mediumGray }]} />
          <View style={[styles.listItem, { borderBottomColor: theme.colors.neutral.lightGray }]}>
            <Typography variant="body" color={theme.colors.neutral.black}>Usuários Ativos</Typography>
            <Typography variant="body" color={theme.colors.status.success}>
              {usersStats.activeUsers}
            </Typography>
          </View>
          <View style={[styles.listItem, { borderBottomColor: theme.colors.neutral.lightGray }]}>
            <Typography variant="body" color={theme.colors.neutral.black}>Novos (30 dias)</Typography>
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
              <View key={index} style={[styles.listItem, { borderBottomColor: theme.colors.neutral.lightGray }]}>
                <Typography variant="body" color={theme.colors.neutral.black}>{item.status}</Typography>
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
              <View key={donor.donorId} style={[styles.topDonorItem, { borderBottomColor: theme.colors.neutral.lightGray }]}>
                <View style={[styles.rankBadge, { backgroundColor: theme.colors.primary.main }]}>
                  <Typography variant="small" color={theme.colors.neutral.white}>
                    {index + 1}º
                  </Typography>
                </View>
                <View style={styles.donorInfo}>
                  <Typography variant="body" color={theme.colors.neutral.black}>{donor.donorName}</Typography>
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
              <View key={category.categoryId} style={[styles.categoryItem, { borderBottomColor: theme.colors.neutral.lightGray }]}>
                <Typography variant="body" color={theme.colors.neutral.black}>{category.categoryName}</Typography>
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
      <ReportGenerator 
        onGenerate={handleGenerateReport}
        initialFilters={filters}
      />

      {/* Espaço final */}
      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 32,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 24,
    borderRadius: 16,
  },
  carouselContainer: {
    marginVertical: 16,
  },
  statsCarousel: {
    paddingLeft: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statCard: {
    minHeight: 120,
    marginRight: 24,
  },
  card: {
    margin: 24,
    padding: 32,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    marginLeft: 16,
  },
  listContainer: {
    marginTop: 24,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  divider: {
    height: 1,
    marginVertical: 24,
  },
  topDonorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 24,
  },
  donorInfo: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
  },
  categoryCount: {
    alignItems: 'flex-end',
  },
  footer: {
    height: 48,
  },
});

export default AnalyticsScreen;

