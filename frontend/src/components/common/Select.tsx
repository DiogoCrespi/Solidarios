import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import Typography from "./Typography";
import { useTheme } from "../../hooks/useTheme";

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectProps {
  options: SelectOption[];
  selectedValue?: string | number;
  onSelect: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  selectStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  optionStyle?: StyleProp<ViewStyle>;
  optionTextStyle?: StyleProp<TextStyle>;
}

const Select: React.FC<SelectProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder = "Selecione uma opção",
  label,
  error,
  disabled = false,
  containerStyle,
  selectStyle,
  labelStyle,
  optionStyle,
  optionTextStyle,
}) => {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find(
    (option) => option.value === selectedValue
  );

  const handleSelect = (value: string | number) => {
    onSelect(value);
    setModalVisible(false);
  };

  const selectBorderColor = error
    ? theme.colors.status.error
    : theme.colors.neutral.mediumGray;
  
  const dynamicStyles = {
    select: {
      backgroundColor: disabled ? theme.colors.neutral.lightGray : theme.colors.neutral.white,
    },
    modalContent: {
      backgroundColor: theme.colors.neutral.white,
    },
    modalHeader: {
      borderBottomColor: theme.colors.neutral.mediumGray,
    },
    option: {
      borderBottomColor: theme.colors.neutral.lightGray,
    },
    arrowDown: {
      borderTopColor: theme.colors.neutral.darkGray,
    },
    checkmark: {
      borderColor: theme.colors.primary.secondary,
    },
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Typography variant="bodySecondary" color={theme.colors.neutral.black} style={[styles.label, labelStyle]}>
          {label}
        </Typography>
      )}

      <TouchableOpacity
        style={[
          styles.select,
          dynamicStyles.select,
          { borderColor: selectBorderColor },
          disabled && styles.disabled,
          selectStyle,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Typography
          variant="body"
          color={
            selectedOption
              ? theme.colors.neutral.black
              : theme.colors.neutral.darkGray
          }
          style={styles.selectedText}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Typography>

        <View style={styles.arrow}>
          <View style={[styles.arrowDown, dynamicStyles.arrowDown]} />
        </View>
      </TouchableOpacity>

      {error && (
        <Typography
          variant="small"
          color={theme.colors.status.error}
          style={styles.errorText}
        >
          {error}
        </Typography>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, dynamicStyles.modalContent]}>
            <View style={[styles.modalHeader, dynamicStyles.modalHeader]}>
              <Typography variant="h4" color={theme.colors.neutral.black}>{label || placeholder}</Typography>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Typography
                  variant="body"
                  color={theme.colors.primary.secondary}
                >
                  Fechar
                </Typography>
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, dynamicStyles.option, optionStyle]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Typography
                    variant="body"
                    color={item.value === selectedValue ? theme.colors.primary.secondary : theme.colors.neutral.black}
                    style={[
                      optionTextStyle,
                      item.value === selectedValue && styles.selectedOption,
                    ]}
                  >
                    {item.label}
                  </Typography>
                  {item.value === selectedValue && (
                    <View style={[styles.checkmark, dynamicStyles.checkmark]} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  select: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    height: 48,
  },
  disabled: {
    opacity: 0.7,
  },
  selectedText: {
    flex: 1,
  },
  arrow: {
    width: 12,
    height: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowDown: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  errorText: {
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxHeight: "70%",
    borderRadius: 8,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  selectedOption: {
    fontWeight: "600",
  },
  checkmark: {
    width: 6,
    height: 12,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    transform: [{ rotate: "45deg" }],
  },
});

export default Select;
