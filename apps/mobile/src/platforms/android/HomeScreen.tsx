import { FlatList, Pressable, StyleSheet, Text, View, Image } from "react-native";
import { useListings } from "../../shared/useListings";
import { useCmsValue } from "../../shared/useCms";

type Props = {
  onOpen: (id: number) => void;
  onBrowse: () => void;
  onPost: () => void;
};

export function AndroidHomeScreen({ onOpen, onBrowse, onPost }: Props) {
  const { listings, loading } = useListings();
  const hero = useCmsValue("landing.heroTitle", "The best place to buy & sell in the UAE");

  return (
    <View style={styles.root}>
      <View style={styles.appBar}>
        <Text style={styles.brand}>Marketly</Text>
        <Text style={styles.hero} numberOfLines={3}>{hero}</Text>
      </View>
      {loading ? (
        <Text style={styles.muted}>Loading…</Text>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 88, gap: 12 }}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => onOpen(item.id)} android_ripple={{ color: "#E8DEF8" }}>
              <Image source={{ uri: item.img }} style={styles.image} />
              <View style={styles.body}>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.price}>AED {item.price.toLocaleString()}</Text>
                <Text style={styles.meta}>{item.location} · {item.category}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
      <Pressable style={styles.fab} onPress={onPost}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
      <View style={styles.nav}>
        <Text style={[styles.navItem, styles.navActive]}>Home</Text>
        <Pressable onPress={onBrowse}><Text style={styles.navItem}>Browse</Text></Pressable>
        <Pressable onPress={onPost}><Text style={styles.navItem}>Post</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFBFE" },
  appBar: { paddingTop: 48, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: "#6750A4" },
  brand: { fontSize: 22, fontWeight: "700", color: "#fff" },
  hero: { marginTop: 8, fontSize: 14, color: "rgba(255,255,255,0.9)", lineHeight: 20 },
  muted: { padding: 20, color: "#888" },
  card: { backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", elevation: 2 },
  image: { width: "100%", height: 140 },
  body: { padding: 12 },
  title: { fontSize: 16, fontWeight: "600", color: "#1C1B1F" },
  price: { marginTop: 4, fontSize: 15, fontWeight: "700", color: "#6750A4" },
  meta: { marginTop: 2, fontSize: 12, color: "#79747E" },
  fab: { position: "absolute", right: 20, bottom: 72, width: 56, height: 56, borderRadius: 16, backgroundColor: "#E8DEF8", alignItems: "center", justifyContent: "center", elevation: 4 },
  fabText: { fontSize: 28, color: "#21005D", marginTop: -2 },
  nav: { height: 56, borderTopWidth: 1, borderTopColor: "#E7E0EC", flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "#FFFBFE" },
  navItem: { fontSize: 12, color: "#49454F", fontWeight: "500" },
  navActive: { color: "#6750A4", fontWeight: "700" },
});
