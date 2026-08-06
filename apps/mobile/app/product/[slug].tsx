import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAddCartItem, useProduct } from '@org/api-client';
import { formatPrice } from '@org/utils';
import { Button } from '../../src/components/button';
import { colors } from '../../src/lib/theme';
import { useSessionStore } from '../../src/lib/session-store';

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: product, isPending } = useProduct(slug);
  const isAuthenticated = useSessionStore((s) => s.status === 'authenticated');
  const router = useRouter();
  const addItem = useAddCartItem();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  if (isPending) return <ActivityIndicator style={{ marginTop: 60 }} color={colors.brand800} />;
  if (!product) return <Text style={styles.notFound}>Product not found.</Text>;

  const variant = product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.imageWrap}>
        {product.images[0] && <Image source={{ uri: product.images[0].url }} style={styles.image} resizeMode="cover" />}
      </View>
      <View style={{ padding: 16 }}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{formatPrice(variant?.priceCents ?? product.basePriceCents, product.currency)}</Text>
        <Text style={styles.description}>{product.description}</Text>

        {product.variants.length > 1 && (
          <View style={styles.variantsRow}>
            {product.variants.map((v) => {
              const label = Object.values(v.attributes).join(' / ');
              const isSelected = (selectedVariantId ?? product.variants[0].id) === v.id;
              return (
                <Pressable
                  key={v.id}
                  onPress={() => setSelectedVariantId(v.id)}
                  disabled={v.inventoryQty === 0}
                  style={[styles.variantChip, isSelected && styles.variantChipActive, v.inventoryQty === 0 && { opacity: 0.4 }]}
                >
                  <Text style={[styles.variantLabel, isSelected && styles.variantLabelActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Button
          label={variant && variant.inventoryQty === 0 ? 'Out of stock' : 'Add to Cart'}
          loading={addItem.isPending}
          disabled={!variant || variant.inventoryQty === 0}
          style={{ marginTop: 24 }}
          onPress={() => {
            if (!isAuthenticated) {
              router.push('/login');
              return;
            }
            if (variant) addItem.mutate({ productVariantId: variant.id, quantity: 1 });
          }}
        />
        {addItem.isSuccess && <Text style={styles.addedText}>Added to your cart.</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  notFound: { textAlign: 'center', marginTop: 60, color: colors.brand400 },
  imageWrap: { aspectRatio: 1, backgroundColor: colors.brand50 },
  image: { width: '100%', height: '100%' },
  name: { fontSize: 20, fontWeight: '700', color: colors.brand900 },
  price: { fontSize: 16, color: colors.brand600, marginTop: 4 },
  description: { fontSize: 14, color: colors.brand600, lineHeight: 20, marginTop: 16 },
  variantsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20 },
  variantChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.brand200 },
  variantChipActive: { backgroundColor: colors.brand800, borderColor: colors.brand800 },
  variantLabel: { fontSize: 13, fontWeight: '500', color: colors.brand700 },
  variantLabelActive: { color: colors.white },
  addedText: { marginTop: 10, fontSize: 13, color: colors.brand600 },
});
