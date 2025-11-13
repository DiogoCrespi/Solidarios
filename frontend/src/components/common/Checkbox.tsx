import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import Typography from "./Typography";
import { useTheme } from "../../hooks/useTheme";

export interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: "small" | "medium" | "large";
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onToggle,
  label,
  disabled = false,
  style,
  size = "medium",
}) => {
  const theme = useTheme();
  
  // Definir tamanhos com base no parâmetro size
  const getSize = () => {
    switch (size) {
      case "small":
        return 16;
      case "large":
        return 24;
      case "medium":
      default:
        return 20;
    }
  };

  const checkboxSize = getSize();
  const innerSize = checkboxSize * 0.6;

  const backgroundColor = disabled
    ? theme.colors.neutral.mediumGray
    : checked
    ? theme.colors.primary.secondary
    : theme.colors.neutral.white;

  const borderColor = disabled
    ? theme.colors.neutral.mediumGray
    : checked
    ? theme.colors.primary.secondary
    : theme.colors.neutral.darkGray;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onToggle}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.checkbox,
          {
            width: checkboxSize,
            height: checkboxSize,
            borderColor,
            backgroundColor,
          },
        ]}
      >
        {checked && (
          <View
            style={[
              styles.inner,
              {
                width: innerSize,
                height: innerSize,
                backgroundColor: checked
                  ? theme.colors.neutral.white
                  : "transparent",
              },
            ]}
          />
        )}
      </View>

      {label && (
        <Typography
          variant="body"
          color={disabled ? theme.colors.neutral.darkGray : theme.colors.neutral.black}
          style={styles.label}
        >
          {label}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  checkbox: {
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  inner: {
    borderRadius: 2,
  },
  label: {
    marginLeft: 8,
  },
});

export default Checkbox;
