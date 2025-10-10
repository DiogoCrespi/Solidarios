import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

// Componentes
import {
  Typography,
  Header,
  Card,
  Button,
  Divider,
  Checkbox,
  NotificationBanner,
} from '../../components/barrelComponents';
import theme from '../../theme';

// Hooks
import { useAuth } from '../../hooks/useAuth';

const SettingsScreen: React.FC = () => {
  const { user } = useAuth();
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'info' | 'warning',
  });

  // Estados para configurações
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);

  const handleSaveSettings = () => {
    setNotification({
      visible: true,
      message: 'Configurações salvas com sucesso!',
      type: 'success',
    });
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Resetar Configurações',
      'Tem certeza que deseja resetar todas as configurações para os valores padrão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: () => {
            setNotificationsEnabled(true);
            setDarkMode(false);
            setAutoSync(true);
            setBiometricAuth(false);
            setNotification({
              visible: true,
              message: 'Configurações resetadas!',
              type: 'info',
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Configurações" showBackButton />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Configurações de Notificações */}
        <Card style={styles.sectionCard}>
          <Typography variant="h6" style={styles.sectionTitle}>
            Notificações
          </Typography>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Typography variant="body">Notificações Push</Typography>
              <Typography variant="caption" color={theme.colors.neutral.mediumGray}>
                Receber notificações sobre doações e distribuições
              </Typography>
            </View>
            <Checkbox
              checked={notificationsEnabled}
              onToggle={() => setNotificationsEnabled(!notificationsEnabled)}
            />
          </View>
        </Card>

        {/* Configurações de Aparência */}
        <Card style={styles.sectionCard}>
          <Typography variant="h6" style={styles.sectionTitle}>
            Aparência
          </Typography>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Typography variant="body">Modo Escuro</Typography>
              <Typography variant="caption" color={theme.colors.neutral.mediumGray}>
                Usar tema escuro na interface
              </Typography>
            </View>
            <Checkbox
              checked={darkMode}
              onToggle={() => setDarkMode(!darkMode)}
            />
          </View>
        </Card>

        {/* Configurações de Sistema */}
        <Card style={styles.sectionCard}>
          <Typography variant="h6" style={styles.sectionTitle}>
            Sistema
          </Typography>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Typography variant="body">Sincronização Automática</Typography>
              <Typography variant="caption" color={theme.colors.neutral.mediumGray}>
                Sincronizar dados automaticamente
              </Typography>
            </View>
            <Checkbox
              checked={autoSync}
              onToggle={() => setAutoSync(!autoSync)}
            />
          </View>

          <Divider style={styles.settingDivider} />

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Typography variant="body">Autenticação Biométrica</Typography>
              <Typography variant="caption" color={theme.colors.neutral.mediumGray}>
                Usar impressão digital ou reconhecimento facial
              </Typography>
            </View>
            <Checkbox
              checked={biometricAuth}
              onToggle={() => setBiometricAuth(!biometricAuth)}
            />
          </View>
        </Card>

        {/* Configurações de Conta */}
        <Card style={styles.sectionCard}>
          <Typography variant="h6" style={styles.sectionTitle}>
            Conta
          </Typography>
          
          <TouchableOpacity style={styles.settingButton}>
            <Typography variant="body">Alterar Senha</Typography>
          </TouchableOpacity>
          
          <Divider style={styles.settingDivider} />
          
          <TouchableOpacity style={styles.settingButton}>
            <Typography variant="body">Editar Perfil</Typography>
          </TouchableOpacity>
          
          <Divider style={styles.settingDivider} />
          
          <TouchableOpacity style={styles.settingButton}>
            <Typography variant="body">Exportar Dados</Typography>
          </TouchableOpacity>
        </Card>

        {/* Informações do Sistema */}
        <Card style={styles.sectionCard}>
          <Typography variant="h6" style={styles.sectionTitle}>
            Informações
          </Typography>
          
          <View style={styles.infoItem}>
            <Typography variant="body" color={theme.colors.neutral.mediumGray}>
              Versão do App
            </Typography>
            <Typography variant="body">1.0.0</Typography>
          </View>
          
          <Divider style={styles.settingDivider} />
          
          <View style={styles.infoItem}>
            <Typography variant="body" color={theme.colors.neutral.mediumGray}>
              Usuário Logado
            </Typography>
            <Typography variant="body">{user?.name}</Typography>
          </View>
          
          <Divider style={styles.settingDivider} />
          
          <View style={styles.infoItem}>
            <Typography variant="body" color={theme.colors.neutral.mediumGray}>
              Tipo de Conta
            </Typography>
            <Typography variant="body">{user?.role}</Typography>
          </View>
        </Card>

        {/* Botões de Ação */}
        <View style={styles.actionButtons}>
          <Button
            title="Salvar Configurações"
            onPress={handleSaveSettings}
            style={styles.saveButton}
          />
          
          <Button
            title="Resetar Configurações"
            variant="secondary"
            onPress={handleResetSettings}
            style={styles.resetButton}
          />
        </View>
      </ScrollView>

      {/* Banner de notificação */}
      <NotificationBanner
        visible={notification.visible}
        message={notification.message}
        type={notification.type}
        onDismiss={() => setNotification({ ...notification, visible: false })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral.lightGray,
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.m,
  },
  sectionCard: {
    marginBottom: theme.spacing.m,
  },
  sectionTitle: {
    marginBottom: theme.spacing.m,
    color: theme.colors.primary.main,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.s,
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.m,
  },
  settingDivider: {
    marginVertical: theme.spacing.sm,
  },
  settingButton: {
    paddingVertical: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.s,
  },
  actionButtons: {
    marginTop: theme.spacing.l,
    marginBottom: theme.spacing.xl,
  },
  saveButton: {
    marginBottom: theme.spacing.m,
  },
  resetButton: {
    // Estilos específicos se necessário
  },
});

export default SettingsScreen;
