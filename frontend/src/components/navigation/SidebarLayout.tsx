import React, { useState } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import ExpandableSidebar from './ExpandableSidebar';
import { useTheme } from '../../hooks/useTheme';

interface SidebarLayoutProps {
  children: React.ReactNode;
  currentRoute?: string;
  onNavigate?: (route: string) => void;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  children,
  currentRoute,
  onNavigate,
}) => {
  const theme = useTheme();
  // Sidebar inicia minimizada (recolhida)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <View style={styles.container}>
      {/* Sidebar fixa */}
      <ExpandableSidebar
        isExpanded={isSidebarExpanded}
        onToggle={toggleSidebar}
        currentRoute={currentRoute}
        onNavigate={onNavigate}
      />

      {/* Conteúdo principal - sem overlay */}
      <View style={[styles.mainContent, { backgroundColor: theme.colors.neutral.lightGray }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
  },
});

export default SidebarLayout;
