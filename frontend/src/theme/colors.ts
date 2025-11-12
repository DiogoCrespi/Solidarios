/**
 * Definição das cores para o tema da aplicação Solidários
 * Baseado no guia de estilo visual fornecido
 */

// Cores do tema claro
export const lightColors = {
  // Cores Primárias
  primary: {
    main: "#173F5F", // Azul Marinho - cor principal
    secondary: "#006E58", // Verde Turquesa - cor secundária
    accent: "#B89700", // Amarelo - cor de destaque
  },

  // Cores Neutras
  neutral: {
    white: "#FFFFFF", // Fundo principal
    lightGray: "#F6F6F6", // Fundo secundário
    mediumGray: "#E2E8F0", // Bordas, linhas divisórias
    darkGray: "#64748B", // Textos secundários
    black: "#1E293B", // Textos principais
  },

  // Cores de Status
  status: {
    success: "#10B981", // Verde Sucesso
    error: "#EF4444", // Vermelho Alerta
    warning: "#F59E0B", // Amarelo Aviso
    info: "#3B82F6", // Azul Informação
  },

  // Badges de Status (para itens)
  badges: {
    available: {
      background: "#DCFCE7",
      text: "#166534",
    },
    reserved: {
      background: "#FEF9C3",
      text: "#854D0E",
    },
    distributed: {
      background: "#FEE2E2",
      text: "#991B1B",
    },
    lowStock: {
      background: "#FEF3C7",
      text: "#92400E",
    },
  },

  // Notificações
  notifications: {
    success: {
      background: "#DCFCE7",
      icon: "#16A34A",
      text: "#166534",
    },
    error: {
      background: "#FEE2E2",
      icon: "#DC2626",
      text: "#991B1B",
    },
    warning: {
      background: "#FEF3C7",
      icon: "#F59E0B",
      text: "#92400E",
    },
    info: {
      background: "#DBEAFE",
      icon: "#3B82F6",
      text: "#1E40AF",
    },
  },
};

// Cores do tema escuro
export const darkColors = {
  // Cores Primárias (mantidas, mas podem ser ajustadas)
  primary: {
    main: "#4A90E2", // Azul mais claro para contraste
    secondary: "#00C896", // Verde mais claro
    accent: "#FFD700", // Amarelo mais vibrante
  },

  // Cores Neutras (invertidas)
  neutral: {
    white: "#1E293B", // Fundo principal escuro
    lightGray: "#0F172A", // Fundo secundário mais escuro
    mediumGray: "#334155", // Bordas, linhas divisórias
    darkGray: "#94A3B8", // Textos secundários mais claros
    black: "#F1F5F9", // Textos principais claros
  },

  // Cores de Status (mantidas, mas podem ser ajustadas)
  status: {
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",
  },

  // Badges de Status (ajustados para tema escuro)
  badges: {
    available: {
      background: "#064E3B",
      text: "#6EE7B7",
    },
    reserved: {
      background: "#78350F",
      text: "#FDE68A",
    },
    distributed: {
      background: "#7F1D1D",
      text: "#FCA5A5",
    },
    lowStock: {
      background: "#78350F",
      text: "#FDE68A",
    },
  },

  // Notificações (ajustadas para tema escuro)
  notifications: {
    success: {
      background: "#064E3B",
      icon: "#6EE7B7",
      text: "#6EE7B7",
    },
    error: {
      background: "#7F1D1D",
      icon: "#FCA5A5",
      text: "#FCA5A5",
    },
    warning: {
      background: "#78350F",
      icon: "#FDE68A",
      text: "#FDE68A",
    },
    info: {
      background: "#1E3A8A",
      icon: "#93C5FD",
      text: "#93C5FD",
    },
  },
};

// Exportar cores padrão (tema claro) para compatibilidade
export const colors = lightColors;

export default colors;
