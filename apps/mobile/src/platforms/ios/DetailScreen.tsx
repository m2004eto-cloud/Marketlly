import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { listingsApi, type Listing } from "@marketly/core";

type Props = { id: number; onBack: () => void };

export function IOSDetailScreen({ id, onBack }: Props) {
  const [listing, setListing] = useState<Listing | null>(null);
  useEffect(() => {
    listingsApi.getListing(id).then((res) => { if (res.ok) setListing(res.data); });
  }, [id]);

  if (!listing) {
    return (
      <View style={styles.root}>
        <Pressable onPress={onBack} style={{ padding: 20 }}><Text style={styles.link}>‹ Back</Text></Pressable>
        <Text style={{ padding: 20 }}>Not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root}>
      <Image source={{ uri: listing.img }} style={styles.hero} />
      <Pressable onPress={onBack} style={styles.back}><Text style={styles.link}>‹ Back</Text></Pressable>
      <View style={styles.body}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.price}>AED {listing.price.toLocaleString()}</Text>
        <Text style={styles.meta}>{listing.location} · {listing.category}</Text>
        <Text style={styles.desc}>{listing.description}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  hero: { width: "100%", height: 260 },
  back: { position: "absolute", top: 50, left: 12, backgroundColor: "rgba(255,255,255,0.9)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  link: { color: "#007AFF", fontSize: 16 },
  body: { padding: 20 },
  title: { fontSize: 22, fontWeight: "700" },
  price: { marginTop: 8, fontSize: 20, fontWeight: "700", color: "#007AFF" },
  meta: { marginTop: 6, color: "#888" },
  desc: { marginTop: 16, fontSize: 15, lineHeight: 22, color: "#333" },
});
