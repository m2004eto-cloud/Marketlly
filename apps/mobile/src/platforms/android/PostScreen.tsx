import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { authApi, listingsApi } from "@marketly/core";

type Props = { onBack: () => void; onCreated: (id: number) => void };

export function AndroidPostScreen({ onBack, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [busy, setBusy] = useState(false);
  const user = authApi.getSessionSync();

  const submit = async () => {
    if (title.trim().length < 8 || !Number(price)) {
      Alert.alert("Check fields", "Title (8+ chars) and price are required.");
      return;
    }
    setBusy(true);
    const res = await listingsApi.createListing({
      title: title.trim(),
      price: Number(price),
      location: "Dubai",
      category: "classifieds",
      img: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800",
      description: `${title.trim()} posted from Android app.`,
      ownerId: user?.id || "mobile-android",
      ownerName: user?.name || "Android user",
      role: user?.role || "customer",
    });
    setBusy(false);
    if (!res.ok) {
      Alert.alert("Error", res.error);
      return;
    }
    Alert.alert("Posted", res.data.status === "pending" ? "Pending review" : "Live now");
    onCreated(res.data.id);
  };

  return (
    <View style={styles.root}>
      <View style={styles.appBar}>
        <Pressable onPress={onBack}><Text style={styles.back}>←</Text></Pressable>
        <Text style={styles.title}>Post ad</Text>
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="What are you selling?" />
        <Text style={styles.label}>Price (AED)</Text>
        <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="0" />
        <Pressable style={[styles.btn, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy}>
          <Text style={styles.btnText}>{busy ? "Saving…" : "Publish"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFBFE" },
  appBar: { paddingTop: 48, paddingBottom: 14, paddingHorizontal: 16, backgroundColor: "#6750A4", flexDirection: "row", alignItems: "center", gap: 12 },
  back: { color: "#fff", fontSize: 22 },
  title: { color: "#fff", fontSize: 20, fontWeight: "600" },
  form: { padding: 20, gap: 8 },
  label: { marginTop: 8, fontWeight: "600", color: "#49454F" },
  input: { borderWidth: 1, borderColor: "#CAC4D0", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: "#fff" },
  btn: { marginTop: 20, backgroundColor: "#6750A4", borderRadius: 24, paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
});
