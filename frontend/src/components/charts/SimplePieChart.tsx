import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../barrelComponents';
import { useTheme } from '../../hooks/useTheme';

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface SimplePieChartProps {
  data: PieChartData[];
  title?: string;
}

const SimplePieChart: React.FC<SimplePieChartProps> = ({
  data,
  title,
}) => {
  const theme = useTheme();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <View style={styles.container}>
        {title && (
          <Typography variant="h3" color={theme.colors.neutral.darkGray} style={styles.title}>
            {title}
          </Typography>
        )}
        <View style={styles.emptyContainer}>
          <Typography variant="body" color={theme.colors.neutral.mediumGray}>
            Sem dados
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {title && (
        <Typography variant="h3" color={theme.colors.neutral.darkGray} style={styles.title}>
          {title}
        </Typography>
      )}
      <View style={styles.content}>
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          return (
            <View key={index} style={styles.item}>
              <View style={styles.itemHeader}>
                <View
                  style={[
                    styles.legendColor,
                    { backgroundColor: item.color },
                  ]}
                />
                <Typography variant="body" color={theme.colors.neutral.darkGray} style={styles.itemLabel}>
                  {item.label}
                </Typography>
                <Typography variant="small" color={theme.colors.neutral.mediumGray} style={styles.itemValue}>
                  {item.value} ({percentage.toFixed(1)}%)
                </Typography>
              </View>
              <View style={[styles.barContainer, { backgroundColor: theme.colors.neutral.lightGray }]}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${percentage}%`,
                      backgroundColor: item.color,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  content: {
    gap: 16,
  },
  item: {
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  itemLabel: {
    flex: 1,
  },
  itemValue: {
    marginLeft: 8,
  },
  barContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
});

export default SimplePieChart;

