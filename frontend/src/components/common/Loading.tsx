import React from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Modal,
} from "react-native";
import Typography from "./Typography";
import { useTheme } from "../../hooks/useTheme";

export interface LoadingProps {
  visible?: boolean;
  message?: string;
  size?: "small" | "large";
  color?: string;
  overlay?: boolean;
  style?: StyleProp<ViewStyle>;
}

const Loading: React.FC<LoadingProps> = ({
  visible = true,
  message,
  size = "large",
  color,
  overlay = false,
  style,
}) => {
  const theme = useTheme();
  const loadingColor = color || theme.colors.primary.secondary;
  
  const content = (
    <View style={[styles.container, overlay && styles.overlayContainer, style]}>
      <ActivityIndicator size={size} color={loadingColor} />

      {message && (
        <Typography 
          variant="bodySecondary" 
          color={theme.colors.neutral.black}
          style={[styles.message, { backgroundColor: theme.colors.neutral.white }]} 
          center
        >
          {message}
        </Typography>
      )}
    </View>
  );

  if (overlay) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        {content}
      </Modal>
    );
  }

  if (!visible) {
    return null;
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  message: {
    marginTop: 16,
    padding: 8,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
});

export default Loading;
