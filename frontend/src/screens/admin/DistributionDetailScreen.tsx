import React, { useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AdminDistributionsStackParamList } from "../../navigation/types";

// Componentes
import {
  Header,
  Typography,
  Button,
  Loading,
  ErrorState,
  DistributionCard,
} from "../../components/barrelComponents";
import { useTheme } from "../../hooks/useTheme";

// Hooks
import { useAuth } from "../../hooks/useAuth";
import { useDistributions } from "../../hooks/useDistributions";

const DistributionDetailScreen: React.FC = () => {
  const theme = useTheme();
  const navigation =
    useNavigation<StackNavigationProp<AdminDistributionsStackParamList>>();
  const route = useRoute();
  const { id } = route.params as { id: string };
  useAuth();
  const { distribution, isLoading, error, fetchDistributionById, clearError } =
    useDistributions();
  const styles = DistributionDetailScreenStyles(theme);

  useEffect(() => {
    fetchDistributionById(id);
  }, [id, fetchDistributionById]);

  if (isLoading) {
    return <Loading visible={true} message="Carregando detalhes..." overlay />;
  }

  if (error) {
    return (
      <ErrorState
        title="Erro ao carregar detalhes"
        description={error}
        actionLabel="Tentar novamente"
        onAction={() => {
          clearError();
          fetchDistributionById(id);
        }}
      />
    );
  }

  if (!distribution) {
    return (
      <ErrorState
        title="Distribuição não encontrada"
        description="A distribuição solicitada não foi encontrada."
        actionLabel="Voltar"
        onAction={() => navigation.goBack()}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={`Distribuição #${distribution.id.slice(0, 8)}`}
        subtitle={`Data: ${new Date(distribution.date).toLocaleDateString()}`}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Typography variant="bodySecondary" style={styles.label}>Beneficiário:</Typography>
          <Typography variant="body" style={styles.value}>
            {distribution.beneficiary?.name || "Não especificado"}
          </Typography>

          <Typography variant="bodySecondary" style={styles.label}>Data da Distribuição:</Typography>
          <Typography variant="body" style={styles.value}>
            {distribution.date
              ? new Date(distribution.date).toLocaleString()
              : "Data não disponível"}
          </Typography>

          <Typography variant="bodySecondary" style={styles.label}>Observações:</Typography>
          <Typography variant="body" style={styles.value}>
            {distribution.observations || "Sem observações"}
          </Typography>

          <Typography variant="bodySecondary" style={styles.label}>Itens Distribuídos:</Typography>
          {distribution.items && distribution.items.length > 0 ? (
            distribution.items.map((item, index) => (
              <DistributionCard
                key={index}
                distribution={{
                  id: distribution.id,
                  date: distribution.date,
                  beneficiary: distribution.beneficiary,
                  beneficiaryId: distribution.beneficiaryId,
                  employee: distribution.employee,
                  employeeId: distribution.employeeId,
                  items: [item],
                  observations: distribution.observations,
                }}
                style={styles.itemCard}
              />
            ))
          ) : (
            <Typography variant="bodySecondary" style={styles.noItems}>Nenhum item distribuído.</Typography>
          )}
        </View>

        <View style={styles.actions}>
          <Button
            title="Editar"
            onPress={() => {
              // Verificar se a rota EditDistribution existe, caso contrário, usar uma alternativa
              navigation.navigate("DistributionDetail" as any, {
                id: distribution.id,
              });
            }}
            style={[styles.editButton, { backgroundColor: theme.colors.primary.accent }]}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const DistributionDetailScreenStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral.white,
  },
  content: {
    flex: 1,
    padding: theme.spacing.m,
    backgroundColor: theme.colors.neutral.white,
  },
  infoCard: {
    backgroundColor: theme.colors.neutral.white,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    elevation: 2,
    shadowColor: theme.colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: "bold",
    color: theme.colors.neutral.black,
    marginBottom: theme.spacing.xxs,
  },
  value: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.neutral.black,
    marginBottom: theme.spacing.s,
  },
  noItems: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.neutral.darkGray,
    marginTop: theme.spacing.xs,
  },
  itemCard: {
    marginBottom: theme.spacing.s,
  },
  actions: {
    marginTop: theme.spacing.m,
  },
  editButton: {
    // backgroundColor será aplicado inline
  },
});

export default DistributionDetailScreen;
