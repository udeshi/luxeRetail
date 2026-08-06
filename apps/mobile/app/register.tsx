import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterRequestSchema, type RegisterRequest } from '@org/contracts';
import { useRegister } from '@org/api-client';
import { Button } from '../src/components/button';
import { ControlledTextField } from '../src/components/controlled-text-field';
import { colors } from '../src/lib/theme';
import { useSessionStore } from '../src/lib/session-store';

export default function RegisterScreen() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const registerAccount = useRegister({
    onSuccess: (result) => {
      setSession(result.user, result.accessToken, result.refreshToken);
      router.back();
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(RegisterRequestSchema),
    defaultValues: { email: '', password: '', firstName: '', lastName: '' },
  });

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <ControlledTextField name="firstName" control={control} label="First name" error={errors.firstName?.message} />
        <ControlledTextField name="lastName" control={control} label="Last name" error={errors.lastName?.message} />
        <ControlledTextField
          name="email"
          control={control}
          label="Email"
          error={errors.email?.message}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <ControlledTextField name="password" control={control} label="Password" error={errors.password?.message} secureTextEntry />
        {registerAccount.isError && <Text style={styles.error}>{registerAccount.error.message}</Text>}
        <Button
          label="Create account"
          loading={registerAccount.isPending}
          style={{ marginTop: 8 }}
          onPress={handleSubmit((v) => registerAccount.mutate(v))}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  error: { color: colors.red, fontSize: 13, marginBottom: 8 },
});
