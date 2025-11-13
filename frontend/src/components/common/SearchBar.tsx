import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";

export interface SearchBarProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  searchIcon?: React.ReactNode;
  clearIcon?: React.ReactNode;
  autoSearch?: boolean;
  delayMs?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSearch,
  onClear,
  placeholder = "Buscar...",
  containerStyle,
  inputStyle,
  searchIcon,
  clearIcon,
  autoSearch = true,
  delayMs = 500,
  ...rest
}) => {
  const theme = useTheme();
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // Função para lidar com a mudança de texto
  const handleChangeText = (text: string) => {
    onChangeText(text);

    // Se autoSearch estiver habilitado, configura um timer para chamar onSearch
    if (autoSearch && onSearch) {
      if (timer) {
        clearTimeout(timer);
      }

      const newTimer = setTimeout(() => {
        onSearch(text);
      }, delayMs);

      setTimer(newTimer);
    }
  };

  // Função para limpar o texto
  const handleClear = () => {
    onChangeText("");
    if (onClear) {
      onClear();
    } else if (onSearch) {
      onSearch("");
    }
  };

  // Função para executar a busca
  const handleSearch = () => {
    if (onSearch) {
      onSearch(value);
    }
  };

  const dynamicStyles = {
    container: {
      backgroundColor: theme.colors.neutral.lightGray,
    },
    input: {
      color: theme.colors.neutral.black,
    },
  };

  return (
    <View style={[styles.container, dynamicStyles.container, containerStyle]}>
      {searchIcon ? (
        <View style={styles.searchIcon}>{searchIcon}</View>
      ) : (
        <View style={styles.searchIcon}>
          <SearchIcon theme={theme} />
        </View>
      )}

      <TextInput
        style={[styles.input, dynamicStyles.input, inputStyle]}
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.neutral.darkGray}
        returnKeyType="search"
        onSubmitEditing={handleSearch}
        {...rest}
      />

      {value !== "" && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          activeOpacity={0.7}
        >
          {clearIcon ? clearIcon : <ClearIcon theme={theme} />}
        </TouchableOpacity>
      )}
    </View>
  );
};

// Componente de ícone de pesquisa padrão
const SearchIcon: React.FC<{ theme: any }> = ({ theme }) => {
  const iconStyles = {
    circle: {
      borderColor: theme.colors.neutral.darkGray,
    },
    handle: {
      backgroundColor: theme.colors.neutral.darkGray,
    },
  };

  return (
    <View style={searchIconStyles.container}>
      <View style={[searchIconStyles.circle, iconStyles.circle]} />
      <View style={[searchIconStyles.handle, iconStyles.handle]} />
    </View>
  );
};

const searchIconStyles = StyleSheet.create({
  container: {
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    width: 10,
    height: 10,
    borderWidth: 1.5,
    borderRadius: 5,
    position: "absolute",
    top: 0,
    left: 0,
  },
  handle: {
    width: 6,
    height: 1.5,
    position: "absolute",
    bottom: 2,
    right: 2,
    transform: [{ rotate: "45deg" }],
  },
});

// Componente de ícone para limpar padrão
const ClearIcon: React.FC<{ theme: any }> = ({ theme }) => {
  const iconStyles = {
    line: {
      backgroundColor: theme.colors.neutral.darkGray,
    },
  };

  return (
    <View style={clearIconStyles.container}>
      <View style={[clearIconStyles.line1, iconStyles.line]} />
      <View style={[clearIconStyles.line2, iconStyles.line]} />
    </View>
  );
};

const clearIconStyles = StyleSheet.create({
  container: {
    width: 14,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  line1: {
    width: 14,
    height: 1.5,
    position: "absolute",
    transform: [{ rotate: "45deg" }],
  },
  line2: {
    width: 14,
    height: 1.5,
    position: "absolute",
    transform: [{ rotate: "-45deg" }],
  },
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'System',
    fontSize: 14,
    height: "100%",
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 2,
  },
});

export default SearchBar;
