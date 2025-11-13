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

export interface EmptyStateProps {
  title: string;
  description?: string;
  image?: ImageSourcePropType;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  image,
  icon,
  actionLabel,
  onAction,
  style,
}) => {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, style]}>
      {image && (
        <Image source={image} style={styles.image} resizeMode="contain" />
      )}

      {icon && <View style={styles.iconContainer}>{icon}</View>}

      <Typography variant="h3" color={theme.colors.neutral.black} style={styles.title}>
        {title}
      </Typography>

      {description && (
        <Typography variant="bodySecondary" color={theme.colors.neutral.darkGray} style={styles.description}>
          {description}
        </Typography>
      )}

      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="secondary"
          style={styles.button}
        />
      )}
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
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
  },
});

export default EmptyState;
