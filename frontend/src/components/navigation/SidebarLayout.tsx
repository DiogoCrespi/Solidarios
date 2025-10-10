import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import ExpandableSidebar from './ExpandableSidebar';
import theme from '../../theme';

const { width: screenWidth } = Dimensions.get('window');

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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [overlayOpacity] = useState(new Animated.Value(0));

  const toggleSidebar = () => {
    const newExpandedState = !isSidebarExpanded;
    setIsSidebarExpanded(newExpandedState);

    // Animar overlay
    Animated.timing(overlayOpacity, {
      toValue: newExpandedState ? 0.5 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = () => {
    setIsSidebarExpanded(false);
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <ExpandableSidebar
        isExpanded={isSidebarExpanded}
        onToggle={toggleSidebar}
        currentRoute={currentRoute}
        onNavigate={onNavigate}
      />

      {/* Conteúdo principal */}
      <View style={styles.mainContent}>
        {children}
      </View>

      {/* Overlay para fechar sidebar quando clicado fora */}
      {isSidebarExpanded && (
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={closeSidebar}
          />
        </Animated.View>
      )}
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
    backgroundColor: theme.colors.neutral.lightGray,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  overlayTouchable: {
    flex: 1,
  },
});

export default SidebarLayout;
