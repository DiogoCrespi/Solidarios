import React, { useState, useEffect } from 'react';
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
import { useTheme } from '../../hooks/useTheme';

// Hooks
import { useAuth } from '../../hooks/useAuth';

const SettingsScreen: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'info' | 'warning',
  });

  // Estados para configurações
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);

  // Sincronizar darkMode com o tema
  const darkMode = theme.isDark;

  const handleToggleDarkMode = () => {
    const newMode = theme.isDark ? 'claro' : 'escuro';
    theme.toggleTheme();
    setNotification({
      visible: true,
      message: `Modo ${newMode} ativado!`,
      type: 'success',
    });
  };

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
            theme.setTheme('light');
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
    <View style={[styles.container, { backgroundColor: theme.colors.neutral.lightGray }]}>
      <Header title="Configurações" showBackButton />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Configurações de Notificações */}
        <Card style={styles.sectionCard}>
          <Typography variant="h6" style={[styles.sectionTitle, { color: theme.colors.primary.main }]}>
            Notificações
          </Typography>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Typography variant="body" color={theme.colors.neutral.black}>
                Notificações Push
              </Typography>
              <Typography variant="caption" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
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
          <Typography variant="h6" style={[styles.sectionTitle, { color: theme.colors.primary.main }]}>
            Aparência
          </Typography>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Typography variant="body" color={theme.colors.neutral.black}>
                Modo Escuro
              </Typography>
              <Typography variant="caption" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
                Usar tema escuro na interface
              </Typography>
            </View>
            <Checkbox
              checked={darkMode}
              onToggle={handleToggleDarkMode}
            />
          </View>
        </Card>

        {/* Configurações de Sistema */}
        <Card style={styles.sectionCard}>
          <Typography variant="h6" style={[styles.sectionTitle, { color: theme.colors.primary.main }]}>
            Sistema
          </Typography>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Typography variant="body" color={theme.colors.neutral.black}>
                Sincronização Automática
              </Typography>
              <Typography variant="caption" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
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
              <Typography variant="body" color={theme.colors.neutral.black}>
                Autenticação Biométrica
              </Typography>
              <Typography variant="caption" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
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
          <Typography variant="h6" style={[styles.sectionTitle, { color: theme.colors.primary.main }]}>
            Conta
          </Typography>
          
          <TouchableOpacity style={styles.settingButton}>
            <Typography variant="body" color={theme.colors.neutral.black}>
              Alterar Senha
            </Typography>
          </TouchableOpacity>
          
          <Divider style={styles.settingDivider} />
          
          <TouchableOpacity style={styles.settingButton}>
            <Typography variant="body" color={theme.colors.neutral.black}>
              Editar Perfil
            </Typography>
          </TouchableOpacity>
          
          <Divider style={styles.settingDivider} />
          
          <TouchableOpacity style={styles.settingButton}>
            <Typography variant="body" color={theme.colors.neutral.black}>
              Exportar Dados
            </Typography>
          </TouchableOpacity>
        </Card>

        {/* Informações do Sistema */}
        <Card style={styles.sectionCard}>
          <Typography variant="h6" style={[styles.sectionTitle, { color: theme.colors.primary.main }]}>
            Informações
          </Typography>
          
          <View style={styles.infoItem}>
            <Typography variant="body" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
              Versão do App
            </Typography>
            <Typography variant="body" color={theme.isDark ? theme.colors.neutral.black : theme.colors.neutral.black}>
              1.0.0
            </Typography>
          </View>
          
          <Divider style={styles.settingDivider} />
          
          <View style={styles.infoItem}>
            <Typography variant="body" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
              Usuário Logado
            </Typography>
            <Typography variant="body" color={theme.isDark ? theme.colors.neutral.black : theme.colors.neutral.black}>
              {user?.name}
            </Typography>
          </View>
          
          <Divider style={styles.settingDivider} />
          
          <View style={styles.infoItem}>
            <Typography variant="body" color={theme.isDark ? theme.colors.neutral.darkGray : theme.colors.neutral.mediumGray}>
              Tipo de Conta
            </Typography>
            <Typography variant="body" color={theme.isDark ? theme.colors.neutral.black : theme.colors.neutral.black}>
              {user?.role}
            </Typography>
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

// Estilos dinâmicos serão aplicados inline usando o hook useTheme
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  sectionCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 24,
  },
  settingDivider: {
    marginVertical: 8,
  },
  settingButton: {
    paddingVertical: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  actionButtons: {
    marginTop: 32,
    marginBottom: 48,
  },
  saveButton: {
    marginBottom: 24,
  },
  resetButton: {
    // Estilos específicos se necessário
  },
});

export default SettingsScreen;
