import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Formik } from "formik";
import * as Yup from "yup";
import { AdminItemsStackParamList } from "../../navigation/types";

// Componentes
import {
  Typography,
  Header,
  TextField,
  Button,
  Select,
  NotificationBanner,
  CategoryPickerDropdown,
  FileUpload,
} from "../../components/barrelComponents";
import theme from "../../theme";

// Hooks
import { useItems } from "../../hooks/useItems";
import { useCategories } from "../../hooks/useCategories";
import { useAuth } from "../../hooks/useAuth";
import { useDonors } from "../../hooks/useDonors";
import { ItemType } from "../../types/items.types";

// Validação do formulário
const CreateItemSchema = Yup.object().shape({
  type: Yup.string()
    .oneOf(Object.values(ItemType), "Tipo inválido")
    .required("Tipo é obrigatório"),
  description: Yup.string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .required("Descrição é obrigatória"),
  conservationState: Yup.string().required(
    "Estado de conservação é obrigatório"
  ),
  size: Yup.string().when("type", {
    is: (value: ItemType) =>
      value === ItemType.ROUPA || value === ItemType.CALCADO,
    then: (schema) =>
      schema.required("Tamanho é obrigatório para roupas e calçados"),
    otherwise: (schema) => schema.notRequired(),
  }),
  categoryId: Yup.string().required("Categoria é obrigatória"),
});

const typeOptions = Object.entries(ItemType).map(([_, value]) => ({
  label:
    value === ItemType.ROUPA
      ? "Roupa"
      : value === ItemType.CALCADO
      ? "Calçado"
      : value === ItemType.UTENSILIO
      ? "Utensílio"
      : "Outro",
  value,
}));

const conservationStateOptions = [
  { label: "Novo", value: "Novo" },
  { label: "Seminovo", value: "Seminovo" },
  { label: "Usado em bom estado", value: "Usado em bom estado" },
  { label: "Usado com marcas de uso", value: "Usado com marcas de uso" },
];

const CreateItemScreen: React.FC = () => {
  const navigation =
    useNavigation<StackNavigationProp<AdminItemsStackParamList>>();
  const { createItem, isLoading, error, clearError } = useItems();
  const { fetchCategories } = useCategories();
  const { user } = useAuth();
  const { donors } = useDonors();
  const [notification, setNotification] = useState({
    visible: false,
    type: "success" as "success" | "error",
    message: "",
    description: "",
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Criar opções de doadores incluindo "Anônimo"
  const donorOptions = [
    { label: "Anônimo", value: "anonimo" },
    ...donors.map((donor) => ({
      label: `${donor.name} (${donor.email})`,
      value: donor.id,
    })),
  ];

  // Função para fechar notificação
  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, visible: false }));
  }, []);

  // Função para criar um novo item
  const handleCreateItem = async (values: any) => {
    try {
      const newItem = await createItem(values);

      if (newItem) {
        setNotification({
          visible: true,
          type: "success",
          message: "Item criado com sucesso!",
          description: "O item foi adicionado ao sistema.",
        });

        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      }
    } catch (err) {
      setNotification({
        visible: true,
        type: "error",
        message: "Erro ao criar item.",
        description: "Não foi possível criar o item. Tente novamente.",
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <Header
        title="Criar Novo Item"
        onBackPress={() => navigation.goBack()}
        backgroundColor={theme.colors.primary.main}
      />

      <NotificationBanner
        visible={notification.visible}
        type={notification.type}
        message={notification.message}
        description={notification.description}
        onClose={handleCloseNotification}
      />

      <NotificationBanner
        visible={!!error}
        type="error"
        message="Erro ao criar item"
        description={error || "Ocorreu um erro. Tente novamente."}
        onClose={clearError}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Typography variant="h3" style={styles.title}>
          Cadastro de Item
        </Typography>

        <Formik
          initialValues={{
            type: ItemType.ROUPA,
            description: "",
            conservationState: "",
            size: "",
            categoryId: "",
            photos: [] as Array<{ uri: string; name: string; type: string }>, // Tipando explicitamente
            donorId: "anonimo", // Valor padrão: Doador Anônimo
          }}
          validationSchema={CreateItemSchema}
          onSubmit={(values, { setSubmitting }) => {
            // Validar donorId
            if (!values.donorId) {
              setNotification({
                visible: true,
                type: "error",
                message: "Doador não especificado",
                description: "Selecione um doador ou escolha 'Anônimo'.",
              });
              setSubmitting(false);
              return;
            }
            
            // Se for anônimo, buscar o ID do doador anônimo
            let finalDonorId = values.donorId;
            if (values.donorId === "anonimo") {
              const anonimoDonor = donors.find(d => d.email === "anonimo@solidarios.com");
              if (anonimoDonor) {
                finalDonorId = anonimoDonor.id;
              } else {
                setNotification({
                  visible: true,
                  type: "error",
                  message: "Doador anônimo não encontrado",
                  description: "O doador anônimo não foi criado no sistema.",
                });
                setSubmitting(false);
                return;
              }
            }
            
            // Preparar dados para envio
            const itemData: any = {
              type: values.type,
              description: values.description,
              conservationState: values.conservationState,
              categoryId: values.categoryId,
              donorId: finalDonorId,
            };
            
            // Adicionar size apenas se for roupa ou calçado
            if (values.type === ItemType.ROUPA || values.type === ItemType.CALCADO) {
              itemData.size = values.size;
            }
            
            // Adicionar photos apenas se houver URLs válidas
            if (values.photos && values.photos.length > 0) {
              // Converter objetos de arquivo para URLs se necessário
              itemData.photos = values.photos.map((photo: any) => 
                typeof photo === 'string' ? photo : photo.uri
              ).filter((url: string) => url && url.startsWith('http'));
            }
            
            handleCreateItem(itemData).finally(() => setSubmitting(false));
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue,
            values,
            errors,
            touched,
          }) => (
            <View style={styles.form}>
              <Select
                label="Tipo de Item"
                options={typeOptions}
                selectedValue={values.type}
                onSelect={(value) => setFieldValue("type", value)}
                error={touched.type && errors.type ? errors.type : undefined}
              />

              <TextField
                label="Descrição"
                value={values.description}
                onChangeText={handleChange("description")}
                onBlur={handleBlur("description")}
                error={
                  touched.description && errors.description
                    ? errors.description
                    : undefined
                }
                placeholder="Descreva o item detalhadamente"
                multiline
                numberOfLines={3}
              />

              <Select
                label="Estado de Conservação"
                options={conservationStateOptions}
                selectedValue={values.conservationState}
                onSelect={(value) => setFieldValue("conservationState", value)}
                error={
                  touched.conservationState && errors.conservationState
                    ? errors.conservationState
                    : undefined
                }
              />

              {(values.type === ItemType.ROUPA ||
                values.type === ItemType.CALCADO) && (
                <TextField
                  label="Tamanho"
                  value={values.size}
                  onChangeText={handleChange("size")}
                  onBlur={handleBlur("size")}
                  error={touched.size && errors.size ? errors.size : undefined}
                  placeholder="Ex: P, M, G, 38, 40, etc."
                />
              )}

              <CategoryPickerDropdown
                name="categoryId"
                label="Categoria"
                placeholder="Selecione uma categoria"
                required={true}
              />

              <Select
                label="Doador"
                options={donorOptions}
                selectedValue={values.donorId}
                onSelect={(value) => setFieldValue("donorId", value)}
                error={
                  touched.donorId && errors.donorId
                    ? errors.donorId
                    : undefined
                }
              />

              <FileUpload
                name="photos"
                label="Fotos do Item"
                accept="images"
                maxFiles={5}
              />

              <View style={styles.buttonsContainer}>
                <Button
                  title="Cancelar"
                  onPress={() => navigation.goBack()}
                  variant="secondary"
                  style={styles.buttonCancel}
                />
                <Button
                  title="Criar Item"
                  onPress={() => handleSubmit()}
                  loading={isLoading}
                  style={styles.buttonSubmit}
                />
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.m,
  },
  title: {
    marginBottom: theme.spacing.m,
  },
  form: {
    width: "100%",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.m,
  },
  buttonCancel: {
    flex: 1,
    marginRight: theme.spacing.xs,
  },
  buttonSubmit: {
    flex: 1,
    marginLeft: theme.spacing.xs,
    backgroundColor: theme.colors.primary.secondary,
  },
});

export default CreateItemScreen;
