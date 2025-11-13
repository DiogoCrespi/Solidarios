// src/screens/doador/DonationDetailScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { DoadorStackParamList } from "../../navigation/types";

// Componentes
import {
  Typography,
  Header,
  StatusIndicator,
  Badge,
  Card,
  Divider,
  Button,
  EmptyState,
  Loading,
  ErrorState,
  NotificationBanner,
} from "../../components/barrelComponents";
import { useTheme } from "../../hooks/useTheme";

// Hooks
import { useAuth } from "../../hooks/useAuth";
import { useItems } from "../../hooks/useItems";

// Tipos e rotas
import { DOADOR_ROUTES } from "../../navigation/routes";
import { formatDate } from "../../utils/formatters";
import { ItemType } from "../../types/items.types";

// Interface para a rota
type DonationDetailScreenRouteProp = RouteProp<
  DoadorStackParamList,
  typeof DOADOR_ROUTES.DONATION_DETAIL
>;

const DonationDetailScreen: React.FC = () => {
  const theme = useTheme();
  // Navegação e parâmetros
  const route = useRoute<DonationDetailScreenRouteProp>();
  const id = route.params?.id;
  const navigation = useNavigation<StackNavigationProp<DoadorStackParamList>>();

  // Verificar se temos um ID válido
  if (!id) {
    return (
      <EmptyState
        title="Doação não encontrada"
        description="O ID da doação é inválido ou não foi fornecido."
        actionLabel="Voltar para minhas doações"
        onAction={() => navigation.goBack()}
      />
    );
  }

  // Estado
  const { user } = useAuth();
  const {
    item,
    fetchItemById,
    updateItem,
    removeItem,
    isLoading,
    error,
    clearError,
  } = useItems();
  const [currentImage, setCurrentImage] = useState<number>(0);
  const [notification, setNotification] = useState<{
    visible: boolean;
    type: "success" | "error";
    message: string;
    description?: string;
  }>({
    visible: false,
    type: "success",
    message: "",
  });

  // Carregar detalhes da doação
  const loadDonationDetails = useCallback(async () => {
    await fetchItemById(id);
  }, [fetchItemById, id]);

  // Carregar dados ao focar na tela
  useFocusEffect(
    useCallback(() => {
      loadDonationDetails();
    }, [loadDonationDetails])
  );

  // Cancelar doação
  const handleCancelDonation = () => {
    Alert.alert(
      "Cancelar Doação",
      "Tem certeza que deseja cancelar esta doação? Esta ação não pode ser desfeita.",
      [
        {
          text: "Não",
          style: "cancel",
        },
        {
          text: "Sim, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              await removeItem(id);
              setNotification({
                visible: true,
                type: "success",
                message: "Doação cancelada com sucesso!",
              });
              setTimeout(() => {
                navigation.navigate(DOADOR_ROUTES.MY_DONATIONS);
              }, 1500);
            } catch (err) {
              console.error("Erro ao cancelar doação:", err);
              setNotification({
                visible: true,
                type: "error",
                message: "Erro ao cancelar doação",
                description:
                  "Não foi possível cancelar sua doação. Tente novamente.",
              });
            }
          },
        },
      ]
    );
  };

  // Renderizar loading state
  if (isLoading && !item) {
    return (
      <Loading
        visible={true}
        message="Carregando detalhes da doação..."
        overlay
      />
    );
  }

  // Renderizar erro
  if (error) {
    return (
      <ErrorState
        title="Erro ao carregar detalhes"
        description={error}
        actionLabel="Tentar novamente"
        onAction={() => {
          clearError();
          loadDonationDetails();
        }}
      />
    );
  }

  // Se o item não foi carregado
  if (!item) {
    return (
      <EmptyState
        title="Doação não encontrada"
        description="A doação que você está procurando não está disponível."
        actionLabel="Voltar para minhas doações"
        onAction={() => navigation.goBack()}
      />
    );
  }

  // Verificar se o usuário logado é o doador do item
  const isOwner = user?.id === item.donorId;

  // Mapeamento de tipos de itens para rótulos
  const itemTypeLabels: Record<ItemType, string> = {
    [ItemType.ROUPA]: "Roupa",
    [ItemType.CALCADO]: "Calçado",
    [ItemType.UTENSILIO]: "Utensílio",
    [ItemType.OUTRO]: "Outro",
  };

  const dynamicStyles = {
    container: {
      backgroundColor: theme.colors.neutral.white,
    },
    contentContainer: {
      backgroundColor: theme.colors.neutral.white,
    },
    imageContainer: {
      backgroundColor: theme.colors.neutral.lightGray,
      borderRadius: 8,
    },
    mainImage: {
      backgroundColor: theme.colors.neutral.lightGray,
    },
    thumbnailContainer: {
      backgroundColor: theme.colors.neutral.lightGray,
    },
    thumbnail: {
      borderRadius: 4,
    },
    selectedThumbnail: {
      borderColor: theme.colors.primary.secondary,
    },
    noImageContainer: {
      backgroundColor: theme.colors.neutral.lightGray,
    },
    statusDot: {
      backgroundColor: theme.colors.neutral.lightGray,
      borderColor: theme.colors.neutral.mediumGray,
    },
    statusDotActive: {
      backgroundColor: theme.colors.status.success,
      borderColor: theme.colors.status.success,
    },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Cabeçalho */}
      <Header
        title="Detalhes da Doação"
        onBackPress={() => navigation.goBack()}
        backgroundColor={theme.colors.primary.secondary}
      />

      {/* Notificação */}
      <NotificationBanner
        visible={notification.visible}
        type={notification.type}
        message={notification.message}
        description={notification.description}
        onClose={() => setNotification({ ...notification, visible: false })}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, dynamicStyles.contentContainer]}
      >
        {/* Galeria de imagens */}
        <View style={[styles.imageContainer, dynamicStyles.imageContainer]}>
          {item.photos && item.photos.length > 0 ? (
            <>
              <Image
                source={{ uri: item.photos[currentImage] }}
                style={[styles.mainImage, dynamicStyles.mainImage]}
                resizeMode="cover"
              />
              {item.photos.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={[styles.thumbnailContainer, dynamicStyles.thumbnailContainer]}
                >
                  {item.photos.map((photo, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setCurrentImage(index)}
                      style={[
                        styles.thumbnail,
                        dynamicStyles.thumbnail,
                        currentImage === index && styles.selectedThumbnail,
                        currentImage === index && dynamicStyles.selectedThumbnail,
                      ]}
                    >
                      <Image
                        source={{ uri: photo }}
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          ) : (
            <View style={[styles.noImageContainer, dynamicStyles.noImageContainer]}>
              <Typography
                variant="bodySecondary"
                color={theme.colors.neutral.darkGray}
              >
                Sem imagens disponíveis
              </Typography>
            </View>
          )}
        </View>

        {/* Informações básicas */}
        <Card style={styles.card}>
          <View style={styles.headerRow}>
            <Badge
              label={itemTypeLabels[item.type]}
              variant="info"
              size="medium"
            />
            <StatusIndicator status={item.status} showLabel />
          </View>

          <Typography variant="h3" style={styles.title} color={theme.colors.neutral.black}>
            {item.description}
          </Typography>

          <Divider spacing={8} />

          {/* Detalhes do item */}
          <View style={styles.detailsContainer}>
            {item.size && (
              <View style={styles.detailRow}>
                <Typography
                  variant="bodySecondary"
                  color={theme.colors.neutral.darkGray}
                >
                  Tamanho:
                </Typography>
                <Typography variant="body" color={theme.colors.neutral.black}>{item.size}</Typography>
              </View>
            )}

            {item.conservationState && (
              <View style={styles.detailRow}>
                <Typography
                  variant="bodySecondary"
                  color={theme.colors.neutral.darkGray}
                >
                  Estado de conservação:
                </Typography>
                <Typography variant="body" color={theme.colors.neutral.black}>{item.conservationState}</Typography>
              </View>
            )}

            <View style={styles.detailRow}>
              <Typography
                variant="bodySecondary"
                color={theme.colors.neutral.darkGray}
              >
                Data de doação:
              </Typography>
              <Typography variant="body" color={theme.colors.neutral.black}>
                {formatDate(item.receivedDate)}
              </Typography>
            </View>

            {item.category && (
              <View style={styles.detailRow}>
                <Typography
                  variant="bodySecondary"
                  color={theme.colors.neutral.darkGray}
                >
                  Categoria:
                </Typography>
                <Badge label={item.category.name} variant="info" size="small" />
              </View>
            )}
          </View>
        </Card>

        {/* Status da doação */}
        <Card title="Status da Doação" style={styles.card}>
          <View style={styles.statusTimeline}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, dynamicStyles.statusDot, styles.statusDotActive, dynamicStyles.statusDotActive]} />
              <View style={styles.statusContent}>
                <Typography variant="bodySecondary" style={styles.statusTitle} color={theme.colors.neutral.black}>
                  Doação Recebida
                </Typography>
                <Typography
                  variant="small"
                  color={theme.colors.neutral.darkGray}
                >
                  {formatDate(item.receivedDate)}
                </Typography>
              </View>
            </View>

            <View style={styles.statusItem}>
              <View
                style={[
                  styles.statusDot,
                  dynamicStyles.statusDot,
                  item.status !== "disponivel" && styles.statusDotActive,
                  item.status !== "disponivel" && dynamicStyles.statusDotActive,
                ]}
              />
              <View style={styles.statusContent}>
                <Typography variant="bodySecondary" style={styles.statusTitle} color={theme.colors.neutral.black}>
                  {item.status === "reservado" || item.status === "distribuido"
                    ? "Reservado para Beneficiário"
                    : "Aguardando Reserva"}
                </Typography>
                {(item.status === "reservado" ||
                  item.status === "distribuido") && (
                  <Typography
                    variant="small"
                    color={theme.colors.neutral.darkGray}
                  >
                    Item reservado para distribuição
                  </Typography>
                )}
              </View>
            </View>

            <View style={styles.statusItem}>
              <View
                style={[
                  styles.statusDot,
                  dynamicStyles.statusDot,
                  item.status === "distribuido" && styles.statusDotActive,
                  item.status === "distribuido" && dynamicStyles.statusDotActive,
                ]}
              />
              <View style={styles.statusContent}>
                <Typography variant="bodySecondary" style={styles.statusTitle} color={theme.colors.neutral.black}>
                  {item.status === "distribuido"
                    ? "Entregue ao Beneficiário"
                    : "Aguardando Entrega"}
                </Typography>
                {item.status === "distribuido" && (
                  <Typography
                    variant="small"
                    color={theme.colors.neutral.darkGray}
                  >
                    Sua doação foi entregue a quem precisava!
                  </Typography>
                )}
              </View>
            </View>
          </View>
        </Card>

        {/* Ações disponíveis */}
        {isOwner && item.status === "disponivel" && (
          <Button
            title="Cancelar Doação"
            onPress={handleCancelDonation}
            variant="secondary"
            style={styles.actionButton}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 8,
    paddingBottom: 48,
  },
  imageContainer: {
    marginBottom: 8,
    overflow: "hidden",
  },
  mainImage: {
    width: "100%",
    height: 250,
  },
  thumbnailContainer: {
    flexDirection: "row",
    padding: 4,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: 4,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedThumbnail: {
    // Border color applied dynamically
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  noImageContainer: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    marginBottom: 4,
  },
  detailsContainer: {
    marginTop: 4,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  statusTimeline: {
    padding: 4,
  },
  statusItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 4,
    marginRight: 4,
  },
  statusDotActive: {
    // Colors applied dynamically
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontWeight: "bold",
  },
  actionButton: {
    marginTop: 8,
  },
});

export default DonationDetailScreen;
