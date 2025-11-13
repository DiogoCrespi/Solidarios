// src/screens/admin/DashboardScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// Componentes
import {
  Typography,
  Header,
  StatsCard,
  Card,
  ItemCard,
  DistributionCard,
  Loading,
  ErrorState,
} from "../../components/barrelComponents";
import { useTheme } from "../../hooks/useTheme";

// Hooks
import { useAuth } from "../../hooks/useAuth";
import { useItems } from "../../hooks/useItems";
import { useInventory } from "../../hooks/useInventory";
import { useDistributions } from "../../hooks/useDistributions";
import { useUsers } from "../../hooks/useUsers";

// Tipos e rotas
import {
  AdminTabParamList,
  AdminItemsStackParamList,
  AdminInventoryStackParamList,
  AdminDistributionsStackParamList,
  AdminUsersStackParamList,
} from "../../navigation/types";
import { Item } from "../../types/items.types";
import { Distribution } from "../../types/distributions.types";
import { User } from "../../types/users.types";
import { Inventory } from "../../types/inventory.types";
import { StatData } from "../../components/cards/StatsCard";

// Definição do tipo de navegação composta para o Dashboard
type DashboardScreenProps = CompositeScreenProps<
  BottomTabScreenProps<AdminTabParamList, "Dashboard">,
  CompositeScreenProps<
    NativeStackScreenProps<AdminItemsStackParamList>,
    CompositeScreenProps<
      NativeStackScreenProps<AdminInventoryStackParamList>,
      CompositeScreenProps<
        NativeStackScreenProps<AdminDistributionsStackParamList>,
        NativeStackScreenProps<AdminUsersStackParamList>
      >
    >
  >
>;

const DashboardScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<DashboardScreenProps["navigation"]>();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hooks para dados
  const itemsHook = useItems();
  const inventoryHook = useInventory();
  const distributionsHook = useDistributions();
  const usersHook = useUsers();

  // Dados agregados para dashboard
  const [stats, setStats] = useState({
    totalItems: 0,
    availableItems: 0,
    totalDistributions: 0,
    lowStockItems: 0,
    totalUsers: 0,
    totalBeneficiaries: 0,
    totalDonors: 0,
  });

  // Dados para cards
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [recentDistributions, setRecentDistributions] = useState<
    Distribution[]
  >([]);
  const [lowStockInventory, setLowStockInventory] = useState<Inventory[]>([]);

  // Carregar dados
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar dados em paralelo
      const [
        itemsResponse,
        inventoryResponse,
        distributionsResponse,
        usersResponse,
        lowStockResponse,
      ] = await Promise.all([
        itemsHook.fetchItems({ page: 1, take: 50 }),
        inventoryHook.fetchInventory({ page: 1, take: 50 }),
        distributionsHook.fetchDistributions({ page: 1, take: 10 }),
        usersHook.fetchUsers({ page: 1, take: 50 }),
        inventoryHook.fetchLowStock({ page: 1, take: 5 }),
      ]);

      // Calcular estatísticas
      if (
        itemsResponse &&
        inventoryResponse &&
        distributionsResponse &&
        usersResponse
      ) {
        const items = Array.isArray(itemsResponse.data) ? itemsResponse.data : [];
        const availableItems = items.filter(
          (item) => item.status === "disponivel"
        ).length;
        const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];
        const beneficiaries = users.filter(
          (user) => user.role === "BENEFICIARIO"
        ).length;
        const donors = users.filter(
          (user) => user.role === "DOADOR"
        ).length;

        setStats({
          totalItems: itemsResponse.meta?.itemCount || 0,
          availableItems,
          totalDistributions: distributionsResponse.meta?.itemCount || 0,
          lowStockItems: lowStockResponse ? (lowStockResponse.meta?.itemCount || 0) : 0,
          totalUsers: usersResponse.meta?.itemCount || 0,
          totalBeneficiaries: beneficiaries,
          totalDonors: donors,
        });

        // Definir itens recentes
        setRecentItems(items.slice(0, 3));

        // Definir distribuições recentes
        const distributions = Array.isArray(distributionsResponse.data) ? distributionsResponse.data : [];
        setRecentDistributions(distributions.slice(0, 3));

        // Definir itens com estoque baixo
        if (lowStockResponse) {
          const lowStock = Array.isArray(lowStockResponse.data) ? lowStockResponse.data : [];
          setLowStockInventory(lowStock.slice(0, 3));
        }
      }
    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
      setError(
        "Não foi possível carregar os dados do dashboard. Tente novamente."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Carregar dados ao montar componente
  useEffect(() => {
    loadData();
  }, []);

  // Função para pull-to-refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Renderizar loading state
  if (loading && !refreshing) {
    return <Loading visible={true} message="Carregando dashboard..." overlay />;
  }

  // Renderizar erro
  if (error) {
    return (
      <ErrorState
        title="Erro ao carregar dashboard"
        description={error}
        actionLabel="Tentar novamente"
        onAction={loadData}
      />
    );
  }

  // Formatar dados para o card de estatísticas
  const statsData: StatData[] = [
    {
      title: "Total de Itens",
      value: stats.totalItems,
      type: "number",
      color: theme.colors.primary.main,
    },
    {
      title: "Disponíveis",
      value: stats.availableItems,
      type: "number",
      color: theme.colors.status.success,
    },
    {
      title: "Distribuições",
      value: stats.totalDistributions,
      type: "number",
      color: theme.colors.primary.secondary,
    },
    {
      title: "Estoque Baixo",
      value: stats.lowStockItems,
      type: "number",
      color:
        stats.lowStockItems > 0
          ? theme.colors.status.warning
          : theme.colors.neutral.darkGray,
    },
  ];

  const usersData: StatData[] = [
    {
      title: "Total de Usuários",
      value: stats.totalUsers,
      type: "number",
      color: theme.colors.primary.main,
    },
    {
      title: "Beneficiários",
      value: stats.totalBeneficiaries,
      type: "number",
      color: theme.colors.status.info,
    },
    {
      title: "Doadores",
      value: stats.totalDonors,
      type: "number",
      color: theme.colors.primary.secondary,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.neutral.lightGray }]}>
      {/* Cabeçalho */}
      <Header
        title="Dashboard"
        subtitle={`Olá, ${user?.name?.split(" ")[0] || "Administrador"}`}
        backgroundColor={theme.colors.primary.main}
      />

      {/* Conteúdo */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Cards de estatísticas */}
        <StatsCard
          title="Estatísticas do Sistema"
          stats={statsData}
          style={styles.statsCard}
        />

        <StatsCard
          title="Usuários"
          stats={usersData}
          style={styles.statsCard}
          actionLabel="Ver todos os usuários"
          onActionPress={() =>
            navigation.navigate("Users", { screen: "UsersList" })
          }
        />

        {/* Itens recentes */}
        <Card
          title="Itens recentes"
          style={styles.card}
          rightHeaderContent={
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Items", { screen: "ItemsList" })
              }
            >
              <Typography
                variant="bodySecondary"
                color={theme.colors.primary.secondary}
              >
                Ver todos
              </Typography>
            </TouchableOpacity>
          }
        >
          <View>
            {recentItems.length > 0 ? (
              recentItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onPress={() => {
                    navigation.navigate("Items", {
                      screen: "ItemDetail",
                      params: { id: item.id },
                    });
                  }}
                  compact
                />
              ))
            ) : (
              <Typography variant="bodySecondary" color={theme.colors.neutral.darkGray} style={styles.emptyText}>
                Nenhum item cadastrado recentemente.
              </Typography>
            )}

            <TouchableOpacity
              style={[styles.addButton, { borderTopColor: theme.colors.neutral.lightGray }]}
              onPress={() => {
                navigation.navigate("Items", {
                  screen: "CreateItem",
                });
              }}
            >
              <Typography variant="body" color={theme.colors.primary.secondary}>
                + Adicionar novo item
              </Typography>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Distribuições recentes */}
        <Card
          title="Distribuições recentes"
          style={styles.card}
          rightHeaderContent={
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Distributions", {
                  screen: "DistributionsList",
                })
              }
            >
              <Typography
                variant="bodySecondary"
                color={theme.colors.primary.secondary}
              >
                Ver todas
              </Typography>
            </TouchableOpacity>
          }
        >
          <View>
            {recentDistributions.length > 0 ? (
              recentDistributions.map((distribution) => (
                <DistributionCard
                  key={distribution.id}
                  distribution={distribution}
                  onPress={() => {
                    navigation.navigate("Distributions", {
                      screen: "DistributionDetail",
                      params: { id: distribution.id },
                    });
                  }}
                  compact
                  showItems={false}
                />
              ))
            ) : (
              <Typography variant="bodySecondary" color={theme.colors.neutral.darkGray} style={styles.emptyText}>
                Nenhuma distribuição realizada recentemente.
              </Typography>
            )}

            <TouchableOpacity
              style={[styles.addButton, { borderTopColor: theme.colors.neutral.lightGray }]}
              onPress={() => {
                navigation.navigate("Distributions", {
                  screen: "CreateDistribution",
                });
              }}
            >
              <Typography variant="body" color={theme.colors.primary.secondary}>
                + Criar nova distribuição
              </Typography>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Itens com estoque baixo */}
        <Card
          title="Itens com estoque baixo"
          style={styles.card}
          rightHeaderContent={
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Inventory", { screen: "InventoryList" })
              }
            >
              <Typography
                variant="bodySecondary"
                color={theme.colors.primary.secondary}
              >
                Ver todos
              </Typography>
            </TouchableOpacity>
          }
        >
          <View>
            {lowStockInventory.length > 0 ? (
              lowStockInventory.map((inv) => (
                <TouchableOpacity
                  key={inv.id}
                  style={[styles.lowStockItem, { borderBottomColor: theme.colors.neutral.lightGray }]}
                  onPress={() => {
                    navigation.navigate("Inventory", {
                      screen: "InventoryDetail",
                      params: { id: inv.id },
                    });
                  }}
                >
                  <View style={styles.lowStockInfo}>
                    <Typography variant="body" color={theme.colors.neutral.black} numberOfLines={1}>
                      {inv.item.description}
                    </Typography>
                    <Typography
                      variant="small"
                      color={theme.colors.neutral.darkGray}
                    >
                      Qtd: {inv.quantity} | Alerta: {inv.alertLevel}
                    </Typography>
                  </View>
                  <View style={[styles.lowStockBadge, { backgroundColor: theme.colors.notifications.error.background }]}>
                    <Typography
                      variant="small"
                      color={theme.colors.notifications.error.text}
                    >
                      Estoque Baixo
                    </Typography>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Typography variant="bodySecondary" color={theme.colors.neutral.darkGray} style={styles.emptyText}>
                Não há itens com estoque baixo.
              </Typography>
            )}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  statsCard: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    marginVertical: 16,
  },
  addButton: {
    alignItems: "center",
    paddingVertical: 8,
    marginTop: 8,
    borderTopWidth: 1,
  },
  lowStockItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  lowStockInfo: {
    flex: 1,
  },
  lowStockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 16,
  },
});

export default DashboardScreen;
