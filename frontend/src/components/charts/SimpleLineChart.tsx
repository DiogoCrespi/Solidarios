import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Typography } from '../barrelComponents';
import { useTheme } from '../../hooks/useTheme';

interface LineChartData {
  label: string;
  value: number;
}

interface SimpleLineChartProps {
  data: LineChartData[];
  title?: string;
  height?: number;
  color?: string;
  showGrid?: boolean;
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  title,
  height = 200,
  color,
  showGrid = true,
}) => {
  const theme = useTheme();
  const chartColor = color || theme.colors.primary.main;
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const minValue = Math.min(...data.map((item) => item.value), 0);
  const valueRange = maxValue - minValue || 1;

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        {title && (
          <Typography variant="h3" color={theme.colors.neutral.darkGray} style={styles.title}>
            {title}
          </Typography>
        )}
        <View style={[styles.emptyContainer, { height }]}>
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.chartContainer, { height, minWidth: Math.max(data.length * 40, 300) }]}>
          {showGrid && (
            <View style={styles.grid}>
              {[0, 1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.gridLine,
                    {
                      top: (i / 4) * (height - 60),
                      borderColor: theme.colors.neutral.lightGray,
                    },
                  ]}
                />
              ))}
            </View>
          )}
          <View style={styles.chartArea}>
            {/* Barras verticais representando os valores */}
            {data.map((item, index) => {
              const barHeight = ((item.value - minValue) / valueRange) * (height - 60);
              const barWidth = Math.max(20, (100 / data.length) * 0.8);
              const spacing = (100 / data.length) * 0.2;
              
              return (
                <View
                  key={index}
                  style={[
                    styles.barContainer,
                    {
                      left: `${(index * 100) / data.length}%`,
                      width: `${100 / data.length}%`,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        width: barWidth,
                        backgroundColor: chartColor,
                        opacity: 0.7,
                      },
                    ]}
                  />
                  <Typography
                    variant="caption"
                    color={theme.colors.neutral.mediumGray}
                    style={styles.valueLabel}
                    numberOfLines={1}
                  >
                    {item.value}
                  </Typography>
                </View>
              );
            })}
          </View>
          {/* Labels no eixo X */}
          <View style={styles.xAxis}>
            {data.map((item, index) => {
              // Mostrar apenas alguns labels para não ficar muito poluído
              if (data.length > 10 && index % Math.ceil(data.length / 10) !== 0 && index !== data.length - 1) {
                return null;
              }
              return (
                <View
                  key={index}
                  style={[
                    styles.xLabelContainer,
                    {
                      left: `${(index * 100) / data.length}%`,
                      width: `${100 / data.length}%`,
                    },
                  ]}
                >
                  <Typography
                    variant="caption"
                    color={theme.colors.neutral.mediumGray}
                    style={styles.xLabel}
                    numberOfLines={1}
                  >
                    {item.label.length > 6 ? item.label.substring(0, 6) + '...' : item.label}
                  </Typography>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  chartContainer: {
    position: 'relative',
    paddingHorizontal: 16,
    paddingBottom: 40,
    width: '100%',
  },
  grid: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    left: 0,
    right: 0,
  },
  gridLine: {
    position: 'absolute',
    width: '100%',
    borderTopWidth: 1,
    left: 0,
    right: 0,
  },
  chartArea: {
    position: 'relative',
    width: '100%',
    height: '100%',
    paddingBottom: 40,
  },
  barContainer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: 2,
    minHeight: 2,
  },
  valueLabel: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 10,
  },
  xAxis: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  xLabelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xLabel: {
    textAlign: 'center',
    fontSize: 10,
  },
});

export default SimpleLineChart;

