import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Typography, Card } from '../barrelComponents';
import theme from '../../theme';

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
  color = theme.colors.primary.main,
  style,
}) => {
  const { width } = useWindowDimensions();
  
  // Calcular tamanho do ícone baseado no tamanho da tela
  // Mobile: 26px, Tablet: 28px, Desktop: 30px
  const iconSize = width < 600 ? 26 : width < 900 ? 28 : 30;
  
  return (
    <Card style={[styles.card, style]}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon as any} size={iconSize} color={color} />
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
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    flexGrow: 0,
    flexShrink: 0,
  },
  iconContainer: {
    marginBottom: theme.spacing.xs,
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
    marginTop: theme.spacing.xs,
    textAlign: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.xs,
  },
});

export default SimpleStatsCard;
