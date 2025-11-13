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
import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import { User, UserRole } from "../../types/users.types";
import { useTheme } from "../../hooks/useTheme";

export interface UserCardProps {
  user: User;
  onPress?: () => void;
  onActionPress?: () => void;
  actionLabel?: string;
  style?: StyleProp<ViewStyle>;
  showActions?: boolean;
  showRole?: boolean;
  compact?: boolean;
}

// Mapeamento de perfis de usuário para rótulos
const userRoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administrador",
  [UserRole.FUNCIONARIO]: "Funcionário",
  [UserRole.DOADOR]: "Doador",
  [UserRole.BENEFICIARIO]: "Beneficiário",
};

// Mapeamento de perfis para variantes de badge
const userRoleBadges: Record<
  UserRole,
  "info" | "success" | "warning" | "lowStock"
> = {
  [UserRole.ADMIN]: "info",
  [UserRole.FUNCIONARIO]: "info",
  [UserRole.DOADOR]: "success",
  [UserRole.BENEFICIARIO]: "warning",
};

const UserCard: React.FC<UserCardProps> = ({
  user,
  onPress,
  onActionPress,
  actionLabel = "Ver perfil",
  style,
  showActions = true,
  showRole = true,
  compact = false,
}) => {
  const theme = useTheme();
  
  // Renderizar conteúdo do card
  const renderCardContent = () => (
    <View style={styles.contentContainer}>
      {/* Avatar do usuário */}
      <Avatar
        name={user.name}
        size={compact ? "small" : "medium"}
        style={styles.avatar}
      />

      <View style={styles.detailsContainer}>
        {/* Nome e perfil do usuário */}
        <View style={styles.nameContainer}>
          <Typography
            variant={compact ? "body" : "h4"}
            color={theme.colors.neutral.black}
            style={styles.name}
            numberOfLines={1}
          >
            {user.name}
          </Typography>

          {showRole && (
            <Badge
              label={userRoleLabels[user.role]}
              variant={userRoleBadges[user.role]}
              size={compact ? "small" : "medium"}
              style={styles.roleBadge}
            />
          )}
        </View>

        {/* E-mail do usuário */}
        <Typography
          variant="bodySecondary"
          color={theme.colors.neutral.darkGray}
          style={styles.email}
          numberOfLines={1}
        >
          {user.email}
        </Typography>

        {/* Status de ativação */}
        {!compact && (
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor: user.isActive
                    ? theme.colors.status.success
                    : theme.colors.status.error,
                },
              ]}
            />
            <Typography variant="small" color={theme.colors.neutral.black}>
              {user.isActive ? "Ativo" : "Inativo"}
            </Typography>
          </View>
        )}
      </View>
    </View>
  );

  // Renderizar rodapé do card com ações
  const renderCardFooter = () =>
    showActions && (
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onActionPress || onPress}
        activeOpacity={0.7}
      >
        <Typography
          variant="bodySecondary"
          color={theme.colors.primary.secondary}
        >
          {actionLabel}
        </Typography>
      </TouchableOpacity>
    );

  return (
    <Card
      style={[styles.card, compact && styles.compactCard, style]}
      onPress={onPress}
      contentStyle={styles.cardContent}
      footer={!compact && renderCardFooter()}
    >
      {renderCardContent()}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  compactCard: {
    minHeight: 60,
  },
  cardContent: {
    padding: 16,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    marginRight: 16,
  },
  detailsContainer: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    flex: 1,
    marginRight: 8,
  },
  roleBadge: {
    marginLeft: 4,
  },
  email: {
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  actionButton: {
    paddingVertical: 8,
    alignItems: "center",
  },
});

export default UserCard;
