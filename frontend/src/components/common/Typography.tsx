import React from 'react';
import { Text, TextProps, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export type TypographyVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'body' 
  | 'bodySecondary' 
  | 'small';

export interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  center?: boolean;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color,
  center = false,
  style,
  children,
  ...rest
}) => {
  const theme = useTheme();
  
  // Verificar se o tema e typography estão disponíveis
  if (!theme || !theme.typography) {
    console.warn('Theme or typography not available in Typography component');
    // Fallback básico se o tema não estiver disponível
    return (
      <Text style={[{ fontSize: 16, color: color || '#000' }, center && styles.center, style]} {...rest}>
        {children}
      </Text>
    );
  }
  
  // Obter estilo de tipografia do tema com fallback para 'body' se a variante não existir
  const typographyStyle = theme.typography[variant] || theme.typography.body;
  
  // Se typographyStyle ainda for undefined, usar valores padrão
  if (!typographyStyle) {
    console.warn(`Typography style for variant '${variant}' not found, using defaults`);
    return (
      <Text style={[{ fontSize: 16, color: color || (theme.colors?.neutral?.black || '#000000') }, center && styles.center, style]} {...rest}>
        {children}
      </Text>
    );
  }
  
  // Se não houver cor especificada, usar a cor padrão do tema baseado na variante
  const textColor = color || typographyStyle.color || (theme.colors?.neutral?.black || '#000000');
  
  const textStyles = [
    {
      fontSize: typographyStyle.fontSize || 16,
      fontFamily: typographyStyle.fontFamily || (theme.fontFamily?.primary || 'System'),
      fontWeight: typographyStyle.fontWeight || 'normal',
      lineHeight: typographyStyle.lineHeight || 24,
      color: textColor,
    },
    center && styles.center,
    style,
  ];

  return (
    <Text style={textStyles} {...rest}>
      {children}
    </Text>
  );
};

// Estilos base
const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
});

export default Typography;