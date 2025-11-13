import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useFormikContext, getIn } from "formik";
import Typography from "../common/Typography";
import Badge from "../common/Badge";
import Loading from "../common/Loading";
import ErrorState from "../common/ErrorState";
import useCategories from "../../hooks/useCategories";
import { Category } from "../../types/categories.types";
import { useTheme } from "../../hooks/useTheme";

export interface CategoryPickerProps {
  name: string;
  label?: string;
  style?: StyleProp<ViewStyle>;
  required?: boolean;
  multiple?: boolean;
  showBadge?: boolean;
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({
  name,
  label = "Categorias",
  style,
  required = false,
  multiple = false,
  showBadge = true,
}) => {
  const theme = useTheme();
  // Estado para acompanhar a seleção atual quando é múltipla
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Formik context para integração com formulários
  const { values, setFieldValue, touched, errors } = useFormikContext<any>();
  const value = getIn(values, name);
  const error = getIn(touched, name) && getIn(errors, name);

  // Hook para buscar as categorias
  const {
    categories,
    fetchCategories,
    isLoading,
    error: categoriesError,
  } = useCategories();

  useEffect(() => {
    // Carregar categorias ao montar o componente
    console.log("CategoryPicker: Carregando categorias...");
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    // Sincronizar o estado local com o valor do Formik para seleção múltipla
    if (multiple && Array.isArray(value)) {
      setSelectedIds(value);
    }
  }, [value, multiple]);

  // Manipulador de seleção de categoria
  const handleSelectCategory = (category: Category) => {
    if (multiple) {
      // Se já estiver selecionado, remover; caso contrário, adicionar
      const newSelectedIds = selectedIds.includes(category.id)
        ? selectedIds.filter((id) => id !== category.id)
        : [...selectedIds, category.id];

      setSelectedIds(newSelectedIds);
      setFieldValue(name, newSelectedIds);
    } else {
      // Seleção única
      setFieldValue(name, category.id);
    }
  };

  // Verificar se uma categoria está selecionada
  const isCategorySelected = (categoryId: string) => {
    if (multiple) {
      return selectedIds.includes(categoryId);
    }
    return value === categoryId;
  };

  // Renderizar item de categoria
  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSelected = isCategorySelected(item.id);
    const dynamicStyles = {
      selectedCategoryItem: {
        borderColor: theme.colors.primary.secondary,
        backgroundColor: theme.colors.primary.secondary + "10",
      },
      categoryItem: {
        borderColor: theme.colors.neutral.mediumGray,
      },
    };

    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          dynamicStyles.categoryItem,
          isSelected && styles.selectedCategoryItem,
          isSelected && dynamicStyles.selectedCategoryItem,
        ]}
        onPress={() => handleSelectCategory(item)}
        activeOpacity={0.7}
      >
        <Typography
          variant="body"
          color={
            isSelected
              ? theme.colors.primary.secondary
              : theme.colors.neutral.black
          }
        >
          {item.name}
        </Typography>

        {item.description && (
          <Typography
            variant="small"
            color={
              isSelected
                ? theme.colors.primary.secondary
                : theme.colors.neutral.darkGray
            }
            numberOfLines={1}
          >
            {item.description}
          </Typography>
        )}
      </TouchableOpacity>
    );
  };

  // Encontrar as categorias selecionadas para exibir os badges
  const getSelectedCategories = (): Category[] => {
    if (multiple) {
      return (Array.isArray(categories) ? categories : []).filter((category) => selectedIds.includes(category.id));
    }

    const selectedCategory = (Array.isArray(categories) ? categories : []).find(
      (category) => category.id === value
    );
    return selectedCategory ? [selectedCategory] : [];
  };

  console.log("CategoryPicker: isLoading =", isLoading);
  console.log("CategoryPicker: categoriesError =", categoriesError);
  console.log("CategoryPicker: categories =", categories);

  if (isLoading) {
    return <Loading message="Carregando categorias..." />;
  }

  if (categoriesError) {
    return (
      <ErrorState
        title="Erro ao carregar categorias"
        description="Não foi possível carregar a lista de categorias."
        actionLabel="Tentar novamente"
        onAction={fetchCategories}
        error={categoriesError}
      />
    );
  }

  const dynamicStyles = {
    categoryList: {
      borderColor: theme.colors.neutral.mediumGray,
    },
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelContainer}>
        <Typography variant="bodySecondary" color={theme.colors.neutral.black} style={styles.label}>
          {label}
        </Typography>

        {required && (
          <Typography variant="bodySecondary" color={theme.colors.status.error}>
            *
          </Typography>
        )}
      </View>

      <FlatList
        data={Array.isArray(categories) ? categories : []}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoryItem}
        horizontal={false}
        style={[styles.categoryList, dynamicStyles.categoryList]}
        contentContainerStyle={styles.categoryListContent}
      />

      {error && (
        <Typography
          variant="small"
          color={theme.colors.status.error}
          style={styles.errorText}
        >
          {error}
        </Typography>
      )}

      {showBadge && getSelectedCategories().length > 0 && (
        <View style={styles.selectedContainer}>
          <Typography variant="small" color={theme.colors.neutral.black} style={styles.selectedLabel}>
            Selecionadas:
          </Typography>

          <View style={styles.badgesContainer}>
            {getSelectedCategories().map((category) => (
              <Badge
                key={category.id}
                label={category.name}
                variant="info"
                style={styles.badge}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    marginRight: 4,
  },
  categoryList: {
    maxHeight: 200,
    borderWidth: 1,
    borderRadius: 8,
  },
  categoryListContent: {
    padding: 8,
  },
  categoryItem: {
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  selectedCategoryItem: {
    // Cores aplicadas dinamicamente
  },
  errorText: {
    marginTop: 4,
  },
  selectedContainer: {
    marginTop: 16,
  },
  selectedLabel: {
    marginBottom: 4,
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  badge: {
    marginRight: 8,
    marginBottom: 8,
  },
});

export default CategoryPicker;
