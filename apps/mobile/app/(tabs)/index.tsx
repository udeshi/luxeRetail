import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useCategories, useProducts } from '@org/api-client';
import { ProductCard } from '../../src/components/product-card';
import { colors } from '../../src/lib/theme';

export default function BrowseScreen() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const { data: categories } = useCategories();
  const { data, isPending } = useProducts({ categorySlug: category, search: search || undefined, page: 1, pageSize: 24 });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>LuxeRetail</Text>
      <TextInput
        style={styles.search}
        placeholder="Search products..."
        placeholderTextColor={colors.brand200}
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.chipsRow}>
        <Chip label="All Items" active={!category} onPress={() => setCategory(undefined)} />
        {categories?.map((c) => (
          <Chip key={c.id} label={c.name} active={category === c.slug} onPress={() => setCategory(c.slug)} />
        ))}
      </View>

      {isPending ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.brand800} />
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => <ProductCard product={item} />}
          ListEmptyComponent={<Text style={styles.empty}>No products found.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface, paddingHorizontal: 16 },
  title: { fontSize: 22, fontWeight: '700', color: colors.brand900, marginTop: 8 },
  search: {
    marginTop: 12,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.brand100,
    paddingHorizontal: 14,
    color: colors.brand900,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: colors.brand50 },
  chipActive: { backgroundColor: colors.brand800 },
  chipLabel: { fontSize: 13, fontWeight: '500', color: colors.brand700 },
  chipLabelActive: { color: colors.white },
  grid: { paddingTop: 12, paddingBottom: 24 },
  empty: { textAlign: 'center', marginTop: 40, color: colors.brand400 },
});
