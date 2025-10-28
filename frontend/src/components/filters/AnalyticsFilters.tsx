import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Typography,
  Card,
  Button,
  TextField,
  Select,
} from '../barrelComponents';
import theme from '../../theme';
import { useCategories } from '../../hooks/useCategories';

export interface AnalyticsFiltersValues {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  status?: string;
  period?: string;
}

interface AnalyticsFiltersProps {
  onApply: (filters: AnalyticsFiltersValues) => void;
  onClear: () => void;
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  onApply,
  onClear,
}) => {
  const { categories } = useCategories();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('');
  const [period, setPeriod] = useState('month');

  const handleApply = () => {
    const filters: AnalyticsFiltersValues = {};
    
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (categoryId) filters.categoryId = categoryId;
    if (status) filters.status = status;
    if (period) filters.period = period;
    
    onApply(filters);
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setCategoryId('');
    setStatus('');
    setPeriod('month');
    onClear();
  };

  const periodOptions = [
    { label: 'Diário', value: 'day' },
    { label: 'Semanal', value: 'week' },
    { label: 'Mensal', value: 'month' },
    { label: 'Anual', value: 'year' },
  ];

  const statusOptions = [
    { label: 'Todos', value: '' },
    { label: 'Disponível', value: 'DISPONIVEL' },
    { label: 'Distribuído', value: 'DISTRIBUIDO' },
    { label: 'Reservado', value: 'RESERVADO' },
  ];

  const categoryOptions = [
    { label: 'Todas as Categorias', value: '' },
    ...categories.map((cat) => ({
      label: cat.name,
      value: cat.id,
    })),
  ];

  return (
    <Card style={styles.container}>
      <Typography variant="h5" color={theme.colors.neutral.darkGray}>
        Filtros Avançados
      </Typography>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filtersRow}>
          {/* Data Inicial */}
          <View style={styles.filterItem}>
            <Typography variant="caption" color={theme.colors.neutral.mediumGray}>
              Data Inicial
            </Typography>
            <TextField
              value={startDate}
              onChangeText={setStartDate}
              placeholder="AAAA-MM-DD"
              style={styles.input}
            />
          </View>

          {/* Data Final */}
          <View style={styles.filterItem}>
            <Typography variant="caption" color={theme.colors.neutral.mediumGray}>
              Data Final
            </Typography>
            <TextField
              value={endDate}
              onChangeText={setEndDate}
              placeholder="AAAA-MM-DD"
              style={styles.input}
            />
          </View>

          {/* Período */}
          <View style={styles.filterItem}>
            <Typography variant="caption" color={theme.colors.neutral.mediumGray}>
              Período
            </Typography>
            <Select
              selectedValue={period}
              onSelect={setPeriod}
              options={periodOptions}
              placeholder="Selecione o período"
              selectStyle={styles.select}
            />
          </View>

          {/* Categoria */}
          <View style={styles.filterItem}>
            <Typography variant="caption" color={theme.colors.neutral.mediumGray}>
              Categoria
            </Typography>
            <Select
              selectedValue={categoryId}
              onSelect={setCategoryId}
              options={categoryOptions}
              placeholder="Selecione a categoria"
              selectStyle={styles.select}
            />
          </View>

          {/* Status */}
          <View style={styles.filterItem}>
            <Typography variant="caption" color={theme.colors.neutral.mediumGray}>
              Status
            </Typography>
            <Select
              selectedValue={status}
              onSelect={setStatus}
              options={statusOptions}
              placeholder="Selecione o status"
              selectStyle={styles.select}
            />
          </View>
        </View>
      </ScrollView>

      {/* Botões */}
      <View style={styles.buttonsRow}>
        <Button
          title="Limpar"
          onPress={handleClear}
          variant="outline"
          style={styles.button}
        />
        <Button
          title="Aplicar Filtros"
          onPress={handleApply}
          style={styles.button}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: theme.spacing.m,
    padding: theme.spacing.l,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: theme.spacing.m,
    paddingVertical: theme.spacing.m,
  },
  filterItem: {
    minWidth: 200,
  },
  input: {
    marginTop: theme.spacing.xs,
  },
  select: {
    marginTop: theme.spacing.xs,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.m,
    marginTop: theme.spacing.m,
  },
  button: {
    minWidth: 120,
  },
});

export default AnalyticsFilters;

