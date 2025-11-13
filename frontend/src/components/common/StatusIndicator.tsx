import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import Typography from "./Typography";
import { useTheme } from "../../hooks/useTheme";
import { ItemStatus } from "../../types/items.types";

export type StatusType = "success" | "warning" | "error" | "info" | "neutral";

export interface StatusIndicatorProps {
  type?: StatusType;
  status?: ItemStatus;
  label?: string;
  size?: "small" | "medium" | "large";
  style?: StyleProp<ViewStyle>;
  showLabel?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  type = "neutral",
  status,
  label,
  size = "medium",
  style,
  showLabel = true,
}) => {
  const theme = useTheme();
  let currentType = type;
  let currentLabel = label;

  // Se status for fornecido, derivar o tipo a partir dele
  if (status) {
    switch (status) {
      case ItemStatus.DISPONIVEL:
        currentType = "success";
        currentLabel = currentLabel || "Disponível";
        break;
      case ItemStatus.RESERVADO:
        currentType = "warning";
        currentLabel = currentLabel || "Reservado";
        break;
      case ItemStatus.DISTRIBUIDO:
        currentType = "info";
        currentLabel = currentLabel || "Distribuído";
        break;
      default:
        currentType = "neutral";
    }
  }

  // Determinar cor com base no tipo
  let backgroundColor;
  switch (currentType) {
    case "success":
      backgroundColor = theme.colors.status.success;
      break;
    case "warning":
      backgroundColor = theme.colors.status.warning;
      break;
    case "error":
      backgroundColor = theme.colors.status.error;
      break;
    case "info":
      backgroundColor = theme.colors.status.info;
      break;
    case "neutral":
    default:
      backgroundColor = theme.colors.neutral.darkGray;
  }

  // Determinar tamanho do indicador
  let indicatorSize;
  let textVariant: "small" | "bodySecondary";

  switch (size) {
    case "small":
      indicatorSize = 8;
      textVariant = "small";
      break;
    case "large":
      indicatorSize = 16;
      textVariant = "bodySecondary";
      break;
    case "medium":
    default:
      indicatorSize = 12;
      textVariant = "small";
  }

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.indicator,
          {
            width: indicatorSize,
            height: indicatorSize,
            backgroundColor,
          },
        ]}
      />

      {showLabel && currentLabel && (
        <Typography variant={textVariant} color={theme.colors.neutral.black} style={styles.label}>
          {currentLabel}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  indicator: {
    borderRadius: 50,
  },
  label: {
    marginLeft: 8,
  },
});

export default StatusIndicator;
