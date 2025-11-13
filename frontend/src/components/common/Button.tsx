import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  ActivityIndicator,
  TouchableOpacityProps,
  View,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export type ButtonVariant = 'primary' | 'secondary' | 'accent';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...rest
}) => {
  const theme = useTheme();

  // Estilos dinâmicos baseados no tema
  const dynamicStyles = {
    primary: {
      backgroundColor: theme.colors.primary.secondary,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.primary.main,
    },
    accent: {
      backgroundColor: theme.colors.primary.accent,
    },
    primaryText: {
      color: theme.colors.neutral.white,
    },
    secondaryText: {
      color: theme.colors.primary.main,
    },
    accentText: {
      color: theme.colors.neutral.black,
    },
  };

  const buttonStyles = [
    styles.base,
    dynamicStyles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    dynamicStyles[`${variant}Text` as keyof typeof dynamicStyles],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const activityIndicatorColor = 
    variant === 'secondary' 
      ? theme.colors.primary.main 
      : variant === 'accent'
      ? theme.colors.neutral.black
      : theme.colors.neutral.white;

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...rest}
    >
      <View style={styles.contentContainer}>
        {leftIcon && !loading && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        {loading ? (
          <ActivityIndicator 
            color={activityIndicatorColor} 
            size="small" 
          />
        ) : (
          <Text style={textStyles}>{title}</Text>
        )}
        
        {rightIcon && !loading && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    minHeight: 32,
  },
  medium: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    minHeight: 40,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 48,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: 'System',
    fontWeight: '600',
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  disabledText: {
    opacity: 0.7,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

export default Button;