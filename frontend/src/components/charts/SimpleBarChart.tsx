import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Typography } from '../barrelComponents';
import { useTheme } from '../../hooks/useTheme';

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface SimpleBarChartProps {
  data: BarChartData[];
  title?: string;
  height?: number;
  showValues?: boolean;
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  title,
  height = 200,
  showValues = true,
}) => {
  const theme = useTheme();
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <View style={styles.container}>
      {title && (
        <Typography variant="h3" color={theme.colors.neutral.darkGray} style={styles.title}>
          {title}
        </Typography>
      )}
      <View style={[styles.chartContainer, { height }]}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 60);
          const barColor = item.color || theme.colors.primary.main;

          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: barColor,
                    },
                  ]}
                />
                {showValues && (
                  <Typography
                    variant="small"
                    color={theme.colors.neutral.darkGray}
                    style={styles.valueLabel}
                  >
                    {item.value}
                  </Typography>
                )}
              </View>
              <Typography
                variant="caption"
                color={theme.colors.neutral.mediumGray}
                style={styles.label}
                numberOfLines={1}
              >
                {item.label}
              </Typography>
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
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingBottom: 40,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  barWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    minHeight: 20,
  },
  bar: {
    width: '80%',
    borderRadius: 4,
    minHeight: 4,
  },
  valueLabel: {
    marginTop: 4,
    textAlign: 'center',
  },
  label: {
    marginTop: 8,
    textAlign: 'center',
    width: '100%',
  },
});

export default SimpleBarChart;

