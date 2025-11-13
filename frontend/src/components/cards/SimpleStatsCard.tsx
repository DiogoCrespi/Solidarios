import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Typography, Card } from '../barrelComponents';
import { useTheme } from '../../hooks/useTheme';

export interface SimpleStatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  iconFamily?: 'MaterialCommunityIcons';
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const SimpleStatsCard: React.FC<SimpleStatsCardProps> = ({
  title,
  value,
  icon,
  iconFamily = 'MaterialCommunityIcons',
  color,
  style,
}) => {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const defaultColor = color || theme.colors.primary.main;
  
  // Calcular tamanho do ícone baseado no tamanho da tela
  // Mobile: 26px, Tablet: 28px, Desktop: 30px
  const iconSize = width < 600 ? 26 : width < 900 ? 28 : 30;
  
  return (
    <Card style={[styles.card, style]}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon as any} size={iconSize} color={defaultColor} />
      </View>
      <View style={styles.content}>
        <Typography variant="h2" color={theme.colors.neutral.black}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
        <Typography
          variant="body"
          color={theme.colors.neutral.darkGray}
          style={styles.title}
        >
          {title}
        </Typography>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    flexGrow: 0,
    flexShrink: 0,
  },
  iconContainer: {
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 36,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flexShrink: 1,
  },
  title: {
    marginTop: 8,
    textAlign: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
});

export default SimpleStatsCard;
