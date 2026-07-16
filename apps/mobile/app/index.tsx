import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { hydrateMobileStorage, initMobileStorage } from "../src/storage/rnStorage";

initMobileStorage();

export default function Index() {
  const [ready, setReady] = useState(false);
  const [Root, setRoot] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      await hydrateMobileStorage();
      if (Platform.OS === "ios") {
        const mod = await import("../src/platforms/ios/App");
        if (alive) setRoot(() => mod.IOSApp);
      } else {
        const mod = await import("../src/platforms/android/App");
        if (alive) setRoot(() => mod.AndroidApp);
      }
      if (alive) setReady(true);
    })();
    return () => { alive = false; };
  }, []);

  if (!ready || !Root) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return <Root />;
}
