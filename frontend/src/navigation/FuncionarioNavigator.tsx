// src/navigation/FuncionarioNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useRoute, useNavigation } from "@react-navigation/native";

// Componentes
import { SidebarLayout } from "../components/barrelComponents";
import DashboardScreen from "../screens/admin/DashboardScreen";
import ItemsScreen from "../screens/admin/ItemsScreen";
import ItemDetailScreen from "../screens/admin/ItemDetailScreen";
import CategoriesScreen from "../screens/admin/CategoriesScreen";
import InventoryScreen from "../screens/admin/InventoryScreen";
import InventoryDetailScreen from "../screens/admin/InventoryDetailScreen";
import DistributionsScreen from "../screens/admin/DistributionsScreen";
import DistributionDetailScreen from "../screens/admin/DistributionDetailScreen";
import CreateItemScreen from "../screens/admin/CreateItemScreen";
import CreateDistributionScreen from "../screens/admin/CreateDistributionScreen";
import BeneficiariesScreen from "../screens/funcionario/BeneficiariesScreen";
import BeneficiaryDetailScreen from "../screens/funcionario/BeneficiaryDetailScreen";
import SettingsScreen from "../screens/admin/SettingsScreen";
import DevScreen from "../screens/dev/DevScreen";

// Stack Navigators para cada tab
const DashboardStack = createNativeStackNavigator();
const ItemsStack = createNativeStackNavigator();
const InventoryStack = createNativeStackNavigator();
const DistributionsStack = createNativeStackNavigator();
const BeneficiariesStack = createNativeStackNavigator();

// Stack Navigator para Dashboard
const DashboardNavigator = () => {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="DashboardMain" component={DashboardScreen} />
    </DashboardStack.Navigator>
  );
};

// Stack Navigator para Itens
const ItemsNavigator = () => {
  return (
    <ItemsStack.Navigator screenOptions={{ headerShown: false }}>
      <ItemsStack.Screen name="ItemsList" component={ItemsScreen} />
      <ItemsStack.Screen name="ItemDetail" component={ItemDetailScreen} />
      <ItemsStack.Screen name="CreateItem" component={CreateItemScreen} />
    </ItemsStack.Navigator>
  );
};

// Stack Navigator para Inventário
const InventoryNavigator = () => {
  return (
    <InventoryStack.Navigator screenOptions={{ headerShown: false }}>
      <InventoryStack.Screen name="InventoryList" component={InventoryScreen} />
      <InventoryStack.Screen
        name="InventoryDetail"
        component={InventoryDetailScreen}
      />
    </InventoryStack.Navigator>
  );
};

// Stack Navigator para Distribuições
const DistributionsNavigator = () => {
  return (
    <DistributionsStack.Navigator screenOptions={{ headerShown: false }}>
      <DistributionsStack.Screen
        name="DistributionsList"
        component={DistributionsScreen}
      />
      <DistributionsStack.Screen
        name="DistributionDetail"
        component={DistributionDetailScreen}
      />
      <DistributionsStack.Screen
        name="CreateDistribution"
        component={CreateDistributionScreen}
      />
    </DistributionsStack.Navigator>
  );
};

// Stack Navigator para Beneficiários
const BeneficiariesNavigator = () => {
  return (
    <BeneficiariesStack.Navigator screenOptions={{ headerShown: false }}>
      <BeneficiariesStack.Screen
        name="BeneficiariesList"
        component={BeneficiariesScreen}
      />
      <BeneficiariesStack.Screen
        name="BeneficiaryDetail"
        component={BeneficiaryDetailScreen}
      />
    </BeneficiariesStack.Navigator>
  );
};

// Stack Navigator principal com sidebar
const MainStack = createNativeStackNavigator();

// Componente wrapper para cada tela com sidebar
const ScreenWithSidebar: React.FC<{ children: React.ReactNode; routeName: string }> = ({ children, routeName }) => {
  const navigation = useNavigation();
  
  const handleNavigate = (route: string) => {
    navigation.navigate(route as never);
  };
  
  return (
    <SidebarLayout currentRoute={routeName} onNavigate={handleNavigate}>
      {children}
    </SidebarLayout>
  );
};

// Wrappers para cada tela
const DashboardWithSidebar = () => (
  <ScreenWithSidebar routeName="Dashboard">
    <DashboardScreen />
  </ScreenWithSidebar>
);

const ItemsWithSidebar = () => (
  <ScreenWithSidebar routeName="Items">
    <ItemsNavigator />
  </ScreenWithSidebar>
);

const CategoriesWithSidebar = () => (
  <ScreenWithSidebar routeName="Categories">
    <CategoriesScreen />
  </ScreenWithSidebar>
);

const InventoryWithSidebar = () => (
  <ScreenWithSidebar routeName="Inventory">
    <InventoryNavigator />
  </ScreenWithSidebar>
);

const DistributionsWithSidebar = () => (
  <ScreenWithSidebar routeName="Distributions">
    <DistributionsNavigator />
  </ScreenWithSidebar>
);

const BeneficiariesWithSidebar = () => (
  <ScreenWithSidebar routeName="Beneficiaries">
    <BeneficiariesNavigator />
  </ScreenWithSidebar>
);

const SettingsWithSidebar = () => (
  <ScreenWithSidebar routeName="Settings">
    <SettingsScreen />
  </ScreenWithSidebar>
);

const DevWithSidebar = () => (
  <ScreenWithSidebar routeName="Dev">
    <DevScreen />
  </ScreenWithSidebar>
);

const FuncionarioNavigator: React.FC = () => {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Dashboard" component={DashboardWithSidebar} />
      <MainStack.Screen name="Items" component={ItemsWithSidebar} />
      <MainStack.Screen name="Categories" component={CategoriesWithSidebar} />
      <MainStack.Screen name="Inventory" component={InventoryWithSidebar} />
      <MainStack.Screen name="Distributions" component={DistributionsWithSidebar} />
      <MainStack.Screen name="Beneficiaries" component={BeneficiariesWithSidebar} />
      <MainStack.Screen name="Settings" component={SettingsWithSidebar} />
      <MainStack.Screen name="Dev" component={DevWithSidebar} />
    </MainStack.Navigator>
  );
};

export default FuncionarioNavigator;
