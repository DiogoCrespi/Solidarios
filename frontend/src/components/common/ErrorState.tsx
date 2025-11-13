import React from "react";
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Image,
  ImageSourcePropType,
} from "react-native";
import Typography from "./Typography";
import Button from "./Button";
import { useTheme } from "../../hooks/useTheme";

export interface ErrorStateProps {
  title: string;
  description?: string;
  image?: ImageSourcePropType;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  style?: StyleProp<ViewStyle>;
  error?: Error | string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  image,
  icon,
  actionLabel = "Tentar novamente",
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  style,
  error,
}) => {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, style]}>
      {image && (
        <Image source={image} style={styles.image} resizeMode="contain" />
      )}

      {icon && <View style={styles.iconContainer}>{icon}</View>}

      <Typography
        variant="h3"
        style={styles.title}
        color={theme.colors.status.error}
      >
        {title}
      </Typography>

      {description && (
        <Typography variant="bodySecondary" color={theme.colors.neutral.darkGray} style={styles.description}>
          {description}
        </Typography>
      )}

      {error && typeof error !== "string" && (
        <Typography 
          variant="small" 
          color={theme.colors.status.error}
          style={[styles.errorDetail, { 
            backgroundColor: theme.colors.notifications.error.background,
            color: theme.colors.notifications.error.text 
          }]}
        >
          {error.message}
        </Typography>
      )}

      {error && typeof error === "string" && (
        <Typography 
          variant="small" 
          color={theme.colors.status.error}
          style={[styles.errorDetail, { 
            backgroundColor: theme.colors.notifications.error.background,
            color: theme.colors.notifications.error.text 
          }]}
        >
          {error}
        </Typography>
      )}

      <View style={styles.buttonsContainer}>
        {actionLabel && onAction && (
          <Button
            title={actionLabel}
            onPress={onAction}
            variant="primary"
            style={styles.primaryButton}
          />
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <Button
            title={secondaryActionLabel}
            onPress={onSecondaryAction}
            variant="secondary"
            style={styles.secondaryButton}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    textAlign: "center",
    marginBottom: 8,
  },
  errorDetail: {
    textAlign: "center",
    marginBottom: 24,
    padding: 8,
    borderRadius: 4,
  },
  buttonsContainer: {
    flexDirection: "row",
    marginTop: 16,
  },
  primaryButton: {
    marginHorizontal: 8,
  },
  secondaryButton: {
    marginHorizontal: 8,
  },
});

export default ErrorState;
