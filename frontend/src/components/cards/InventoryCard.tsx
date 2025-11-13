import React from "react";
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
} from "react-native";
import Card from "../common/Card";
import Typography from "../common/Typography";
import Badge from "../common/Badge";
import StatusIndicator from "../common/StatusIndicator";
import { formatDate } from "../../utils/formatters";
import { Inventory } from "../../types/inventory.types";
import { ItemType } from "../../types/items.types";
import { useTheme } from "../../hooks/useTheme";

export interface InventoryCardProps {
  inventory: Inventory;
  onPress?: () => void;
  onUpdatePress?: () => void;
  style?: StyleProp<ViewStyle>;
  showActions?: boolean;
  compact?: boolean;
}

// Mapeamento de tipos de itens para rótulos
const itemTypeLabels: Record<ItemType, string> = {
  [ItemType.ROUPA]: "Roupa",
  [ItemType.CALCADO]: "Calçado",
  [ItemType.UTENSILIO]: "Utensílio",
  [ItemType.OUTRO]: "Outro",
};

const InventoryCard: React.FC<InventoryCardProps> = ({
  inventory,
  onPress,
  onUpdatePress,
  style,
  showActions = true,
  compact = false,
}) => {
  const theme = useTheme();
  const { item } = inventory;

  // Verificar se o estoque está baixo
  const isLowStock =
    inventory.alertLevel && inventory.quantity <= inventory.alertLevel;

  // Renderizar conteúdo do card
  const renderCardContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.mainInfoContainer}>
        {/* Tipo do item e status */}
        <View style={styles.headerRow}>
          <Badge
            label={itemTypeLabels[item.type]}
            variant="info"
            size="small"
          />

          <StatusIndicator status={item.status} size="small" />
        </View>

        {/* Descrição do item */}
        <Typography
          variant="body"
          color={theme.colors.neutral.black}
          style={styles.description}
          numberOfLines={compact ? 1 : 2}
        >
          {item.description}
        </Typography>

        {/* Categoria (se disponível) */}
        {item.category && (
          <View style={styles.categoryContainer}>
            <Typography variant="small" color={theme.colors.neutral.darkGray}>
              Categoria:
            </Typography>
            <Typography variant="small" color={theme.colors.neutral.black} style={styles.categoryText}>
              {item.category.name}
            </Typography>
          </View>
        )}
      </View>

      {/* Informações de inventário */}
      <View style={styles.inventoryInfoContainer}>
        {/* Quantidade em estoque */}
        <View style={styles.quantityContainer}>
          <Typography
            variant={compact ? "h4" : "h3"}
            color={
              isLowStock ? theme.colors.status.error : theme.colors.primary.main
            }
          >
            {inventory.quantity}
          </Typography>

          <Typography variant="small" color={theme.colors.neutral.darkGray}>
            unid.
          </Typography>
        </View>

        {/* Indicador de estoque baixo */}
        {isLowStock && (
          <Badge
            label="Estoque Baixo"
            variant="lowStock"
            size="small"
            style={styles.lowStockBadge}
          />
        )}
      </View>
    </View>
  );

  // Renderizar informações adicionais
  const renderAdditionalInfo = () =>
    !compact && (
      <View style={[styles.additionalInfoContainer, { borderTopColor: theme.colors.neutral.lightGray }]}>
        {/* Localização */}
        {inventory.location && (
          <View style={styles.infoItem}>
            <Typography variant="small" color={theme.colors.neutral.darkGray}>
              Localização:
            </Typography>
            <Typography variant="small" color={theme.colors.neutral.black}>{inventory.location}</Typography>
          </View>
        )}

        {/* Nível de alerta */}
        {inventory.alertLevel && (
          <View style={styles.infoItem}>
            <Typography variant="small" color={theme.colors.neutral.darkGray}>
              Nível de alerta:
            </Typography>
            <Typography variant="small" color={theme.colors.neutral.black}>
              {inventory.alertLevel} unidades
            </Typography>
          </View>
        )}

        {/* Última atualização */}
        <View style={styles.infoItem}>
          <Typography variant="small" color={theme.colors.neutral.darkGray}>
            Atualizado em:
          </Typography>
          <Typography variant="small" color={theme.colors.neutral.black}>
            {formatDate(inventory.updatedAt)}
          </Typography>
        </View>
      </View>
    );

  // Renderizar rodapé do card com ações
  const renderCardFooter = () =>
    showActions && (
      <View style={[styles.footer, { borderTopColor: theme.colors.neutral.lightGray }]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onUpdatePress}
          activeOpacity={0.7}
        >
          <Typography
            variant="bodySecondary"
            color={theme.colors.primary.secondary}
          >
            Atualizar quantidade
          </Typography>
        </TouchableOpacity>
      </View>
    );

  return (
    <Card
      style={[styles.card, compact && styles.compactCard, style]}
      onPress={onPress}
      contentStyle={styles.cardContent}
      footer={!compact && renderCardFooter()}
    >
      {renderCardContent()}
      {renderAdditionalInfo()}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  compactCard: {
    minHeight: 80,
  },
  cardContent: {
    padding: 16,
  },
  contentContainer: {
    flexDirection: "row",
  },
  mainInfoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  description: {
    marginBottom: 4,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryText: {
    marginLeft: 4,
  },
  inventoryInfoContainer: {
    marginLeft: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityContainer: {
    alignItems: "center",
  },
  lowStockBadge: {
    marginTop: 4,
  },
  additionalInfoContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  footer: {
    borderTopWidth: 1,
  },
  actionButton: {
    paddingVertical: 8,
    alignItems: "center",
  },
});

export default InventoryCard;
