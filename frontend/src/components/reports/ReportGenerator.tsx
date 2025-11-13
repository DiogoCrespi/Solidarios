import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  Typography,
  Card,
  Button,
  Select,
  TextField,
} from '../barrelComponents';
import { useTheme } from '../../hooks/useTheme';
import { useCategories } from '../../hooks/useCategories';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface ReportConfig {
  type: string;
  format: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
}

interface ReportGeneratorProps {
  onGenerate: (config: ReportConfig) => Promise<void>;
  initialFilters?: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
  };
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ onGenerate, initialFilters }) => {
  const theme = useTheme();
  const { categories } = useCategories();
  const [reportType, setReportType] = useState('dashboard');
  const [format, setFormat] = useState('pdf');
  const [startDate, setStartDate] = useState(initialFilters?.startDate || '');
  const [endDate, setEndDate] = useState(initialFilters?.endDate || '');
  const [categoryId, setCategoryId] = useState(initialFilters?.categoryId || '');
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { label: 'Relatório Geral', value: 'dashboard' },
    { label: 'Relatório de Usuários', value: 'users' },
    { label: 'Relatório de Itens', value: 'items' },
    { label: 'Relatório de Distribuições', value: 'distributions' },
    { label: 'Relatório de Estoque', value: 'inventory' },
    { label: 'Relatório de Doadores', value: 'donors' },
  ];

  const formats = [
    { label: 'PDF', value: 'pdf' },
    { label: 'Excel (XLSX)', value: 'xlsx' },
    { label: 'CSV', value: 'csv' },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await onGenerate({
        type: reportType,
        format,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        categoryId: categoryId || undefined,
      });
      // Não precisa de Alert aqui, pois o download já acontece automaticamente
      // O Alert será mostrado pelo componente pai se houver erro
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o relatório. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = [
    { label: 'Todas as Categorias', value: '' },
    ...categories.map((cat) => ({
      label: cat.name,
      value: cat.id,
    })),
  ];

  // Sincronizar filtros iniciais quando mudarem
  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.startDate) setStartDate(initialFilters.startDate);
      if (initialFilters.endDate) setEndDate(initialFilters.endDate);
      if (initialFilters.categoryId) setCategoryId(initialFilters.categoryId);
    }
  }, [initialFilters]);

  // Determinar se os campos de filtro devem ser mostrados
  const showFilters = reportType === 'items' || reportType === 'distributions' || reportType === 'donors';

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="file-document"
          size={28}
          color={theme.colors.primary.main}
        />
        <Typography variant="h5" color={theme.colors.neutral.darkGray} style={styles.title}>
          Gerador de Relatórios
        </Typography>
      </View>

      <Typography variant="body" color={theme.colors.neutral.mediumGray} style={styles.description}>
        Selecione o tipo de relatório e o formato para exportação
      </Typography>

      <View style={styles.form}>
        {/* Tipo de Relatório */}
        <View style={styles.field}>
          <Typography variant="caption" color={theme.colors.neutral.mediumGray}>
            Tipo de Relatório
          </Typography>
          <Select
            selectedValue={reportType}
            onSelect={setReportType}
            options={reportTypes}
            placeholder="Selecione o tipo"
            selectStyle={styles.select}
          />
        </View>

        {/* Formato */}
        <View style={styles.field}>
          <Typography variant="caption" color={theme.colors.neutral.mediumGray}>
            Formato
          </Typography>
          <Select
            selectedValue={format}
            onSelect={setFormat}
            options={formats}
            placeholder="Selecione o formato"
            selectStyle={styles.select}
          />
        </View>

        {/* Filtros - Mostrar apenas para relatórios relevantes */}
        {showFilters && (
          <>
            {/* Data Inicial */}
            <View style={styles.field}>
              <Typography variant="caption" color={theme.colors.neutral.mediumGray}>
                Data Inicial (Opcional)
              </Typography>
              <TextField
                value={startDate}
                onChangeText={setStartDate}
                placeholder="AAAA-MM-DD"
                style={styles.input}
              />
            </View>

            {/* Data Final */}
            <View style={styles.field}>
              <Typography variant="caption" color={theme.colors.neutral.mediumGray}>
                Data Final (Opcional)
              </Typography>
              <TextField
                value={endDate}
                onChangeText={setEndDate}
                placeholder="AAAA-MM-DD"
                style={styles.input}
              />
            </View>

            {/* Categoria - Apenas para relatório de itens */}
            {reportType === 'items' && (
              <View style={styles.field}>
                <Typography variant="caption" color={theme.colors.neutral.mediumGray}>
                  Categoria (Opcional)
                </Typography>
                <Select
                  selectedValue={categoryId}
                  onSelect={setCategoryId}
                  options={categoryOptions}
                  placeholder="Selecione a categoria"
                  selectStyle={styles.select}
                />
              </View>
            )}
          </>
        )}
      </View>

      {/* Botão de Gerar */}
      <Button
        title={loading ? 'Gerando...' : 'Gerar Relatório'}
        onPress={handleGenerate}
        disabled={loading}
        style={styles.generateButton}
        icon={
          <MaterialCommunityIcons
            name="download"
            size={20}
            color={theme.colors.neutral.white}
          />
        }
      />

      {/* Informações sobre formatos */}
      <View style={[styles.info, { backgroundColor: theme.colors.notifications.info.background }]}>
        <MaterialCommunityIcons
          name="information"
          size={16}
          color={theme.colors.status.info}
        />
        <Typography variant="caption" color={theme.colors.neutral.mediumGray} style={styles.infoText}>
          Os relatórios são gerados com base nos dados atuais do sistema
        </Typography>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 24,
    padding: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    marginLeft: 24,
  },
  description: {
    marginBottom: 32,
  },
  form: {
    marginBottom: 32,
  },
  field: {
    marginBottom: 24,
  },
  select: {
    marginTop: 8,
  },
  input: {
    marginTop: 8,
  },
  generateButton: {
    marginTop: 24,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    padding: 24,
    borderRadius: 16,
  },
  infoText: {
    marginLeft: 16,
    flex: 1,
  },
});

export default ReportGenerator;

