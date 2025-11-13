import React from "react";
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useFormikContext, getIn } from "formik";
import TextField, { TextFieldProps } from "../common/TextField";
import Typography from "../common/Typography";
import { useTheme } from "../../hooks/useTheme";

export interface FormFieldProps extends Omit<TextFieldProps, "error"> {
  name: string;
  label?: string;
  hint?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  required?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  hint,
  style,
  labelStyle,
  required = false,
  ...rest
}) => {
  const theme = useTheme();
  const { values, handleChange, handleBlur, touched, errors } =
    useFormikContext<any>();

  const value = getIn(values, name);
  const error = getIn(touched, name) && getIn(errors, name);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Typography
            variant="bodySecondary"
            color={theme.colors.neutral.black}
            style={[styles.label, labelStyle]}
          >
            {label}
          </Typography>

          {required && (
            <Typography
              variant="bodySecondary"
              color={theme.colors.status.error}
            >
              *
            </Typography>
          )}
        </View>
      )}

      <TextField
        value={value}
        onChangeText={handleChange(name)}
        onBlur={handleBlur(name)}
        error={error}
        helper={hint}
        {...rest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    marginRight: 4,
  },
});

export default FormField;
