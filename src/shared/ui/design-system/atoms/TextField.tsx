import { useState } from 'react';
import { StyleSheet, TextInput, type KeyboardTypeOptions } from 'react-native';

import { Colors, FontSize, Fonts, Radius } from '@/shared/ui/theme';

interface TextFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  hasError?: boolean;
  testID?: string;
}

export const TextField = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  multiline,
  hasError,
  testID,
}: TextFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      multiline={multiline}
      testID={testID}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={[
        styles.field,
        multiline && styles.multiline,
        isFocused && styles.focused,
        hasError && styles.error,
      ]}
      placeholderTextColor={Colors.light.textSecondary}
    />
  );
};

const styles = StyleSheet.create({
  field: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: Colors.light.backgroundElement,
    fontFamily: Fonts.ui,
    fontSize: FontSize.body,
    color: Colors.light.text,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  focused: {
    borderColor: Colors.light.primary,
  },
  error: {
    borderColor: Colors.light.overdue,
  },
});
