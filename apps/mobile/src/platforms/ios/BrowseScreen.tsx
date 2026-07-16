import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useListings } from "../../shared/useListings";

type Props = { onOpen: (id: number) => void; onBack: () => void };

export function IOSBrowseScreen({ onOpen, onBack }: Props) {
  const { listings } = useListings();
  return (
    <View style={styles.root}>
      <View style={styles.bar}>
        <Pressable onPress={onBack}><Text style={styles.link}>‹ Home</Text></Pressable>
        <Text style={styles.title}>Browse</Text>
        <View style={{ width: 48 }} />
      </View>
      <FlatList
        data={listings}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 12, gap: 10 }}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => onOpen(item.id)}>
            <Image source={{ uri: item.img }} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.price}>AED {item.price.toLocaleString()}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F2F7" },
  bar: { paddingTop: 54, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: "#fff", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  link: { color: "#007AFF", fontSize: 17, width: 64 },
  title: { fontSize: 17, fontWeight: "600" },
  row: { flexDirection: "row", gap: 12, backgroundColor: "#fff", borderRadius: 14, padding: 10 },
  thumb: { width: 72, height: 72, borderRadius: 10 },
  name: { fontSize: 15, fontWeight: "600", color: "#111" },
  price: { marginTop: 4, color: "#007AFF", fontWeight: "600" },
});
