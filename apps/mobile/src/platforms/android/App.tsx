import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AndroidHomeScreen } from "./HomeScreen";
import { AndroidBrowseScreen } from "./BrowseScreen";
import { AndroidDetailScreen } from "./DetailScreen";
import { AndroidPostScreen } from "./PostScreen";

type Screen =
  | { name: "home" }
  | { name: "browse" }
  | { name: "detail"; id: number }
  | { name: "post" };

/** Android-only UI tree (Material You). Do not import from platforms/ios. */
export function AndroidApp() {
  const [screen, setScreen] = useState<Screen>({ name: "home" });

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {screen.name === "home" && (
        <AndroidHomeScreen
          onBrowse={() => setScreen({ name: "browse" })}
          onPost={() => setScreen({ name: "post" })}
          onOpen={(id) => setScreen({ name: "detail", id })}
        />
      )}
      {screen.name === "browse" && (
        <AndroidBrowseScreen
          onBack={() => setScreen({ name: "home" })}
          onOpen={(id) => setScreen({ name: "detail", id })}
        />
      )}
      {screen.name === "detail" && (
        <AndroidDetailScreen id={screen.id} onBack={() => setScreen({ name: "browse" })} />
      )}
      {screen.name === "post" && (
        <AndroidPostScreen
          onBack={() => setScreen({ name: "home" })}
          onCreated={(id) => setScreen({ name: "detail", id })}
        />
      )}
    </SafeAreaProvider>
  );
}
