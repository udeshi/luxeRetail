import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { formatPrice } from '@org/utils';
import type { ProductSummary } from '@org/contracts';
import { colors } from '../lib/theme';

export function ProductCard({ product }: { product: ProductSummary }) {
  const router = useRouter();
  return (
    <Pressable style={styles.card} onPress={() => router.push(`/product/${product.slug}`)}>
      <View style={styles.imageWrap}>
        {product.thumbnailUrl ? (
          <Image source={{ uri: product.thumbnailUrl }} style={styles.image} resizeMode="cover" />
        ) : null}
      </View>
      <Text numberOfLines={1} style={styles.name}>
        {product.name}
      </Text>
      <Text style={styles.price}>{formatPrice(product.basePriceCents, product.currency)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: '48%', marginBottom: 20 },
  imageWrap: { aspectRatio: 0.8, borderRadius: 16, backgroundColor: colors.brand50, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  name: { marginTop: 8, fontSize: 14, fontWeight: '500', color: colors.brand900 },
  price: { marginTop: 2, fontSize: 13, color: colors.brand600 },
});
