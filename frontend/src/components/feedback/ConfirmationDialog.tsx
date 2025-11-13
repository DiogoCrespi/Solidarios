import React from "react";
import {
  View,
  Modal,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  Pressable,
  Platform,
} from "react-native";
import Typography from "../common/Typography";
import Button from "../common/Button";
import { useTheme } from "../../hooks/useTheme";

export type ConfirmationVariant = "default" | "success" | "danger" | "warning";

export interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: ConfirmationVariant;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  variant = "default",
  style,
  icon,
}) => {
  const theme = useTheme();
  
  // Determinar cores com base na variante
  const getColors = (): { primary: string; text: string } => {
    switch (variant) {
      case "success":
        return {
          primary: theme.colors.status.success,
          text: theme.colors.neutral.white,
        };
      case "danger":
        return {
          primary: theme.colors.status.error,
          text: theme.colors.neutral.white,
        };
      case "warning":
        return {
          primary: theme.colors.status.warning,
          text: theme.colors.neutral.black,
        };
      case "default":
      default:
        return {
          primary: theme.colors.primary.secondary,
          text: theme.colors.neutral.white,
        };
    }
  };

  const colors = getColors();
  
  const dynamicStyles = {
    container: {
      backgroundColor: theme.colors.neutral.white,
    },
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable 
          style={StyleSheet.absoluteFill} 
          onPress={onCancel}
        />
        <Pressable onPress={() => {}}>
          <View
            style={[
              styles.container,
              dynamicStyles.container,
              Platform.OS === "web" ? containerWebStyle : containerMobileStyle,
              style,
            ]}
          >
          {/* Cabeçalho */}
          <View
            style={[styles.header, { backgroundColor: colors.primary }]}
          >
            {icon && <View style={styles.icon}>{icon}</View>}
            <Typography
              variant="h3"
              color={colors.text}
              style={styles.title}
            >
              {title}
            </Typography>
          </View>

          {/* Conteúdo */}
          <View style={styles.content}>
            {message && (
              <Typography variant="body" color={theme.colors.neutral.black} style={styles.message}>
                {message}
              </Typography>
            )}

            {/* Botões */}
            <View style={styles.buttonsContainer}>
              <Button
                title={cancelLabel}
                onPress={onCancel}
                variant="secondary"
                style={styles.cancelButton}
              />

              <Button
                title={confirmLabel}
                onPress={onConfirm}
                variant={variant === "default" ? "primary" : "accent"}
                style={[
                  styles.confirmButton,
                  variant === "danger" && styles.dangerButton,
                  variant === "success" && styles.successButton,
                  variant === "warning" && styles.warningButton,
                ]}
              />
            </View>
          </View>
          </View>
        </Pressable>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    maxWidth: 400,
    borderRadius: 8,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  icon: {
    marginRight: 16,
  },
  title: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  message: {
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    marginRight: 16,
  },
  confirmButton: {
    minWidth: 100,
  },
  dangerButton: {
    backgroundColor: "#DC3545",
  },
  successButton: {
    backgroundColor: "#28A745",
  },
  warningButton: {
    backgroundColor: "#FFC107",
  },
});

// Estilos condicionais para sombras (definidos fora do StyleSheet.create para evitar warnings)
const containerWebStyle = Platform.OS === "web" ? {
  boxShadow: "0 3px 6px rgba(0, 0, 0, 0.2)",
} : {};

const containerMobileStyle = Platform.OS !== "web" ? {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 3,
} : {};

export default ConfirmationDialog;
