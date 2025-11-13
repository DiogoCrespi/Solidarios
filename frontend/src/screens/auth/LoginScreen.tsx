import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Formik } from "formik";
import * as Yup from "yup";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";
import { AuthStackParamList } from "../../navigation/AuthNavigator";
import { AUTH_ROUTES } from "../../navigation/routes";

// Esquema de validação do formulário
const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Email inválido").required("Email é obrigatório"),
  password: Yup.string()
    .min(6, "A senha deve ter pelo menos 6 caracteres")
    .required("Senha é obrigatória"),
});

Dimensions.get("window");

const LoginScreen: React.FC = () => {
  const theme = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { login, isLoading, error, clearErrors } = useAuth();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs para animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Efeito de animação ao carregar a tela
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Efeito para mostrar erro
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      // Animação de shake quando houver erro
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error]);

  const handleLogin = async (values: { email: string; password: string }) => {
    clearErrors();
    setErrorMessage(null);

    try {
      const success = await login(values);
      if (!success && error) {
        let friendlyError = error;
        if (error.includes("Unauthorized") || error.includes("credentials")) {
          friendlyError = "Email ou senha incorretos. Tente novamente.";
        } else if (error.includes("not found")) {
          friendlyError = "Usuário não encontrado. Verifique seu email.";
        } else if (!friendlyError) {
          friendlyError = "Não foi possível fazer login. Tente novamente.";
        }
        setErrorMessage(friendlyError);
      }
    } catch (err) {
      setErrorMessage(
        "Ocorreu um erro inesperado. Tente novamente mais tarde."
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={
          theme.isDark
            ? [
                theme.colors.neutral.darkGray,
                theme.colors.neutral.mediumGray,
                theme.colors.neutral.lightGray,
              ]
            : ["#b0e6f2", "#e3f7ff", "#ffffff"]
        }
        locations={[0, 0.6, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Botão de voltar */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-undo"
              size={22}
              color={theme.colors.primary.main}
            />
          </TouchableOpacity>

          {/* Logo animada */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Image
              source={require("../../../assets/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Título e subtítulo animados */}
          <Animated.View
            style={[
              styles.headerTextContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={[styles.welcomeText, { color: theme.colors.primary.main }]}>Bem-vindo de volta!</Text>
            <Text style={[styles.subtitle, { color: theme.colors.neutral.darkGray }]}>Faça login para continuar</Text>
          </Animated.View>

          {/* Formulário de login animado */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { translateX: shakeAnim },
                ],
              },
            ]}
          >
            {errorMessage && (
              <View style={[styles.errorContainer, { backgroundColor: theme.colors.notifications.error.background }]}>
                <MaterialIcons name="error-outline" size={20} color={theme.colors.status.error} />
                <Text style={[styles.errorText, { color: theme.colors.status.error }]}>{errorMessage}</Text>
              </View>
            )}

            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={LoginSchema}
              onSubmit={handleLogin}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <>
                  {/* Campo de email */}
                  <View style={[styles.inputContainer, { 
                    backgroundColor: theme.colors.neutral.white,
                    borderColor: theme.colors.neutral.mediumGray 
                  }]}>
                    <MaterialIcons
                      name="email"
                      size={22}
                      color={theme.colors.neutral.darkGray}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, { color: theme.colors.neutral.black }]}
                      placeholder="Email"
                      placeholderTextColor={theme.colors.neutral.mediumGray}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                    />
                  </View>
                  {touched.email && errors.email && (
                    <Text style={[styles.validationError, { color: theme.colors.status.error }]}>{errors.email}</Text>
                  )}

                  {/* Campo de senha */}
                  <View style={[styles.inputContainer, { 
                    backgroundColor: theme.colors.neutral.white,
                    borderColor: theme.colors.neutral.mediumGray 
                  }]}>
                    <MaterialIcons
                      name="lock"
                      size={22}
                      color={theme.colors.neutral.darkGray}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, { color: theme.colors.neutral.black }]}
                      placeholder="Senha"
                      placeholderTextColor={theme.colors.neutral.mediumGray}
                      secureTextEntry={!passwordVisible}
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setPasswordVisible(!passwordVisible)}
                    >
                      <MaterialIcons
                        name={passwordVisible ? "visibility" : "visibility-off"}
                        size={22}
                        color={theme.colors.neutral.darkGray}
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.password && errors.password && (
                    <Text style={[styles.validationError, { color: theme.colors.status.error }]}>
                      {errors.password}
                    </Text>
                  )}

                  {/* Link para esqueci a senha */}
                  <TouchableOpacity
                    style={styles.forgotPasswordLink}
                    onPress={() =>
                      navigation.navigate(AUTH_ROUTES.FORGOT_PASSWORD as any)
                    }
                  >
                    <Text style={[styles.forgotPasswordText, { color: theme.colors.primary.secondary }]}>
                      Esqueceu a senha?
                    </Text>
                  </TouchableOpacity>

                  {/* Botão de login */}
                  <TouchableOpacity
                    style={styles.loginButtonContainer}
                    onPress={() => handleSubmit()}
                    activeOpacity={0.8}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={["#173F5F", "#006E58"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.loginButton}
                    >
                      {isLoading ? (
                        <View style={styles.loadingIndicator} />
                      ) : (
                        <Text style={styles.loginButtonText}>Login</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </Formik>
          </Animated.View>

          {/* Ou continue com */}
          <Animated.View
            style={[
              styles.dividerContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.neutral.mediumGray }]} />
            <Text style={[styles.dividerText, { color: theme.colors.neutral.darkGray }]}>ou</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.neutral.mediumGray }]} />
          </Animated.View>

          {/* Botões de redes sociais */}
          <Animated.View
            style={[
              styles.socialButtonsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.googleButtonWrapper}
            >
              <LinearGradient
                colors={["#7b0000", "#d61c1c", "#fb2727"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.googleButtonGradient}
              >
                <Ionicons
                  name="logo-google"
                  size={24}
                  color="#fff"
                  style={styles.googleIcon}
                />
                <Text style={styles.socialButtonText}>
                  Continuar com Google
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Link para registro */}
          <Animated.View
            style={[
              styles.registerContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={[styles.registerText, { color: theme.colors.neutral.darkGray }]}>Não tem uma conta?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(AUTH_ROUTES.REGISTER as any)}
            >
              <Text style={[styles.registerLink, { color: theme.colors.primary.secondary }]}>Registre-se</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 80,
    paddingBottom: 40,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
  },
  headerTextContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
  },
  formContainer: {
    width: "100%",
    marginBottom: 20,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    height: 56,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 8,
  },
  validationError: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 2,
  },
  forgotPasswordLink: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  loginButtonContainer: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  loadingIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#fff",
    borderTopColor: "transparent",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 10,
    fontSize: 14,
  },
  socialButtonsContainer: {
    alignItems: "center",
    marginBottom: 30,
    width: "100%",
  },
  googleButtonWrapper: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  googleButtonGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  googleIcon: {
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
});

export default LoginScreen;
