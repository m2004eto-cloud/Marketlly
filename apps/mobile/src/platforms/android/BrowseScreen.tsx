import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useListings } from "../../shared/useListings";

type Props = { onOpen: (id: number) => void; onBack: () => void };

export function AndroidBrowseScreen({ onOpen, onBack }: Props) {
  const { listings } = useListings();
  return (
    <View style={styles.root}>
      <View style={styles.appBar}>
        <Pressable onPress={onBack}><Text style={styles.back}>←</Text></Pressable>
        <Text style={styles.title}>Browse</Text>
      </View>
      <FlatList
        data={listings}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 12, gap: 10 }}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => onOpen(item.id)} android_ripple={{ color: "#E8DEF8" }}>
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
  root: { flex: 1, backgroundColor: "#FFFBFE" },
  appBar: { paddingTop: 48, paddingBottom: 14, paddingHorizontal: 16, backgroundColor: "#6750A4", flexDirection: "row", alignItems: "center", gap: 12 },
  back: { color: "#fff", fontSize: 22, width: 28 },
  title: { color: "#fff", fontSize: 20, fontWeight: "600" },
  row: { flexDirection: "row", gap: 12, backgroundColor: "#fff", borderRadius: 12, padding: 10, elevation: 1 },
  thumb: { width: 76, height: 76, borderRadius: 8 },
  name: { fontSize: 15, fontWeight: "600", color: "#1C1B1F" },
  price: { marginTop: 4, color: "#6750A4", fontWeight: "700" },
});
