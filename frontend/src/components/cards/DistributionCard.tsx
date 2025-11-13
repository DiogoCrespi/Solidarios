import React from "react";
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  FlatList,
} from "react-native";
import Card from "../common/Card";
import Typography from "../common/Typography";
import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import Divider from "../common/Divider";
import { formatDateTime } from "../../utils/formatters";
import { Distribution } from "../../types/distributions.types";
import { useTheme } from "../../hooks/useTheme";

export interface DistributionCardProps {
  distribution: Distribution;
  onPress?: () => void;
  onBeneficiaryPress?: () => void;
  onItemPress?: (itemId: string) => void;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
  showItems?: boolean;
}

const DistributionCard: React.FC<DistributionCardProps> = ({
  distribution,
  onPress,
  onBeneficiaryPress,
  onItemPress,
  style,
  compact = false,
  showItems = true,
}) => {
  const theme = useTheme();
  
  // Renderizar cabeçalho com data e ID
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Typography
        variant={compact ? "bodySecondary" : "h4"}
        color={theme.colors.neutral.black}
        style={styles.headerTitle}
      >
        Distribuição
      </Typography>
      <Typography variant="small" color={theme.colors.neutral.darkGray}>
        {formatDateTime(distribution.date)}
      </Typography>
    </View>
  );

  // Renderizar informações do beneficiário
  const renderBeneficiary = () => (
    <TouchableOpacity
      style={styles.beneficiaryContainer}
      onPress={onBeneficiaryPress}
      disabled={!onBeneficiaryPress}
      activeOpacity={0.7}
    >
      <View style={styles.beneficiaryHeader}>
        <Typography
          variant="bodySecondary"
          color={theme.colors.neutral.darkGray}
        >
          Beneficiário:
        </Typography>

        {!compact && onBeneficiaryPress && (
          <Typography variant="small" color={theme.colors.primary.secondary}>
            Ver perfil
          </Typography>
        )}
      </View>

      <View style={styles.beneficiaryContent}>
        <Avatar
          name={distribution.beneficiary.name}
          size={compact ? "small" : "medium"}
          style={styles.avatar}
        />

        <View style={styles.beneficiaryInfo}>
          <Typography variant="body" color={theme.colors.neutral.black} numberOfLines={1}>
            {distribution.beneficiary.name}
          </Typography>

          {!compact && (
            <Typography
              variant="small"
              color={theme.colors.neutral.darkGray}
              numberOfLines={1}
            >
              {distribution.beneficiary.email}
            </Typography>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Renderizar informações do funcionário
  const renderEmployee = () =>
    !compact && (
      <View style={styles.employeeContainer}>
        <Typography
          variant="bodySecondary"
          color={theme.colors.neutral.darkGray}
        >
          Realizada por:
        </Typography>

        <View style={styles.employeeContent}>
          <Avatar
            name={distribution.employee.name}
            size="small"
            style={styles.avatar}
          />

          <Typography variant="bodySecondary" color={theme.colors.neutral.black} numberOfLines={1}>
            {distribution.employee.name}
          </Typography>
        </View>
      </View>
    );

  // Renderizar item da distribuição
  const renderItem = ({ item }: { item: Distribution["items"][0] }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => onItemPress && onItemPress(item.id)}
      disabled={!onItemPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemInfo}>
        <Typography variant="bodySecondary" color={theme.colors.neutral.black} numberOfLines={1}>
          {item.description}
        </Typography>

        {item.category && (
          <Typography variant="small" color={theme.colors.neutral.darkGray}>
            {item.category.name}
          </Typography>
        )}
      </View>

      {item.size && (
        <Badge
          label={item.size}
          variant="info"
          size="small"
          style={styles.sizeBadge}
        />
      )}
    </TouchableOpacity>
  );

  // Renderizar lista de itens
  const renderItems = () =>
    showItems &&
    !compact && (
      <View style={styles.itemsContainer}>
        <Typography variant="bodySecondary" color={theme.colors.neutral.black} style={styles.itemsTitle}>
          Itens distribuídos ({distribution.items.length})
        </Typography>

        <FlatList
          data={distribution.items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <Divider spacing={8} />}
          style={styles.itemsList}
        />
      </View>
    );

  // Renderizar observações
  const renderObservations = () =>
    !compact &&
    distribution.observations && (
      <View style={styles.observationsContainer}>
        <Typography
          variant="bodySecondary"
          color={theme.colors.neutral.darkGray}
        >
          Observações:
        </Typography>

        <Typography variant="bodySecondary" color={theme.colors.neutral.black} style={styles.observationsText}>
          {distribution.observations}
        </Typography>
      </View>
    );

  // Renderizar resumo compacto (número de itens)
  const renderCompactSummary = () =>
    compact && (
      <View style={styles.compactSummaryContainer}>
        <Typography
          variant="bodySecondary"
          color={theme.colors.neutral.darkGray}
        >
          {distribution.items.length}{" "}
          {distribution.items.length === 1 ? "item" : "itens"} distribuídos
        </Typography>
      </View>
    );

  return (
    <Card
      style={[styles.card, compact && styles.compactCard, style]}
      onPress={onPress}
      contentStyle={styles.cardContent}
    >
      {renderHeader()}
      {renderBeneficiary()}
      {renderEmployee()}
      {renderItems()}
      {renderObservations()}
      {renderCompactSummary()}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  compactCard: {
    minHeight: 100,
  },
  cardContent: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: {
    flex: 1,
  },
  beneficiaryContainer: {
    marginBottom: 16,
  },
  beneficiaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  beneficiaryContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  beneficiaryInfo: {
    flex: 1,
  },
  avatar: {
    marginRight: 8,
  },
  employeeContainer: {
    marginBottom: 16,
  },
  employeeContent: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  itemsContainer: {
    marginBottom: 16,
  },
  itemsTitle: {
    marginBottom: 8,
  },
  itemsList: {
    maxHeight: 200,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  itemInfo: {
    flex: 1,
  },
  sizeBadge: {
    marginLeft: 16,
  },
  observationsContainer: {
    marginTop: 8,
  },
  observationsText: {
    marginTop: 4,
  },
  compactSummaryContainer: {
    marginTop: 8,
    alignItems: "flex-end",
  },
});

export default DistributionCard;
