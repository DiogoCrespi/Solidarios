import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Typography,
  Header,
  Card,
  Button,
  TextField,
  SearchBar,
  Divider,
  NotificationBanner,
  Loading,
} from '../../components/barrelComponents';
import { useTheme } from '../../hooks/useTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCategories } from '../../hooks/useCategories';

const CategoriesScreen: React.FC = () => {
  const theme = useTheme();
  const {
    categories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    removeCategory,
  } = useCategories();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      setNotification({
        visible: true,
        message: 'Nome da categoria é obrigatório',
        type: 'error',
      });
      return;
    }

    const result = await createCategory({
      name: newCategory.name,
      description: newCategory.description,
    });

    if (result) {
      setNewCategory({ name: '', description: '' });
      setShowAddForm(false);
      
      // Recarregar a lista de categorias
      await fetchCategories();
      
      setNotification({
        visible: true,
        message: 'Categoria adicionada com sucesso!',
        type: 'success',
      });
    } else {
      setNotification({
        visible: true,
        message: error || 'Erro ao adicionar categoria',
        type: 'error',
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const success = await removeCategory(id);
    
    if (success) {
      setNotification({
        visible: true,
        message: 'Categoria removida com sucesso!',
        type: 'success',
      });
    } else {
      setNotification({
        visible: true,
        message: error || 'Erro ao remover categoria',
        type: 'error',
      });
    }
  };

  if (isLoading && categories.length === 0) {
    return (
      <View style={styles.container}>
        <Header
          title="Gerenciar Categorias"
          subtitle="Organize os itens por categorias"
        />
        <View style={styles.loadingContainer}>
          <Loading message="Carregando categorias..." />
        </View>
      </View>
    );
  }

  const dynamicStyles = {
    container: {
      backgroundColor: theme.colors.neutral.lightGray,
    },
    categoryIcon: {
      backgroundColor: theme.colors.primary.main + '15',
    },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Header
        title="Gerenciar Categorias"
        subtitle="Organize os itens por categorias"
      />

      {notification.visible && (
        <NotificationBanner
          message={notification.message}
          type={notification.type}
          onDismiss={() => setNotification({ ...notification, visible: false })}
        />
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Barra de pesquisa e botão adicionar */}
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder="Buscar categorias..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          <Button
            title="Nova Categoria"
            onPress={() => setShowAddForm(!showAddForm)}
            variant="primary"
            icon="plus"
            style={styles.addButton}
          />
        </View>

        {/* Formulário de adicionar categoria */}
        {showAddForm && (
          <Card style={styles.formCard}>
            <Typography variant="h6" color={theme.colors.neutral.black} style={styles.formTitle}>
              Nova Categoria
            </Typography>
            <Divider style={styles.divider} />
            
            <TextField
              label="Nome da Categoria *"
              placeholder="Ex: Alimentos, Roupas, Higiene..."
              value={newCategory.name}
              onChangeText={(text) => setNewCategory({ ...newCategory, name: text })}
            />

            <TextField
              label="Descrição"
              placeholder="Descrição da categoria..."
              value={newCategory.description}
              onChangeText={(text) =>
                setNewCategory({ ...newCategory, description: text })
              }
              multiline
              numberOfLines={3}
            />

            <View style={styles.formButtons}>
              <Button
                title="Cancelar"
                onPress={() => {
                  setShowAddForm(false);
                  setNewCategory({ name: '', description: '' });
                }}
                variant="outline"
                style={styles.cancelButton}
              />
              <Button
                title="Adicionar"
                onPress={handleAddCategory}
                variant="primary"
                style={styles.saveButton}
              />
            </View>
          </Card>
        )}

        {/* Lista de categorias */}
        <View style={styles.categoriesContainer}>
          <Typography variant="h6" color={theme.colors.neutral.black} style={styles.sectionTitle}>
            Categorias Cadastradas ({filteredCategories.length})
          </Typography>

          {filteredCategories.length === 0 ? (
            <Card style={styles.emptyCard}>
              <MaterialCommunityIcons
                name="shape-outline"
                size={64}
                color={theme.colors.neutral.mediumGray}
              />
              <Typography
                variant="body"
                color={theme.colors.neutral.darkGray}
                style={styles.emptyText}
              >
                Nenhuma categoria encontrada
              </Typography>
            </Card>
          ) : (
            filteredCategories.map((category) => (
              <Card key={category.id} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryIcon, dynamicStyles.categoryIcon]}>
                    <MaterialCommunityIcons
                      name="shape"
                      size={24}
                      color={theme.colors.primary.main}
                    />
                  </View>
                  <View style={styles.categoryInfo}>
                    <Typography variant="h6" color={theme.colors.neutral.black} style={styles.categoryName}>
                      {category.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={theme.colors.neutral.darkGray}
                    >
                      {category.description}
                    </Typography>
                  </View>
                  <View style={styles.categoryActions}>
                    <View style={styles.itemCount}>
                      <MaterialCommunityIcons
                        name="package-variant"
                        size={16}
                        color={theme.colors.neutral.darkGray}
                      />
                      <Typography
                        variant="caption"
                        color={theme.colors.neutral.darkGray}
                        style={styles.countText}
                      >
                        {category.itemCount || 0} itens
                      </Typography>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteCategory(category.id)}
                    >
                      <MaterialCommunityIcons
                        name="delete"
                        size={20}
                        color={theme.colors.status.error}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
  },
  addButton: {
    minWidth: 150,
  },
  formCard: {
    marginBottom: 24,
  },
  formTitle: {
    marginBottom: 16,
  },
  divider: {
    marginBottom: 24,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 24,
  },
  cancelButton: {
    minWidth: 100,
  },
  saveButton: {
    minWidth: 100,
  },
  categoriesContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 24,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    marginTop: 24,
    textAlign: 'center',
  },
  categoryCard: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    marginBottom: 4,
  },
  categoryActions: {
    alignItems: 'flex-end',
    gap: 16,
  },
  itemCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countText: {
    marginLeft: 4,
  },
  deleteButton: {
    padding: 8,
  },
});

export default CategoriesScreen;

