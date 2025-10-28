import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
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
  return (
    <Card style={[styles.card, style]}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon as any} size={32} color={color} />
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
    minWidth: 150,
    padding: theme.spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: theme.spacing.m,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});

export default SimpleStatsCard;

