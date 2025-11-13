import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { DoadorProfileStackParamList } from "../../navigation/types";

// Componentes
import {
  Typography,
  Header,
  Card,
  ErrorState,
} from "../../components/barrelComponents";
import { useTheme } from "../../hooks/useTheme";

// Hooks
import { useAuth } from "../../hooks/useAuth";
import { useItems } from "../../hooks/useItems";

// Tipos das estatísticas de impacto
type ImpactStats = {
  totalDonations: number;
  distributedItems: number;
  peopleHelped: number;
  clothesDonated: number;
  shoesDonated: number;
  utensilsDonated: number;
  othersDonated: number;
};

const ImpactScreen: React.FC = () => {
  const theme = useTheme();
  const navigation =
    useNavigation<StackNavigationProp<DoadorProfileStackParamList, "Impact">>();
  const { user } = useAuth();
  const { fetchItemsByDonor } = useItems();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ImpactStats>({
    totalDonations: 0,
    distributedItems: 0,
    peopleHelped: 0,
    clothesDonated: 0,
    shoesDonated: 0,
    utensilsDonated: 0,
    othersDonated: 0,
  });

  // Carregar estatísticas do usuário
  useEffect(() => {
    const loadImpactStats = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        // Buscar todos os itens doados pelo usuário
        const response = await fetchItemsByDonor(user.id, {
          page: 1,
          take: 100,
        });

        if (response && response.data) {
          const items = response.data;

          // Calcular estatísticas
          const distributedItems = items.filter(
            (item) => item.status === "distribuido"
          ).length;

          // Aqui assumimos que cada item distribuído ajudou uma pessoa
          // Numa aplicação real, você poderia ter um cálculo mais preciso
          const peopleHelped = distributedItems;

          // Contar itens por tipo
          const clothesDonated = items.filter(
            (item) => item.type === "roupa"
          ).length;
          const shoesDonated = items.filter(
            (item) => item.type === "calcado"
          ).length;
          const utensilsDonated = items.filter(
            (item) => item.type === "utensilio"
          ).length;
          const othersDonated = items.filter(
            (item) => item.type === "outro"
          ).length;

          setStats({
            totalDonations: items.length,
            distributedItems,
            peopleHelped,
            clothesDonated,
            shoesDonated,
            utensilsDonated,
            othersDonated,
          });
        }
      } catch (err) {
        console.error("Erro ao carregar estatísticas de impacto:", err);
        setError("Não foi possível carregar seus dados de impacto social.");
      } finally {
        setLoading(false);
      }
    };

    loadImpactStats();
  }, [user, fetchItemsByDonor]);

  if (error) {
    return (
      <View style={styles.container}>
        <Header
          title="Meu Impacto Social"
          onBackPress={() => navigation.goBack()}
          backgroundColor={theme.colors.primary.secondary}
        />
        <ErrorState
          title="Erro ao carregar dados"
          description={error}
          actionLabel="Tentar novamente"
          onAction={() => {
            // Usar o tipo correto de navegação
            const rootNavigation = navigation.getParent();
            if (rootNavigation) {
              rootNavigation.navigate("Profile", {
                screen: "Impact",
              });
            } else {
              // Navegação dentro da própria pilha
              navigation.navigate("Impact");
            }
          }}
        />
      </View>
    );
  }

  const dynamicStyles = {
    container: {
      backgroundColor: theme.colors.neutral.lightGray,
    },
    subtitle: {
      color: theme.colors.neutral.darkGray,
    },
    loadingText: {
      color: theme.colors.neutral.darkGray,
    },
    detailRow: {
      borderBottomColor: theme.colors.neutral.lightGray,
    },
    messageCard: {
      backgroundColor: theme.colors.primary.secondary + "20",
    },
    messageText: {
      color: theme.colors.primary.secondary,
    },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Header
        title="Meu Impacto Social"
        onBackPress={() => navigation.goBack()}
        backgroundColor={theme.colors.primary.secondary}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <Typography variant="h3" style={styles.title} color={theme.colors.neutral.black}>
          Seu impacto como doador
        </Typography>

        <Typography variant="bodySecondary" style={[styles.subtitle, dynamicStyles.subtitle]}>
          Veja como suas doações estão fazendo a diferença
        </Typography>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={theme.colors.primary.secondary}
            />
            <Typography variant="bodySecondary" style={[styles.loadingText, dynamicStyles.loadingText]}>
              Carregando suas estatísticas...
            </Typography>
          </View>
        ) : (
          <>
            {/* Card principal de impacto */}
            <Card style={styles.impactCard}>
              <View style={styles.mainStats}>
                <View style={styles.statItem}>
                  <Typography
                    variant="h2"
                    color={theme.colors.primary.secondary}
                  >
                    {stats.totalDonations}
                  </Typography>
                  <Typography variant="bodySecondary" color={theme.colors.neutral.darkGray}>
                    Doações realizadas
                  </Typography>
                </View>

                <View style={styles.statItem}>
                  <Typography
                    variant="h2"
                    color={theme.colors.primary.secondary}
                  >
                    {stats.distributedItems}
                  </Typography>
                  <Typography variant="bodySecondary" color={theme.colors.neutral.darkGray}>
                    Itens distribuídos
                  </Typography>
                </View>

                <View style={styles.statItem}>
                  <Typography
                    variant="h2"
                    color={theme.colors.primary.secondary}
                  >
                    {stats.peopleHelped}
                  </Typography>
                  <Typography variant="bodySecondary" color={theme.colors.neutral.darkGray}>
                    Pessoas ajudadas
                  </Typography>
                </View>
              </View>
            </Card>

            {/* Detalhes por tipo de item */}
            <Card title="Tipos de itens doados" style={styles.detailsCard}>
              <View style={[styles.detailRow, dynamicStyles.detailRow]}>
                <Typography variant="bodySecondary" color={theme.colors.neutral.darkGray}>Roupas:</Typography>
                <Typography variant="body" color={theme.colors.neutral.black}>{stats.clothesDonated}</Typography>
              </View>
              <View style={[styles.detailRow, dynamicStyles.detailRow]}>
                <Typography variant="bodySecondary" color={theme.colors.neutral.darkGray}>Calçados:</Typography>
                <Typography variant="body" color={theme.colors.neutral.black}>{stats.shoesDonated}</Typography>
              </View>
              <View style={[styles.detailRow, dynamicStyles.detailRow]}>
                <Typography variant="bodySecondary" color={theme.colors.neutral.darkGray}>Utensílios:</Typography>
                <Typography variant="body" color={theme.colors.neutral.black}>{stats.utensilsDonated}</Typography>
              </View>
              <View style={[styles.detailRow, dynamicStyles.detailRow]}>
                <Typography variant="bodySecondary" color={theme.colors.neutral.darkGray}>Outros:</Typography>
                <Typography variant="body" color={theme.colors.neutral.black}>{stats.othersDonated}</Typography>
              </View>
            </Card>

            {/* Mensagem de agradecimento */}
            <Card style={[styles.messageCard, dynamicStyles.messageCard]}>
              <Typography variant="body" style={[styles.messageText, dynamicStyles.messageText]}>
                Obrigado por suas doações! Cada item faz a diferença na vida de
                quem precisa.
              </Typography>
            </Card>
          </>
        )}
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
  title: {
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
  },
  impactCard: {
    marginBottom: 16,
    padding: 8,
  },
  mainStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
  },
  statItem: {
    alignItems: "center",
  },
  detailsCard: {
    marginBottom: 16,
    padding: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    borderBottomWidth: 1,
  },
  messageCard: {
    marginBottom: 16,
    padding: 16,
  },
  messageText: {
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default ImpactScreen;
