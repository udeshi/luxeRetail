import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginRequestSchema, type LoginRequest } from '@org/contracts';
import { useLogin } from '@org/api-client';
import { Button } from '../src/components/button';
import { ControlledTextField } from '../src/components/controlled-text-field';
import { colors } from '../src/lib/theme';
import { useSessionStore } from '../src/lib/session-store';

export default function LoginScreen() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const login = useLogin({
    onSuccess: (result) => {
      setSession(result.user, result.accessToken, result.refreshToken);
      router.back();
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({ resolver: zodResolver(LoginRequestSchema), defaultValues: { email: '', password: '' } });

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <ControlledTextField
          name="email"
          control={control}
          label="Email"
          error={errors.email?.message}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <ControlledTextField name="password" control={control} label="Password" error={errors.password?.message} secureTextEntry />
        {login.isError && <Text style={styles.error}>{login.error.message}</Text>}
        <Button label="Sign in" loading={login.isPending} style={{ marginTop: 8 }} onPress={handleSubmit((v) => login.mutate(v))} />
        <Text style={styles.hint}>Demo account: customer@luxeretail.dev / Password123!</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  error: { color: colors.red, fontSize: 13, marginBottom: 8 },
  hint: { fontSize: 12, color: colors.brand400, marginTop: 16, textAlign: 'center' },
});
