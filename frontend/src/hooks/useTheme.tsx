/**
 * Hook para acessar o tema da aplicação
 */
import { useSelector, useDispatch } from "react-redux";
import { useAppSelector, useAppDispatch } from "../store";
import { setTheme, toggleTheme, initializeTheme, loadTheme } from "../store/slices/themeSlice";
import { lightColors, darkColors } from "../theme/colors";
import spacing from "../theme/spacing";
import typography, { applyTextStyle, fontFamily } from "../theme/typography";
import type { ThemeMode } from "../store/slices/themeSlice";
import { useEffect } from "react";

// Definição de bordas
const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  extraLarge: 18,
  round: 9999,
};

// Definição de sombras
const shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  subtle: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 0.5,
  },
  strong: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state) => state.theme.mode);
  
  // Carregar tema do storage na primeira vez
  useEffect(() => {
    loadTheme().then((savedTheme) => {
      dispatch(initializeTheme(savedTheme));
    });
  }, [dispatch]);

  const colors = themeMode === "dark" ? darkColors : lightColors;

  const theme = {
    colors,
    spacing,
    typography,
    borderRadius,
    shadows,
    fontFamily,
    applyTextStyle,
    mode: themeMode,
    isDark: themeMode === "dark",
    setTheme: (mode: ThemeMode) => dispatch(setTheme(mode)),
    toggleTheme: () => dispatch(toggleTheme()),
  };

  return theme;
};

export default useTheme;

