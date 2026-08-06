import { ActivityIndicator, FlatList, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart, useUpdateCartItemQuantity } from '@org/api-client';
import { formatPrice } from '@org/utils';
import { Button } from '../../src/components/button';
import { colors } from '../../src/lib/theme';
import { useSessionStore } from '../../src/lib/session-store';

export default function CartScreen() {
  const isAuthenticated = useSessionStore((s) => s.status === 'authenticated');
  const router = useRouter();
  const { data: cart, isPending } = useCart(isAuthenticated);
  const updateQuantity = useUpdateCartItemQuantity();

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.emptyText}>Sign in to view your cart.</Text>
        <Button label="Sign in" style={{ marginTop: 16 }} onPress={() => router.push('/login')} />
      </SafeAreaView>
    );
  }

  if (isPending) return <ActivityIndicator style={{ marginTop: 60 }} color={colors.brand800} />;

  if (!cart || cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.emptyText}>Your cart is empty.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.thumb}>
              {item.thumbnailUrl && <Image source={{ uri: item.thumbnailUrl }} style={{ width: '100%', height: '100%' }} />}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.itemName}>{item.productName}</Text>
              <Text style={styles.itemVariant}>{Object.values(item.variantAttributes).join(' / ')}</Text>
              <View style={styles.stepper}>
                <Text onPress={() => updateQuantity.mutate({ itemId: item.id, quantity: Math.max(0, item.quantity - 1) })} style={styles.stepperBtn}>
                  −
                </Text>
                <Text style={styles.stepperValue}>{item.quantity}</Text>
                <Text onPress={() => updateQuantity.mutate({ itemId: item.id, quantity: item.quantity + 1 })} style={styles.stepperBtn}>
                  +
                </Text>
              </View>
            </View>
            <Text style={styles.itemPrice}>{formatPrice(item.unitPriceCents * item.quantity, cart.currency)}</Text>
          </View>
        )}
      />
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatPrice(cart.subtotalCents, cart.currency)}</Text>
        </View>
        <Button label="Checkout" style={{ marginTop: 12 }} onPress={() => router.push('/(tabs)/orders')} />
        <Text style={styles.note}>Checkout on mobile continues via the storefront web checkout in this build.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface, paddingHorizontal: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, padding: 24 },
  title: { fontSize: 22, fontWeight: '700', color: colors.brand900, marginTop: 8, marginBottom: 12 },
  emptyText: { color: colors.brand400, fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.brand100 },
  thumb: { width: 64, height: 64, borderRadius: 12, backgroundColor: colors.brand50, overflow: 'hidden' },
  itemName: { fontSize: 14, fontWeight: '600', color: colors.brand900 },
  itemVariant: { fontSize: 12, color: colors.brand400, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '600', color: colors.brand900 },
  stepper: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 },
  stepperBtn: { fontSize: 16, color: colors.brand700, paddingHorizontal: 8 },
  stepperValue: { fontSize: 14, color: colors.brand900 },
  summary: { paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.brand100 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: colors.brand600 },
  summaryValue: { fontWeight: '600', color: colors.brand900 },
  note: { fontSize: 11, color: colors.brand400, marginTop: 10, textAlign: 'center' },
});
