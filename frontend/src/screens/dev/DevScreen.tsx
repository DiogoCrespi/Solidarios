import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";

// Componentes
import { Typography } from "../../components/barrelComponents";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Rotas
import {
  AUTH_ROUTES,
  ADMIN_ROUTES,
  FUNCIONARIO_ROUTES,
  DOADOR_ROUTES,
  BENEFICIARIO_ROUTES,
  ROLE_ROUTES,
} from "../../navigation/routes";

interface ScreenRoute {
  id: string;
  name: string;
  route: string;
  category: string;
  params?: any;
  navigator?: string;
  requiresNavigatorSwitch?: boolean;
}

const DevScreen: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const styles = DevScreenStyles(theme);
  
  // Cores por categoria
  const categoryColors: Record<string, string> = {
    Auth: theme.colors.status.error,
    Admin: theme.colors.primary.main,
    Funcionario: theme.colors.primary.accent,
    Doador: theme.colors.status.success,
    Beneficiario: theme.colors.status.warning,
  };

  // Lista de TODAS as telas da aplicação
  const allScreens: ScreenRoute[] = [
    // Auth Screens
    { id: "welcome", name: "Welcome", route: AUTH_ROUTES.WELCOME, category: "Auth", navigator: "Auth", requiresNavigatorSwitch: true },
    { id: "login", name: "Login", route: AUTH_ROUTES.LOGIN, category: "Auth", navigator: "Auth", requiresNavigatorSwitch: true },
    { id: "register", name: "Register", route: AUTH_ROUTES.REGISTER, category: "Auth", navigator: "Auth", requiresNavigatorSwitch: true },
    { id: "forgot-password", name: "Forgot Password", route: AUTH_ROUTES.FORGOT_PASSWORD, category: "Auth", navigator: "Auth", requiresNavigatorSwitch: true },

    // Admin Screens - Principais
    { id: "admin-dashboard", name: "Dashboard", route: "Dashboard", category: "Admin", navigator: "Admin" },
    { id: "admin-analytics", name: "Analytics", route: "Analytics", category: "Admin", navigator: "Admin" },
    { id: "admin-items", name: "Items", route: "Items", category: "Admin", navigator: "Admin" },
    { id: "admin-items-list", name: "Items List", route: ADMIN_ROUTES.ITEMS_LIST, category: "Admin", navigator: "Admin", params: { screen: "Items", params: { screen: "ItemsList" } } },
    { id: "admin-item-detail", name: "Item Detail", route: ADMIN_ROUTES.ITEM_DETAIL, category: "Admin", navigator: "Admin", params: { screen: "Items", params: { screen: "ItemDetail", params: { id: 1 } } } },
    { id: "admin-create-item", name: "Create Item", route: ADMIN_ROUTES.CREATE_ITEM, category: "Admin", navigator: "Admin", params: { screen: "Items", params: { screen: "CreateItem" } } },
    { id: "admin-categories", name: "Categories", route: "Categories", category: "Admin", navigator: "Admin" },
    { id: "admin-inventory", name: "Inventory", route: "Inventory", category: "Admin", navigator: "Admin" },
    { id: "admin-inventory-list", name: "Inventory List", route: ADMIN_ROUTES.INVENTORY_LIST, category: "Admin", navigator: "Admin", params: { screen: "Inventory", params: { screen: "InventoryList" } } },
    { id: "admin-inventory-detail", name: "Inventory Detail", route: ADMIN_ROUTES.INVENTORY_DETAIL, category: "Admin", navigator: "Admin", params: { screen: "Inventory", params: { screen: "InventoryDetail", params: { id: 1 } } } },
    { id: "admin-distributions", name: "Distributions", route: "Distributions", category: "Admin", navigator: "Admin" },
    { id: "admin-distributions-list", name: "Distributions List", route: ADMIN_ROUTES.DISTRIBUTIONS_LIST, category: "Admin", navigator: "Admin", params: { screen: "Distributions", params: { screen: "DistributionsList" } } },
    { id: "admin-distribution-detail", name: "Distribution Detail", route: ADMIN_ROUTES.DISTRIBUTION_DETAIL, category: "Admin", navigator: "Admin", params: { screen: "Distributions", params: { screen: "DistributionDetail", params: { id: 1 } } } },
    { id: "admin-create-distribution", name: "Create Distribution", route: ADMIN_ROUTES.CREATE_DISTRIBUTION, category: "Admin", navigator: "Admin", params: { screen: "Distributions", params: { screen: "CreateDistribution" } } },
    { id: "admin-users", name: "Users", route: "Users", category: "Admin", navigator: "Admin" },
    { id: "admin-users-list", name: "Users List", route: ADMIN_ROUTES.USERS_LIST, category: "Admin", navigator: "Admin", params: { screen: "Users", params: { screen: "UsersList" } } },
    { id: "admin-user-detail", name: "User Detail", route: ADMIN_ROUTES.USER_DETAIL, category: "Admin", navigator: "Admin", params: { screen: "Users", params: { screen: "UserDetail", params: { id: 1 } } } },
    { id: "admin-create-user", name: "Create User", route: ADMIN_ROUTES.CREATE_USER, category: "Admin", navigator: "Admin", params: { screen: "Users", params: { screen: "CreateUser" } } },
    { id: "admin-settings", name: "Settings", route: "Settings", category: "Admin", navigator: "Admin" },
    { id: "admin-dev", name: "Dev Screen", route: "Dev", category: "Admin", navigator: "Admin" },

    // Funcionario Screens - Principais
    { id: "funcionario-dashboard", name: "Dashboard", route: "Dashboard", category: "Funcionario", navigator: "Funcionario" },
    { id: "funcionario-items", name: "Items", route: "Items", category: "Funcionario", navigator: "Funcionario" },
    { id: "funcionario-items-list", name: "Items List", route: FUNCIONARIO_ROUTES.ITEMS_LIST, category: "Funcionario", navigator: "Funcionario", params: { screen: "Items", params: { screen: "ItemsList" } } },
    { id: "funcionario-item-detail", name: "Item Detail", route: FUNCIONARIO_ROUTES.ITEM_DETAIL, category: "Funcionario", navigator: "Funcionario", params: { screen: "Items", params: { screen: "ItemDetail", params: { id: 1 } } } },
    { id: "funcionario-create-item", name: "Create Item", route: FUNCIONARIO_ROUTES.CREATE_ITEM, category: "Funcionario", navigator: "Funcionario", params: { screen: "Items", params: { screen: "CreateItem" } } },
    { id: "funcionario-categories", name: "Categories", route: "Categories", category: "Funcionario", navigator: "Funcionario" },
    { id: "funcionario-inventory", name: "Inventory", route: "Inventory", category: "Funcionario", navigator: "Funcionario" },
    { id: "funcionario-inventory-list", name: "Inventory List", route: FUNCIONARIO_ROUTES.INVENTORY_LIST, category: "Funcionario", navigator: "Funcionario", params: { screen: "Inventory", params: { screen: "InventoryList" } } },
    { id: "funcionario-inventory-detail", name: "Inventory Detail", route: FUNCIONARIO_ROUTES.INVENTORY_DETAIL, category: "Funcionario", navigator: "Funcionario", params: { screen: "Inventory", params: { screen: "InventoryDetail", params: { id: 1 } } } },
    { id: "funcionario-distributions", name: "Distributions", route: "Distributions", category: "Funcionario", navigator: "Funcionario" },
    { id: "funcionario-distributions-list", name: "Distributions List", route: FUNCIONARIO_ROUTES.DISTRIBUTIONS_LIST, category: "Funcionario", navigator: "Funcionario", params: { screen: "Distributions", params: { screen: "DistributionsList" } } },
    { id: "funcionario-distribution-detail", name: "Distribution Detail", route: FUNCIONARIO_ROUTES.DISTRIBUTION_DETAIL, category: "Funcionario", navigator: "Funcionario", params: { screen: "Distributions", params: { screen: "DistributionDetail", params: { id: 1 } } } },
    { id: "funcionario-create-distribution", name: "Create Distribution", route: FUNCIONARIO_ROUTES.CREATE_DISTRIBUTION, category: "Funcionario", navigator: "Funcionario", params: { screen: "Distributions", params: { screen: "CreateDistribution" } } },
    { id: "funcionario-beneficiaries", name: "Beneficiaries", route: "Beneficiaries", category: "Funcionario", navigator: "Funcionario" },
    { id: "funcionario-beneficiaries-list", name: "Beneficiaries List", route: FUNCIONARIO_ROUTES.BENEFICIARIES_LIST, category: "Funcionario", navigator: "Funcionario", params: { screen: "Beneficiaries", params: { screen: "BeneficiariesList" } } },
    { id: "funcionario-beneficiary-detail", name: "Beneficiary Detail", route: FUNCIONARIO_ROUTES.BENEFICIARY_DETAIL, category: "Funcionario", navigator: "Funcionario", params: { screen: "Beneficiaries", params: { screen: "BeneficiaryDetail", params: { id: 1 } } } },
    { id: "funcionario-settings", name: "Settings", route: "Settings", category: "Funcionario", navigator: "Funcionario" },
    { id: "funcionario-dev", name: "Dev Screen", route: "Dev", category: "Funcionario", navigator: "Funcionario" },

    // Doador Screens
    { id: "doador-my-donations", name: "My Donations", route: DOADOR_ROUTES.MY_DONATIONS, category: "Doador", navigator: "Doador", params: { screen: "MyDonations", params: { screen: "MyDonationsList" } } },
    { id: "doador-my-donations-list", name: "My Donations List", route: DOADOR_ROUTES.MY_DONATIONS_LIST, category: "Doador", navigator: "Doador", params: { screen: "MyDonations", params: { screen: "MyDonationsList" } } },
    { id: "doador-donation-detail", name: "Donation Detail", route: DOADOR_ROUTES.DONATION_DETAIL, category: "Doador", navigator: "Doador", params: { screen: "MyDonations", params: { screen: "DonationDetail", params: { id: 1 } } } },
    { id: "doador-donation-history", name: "Donation History", route: DOADOR_ROUTES.DONATION_HISTORY, category: "Doador", navigator: "Doador", params: { screen: "MyDonations", params: { screen: "DonationHistory" } } },
    { id: "doador-impact", name: "Impact", route: DOADOR_ROUTES.IMPACT, category: "Doador", navigator: "Doador", params: { screen: "MyDonations", params: { screen: "Impact" } } },
    { id: "doador-new-donation", name: "New Donation", route: DOADOR_ROUTES.NEW_DONATION, category: "Doador", navigator: "Doador", params: { screen: "NewDonation", params: { screen: "CreateDonation" } } },
    { id: "doador-create-donation", name: "Create Donation", route: DOADOR_ROUTES.CREATE_DONATION, category: "Doador", navigator: "Doador", params: { screen: "NewDonation", params: { screen: "CreateDonation" } } },
    { id: "doador-profile", name: "Profile", route: DOADOR_ROUTES.PROFILE, category: "Doador", navigator: "Doador", params: { screen: "Profile", params: { screen: "ProfileMain" } } },
    { id: "doador-profile-main", name: "Profile Main", route: DOADOR_ROUTES.PROFILE_MAIN, category: "Doador", navigator: "Doador", params: { screen: "Profile", params: { screen: "ProfileMain" } } },
    { id: "doador-edit-profile", name: "Edit Profile", route: DOADOR_ROUTES.EDIT_PROFILE, category: "Doador", navigator: "Doador", params: { screen: "Profile", params: { screen: "EditProfile" } } },

    // Beneficiario Screens
    { id: "beneficiario-my-receipts", name: "My Receipts", route: BENEFICIARIO_ROUTES.MY_RECEIPTS, category: "Beneficiario", navigator: "Beneficiario", params: { screen: "MyReceipts", params: { screen: "MyReceiptsList" } } },
    { id: "beneficiario-my-receipts-list", name: "My Receipts List", route: BENEFICIARIO_ROUTES.MY_RECEIPTS_LIST, category: "Beneficiario", navigator: "Beneficiario", params: { screen: "MyReceipts", params: { screen: "MyReceiptsList" } } },
    { id: "beneficiario-receipt-detail", name: "Receipt Detail", route: BENEFICIARIO_ROUTES.RECEIPT_DETAIL, category: "Beneficiario", navigator: "Beneficiario", params: { screen: "MyReceipts", params: { screen: "ReceiptDetail", params: { id: 1 } } } },
    { id: "beneficiario-receipt-history", name: "Receipt History", route: BENEFICIARIO_ROUTES.RECEIPT_HISTORY, category: "Beneficiario", navigator: "Beneficiario", params: { screen: "MyReceipts", params: { screen: "ReceiptHistory" } } },
    { id: "beneficiario-available-items", name: "Available Items", route: BENEFICIARIO_ROUTES.AVAILABLE_ITEMS, category: "Beneficiario", navigator: "Beneficiario", params: { screen: "AvailableItems", params: { screen: "AvailableItemsList" } } },
    { id: "beneficiario-available-items-list", name: "Available Items List", route: BENEFICIARIO_ROUTES.AVAILABLE_ITEMS_LIST, category: "Beneficiario", navigator: "Beneficiario", params: { screen: "AvailableItems", params: { screen: "AvailableItemsList" } } },
    { id: "beneficiario-item-detail", name: "Item Detail", route: BENEFICIARIO_ROUTES.ITEM_DETAIL, category: "Beneficiario", navigator: "Beneficiario", params: { screen: "AvailableItems", params: { screen: "ItemDetail", params: { id: 1 } } } },
    { id: "beneficiario-profile", name: "Profile", route: BENEFICIARIO_ROUTES.PROFILE, category: "Beneficiario", navigator: "Beneficiario", params: { screen: "Profile", params: { screen: "ProfileMain" } } },
    { id: "beneficiario-profile-main", name: "Profile Main", route: BENEFICIARIO_ROUTES.PROFILE_MAIN, category: "Beneficiario", navigator: "Beneficiario", params: { screen: "Profile", params: { screen: "ProfileMain" } } },
    { id: "beneficiario-edit-profile", name: "Edit Profile", route: BENEFICIARIO_ROUTES.EDIT_PROFILE, category: "Beneficiario", navigator: "Beneficiario", params: { screen: "Profile", params: { screen: "EditProfile" } } },
    { id: "beneficiario-needs-assessment", name: "Needs Assessment", route: BENEFICIARIO_ROUTES.NEEDS_ASSESSMENT, category: "Beneficiario", navigator: "Beneficiario", params: { screen: "Profile", params: { screen: "NeedsAssessment" } } },
  ];

  // Agrupar telas por categoria
  const screensByCategory = allScreens.reduce((acc, screen) => {
    if (!acc[screen.category]) {
      acc[screen.category] = [];
    }
    acc[screen.category].push(screen);
    return acc;
  }, {} as Record<string, ScreenRoute[]>);

  // Função para navegar para uma tela - PERMITE ACESSO A TODAS AS TELAS
  const handleNavigate = (screen: ScreenRoute) => {
    try {
      const currentNavigator = user?.role === "ADMIN" ? "Admin" : 
                               user?.role === "FUNCIONARIO" ? "Funcionario" : 
                               user?.role === "DOADOR" ? "Doador" : 
                               user?.role === "BENEFICIARIO" ? "Beneficiario" : "Auth";

      // Se a tela requer mudança de navegador, tentar navegar através do RoleNavigator
      if (screen.requiresNavigatorSwitch || (screen.navigator && screen.navigator !== currentNavigator)) {
        // Tentar navegar através do RoleNavigator primeiro
        const roleRoute = screen.navigator === "Admin" ? ROLE_ROUTES.ADMIN :
                         screen.navigator === "Funcionario" ? ROLE_ROUTES.FUNCIONARIO :
                         screen.navigator === "Doador" ? ROLE_ROUTES.DOADOR :
                         screen.navigator === "Beneficiario" ? ROLE_ROUTES.BENEFICIARIO : null;

        if (roleRoute) {
          // Navegar para o navegador correto primeiro
          navigation.dispatch(
            CommonActions.navigate({
              name: "Role",
              params: {
                screen: roleRoute,
                params: screen.params || { screen: screen.route },
              },
            } as never)
          );
          return;
        }
      }

      // Navegação normal dentro do mesmo navegador
      if (screen.params) {
        const mainScreen = screen.params.screen;
        if (mainScreen) {
          navigation.navigate(mainScreen as never, screen.params.params as never);
        } else {
          navigation.navigate(screen.route as never);
        }
      } else {
        navigation.navigate(screen.route as never);
      }
    } catch (error: any) {
      console.error(`Erro ao navegar para ${screen.name}:`, error);
      // Não mostrar alerta, apenas logar o erro para não interromper o fluxo
      console.warn(`Aviso: Não foi possível navegar para ${screen.name}. Esta tela pode não estar disponível no navegador atual.`);
    }
  };

  // Estilos de sombra baseados na plataforma
  const buttonShadowStyle = Platform.OS === "web"
    ? { boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }
    : {
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h2" style={styles.title} color={theme.colors.neutral.black}>
            Dev Screen - Todas as Telas
          </Typography>
          <Typography variant="bodySecondary" style={styles.subtitle} color={theme.colors.neutral.darkGray}>
            Navegador atual: {user?.role || "Não autenticado"} | Total: {allScreens.length} telas
          </Typography>
        </View>

        {/* Grid de telas por categoria */}
        {Object.entries(screensByCategory).map(([category, screens]) => {
          const categoryColor = categoryColors[category] || theme.colors.primary.main;
          
          return (
            <View key={category} style={styles.categorySection}>
              <View style={[styles.categoryHeader, { borderLeftColor: categoryColor }]}>
                <Typography variant="h3" style={styles.categoryTitle} color={categoryColor}>
                  {category}
                </Typography>
                <Typography variant="small" style={styles.categoryCount} color={theme.colors.neutral.darkGray}>
                  {screens.length} telas
                </Typography>
              </View>
              
              <View style={styles.grid}>
                {screens.map((screen) => {
                  const currentNavigator = user?.role === "ADMIN" ? "Admin" : 
                                          user?.role === "FUNCIONARIO" ? "Funcionario" : 
                                          user?.role === "DOADOR" ? "Doador" : 
                                          user?.role === "BENEFICIARIO" ? "Beneficiario" : "Auth";
                  const isFromDifferentNavigator = screen.navigator && screen.navigator !== currentNavigator;
                  
                  return (
                    <TouchableOpacity
                      key={screen.id}
                      style={[
                        styles.screenButton,
                        buttonShadowStyle,
                      ]}
                      onPress={() => handleNavigate(screen)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.screenButtonContent,
                        { 
                          backgroundColor: theme.colors.neutral.white,
                          borderColor: isFromDifferentNavigator ? categoryColor : theme.colors.neutral.mediumGray,
                          borderWidth: isFromDifferentNavigator ? 2 : 1,
                        }
                      ]}>
                        <Typography
                          variant="body"
                          style={styles.screenButtonText}
                          color={theme.colors.neutral.black}
                          numberOfLines={2}
                        >
                          {screen.name}
                        </Typography>
                        <Typography
                          variant="small"
                          style={styles.screenButtonRoute}
                          color={theme.colors.neutral.darkGray}
                          numberOfLines={1}
                        >
                          {screen.route}
                        </Typography>
                        {isFromDifferentNavigator && (
                          <Typography
                            variant="small"
                            style={styles.screenButtonUnavailable}
                            color={categoryColor}
                          >
                            {screen.navigator}
                          </Typography>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const DevScreenStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral.lightGray,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.m,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.xl,
    paddingBottom: theme.spacing.m,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.neutral.mediumGray,
  },
  title: {
    marginBottom: theme.spacing.xs,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
  },
  categorySection: {
    marginBottom: theme.spacing.xl,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.m,
    paddingLeft: theme.spacing.s,
    borderLeftWidth: 4,
  },
  categoryTitle: {
    fontWeight: "600",
    flex: 1,
  },
  categoryCount: {
    marginLeft: theme.spacing.s,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginHorizontal: -theme.spacing.xs,
  },
  screenButton: {
    width: Platform.OS === "web" 
      ? `calc(25% - ${theme.spacing.s}px)`
      : (SCREEN_WIDTH - theme.spacing.m * 2 - theme.spacing.xs * 6) / 4,
    minWidth: 140,
    maxWidth: 200,
    height: 130,
    margin: theme.spacing.xs,
    marginBottom: theme.spacing.s,
  },
  screenButtonDisabled: {
    opacity: 0.6,
  },
  screenButtonContent: {
    flex: 1,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.s,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  screenButtonText: {
    textAlign: "center",
    marginBottom: theme.spacing.xxs,
    fontWeight: "500",
    fontSize: 13,
  },
  screenButtonRoute: {
    textAlign: "center",
    fontSize: 10,
    marginTop: theme.spacing.xxs,
  },
  screenButtonUnavailable: {
    textAlign: "center",
    fontSize: 9,
    marginTop: theme.spacing.xxs,
    fontStyle: "italic",
  },
});

export default DevScreen;

