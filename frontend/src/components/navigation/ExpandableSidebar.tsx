import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';
import UsersService from '../../api/users';
import { getApiBaseUrl } from '../../api/api';
import { useState as useReactState } from 'react';

// Componentes
import {
  Typography,
  Avatar,
  Divider,
  Card,
} from '../barrelComponents';
import theme from '../../theme';

// Ícones
import {
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
} from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');
const SIDEBAR_WIDTH = 80;
const EXPANDED_WIDTH = 280;

interface MenuItem {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap | keyof typeof Ionicons.glyphMap;
  iconFamily: 'MaterialIcons' | 'MaterialCommunityIcons' | 'Ionicons';
  label: string;
  route?: string;
  onPress?: () => void;
  stats?: {
    count: number;
    total: number;
    searchPlaceholder: string;
    emptyMessage: string;
  };
}

interface ExpandableSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  currentRoute?: string;
  onNavigate?: (route: string) => void;
}

const ExpandableSidebar: React.FC<ExpandableSidebarProps> = ({
  isExpanded,
  onToggle,
  currentRoute,
  onNavigate,
}) => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  // Iniciar com a largura minimizada
  const [animatedWidth] = useState(new Animated.Value(SIDEBAR_WIDTH));
  const [photoUrl, setPhotoUrl] = useReactState<string | null>(user?.photo || null);

  React.useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: isExpanded ? EXPANDED_WIDTH : SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isExpanded, animatedWidth]);

  // Atualizar photoUrl quando user.photo mudar (ex: ao fazer login)
  React.useEffect(() => {
    if (user?.photo) {
      setPhotoUrl(user.photo);
    }
  }, [user?.photo]);

  const getMenuItems = (): MenuItem[] => {
    const baseItems: MenuItem[] = [
      {
        id: 'dashboard',
        icon: 'dashboard',
        iconFamily: 'MaterialIcons',
        label: 'Dashboard',
        route: 'Dashboard',
      },
    ];

    // Adicionar Analytics apenas para ADMINs
    if (user?.role === 'ADMIN') {
      baseItems.push({
        id: 'analytics',
        icon: 'chart-line',
        iconFamily: 'MaterialCommunityIcons',
        label: 'Analytics',
        route: 'Analytics',
      });
    }

    // Continuar com os itens base
    baseItems.push(
      {
        id: 'items',
        icon: 'package-variant',
        iconFamily: 'MaterialCommunityIcons',
        label: 'Itens',
        route: 'Items',
      },
      {
        id: 'categories',
        icon: 'shape',
        iconFamily: 'MaterialCommunityIcons',
        label: 'Categorias',
        route: 'Categories',
      },
      {
        id: 'inventory',
        icon: 'clipboard-list',
        iconFamily: 'MaterialCommunityIcons',
        label: 'Estoque',
        route: 'Inventory',
        stats: {
          count: 0,
          total: 0,
          searchPlaceholder: 'Buscar no inventário...',
          emptyMessage: 'Não há itens cadastrados no inventário.',
        },
      },
      {
        id: 'distributions',
        icon: 'truck-delivery',
        iconFamily: 'MaterialCommunityIcons',
        label: 'Distribuições',
        route: 'Distributions',
        stats: {
          count: 0,
          total: 0,
          searchPlaceholder: 'Buscar distribuições...',
          emptyMessage: 'Não há distribuições cadastradas.',
        },
      }
    );

    // Adicionar itens específicos por role
    if (user?.role === 'ADMIN') {
      baseItems.push({
        id: 'users',
        icon: 'account-group',
        iconFamily: 'MaterialCommunityIcons',
        label: 'Usuários',
        route: 'Users',
        stats: {
          count: 0,
          total: 0,
          searchPlaceholder: 'Buscar usuários...',
          emptyMessage: 'Não há usuários cadastrados no sistema',
        },
      });
    } else if (user?.role === 'FUNCIONARIO') {
      baseItems.push({
        id: 'beneficiaries',
        icon: 'account-group',
        iconFamily: 'MaterialCommunityIcons',
        label: 'Beneficiários',
        route: 'Beneficiaries',
        stats: {
          count: 0,
          total: 0,
          searchPlaceholder: 'Buscar beneficiários...',
          emptyMessage: 'Não há beneficiários cadastrados no sistema',
        },
      });
    }

    // Adicionar configurações para todos
    baseItems.push({
      id: 'settings',
      icon: 'settings',
      iconFamily: 'Ionicons',
      label: 'Configurações',
      route: 'Settings',
    });

    return baseItems;
  };

  const menuItems = getMenuItems();

  const renderIcon = (item: MenuItem, color: string, size: number = 24) => {
    const iconProps = { name: item.icon, size, color };
    
    switch (item.iconFamily) {
      case 'MaterialIcons':
        return <MaterialIcons {...iconProps} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons {...iconProps} />;
      case 'Ionicons':
        return <Ionicons {...iconProps} />;
      default:
        return <MaterialIcons {...iconProps} />;
    }
  };

  const handleMenuItemPress = (item: MenuItem) => {
    if (item.onPress) {
      item.onPress();
    } else if (item.route) {
      if (onNavigate) {
        onNavigate(item.route);
      } else {
        navigation.navigate(item.route as never);
      }
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleSelectPhoto = async () => {
    try {
      // Solicitar permissão para acessar a galeria
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          'Permissão necessária',
          'É necessário permitir o acesso à galeria para alterar a foto de perfil.'
        );
        return;
      }

      // Abrir seletor de imagens
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        await handleUploadPhoto(selectedImage.uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const handleUploadPhoto = async (imageUri: string) => {
    if (!user?.id) return;

    try {
      console.log('📸 Iniciando upload da foto:', imageUri);
      
      // Criar FormData
      const formData = new FormData();
      
      // Para Web, usar fetch para obter o blob
      if (Platform.OS === 'web') {
        console.log('🌐 Plataforma Web detectada');
        
        // Verificar se é uma data URL (base64)
        if (imageUri.startsWith('data:')) {
          console.log('📄 Data URL detectada, convertendo para blob');
          
          // Converter data URL para blob
          const response = await fetch(imageUri);
          const blob = await response.blob();
          
          console.log('📦 Blob criado:', blob.type, blob.size, 'bytes');
          
          // Determinar tipo do arquivo
          const mimeType = blob.type || 'image/jpeg';
          const extension = mimeType.split('/')[1] || 'jpg';
          const fileName = `photo-${Date.now()}.${extension}`;
          
          console.log('📝 Nome do arquivo:', fileName);
          
          // Criar um novo File a partir do blob para garantir que tenha nome e tipo corretos
          const file = new File([blob], fileName, { type: mimeType });
          formData.append('file', file);
          
          console.log('✅ File anexado ao FormData:', file.name, file.type, file.size);
        } else {
          // URL normal de blob
          console.log('🔗 URL blob detectada');
          const response = await fetch(imageUri);
          const blob = await response.blob();
          
          const extension = imageUri.split('.').pop()?.split('?')[0] || 'jpg';
          const fileName = `photo-${Date.now()}.${extension}`;
          const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
          
          formData.append('file', file);
          console.log('✅ File anexado ao FormData:', file.name, file.type, file.size);
        }
      } else {
        // Para React Native (iOS/Android)
        console.log('📱 Plataforma Mobile detectada');
        const uriParts = imageUri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        const file: any = {
          uri: imageUri,
          name: `photo-${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        };
        formData.append('file', file);
        console.log('✅ File anexado ao FormData (mobile)');
      }

      console.log('🚀 Enviando FormData para o servidor...');
      
      // Fazer upload
      const updatedUser = await UsersService.uploadPhoto(user.id, formData);
      
      console.log('✅ Upload bem-sucedido!', updatedUser);
      
      // Atualizar a URL da foto localmente para exibir imediatamente
      if (updatedUser.data?.photo) {
        setPhotoUrl(updatedUser.data.photo);
        console.log('📸 Foto atualizada localmente:', updatedUser.data.photo);
      }
      
      Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao fazer upload da foto:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a foto de perfil.');
    }
  };

  return (
    <Animated.View 
      style={[styles.container, { width: animatedWidth }]}
    >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header com toggle */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={onToggle}
            activeOpacity={0.7}
          >
            {renderIcon(
              { id: 'menu', icon: 'menu', iconFamily: 'MaterialIcons' },
              theme.colors.neutral.darkGray,
              24
            )}
          </TouchableOpacity>
          
          {isExpanded && (
            <Animated.View style={styles.headerText}>
              <Typography variant="h6" color={theme.colors.neutral.darkGray}>
                Solidários
              </Typography>
            </Animated.View>
          )}
        </View>

        <Divider />

        {/* Seção do usuário */}
        {isExpanded && user && (
          <Card style={styles.userCard}>
            <View style={styles.userInfo}>
              <TouchableOpacity onPress={handleSelectPhoto} activeOpacity={0.7}>
                <Avatar
                  size={60}
                  source={(photoUrl || user.photo) ? { uri: `${getApiBaseUrl()}${photoUrl || user.photo}` } : undefined}
                  name={user.name}
                />
              </TouchableOpacity>
              <View style={styles.userDetails}>
                <Typography variant="body" color={theme.colors.neutral.darkGray}>
                  Bem-vindo,
                </Typography>
                <Typography variant="h6" color={theme.colors.primary.main}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color={theme.colors.neutral.mediumGray}>
                  {user.role}
                </Typography>
              </View>
            </View>
          </Card>
        )}

        {/* Menu items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => {
            const isActive = currentRoute === item.route;
            
            return (
              <View key={item.id}>
                <TouchableOpacity
                  style={[
                    styles.menuItem,
                    isActive && styles.activeMenuItem,
                  ]}
                  onPress={() => handleMenuItemPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemContent}>
                    {renderIcon(
                      item,
                      isActive ? theme.colors.primary.main : theme.colors.neutral.darkGray,
                      24
                    )}
                    
                    {isExpanded && (
                      <Animated.View style={styles.menuItemText}>
                        <Typography
                          variant="body"
                          color={isActive ? theme.colors.primary.main : theme.colors.neutral.darkGray}
                        >
                          {item.label}
                        </Typography>
                        
                        {/* Estatísticas para itens específicos */}
                        {item.stats && (
                          <View style={styles.statsContainer}>
                            <Typography variant="caption" color={theme.colors.neutral.mediumGray}>
                              {item.stats.count} {item.id === 'inventory' ? 'itens' : 
                               item.id === 'distributions' ? 'distribuições' : 'usuários'} encontrados
                            </Typography>
                            <Typography variant="caption" color={theme.colors.neutral.mediumGray}>
                              {item.stats.total} Total
                            </Typography>
                          </View>
                        )}
                      </Animated.View>
                    )}
                  </View>
                </TouchableOpacity>
                
                {/* Divider entre itens */}
                {isExpanded && item.id !== 'settings' && <Divider style={styles.itemDivider} />}
              </View>
            );
          })}
        </View>

        {/* Botão de logout */}
        {isExpanded && (
          <View style={styles.logoutContainer}>
            <Divider />
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemContent}>
                {renderIcon(
                  { id: 'logout', icon: 'logout', iconFamily: 'MaterialIcons' },
                  theme.colors.status.error,
                  24
                )}
                <Animated.View style={styles.menuItemText}>
                  <Typography variant="body" color={theme.colors.status.error}>
                    Sair
                  </Typography>
                </Animated.View>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.neutral.white,
    borderRightWidth: 1,
    borderRightColor: theme.colors.neutral.lightGray,
    height: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
    minHeight: 60,
  },
  toggleButton: {
    padding: theme.spacing.s,
    borderRadius: theme.borderRadius.small,
  },
  headerText: {
    marginLeft: theme.spacing.m,
    flex: 1,
  },
  userCard: {
    margin: theme.spacing.m,
    padding: theme.spacing.m,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: theme.spacing.m,
    flex: 1,
  },
  menuContainer: {
    paddingVertical: theme.spacing.s,
  },
  menuItem: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.m,
    minHeight: 56,
  },
  activeMenuItem: {
    backgroundColor: theme.colors.neutral.mediumGray,
    borderRightWidth: 3,
    borderRightColor: theme.colors.primary.main,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: theme.spacing.m,
    flex: 1,
  },
  statsContainer: {
    marginTop: theme.spacing.xs,
  },
  itemDivider: {
    marginHorizontal: theme.spacing.m,
  },
  logoutContainer: {
    marginTop: 'auto',
    paddingTop: theme.spacing.m,
  },
  logoutButton: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.m,
    minHeight: 56,
  },
});

export default ExpandableSidebar;
