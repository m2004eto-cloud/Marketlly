import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { listingsApi, type Listing } from "@marketly/core";

type Props = { id: number; onBack: () => void };

export function AndroidDetailScreen({ id, onBack }: Props) {
  const [listing, setListing] = useState<Listing | null>(null);
  useEffect(() => {
    listingsApi.getListing(id).then((res) => { if (res.ok) setListing(res.data); });
  }, [id]);

  if (!listing) {
    return (
      <View style={styles.root}>
        <Pressable onPress={onBack} style={{ padding: 20 }}><Text>← Back</Text></Pressable>
        <Text style={{ padding: 20 }}>Not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root}>
      <View style={styles.appBar}>
        <Pressable onPress={onBack}><Text style={styles.back}>←</Text></Pressable>
        <Text style={styles.barTitle} numberOfLines={1}>{listing.title}</Text>
      </View>
      <Image source={{ uri: listing.img }} style={styles.hero} />
      <View style={styles.body}>
        <Text style={styles.price}>AED {listing.price.toLocaleString()}</Text>
        <Text style={styles.meta}>{listing.location} · {listing.category}</Text>
        <Text style={styles.desc}>{listing.description}</Text>
        <Pressable style={styles.btn}>
          <Text style={styles.btnText}>Contact seller</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFBFE" },
  appBar: { paddingTop: 48, paddingBottom: 14, paddingHorizontal: 16, backgroundColor: "#6750A4", flexDirection: "row", alignItems: "center", gap: 12 },
  back: { color: "#fff", fontSize: 22 },
  barTitle: { color: "#fff", fontSize: 18, fontWeight: "600", flex: 1 },
  hero: { width: "100%", height: 240 },
  body: { padding: 20 },
  price: { fontSize: 22, fontWeight: "700", color: "#6750A4" },
  meta: { marginTop: 6, color: "#79747E" },
  desc: { marginTop: 16, fontSize: 15, lineHeight: 22, color: "#1C1B1F" },
  btn: { marginTop: 24, backgroundColor: "#6750A4", borderRadius: 24, paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
});
