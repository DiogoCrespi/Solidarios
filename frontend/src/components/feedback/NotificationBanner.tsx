import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Platform,
} from "react-native";
import Typography from "../common/Typography";
import { useTheme } from "../../hooks/useTheme";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface NotificationBannerProps {
  visible: boolean;
  type?: NotificationType;
  message: string;
  description?: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
  position?: "top" | "bottom";
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onPress: () => void;
  };
}

// Componentes de ícones definidos antes do uso
const CloseIcon = ({ color = "#000000" }: { color?: string }) => (
  <View style={closeIconStyles.container}>
    <View style={[closeIconStyles.line1, { backgroundColor: color }]} />
    <View style={[closeIconStyles.line2, { backgroundColor: color }]} />
  </View>
);

const SuccessIcon = () => (
  <View style={commonIconStyles.container}>
    <View style={commonIconStyles.check} />
  </View>
);

const ErrorIcon = () => (
  <View style={commonIconStyles.container}>
    <View style={commonIconStyles.exclamation} />
  </View>
);

const WarningIcon = () => (
  <View style={commonIconStyles.container}>
    <View style={commonIconStyles.exclamation} />
  </View>
);

const InfoIcon = () => (
  <View style={commonIconStyles.container}>
    <View style={commonIconStyles.info} />
  </View>
);

const NotificationBanner: React.FC<NotificationBannerProps> = ({
  visible,
  type = "info",
  message,
  description,
  onClose,
  autoClose = true,
  duration = 5000,
  position = "top",
  style,
  icon,
  action,
}) => {
  const theme = useTheme();
  const translateY = useRef(
    new Animated.Value(position === "top" ? -100 : 100)
  ).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getTypeStyles = (): {
    backgroundColor: string;
    iconColor: string;
    textColor: string;
  } => {
    switch (type) {
      case "success":
        return {
          backgroundColor: theme.colors.notifications.success.background,
          iconColor: theme.colors.notifications.success.icon,
          textColor: theme.colors.notifications.success.text,
        };
      case "error":
        return {
          backgroundColor: theme.colors.notifications.error.background,
          iconColor: theme.colors.notifications.error.icon,
          textColor: theme.colors.notifications.error.text,
        };
      case "warning":
        return {
          backgroundColor: theme.colors.notifications.warning.background,
          iconColor: theme.colors.notifications.warning.icon,
          textColor: theme.colors.notifications.warning.text,
        };
      case "info":
      default:
        return {
          backgroundColor: theme.colors.notifications.info.background,
          iconColor: theme.colors.notifications.info.icon,
          textColor: theme.colors.notifications.info.text,
        };
    }
  };

  useEffect(() => {
    const opacityListener = opacity.addListener(({ value }) => {
      opacityValue.current = value;
    });
    return () => {
      opacity.removeListener(opacityListener);
    };
  }, [opacity]);

  useEffect(() => {
    // useNativeDriver não é suportado no React Native Web
    const useNativeDriver = Platform.OS !== "web";

    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver,
        }),
      ]).start();

      if (autoClose && onClose) {
        timerRef.current = setTimeout(() => {
          handleClose();
        }, duration);
      }
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: position === "top" ? -100 : 100,
          duration: 300,
          useNativeDriver,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver,
        }),
      ]).start(() => {
        if (onClose) {
          onClose();
        }
      });

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [visible, autoClose, duration, onClose, position]);

  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // useNativeDriver não é suportado no React Native Web
    const useNativeDriver = Platform.OS !== "web";

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === "top" ? -100 : 100,
        duration: 300,
        useNativeDriver,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver,
      }),
    ]).start(() => {
      if (onClose) {
        onClose();
      }
    });
  };

  const renderIcon = () => {
    if (icon) {
      return <View style={styles.icon}>{icon}</View>;
    }
    const typeStyles = getTypeStyles();
    return (
      <View
        style={[styles.defaultIcon, { backgroundColor: typeStyles.iconColor }]}
      >
        {type === "success" && <SuccessIcon />}
        {type === "error" && <ErrorIcon />}
        {type === "warning" && <WarningIcon />}
        {type === "info" && <InfoIcon />}
      </View>
    );
  };

  if (!visible && opacityValue.current === 0) {
    return null;
  }

  const typeStyles = getTypeStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        Platform.OS === "web" ? containerWebStyle : containerMobileStyle,
        position === "top" ? styles.topPosition : styles.bottomPosition,
        {
          backgroundColor: typeStyles.backgroundColor,
          transform: [{ translateY }],
          opacity,
        },
        style,
      ]}
    >
      <View style={styles.contentContainer}>
        {renderIcon()}
        <View style={styles.messageContainer}>
          <Typography
            variant="body"
            color={typeStyles.textColor}
            style={styles.message}
          >
            {message}
          </Typography>
          {description && (
            <Typography
              variant="small"
              color={typeStyles.textColor}
              style={styles.description}
            >
              {description}
            </Typography>
          )}
        </View>
        {onClose && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <CloseIcon color={typeStyles.textColor} />
          </TouchableOpacity>
        )}
      </View>
      {action && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            action.onPress();
            handleClose();
          }}
          activeOpacity={0.7}
        >
          <Typography
            variant="bodySecondary"
            color={typeStyles.iconColor}
            style={styles.actionLabel}
          >
            {action.label}
          </Typography>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// Estilos para os ícones
const closeIconStyles = StyleSheet.create({
  container: {
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  line1: {
    width: 16,
    height: 2,
    position: "absolute",
    transform: [{ rotate: "45deg" }],
  },
  line2: {
    width: 16,
    height: 2,
    position: "absolute",
    transform: [{ rotate: "-45deg" }],
  },
});

const commonIconStyles = StyleSheet.create({
  container: {
    width: 14,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  check: {
    width: 7,
    height: 10,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "#FFFFFF",
    transform: [{ rotate: "45deg" }],
  },
  exclamation: {
    width: 2,
    height: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
  },
  info: {
    width: 2,
    height: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
  },
});

// Estilos base
const baseStyles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: 8,
    padding: 16,
    zIndex: 9999,
  },
  topPosition: {
    top: 32,
  },
  bottomPosition: {
    bottom: 32,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 8,
  },
  defaultIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  messageContainer: {
    flex: 1,
  },
  message: {
    fontWeight: "600",
  },
  description: {
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  actionButton: {
    marginTop: 16,
    paddingTop: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "flex-end",
  },
  actionLabel: {
    fontWeight: "600",
  },
});

// Estilos condicionais para sombras (definidos fora do StyleSheet.create para evitar warnings)
const containerWebStyle = Platform.OS === "web" ? {
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
} : {};

const containerMobileStyle = Platform.OS !== "web" ? {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 2,
} : {};

// Exportar estilos junto com os condicionais
const styles = baseStyles;

export default NotificationBanner;
