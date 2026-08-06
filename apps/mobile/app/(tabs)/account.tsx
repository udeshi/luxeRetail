import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useLogout } from '@org/api-client';
import { Button } from '../../src/components/button';
import { colors } from '../../src/lib/theme';
import { useSessionStore } from '../../src/lib/session-store';

export default function AccountScreen() {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const isAuthenticated = useSessionStore((s) => s.status === 'authenticated');
  const clearSession = useSessionStore((s) => s.clearSession);
  const logout = useLogout();

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.title}>Welcome to LuxeRetail</Text>
        <Text style={styles.subtitle}>Sign in to shop, track orders, and check out faster.</Text>
        <Button label="Sign in" style={{ marginTop: 20, width: '100%' }} onPress={() => router.push('/login')} />
        <Button label="Create account" variant="outline" style={{ marginTop: 12, width: '100%' }} onPress={() => router.push('/register')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <View style={styles.card}>
        <Text style={styles.name}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>
      <Button
        label="Sign out"
        variant="outline"
        style={{ marginTop: 24 }}
        onPress={() => logout.mutate(undefined, { onSettled: () => clearSession() })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface, paddingHorizontal: 16, paddingTop: 8 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, padding: 32 },
  title: { fontSize: 22, fontWeight: '700', color: colors.brand900, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.brand600, textAlign: 'center', marginTop: 8 },
  card: { marginTop: 20, padding: 16, borderRadius: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.brand100 },
  name: { fontSize: 16, fontWeight: '600', color: colors.brand900 },
  email: { fontSize: 13, color: colors.brand400, marginTop: 4 },
});
