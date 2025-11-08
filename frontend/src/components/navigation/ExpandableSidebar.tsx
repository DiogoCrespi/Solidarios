import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../store';
import { updateUserPhoto } from '../../store/slices/authSlice';
import * as ImagePicker from 'expo-image-picker';
import UsersService from '../../api/users';
import { getApiBaseUrl } from '../../api/api';

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
  const dispatch = useAppDispatch();
  const [animatedWidth] = useState(new Animated.Value(SIDEBAR_WIDTH));
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null) as React.MutableRefObject<HTMLVideoElement | null>;
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null) as React.MutableRefObject<HTMLCanvasElement | null>;

  React.useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: isExpanded ? EXPANDED_WIDTH : SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isExpanded, animatedWidth]);

  // Limpar a câmera quando o modal fechar ou componente desmontar
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  React.useEffect(() => {
    if (!showCameraModal) {
      stopCamera();
    }
  }, [showCameraModal]);

  const getMenuItems = (): MenuItem[] => {
    const baseItems: MenuItem[] = [
      {
        id: 'dashboard',
        icon: 'dashboard',
        iconFamily: 'MaterialIcons',
        label: 'Dashboard',
        route: 'Dashboard',
      },
      {
        id: 'analytics',
        icon: 'chart-bar',
        iconFamily: 'MaterialCommunityIcons',
        label: 'Analytics',
        route: 'Analytics',
      },
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
      },
    ];

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
    switch (item.iconFamily) {
      case 'MaterialIcons':
        return <MaterialIcons name={item.icon as any} size={size} color={color} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={item.icon as any} size={size} color={color} />;
      case 'Ionicons':
        return <Ionicons name={item.icon as any} size={size} color={color} />;
      default:
        return <MaterialIcons name={item.icon as any} size={size} color={color} />;
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

  const handleAvatarPress = async () => {
    console.log('[ExpandableSidebar] handleAvatarPress chamado');
    console.log('[ExpandableSidebar] user:', user);
    
    if (!user) {
      console.log('[ExpandableSidebar] Usuário não encontrado, retornando');
      return;
    }

    console.log('[ExpandableSidebar] Mostrando Modal para escolher foto');
    setShowPhotoModal(true);
  };

  const startCamera = async () => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 1280 }
        } 
      });
      setCameraStream(stream);
      // Aguardar um pouco para garantir que o elemento foi renderizado
      setTimeout(() => {
        const videoElement = videoRef.current as any;
        if (videoElement) {
          videoElement.srcObject = stream;
          videoElement.play().catch((err: any) => {
            console.error('Erro ao reproduzir vídeo:', err);
          });
        }
      }, 200);
    } catch (error: any) {
      console.error('[ExpandableSidebar] Erro ao acessar câmera:', error);
      Alert.alert(
        'Erro de Câmera',
        'Não foi possível acessar a câmera. Verifique se o navegador tem permissão para usar a câmera.'
      );
      setShowCameraModal(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = async () => {
    if (Platform.OS !== 'web') return;
    
    const videoElement = videoRef.current as any;
    const canvasElement = canvasRef.current as any;
    
    if (!videoElement || !canvasElement) return;

    const video = videoElement;
    const canvas = canvasElement;
    const context = canvas.getContext('2d');

    if (!context || !video.videoWidth || !video.videoHeight) return;

    // Configurar canvas para captura quadrada (1:1)
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;

    // Calcular offset para centralizar
    const offsetX = (video.videoWidth - size) / 2;
    const offsetY = (video.videoHeight - size) / 2;

    // Desenhar o frame do vídeo no canvas
    context.drawImage(
      video,
      offsetX, offsetY, size, size,
      0, 0, size, size
    );

    // Converter canvas para blob
    canvas.toBlob(async (blob: Blob | null) => {
      if (!blob) return;

      // Parar a câmera
      stopCamera();
      setShowCameraModal(false);

      // Converter blob para base64
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const base64 = e.target.result;
        const asset: ImagePicker.ImagePickerAsset = {
          uri: base64,
          width: size,
          height: size,
          fileName: 'photo.jpg',
          type: 'image',
          mimeType: 'image/jpeg',
          fileSize: blob.size,
          assetId: null,
          base64: base64.split(',')[1],
          duration: null,
          exif: null,
        };
        await uploadPhoto(asset);
      };
      reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.8);
  };

  const handleTakePhoto = async () => {
    console.log('[ExpandableSidebar] Opção "Tirar Foto" selecionada');
    setShowPhotoModal(false);
    
    if (Platform.OS === 'web') {
      // Na web, abrir modal customizado com câmera
      setShowCameraModal(true);
      // Iniciar câmera após um pequeno delay para garantir que o modal está montado
      setTimeout(() => {
        startCamera();
      }, 100);
    } else {
      // Mobile: usar expo-image-picker
      try {
        console.log('[ExpandableSidebar] Solicitando permissão de câmera');
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        console.log('[ExpandableSidebar] Status da permissão de câmera:', status);
        
        if (status !== 'granted') {
          Alert.alert(
            'Permissão necessária',
            'Precisamos de permissão para acessar sua câmera.'
          );
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        console.log('[ExpandableSidebar] Resultado da câmera:', result);
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          console.log('[ExpandableSidebar] Asset selecionado:', asset);
          await uploadPhoto(asset);
        } else {
          console.log('[ExpandableSidebar] Foto cancelada ou sem assets');
        }
      } catch (error: any) {
        console.error('[ExpandableSidebar] Erro ao tirar foto:', error);
        Alert.alert('Erro', 'Ocorreu um erro ao tirar a foto.');
      }
    }
  };

  const handleChooseFromGallery = async () => {
    console.log('[ExpandableSidebar] Opção "Escolher da Galeria" selecionada');
    setShowPhotoModal(false);
    try {
      console.log('[ExpandableSidebar] Solicitando permissão de galeria');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('[ExpandableSidebar] Status da permissão de galeria:', status);
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar sua galeria.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('[ExpandableSidebar] Resultado da galeria:', result);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log('[ExpandableSidebar] Asset selecionado:', asset);
        await uploadPhoto(asset);
      } else {
        console.log('[ExpandableSidebar] Seleção cancelada ou sem assets');
      }
    } catch (error) {
      console.error('[ExpandableSidebar] Erro ao escolher foto:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao escolher a foto.');
    }
  };

  const uploadPhoto = async (asset: ImagePicker.ImagePickerAsset) => {
    console.log('[ExpandableSidebar] uploadPhoto chamado');
    console.log('[ExpandableSidebar] asset:', asset);
    console.log('[ExpandableSidebar] user:', user);
    
    if (!user) {
      console.log('[ExpandableSidebar] Usuário não encontrado no uploadPhoto');
      return;
    }

    try {
      const formData = new FormData();

      // Para Web - converter data URL ou blob para File
      if (Platform.OS === 'web') {
        console.log('[ExpandableSidebar] Processando upload para Web');
        
        // Se é uma data URL (base64)
        if (asset.uri.startsWith('data:')) {
          console.log('[ExpandableSidebar] Convertendo data URL para File');
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          
          const mimeType = asset.mimeType || blob.type || 'image/jpeg';
          const extension = mimeType.split('/')[1] || 'jpg';
          const fileName = asset.fileName || `photo-${Date.now()}.${extension}`;
          
          const file = new File([blob], fileName, { type: mimeType });
          formData.append('photo', file);
          
          console.log('[ExpandableSidebar] File criado:', { name: fileName, type: mimeType, size: blob.size });
        } else {
          // URL blob ou file://
          console.log('[ExpandableSidebar] Convertendo blob URL para File');
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          
          const mimeType = asset.mimeType || blob.type || 'image/jpeg';
          const extension = mimeType.split('/')[1] || 'jpg';
          const fileName = asset.fileName || `photo-${Date.now()}.${extension}`;
          
          const file = new File([blob], fileName, { type: mimeType });
          formData.append('photo', file);
          
          console.log('[ExpandableSidebar] File criado:', { name: fileName, type: mimeType, size: blob.size });
        }
      } else {
        // Para Mobile (React Native) - usar objeto com uri, type e name
        console.log('[ExpandableSidebar] Processando upload para Mobile');
        const uriParts = asset.uri.split('.');
        const fileType = uriParts[uriParts.length - 1] || 'jpg';
        const mimeType = asset.mimeType || `image/${fileType}`;
        const fileName = asset.fileName || asset.uri.split('/').pop() || `photo-${Date.now()}.${fileType}`;
        
        // Para React Native, FormData aceita objetos com uri, type e name
        const file: any = {
          uri: asset.uri,
          type: mimeType,
          name: fileName,
        };
        formData.append('photo', file);
        
        console.log('[ExpandableSidebar] File preparado para mobile:', { name: fileName, type: mimeType });
      }

      console.log('[ExpandableSidebar] Enviando FormData para o servidor...');
      const result = await UsersService.uploadPhoto(user.id, formData);
      console.log('[ExpandableSidebar] Upload concluído, resultado completo:', JSON.stringify(result, null, 2));
      
      // O backend retorna a resposta dentro de { data: User, statusCode, message, timestamp }
      // O UsersService retorna response.data do axios, que já é o objeto transformado
      // Então result = { data: User, statusCode, message, timestamp }
      // E result.data = User (com photo)
      const updatedUser = result?.data;
      const photoUrl = updatedUser?.photo;
      
      console.log('[ExpandableSidebar] updatedUser:', updatedUser);
      console.log('[ExpandableSidebar] photoUrl extraída:', photoUrl);
      
      if (photoUrl) {
        console.log('[ExpandableSidebar] Foto URL recebida:', photoUrl);
        
        // Atualizar diretamente no Redux sem fazer nova requisição
        // Isso evita re-renderizações que podem causar problemas de navegação
        // O componente irá re-renderizar automaticamente quando o user.photo for atualizado
        dispatch(updateUserPhoto(photoUrl));
        console.log('[ExpandableSidebar] Foto atualizada no estado do Redux');
      } else {
        console.warn('[ExpandableSidebar] Foto URL não encontrada na resposta');
        console.warn('[ExpandableSidebar] Estrutura do result:', Object.keys(result || {}));
        if (result?.data) {
          console.warn('[ExpandableSidebar] Estrutura do result.data:', Object.keys(result.data));
        }
      }
      
      Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
    } catch (error: any) {
      console.error('[ExpandableSidebar] Erro no uploadPhoto:', error);
      console.error('[ExpandableSidebar] Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      Alert.alert('Erro', error.message || 'Erro ao fazer upload da foto.');
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
              { id: 'menu', icon: 'menu', iconFamily: 'MaterialIcons', label: 'Menu' },
              theme.colors.neutral.darkGray,
              24
            )}
          </TouchableOpacity>
          
          {isExpanded && (
            <Animated.View style={styles.headerText}>
              <Typography variant="h3" color={theme.colors.neutral.darkGray}>
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
              <TouchableOpacity 
                onPress={() => {
                  console.log('[ExpandableSidebar] TouchableOpacity do Avatar pressionado');
                  handleAvatarPress();
                }} 
                activeOpacity={0.7}
                style={{ zIndex: 10 }}
              >
                <Avatar
                  size={60}
                  source={user.photo ? { uri: user.photo.startsWith('http') ? user.photo : `${getApiBaseUrl()}${user.photo}` } : undefined}
                  name={user.name}
                />
              </TouchableOpacity>
              <View style={styles.userDetails}>
                <Typography variant="body" color={theme.colors.neutral.darkGray}>
                  Bem-vindo,
                </Typography>
                <Typography variant="h4" color={theme.colors.primary.main}>
                  {user.name}
                </Typography>
                <Typography variant="small" color={theme.colors.neutral.mediumGray}>
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
                            <Typography variant="small" color={theme.colors.neutral.mediumGray}>
                              {item.stats.count} {item.id === 'inventory' ? 'itens' : 
                               item.id === 'distributions' ? 'distribuições' : 'usuários'} encontrados
                            </Typography>
                            <Typography variant="small" color={theme.colors.neutral.mediumGray}>
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
                  { id: 'logout', icon: 'logout', iconFamily: 'MaterialIcons', label: 'Sair' },
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

      {/* Modal para escolher foto */}
      <Modal
        visible={showPhotoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPhotoModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Typography variant="h4" style={styles.modalTitle}>
                  Foto de Perfil
                </Typography>
                <Typography variant="body" style={styles.modalSubtitle}>
                  Escolha uma opção
                </Typography>

                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={handleTakePhoto}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="camera-alt" size={24} color={theme.colors.primary.main} />
                  <Typography variant="body" style={styles.modalOptionText}>
                    Tirar Foto
                  </Typography>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={handleChooseFromGallery}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="photo-library" size={24} color={theme.colors.primary.main} />
                  <Typography variant="body" style={styles.modalOptionText}>
                    Escolher da Galeria
                  </Typography>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowPhotoModal(false)}
                  activeOpacity={0.7}
                >
                  <Typography variant="body" color={theme.colors.neutral.mediumGray}>
                    Cancelar
                  </Typography>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal da câmera para web */}
      {Platform.OS === 'web' && (
        <Modal
          visible={showCameraModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            stopCamera();
            setShowCameraModal(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.cameraModalContent}>
              <Typography variant="h4" style={styles.modalTitle}>
                Tirar Foto
              </Typography>
              
              <View style={styles.cameraContainer}>
                {Platform.OS === 'web' && typeof document !== 'undefined' && (
                  <>
                    {React.createElement('video', {
                      ref: (node: HTMLVideoElement | null) => {
                        videoRef.current = node;
                      },
                      autoPlay: true,
                      playsInline: true,
                      style: {
                        width: '100%',
                        maxWidth: '500px',
                        height: 'auto',
                        borderRadius: 8,
                        backgroundColor: '#000',
                      },
                    })}
                    {React.createElement('canvas', {
                      ref: (node: HTMLCanvasElement | null) => {
                        canvasRef.current = node;
                      },
                      style: { display: 'none' },
                    })}
                  </>
                )}
              </View>

              <View style={styles.cameraButtons}>
                <TouchableOpacity
                  style={[styles.cameraButton, styles.captureButton]}
                  onPress={capturePhoto}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="camera-alt" size={32} color={theme.colors.neutral.white} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.cameraButton, styles.cancelCameraButton]}
                  onPress={() => {
                    stopCamera();
                    setShowCameraModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Typography variant="body" color={theme.colors.neutral.white}>
                    Cancelar
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
    backgroundColor: theme.colors.neutral.lightGray,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.neutral.white,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.l,
    width: '80%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  modalSubtitle: {
    marginBottom: theme.spacing.l,
    textAlign: 'center',
    color: theme.colors.neutral.mediumGray,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.small,
    backgroundColor: theme.colors.neutral.lightGray,
    marginBottom: theme.spacing.s,
  },
  modalOptionText: {
    marginLeft: theme.spacing.m,
    flex: 1,
  },
  modalCancelButton: {
    marginTop: theme.spacing.m,
    padding: theme.spacing.m,
    alignItems: 'center',
  },
  cameraModalContent: {
    backgroundColor: theme.colors.neutral.white,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.l,
    width: '90%',
    maxWidth: 600,
    alignItems: 'center',
  },
  cameraContainer: {
    width: '100%',
    marginVertical: theme.spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.m,
    width: '100%',
  },
  cameraButton: {
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    backgroundColor: theme.colors.primary.main,
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  cancelCameraButton: {
    backgroundColor: theme.colors.status.error,
    paddingHorizontal: theme.spacing.l,
  },
});

export default ExpandableSidebar;
