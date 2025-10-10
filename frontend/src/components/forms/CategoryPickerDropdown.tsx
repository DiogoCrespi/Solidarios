import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import { useFormikContext, getIn } from "formik";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Typography from "../common/Typography";
import Loading from "../common/Loading";
import ErrorState from "../common/ErrorState";
import useCategories from "../../hooks/useCategories";
import { Category } from "../../types/categories.types";
import theme from "../../theme";

export interface CategoryPickerDropdownProps {
  name: string;
  label?: string;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  required?: boolean;
}

const CategoryPickerDropdown: React.FC<CategoryPickerDropdownProps> = ({
  name,
  label = "Categoria",
  placeholder = "Selecione uma categoria",
  style,
  required = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
    console.log("CategoryPickerDropdown: Carregando categorias...");
    fetchCategories();
  }, [fetchCategories]);

  // Manipulador de seleção de categoria
  const handleSelectCategory = (category: Category) => {
    setFieldValue(name, category.id);
    setIsExpanded(false);
  };

  // Encontrar a categoria selecionada
  const selectedCategory = (Array.isArray(categories) ? categories : []).find(
    (category) => category.id === value
  );

  // Renderizar item de categoria
  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSelected = value === item.id;

    return (
      <TouchableOpacity
        style={[styles.dropdownItem, isSelected && styles.selectedItem]}
        onPress={() => handleSelectCategory(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemContent}>
          <View style={styles.itemIcon}>
            <MaterialCommunityIcons
              name="shape"
              size={20}
              color={isSelected ? theme.colors.primary.main : theme.colors.neutral.darkGray}
            />
          </View>
          <View style={styles.itemText}>
            <Typography
              variant="body"
              color={isSelected ? theme.colors.primary.main : theme.colors.neutral.black}
              style={styles.itemName}
            >
              {item.name}
            </Typography>
            {item.description && (
              <Typography
                variant="caption"
                color={theme.colors.neutral.darkGray}
                numberOfLines={1}
              >
                {item.description}
              </Typography>
            )}
          </View>
          {isSelected && (
            <MaterialCommunityIcons
              name="check"
              size={20}
              color={theme.colors.primary.main}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && !categories.length) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.labelContainer}>
          <Typography variant="body" style={styles.label}>
            {label}
          </Typography>
          {required && (
            <Typography variant="body" color={theme.colors.status.error}>
              *
            </Typography>
          )}
        </View>
        <View style={styles.loadingContainer}>
          <Loading size="small" />
          <Typography variant="caption" color={theme.colors.neutral.darkGray}>
            Carregando categorias...
          </Typography>
        </View>
      </View>
    );
  }

  if (categoriesError && !categories.length) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.labelContainer}>
          <Typography variant="body" style={styles.label}>
            {label}
          </Typography>
          {required && (
            <Typography variant="body" color={theme.colors.status.error}>
              *
            </Typography>
          )}
        </View>
        <ErrorState
          title="Erro ao carregar categorias"
          description="Não foi possível carregar a lista de categorias."
          actionLabel="Tentar novamente"
          onAction={fetchCategories}
          error={categoriesError}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      <View style={styles.labelContainer}>
        <Typography variant="body" style={styles.label}>
          {label}
        </Typography>
        {required && (
          <Typography variant="body" color={theme.colors.status.error}>
            *
          </Typography>
        )}
      </View>

      {/* Campo selecionável */}
      <TouchableOpacity
        style={[
          styles.selector,
          error && styles.selectorError,
          isExpanded && styles.selectorExpanded,
        ]}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.selectorContent}>
          {selectedCategory ? (
            <View style={styles.selectedContent}>
              <MaterialCommunityIcons
                name="shape"
                size={20}
                color={theme.colors.primary.main}
                style={styles.selectedIcon}
              />
              <View style={styles.selectedTextContainer}>
                <Typography variant="body" color={theme.colors.neutral.black}>
                  {selectedCategory.name}
                </Typography>
                {selectedCategory.description && (
                  <Typography
                    variant="caption"
                    color={theme.colors.neutral.darkGray}
                    numberOfLines={1}
                  >
                    {selectedCategory.description}
                  </Typography>
                )}
              </View>
            </View>
          ) : (
            <Typography variant="body" color={theme.colors.neutral.darkGray}>
              {placeholder}
            </Typography>
          )}
        </View>
        <MaterialCommunityIcons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color={theme.colors.neutral.darkGray}
        />
      </TouchableOpacity>

      {/* Lista expansível */}
      {isExpanded && (
        <View style={styles.dropdown}>
          <FlatList
            data={Array.isArray(categories) ? categories : []}
            keyExtractor={(item) => item.id}
            renderItem={renderCategoryItem}
            style={styles.dropdownList}
            contentContainerStyle={styles.dropdownListContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="shape-outline"
                  size={48}
                  color={theme.colors.neutral.mediumGray}
                />
                <Typography
                  variant="body"
                  color={theme.colors.neutral.darkGray}
                  style={styles.emptyText}
                >
                  Nenhuma categoria cadastrada
                </Typography>
              </View>
            }
          />
        </View>
      )}

      {/* Mensagem de erro */}
      {error && (
        <Typography
          variant="caption"
          color={theme.colors.status.error}
          style={styles.errorText}
        >
          {error}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.m,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  label: {
    marginRight: theme.spacing.xxs,
    fontWeight: "500",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.neutral.mediumGray,
    borderRadius: theme.borderRadius.medium,
    gap: theme.spacing.s,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.s,
    borderWidth: 1,
    borderColor: theme.colors.neutral.mediumGray,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.neutral.white,
    minHeight: 50,
  },
  selectorError: {
    borderColor: theme.colors.status.error,
  },
  selectorExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  selectorContent: {
    flex: 1,
  },
  selectedContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedIcon: {
    marginRight: theme.spacing.s,
  },
  selectedTextContainer: {
    flex: 1,
  },
  dropdown: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: theme.colors.neutral.mediumGray,
    borderBottomLeftRadius: theme.borderRadius.medium,
    borderBottomRightRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.neutral.white,
    maxHeight: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownListContent: {
    padding: theme.spacing.xxs,
  },
  dropdownItem: {
    padding: theme.spacing.s,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.xxs,
  },
  selectedItem: {
    backgroundColor: theme.colors.primary.main + "10",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.small,
    backgroundColor: theme.colors.neutral.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.s,
  },
  itemText: {
    flex: 1,
  },
  itemName: {
    marginBottom: theme.spacing.xxs,
  },
  emptyContainer: {
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  emptyText: {
    marginTop: theme.spacing.s,
    textAlign: "center",
  },
  errorText: {
    marginTop: theme.spacing.xxs,
  },
});

export default CategoryPickerDropdown;

