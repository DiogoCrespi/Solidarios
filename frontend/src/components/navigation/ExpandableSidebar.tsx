import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';

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

  React.useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: isExpanded ? EXPANDED_WIDTH : SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isExpanded, animatedWidth]);

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
              <Avatar
                size={60}
                source={user.photo ? { uri: user.photo } : undefined}
                name={user.name}
              />
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
    backgroundColor: theme.colors.primary.light,
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
