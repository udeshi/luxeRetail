import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors } from '../lib/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function TextField({ label, error, style, ...props }: TextFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={colors.brand200}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '500', color: colors.brand800, marginBottom: 6 },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.brand100,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.brand900,
  },
  inputError: { borderColor: colors.red },
  error: { color: colors.red, fontSize: 12, marginTop: 4 },
});
