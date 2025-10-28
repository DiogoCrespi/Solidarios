import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  Typography,
  Card,
  Button,
  Select,
} from '../barrelComponents';
import theme from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface ReportConfig {
  type: string;
  format: string;
  startDate?: string;
  endDate?: string;
}

interface ReportGeneratorProps {
  onGenerate: (config: ReportConfig) => Promise<void>;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ onGenerate }) => {
  const [reportType, setReportType] = useState('dashboard');
  const [format, setFormat] = useState('pdf');
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
      });
      Alert.alert('Sucesso', 'Relatório gerado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o relatório.');
    } finally {
      setLoading(false);
    }
  };

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
      <View style={styles.info}>
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
    margin: theme.spacing.m,
    padding: theme.spacing.l,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  title: {
    marginLeft: theme.spacing.m,
  },
  description: {
    marginBottom: theme.spacing.l,
  },
  form: {
    marginBottom: theme.spacing.l,
  },
  field: {
    marginBottom: theme.spacing.m,
  },
  select: {
    marginTop: theme.spacing.xs,
  },
  generateButton: {
    marginTop: theme.spacing.m,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.l,
    padding: theme.spacing.m,
    backgroundColor: theme.colors.notifications.info.background,
    borderRadius: theme.spacing.s,
  },
  infoText: {
    marginLeft: theme.spacing.s,
    flex: 1,
  },
});

export default ReportGenerator;

