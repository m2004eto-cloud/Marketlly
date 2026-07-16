import { FlatList, Pressable, StyleSheet, Text, View, Image } from "react-native";
import { useListings } from "../../shared/useListings";
import { useCmsValue } from "../../shared/useCms";

type Props = {
  onOpen: (id: number) => void;
  onBrowse: () => void;
};

export function IOSHomeScreen({ onOpen, onBrowse }: Props) {
  const { listings, loading } = useListings();
  const hero = useCmsValue("landing.heroTitle", "The best place to buy & sell in the UAE");

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.brand}>Marketly</Text>
        <Text style={styles.hero} numberOfLines={3}>{hero}</Text>
        <Pressable style={styles.cta} onPress={onBrowse}>
          <Text style={styles.ctaText}>Browse listings</Text>
        </Pressable>
      </View>
      {loading ? (
        <Text style={styles.muted}>Loading…</Text>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => onOpen(item.id)}>
              <Image source={{ uri: item.img }} style={styles.image} />
              <View style={styles.body}>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.price}>AED {item.price.toLocaleString()}</Text>
                <Text style={styles.meta}>{item.location}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F2F7" },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: "#fff" },
  brand: { fontSize: 28, fontWeight: "700", color: "#111" },
  hero: { marginTop: 8, fontSize: 15, color: "#555", lineHeight: 21 },
  cta: { marginTop: 14, alignSelf: "flex-start", backgroundColor: "#007AFF", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  ctaText: { color: "#fff", fontWeight: "600" },
  muted: { padding: 20, color: "#888" },
  card: { backgroundColor: "#fff", borderRadius: 16, overflow: "hidden" },
  image: { width: "100%", height: 140 },
  body: { padding: 12 },
  title: { fontSize: 16, fontWeight: "600", color: "#111" },
  price: { marginTop: 4, fontSize: 15, fontWeight: "600", color: "#007AFF" },
  meta: { marginTop: 2, fontSize: 12, color: "#888" },
});
