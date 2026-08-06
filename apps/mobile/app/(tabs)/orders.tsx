import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMyOrders } from '@org/api-client';
import { formatPrice } from '@org/utils';
import { Button } from '../../src/components/button';
import { colors } from '../../src/lib/theme';
import { useSessionStore } from '../../src/lib/session-store';

export default function OrdersScreen() {
  const isAuthenticated = useSessionStore((s) => s.status === 'authenticated');
  const router = useRouter();
  const { data, isPending } = useMyOrders({ page: 1, pageSize: 20 });

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.emptyText}>Sign in to see your order history.</Text>
        <Button label="Sign in" style={{ marginTop: 16 }} onPress={() => router.push('/login')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Order History</Text>
      {isPending ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.brand800} />
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>You haven't placed any orders yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View>
                <Text style={styles.orderId}>Order #{item.id.slice(0, 8)}</Text>
                <Text style={styles.orderMeta}>
                  {new Date(item.createdAt).toLocaleDateString()} · {item.itemCount} items · {item.status}
                </Text>
              </View>
              <Text style={styles.orderTotal}>{formatPrice(item.totalCents, item.currency)}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface, paddingHorizontal: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, padding: 24 },
  title: { fontSize: 22, fontWeight: '700', color: colors.brand900, marginTop: 8, marginBottom: 12 },
  emptyText: { color: colors.brand400, fontSize: 14, marginTop: 24, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.brand100,
  },
  orderId: { fontSize: 14, fontWeight: '600', color: colors.brand900 },
  orderMeta: { fontSize: 12, color: colors.brand400, marginTop: 2 },
  orderTotal: { fontSize: 14, fontWeight: '600', color: colors.brand900 },
});
