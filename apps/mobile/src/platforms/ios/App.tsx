import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { IOSHomeScreen } from "./HomeScreen";
import { IOSBrowseScreen } from "./BrowseScreen";
import { IOSDetailScreen } from "./DetailScreen";

type Screen = { name: "home" } | { name: "browse" } | { name: "detail"; id: number };

/** iOS-only UI tree (HIG). Do not import from platforms/android. */
export function IOSApp() {
  const [screen, setScreen] = useState<Screen>({ name: "home" });

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {screen.name === "home" && (
        <IOSHomeScreen
          onBrowse={() => setScreen({ name: "browse" })}
          onOpen={(id) => setScreen({ name: "detail", id })}
        />
      )}
      {screen.name === "browse" && (
        <IOSBrowseScreen
          onBack={() => setScreen({ name: "home" })}
          onOpen={(id) => setScreen({ name: "detail", id })}
        />
      )}
      {screen.name === "detail" && (
        <IOSDetailScreen id={screen.id} onBack={() => setScreen({ name: "browse" })} />
      )}
    </SafeAreaProvider>
  );
}
