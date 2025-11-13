import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import Typography from "./Typography";
import { useTheme } from "../../hooks/useTheme";

export interface DividerProps {
  orientation?: "horizontal" | "vertical";
  thickness?: number;
  color?: string;
  label?: string;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<ViewStyle>;
}

const Divider: React.FC<DividerProps> = ({
  orientation = "horizontal",
  thickness = 1,
  color,
  label,
  spacing,
  style,
  labelStyle,
}) => {
  const theme = useTheme();
  const defaultColor = color || theme.colors.neutral.mediumGray;
  const defaultSpacing = spacing !== undefined ? spacing : theme.spacing.m;
  const dividerStyle = {
    backgroundColor: defaultColor,
    ...(orientation === "horizontal"
      ? { height: thickness, marginVertical: defaultSpacing }
      : {
          width: thickness,
          marginHorizontal: defaultSpacing,
          height: "100%" as unknown as number,
        }),
  };

  // Se houver label, cria um divider com texto no meio
  if (label && orientation === "horizontal") {
    return (
      <View style={[styles.labelContainer, style]}>
        <View style={[styles.divider, dividerStyle, styles.labelDivider]} />
        <View style={[styles.labelWrapper, labelStyle]}>
          <Typography variant="bodySecondary" color={theme.colors.neutral.darkGray}>{label}</Typography>
        </View>
        <View style={[styles.divider, dividerStyle, styles.labelDivider]} />
      </View>
    );
  }

  return <View style={[styles.divider, dividerStyle, style]} />;
};

const styles = StyleSheet.create({
  divider: {
    flexShrink: 0,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  labelDivider: {
    flex: 1,
    marginVertical: 0,
  },
  labelWrapper: {
    paddingHorizontal: 8,
  },
});

export default Divider;
