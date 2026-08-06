import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../lib/theme';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'outline';
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, loading, variant = 'primary', disabled, style, ...props }: ButtonProps) {
  const isOutline = variant === 'outline';
  return (
    <Pressable
      disabled={disabled || loading}
      style={[styles.base, isOutline ? styles.outline : styles.primary, (disabled || loading) && styles.disabled, style]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.brand800 : colors.white} />
      ) : (
        <Text style={isOutline ? styles.outlineLabel : styles.primaryLabel}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: { backgroundColor: colors.brand800 },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.brand200 },
  disabled: { opacity: 0.5 },
  primaryLabel: { color: colors.white, fontWeight: '600', fontSize: 15 },
  outlineLabel: { color: colors.brand800, fontWeight: '600', fontSize: 15 },
});
