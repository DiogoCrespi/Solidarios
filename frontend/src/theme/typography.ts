/**
 * Definição da tipografia para o tema da aplicação Solidários
 * Baseado no guia de estilo visual fornecido
 */
import { TextStyle } from "react-native";
import colors from "./colors";

type FontWeight =
  | "normal"
  | "bold"
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900";

interface TypographyStyle {
  fontSize: number;
  fontFamily: string;
  fontWeight: FontWeight;
  color: string;
  lineHeight?: number;
}

// Família de fontes
export const fontFamily = {
  primary: "Inter",
  alternative: "Roboto",
  monospace: "RobotoMono",
};

// Função para criar tipografia baseada nas cores
export const createTypography = (colors: typeof import('./colors').lightColors) => ({
  h1: {
    fontSize: 32,
    fontFamily: fontFamily.primary,
    fontWeight: "bold" as FontWeight,
    color: colors.neutral.black,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontFamily: fontFamily.primary,
    fontWeight: "bold" as FontWeight,
    color: colors.neutral.black,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontFamily: fontFamily.primary,
    fontWeight: "600" as FontWeight,
    color: colors.neutral.black,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontFamily: fontFamily.primary,
    fontWeight: "600" as FontWeight,
    color: colors.neutral.black,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontFamily: fontFamily.primary,
    fontWeight: "normal" as FontWeight,
    color: colors.neutral.black,
    lineHeight: 24,
  },
  bodySecondary: {
    fontSize: 14,
    fontFamily: fontFamily.primary,
    fontWeight: "normal" as FontWeight,
    color: colors.neutral.darkGray,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontFamily: fontFamily.primary,
    fontWeight: "normal" as FontWeight,
    color: colors.neutral.darkGray,
    lineHeight: 16,
  },
  button: {
    fontSize: 14,
    fontFamily: fontFamily.primary,
    fontWeight: "600" as FontWeight,
    color: colors.neutral.white,
  },
  buttonSmall: {
    fontSize: 12,
    fontFamily: fontFamily.primary,
    fontWeight: "600" as FontWeight,
    color: colors.neutral.white,
  },
});

// Tipografia padrão (tema claro)
export const typography = createTypography(colors);

// Função auxiliar para aplicar estilos de texto
export const applyTextStyle = (
  style: keyof typeof typography,
  overrides?: Partial<TextStyle>
): TextStyle => {
  return {
    ...typography[style],
    ...overrides,
  };
};

export default typography;
