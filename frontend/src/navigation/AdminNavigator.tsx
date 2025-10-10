// src/navigation/AdminNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useRoute, useNavigation } from "@react-navigation/native";

// Componentes
import { SidebarLayout } from "../components/barrelComponents";

// Tipos de navegação
import {
  AdminItemsStackParamList,
  AdminInventoryStackParamList,
  AdminDistributionsStackParamList,
  AdminUsersStackParamList,
} from "./types";

// Telas
import DashboardScreen from "../screens/admin/DashboardScreen";
import ItemsScreen from "../screens/admin/ItemsScreen";
import ItemDetailScreen from "../screens/admin/ItemDetailScreen";
import CategoriesScreen from "../screens/admin/CategoriesScreen";
import InventoryScreen from "../screens/admin/InventoryScreen";
import InventoryDetailScreen from "../screens/admin/InventoryDetailScreen";
import DistributionsScreen from "../screens/admin/DistributionsScreen";
import DistributionDetailScreen from "../screens/admin/DistributionDetailScreen";
import UsersScreen from "../screens/admin/UsersScreen";
import UserDetailScreen from "../screens/admin/UserDetailScreen";
import CreateUserScreen from "../screens/admin/CreateUserScreen";
import CreateItemScreen from "../screens/admin/CreateItemScreen";
import CreateDistributionScreen from "../screens/admin/CreateDistributionScreen";
import SettingsScreen from "../screens/admin/SettingsScreen";

// Stack Navigators para cada tab
const DashboardStack = createNativeStackNavigator();
const ItemsStack = createNativeStackNavigator<AdminItemsStackParamList>();
const InventoryStack =
  createNativeStackNavigator<AdminInventoryStackParamList>();
const DistributionsStack =
  createNativeStackNavigator<AdminDistributionsStackParamList>();
const UsersStack = createNativeStackNavigator<AdminUsersStackParamList>();

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

// Stack Navigator para Usuários
const UsersNavigator = () => {
  return (
    <UsersStack.Navigator screenOptions={{ headerShown: false }}>
      <UsersStack.Screen name="UsersList" component={UsersScreen} />
      <UsersStack.Screen name="UserDetail" component={UserDetailScreen} />
      <UsersStack.Screen name="CreateUser" component={CreateUserScreen} />
    </UsersStack.Navigator>
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

const UsersWithSidebar = () => (
  <ScreenWithSidebar routeName="Users">
    <UsersNavigator />
  </ScreenWithSidebar>
);

const SettingsWithSidebar = () => (
  <ScreenWithSidebar routeName="Settings">
    <SettingsScreen />
  </ScreenWithSidebar>
);

const AdminNavigator: React.FC = () => {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Dashboard" component={DashboardWithSidebar} />
      <MainStack.Screen name="Items" component={ItemsWithSidebar} />
      <MainStack.Screen name="Categories" component={CategoriesWithSidebar} />
      <MainStack.Screen name="Inventory" component={InventoryWithSidebar} />
      <MainStack.Screen name="Distributions" component={DistributionsWithSidebar} />
      <MainStack.Screen name="Users" component={UsersWithSidebar} />
      <MainStack.Screen name="Settings" component={SettingsWithSidebar} />
    </MainStack.Navigator>
  );
};

export default AdminNavigator;
