import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  StatusBar,
} from "react-native";
import Typography from "./Typography";
import { useTheme } from "../../hooks/useTheme";

export interface HeaderProps {
  title: string;
  subtitle?: string;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  elevated?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftComponent,
  rightComponent,
  onBackPress,
  style,
  backgroundColor,
  titleColor,
  subtitleColor,
  elevated = true,
}) => {
  const theme = useTheme();
  
  // Valores padrão baseados no tema
  const defaultBackgroundColor = backgroundColor || theme.colors.primary.main;
  const defaultTitleColor = titleColor || theme.colors.neutral.white;
  const defaultSubtitleColor = subtitleColor || theme.colors.neutral.white + "CC"; // 80% opacity
  
  // Determinar estilo da barra de status baseado no tema
  const statusBarStyle = theme.isDark ? "light-content" : "dark-content";
  
  return (
    <>
      <StatusBar backgroundColor={defaultBackgroundColor} barStyle={statusBarStyle} />
      <View
        style={[
          styles.container,
          { backgroundColor: defaultBackgroundColor },
          elevated && theme.shadows.medium,
          elevated && { elevation: 4 },
          style,
        ]}
      >
        <View style={styles.leftContainer}>
          {leftComponent ? (
            leftComponent
          ) : onBackPress ? (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <BackIcon color={defaultTitleColor} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.titleContainer}>
          <Typography
            variant="h3"
            color={defaultTitleColor}
            style={styles.title}
            numberOfLines={1}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="small"
              color={defaultSubtitleColor}
              style={styles.subtitle}
              numberOfLines={1}
            >
              {subtitle}
            </Typography>
          )}
        </View>

        <View style={styles.rightContainer}>
          {rightComponent || <View style={styles.placeholderRight} />}
        </View>
      </View>
    </>
  );
};

// Componente de ícone de voltar padrão
const BackIcon = ({ color = "#FFFFFF" }: { color?: string }) => (
  <View style={backIconStyles.container}>
    <View style={[backIconStyles.arrow, { borderColor: color }]} />
  </View>
);

const backIconStyles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: "45deg" }],
  },
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: 16,
  },
  leftContainer: {
    width: 48,
    height: "100%",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  backButton: {
    padding: 4,
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
  },
  rightContainer: {
    width: 48,
    height: "100%",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  placeholderRight: {
    width: 24,
  },
});

export default Header;
