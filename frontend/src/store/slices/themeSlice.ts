/**
 * Redux slice para gerenciamento do tema (claro/escuro)
 */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import storage from "../../utils/storage";

export type ThemeMode = "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
}

const THEME_STORAGE_KEY = "theme_mode";

// Estado inicial - tenta carregar do storage, senão usa 'light'
const getInitialTheme = async (): Promise<ThemeMode> => {
  try {
    const savedTheme = await storage.getItem<ThemeMode>(THEME_STORAGE_KEY);
    return savedTheme || "light";
  } catch (error) {
    console.error("Erro ao carregar tema do storage:", error);
    return "light";
  }
};

// Para uso síncrono, vamos usar 'light' como padrão e carregar depois
const initialState: ThemeState = {
  mode: "light",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      // Salvar no storage
      storage.setItem(THEME_STORAGE_KEY, action.payload).catch((error) => {
        console.error("Erro ao salvar tema no storage:", error);
      });
    },
    toggleTheme: (state) => {
      const newMode = state.mode === "light" ? "dark" : "light";
      state.mode = newMode;
      // Salvar no storage
      storage.setItem(THEME_STORAGE_KEY, newMode).catch((error) => {
        console.error("Erro ao salvar tema no storage:", error);
      });
    },
    initializeTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
    },
  },
});

export const { setTheme, toggleTheme, initializeTheme } = themeSlice.actions;

// Função para inicializar o tema ao iniciar o app
export const loadTheme = async (): Promise<ThemeMode> => {
  try {
    const savedTheme = await storage.getItem<ThemeMode>(THEME_STORAGE_KEY);
    return savedTheme || "light";
  } catch (error) {
    console.error("Erro ao carregar tema do storage:", error);
    return "light";
  }
};

export default themeSlice.reducer;


