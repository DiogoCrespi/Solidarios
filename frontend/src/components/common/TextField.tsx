import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInputProps,
  TouchableOpacity,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from "react-native";
import Typography from "./Typography";
import { useTheme } from "../../hooks/useTheme";

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  helperStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputContainerStyle,
  inputStyle,
  labelStyle,
  helperStyle,
  errorStyle,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  editable = true,
  ...rest
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    rest.onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    rest.onBlur?.(e);
  };

  const inputContainerBorderColor = error
    ? theme.colors.status.error
    : isFocused
    ? theme.colors.primary.secondary
    : theme.colors.neutral.mediumGray;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Typography variant="bodySecondary" color={theme.colors.neutral.black} style={[styles.label, labelStyle]}>
          {label}
        </Typography>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: inputContainerBorderColor,
            backgroundColor: editable
              ? theme.colors.neutral.white
              : theme.colors.neutral.lightGray,
          },
          inputContainerStyle,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            {
              color: editable
                ? theme.colors.neutral.black
                : theme.colors.neutral.darkGray,
            },
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.neutral.darkGray}
          secureTextEntry={secureTextEntry}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightIcon}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {(error || helper) && (
        <Typography
          variant="small"
          color={
            error ? theme.colors.status.error : theme.colors.neutral.darkGray
          }
          style={[styles.helperText, error ? errorStyle : helperStyle]}
        >
          {error || helper}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 48,
  },
  input: {
    flex: 1,
    fontFamily: 'System',
    fontSize: 16,
    height: "100%",
    paddingVertical: 0,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  helperText: {
    marginTop: 4,
  },
});

export default TextField;
