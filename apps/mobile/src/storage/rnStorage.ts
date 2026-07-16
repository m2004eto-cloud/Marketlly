import AsyncStorage from "@react-native-async-storage/async-storage";
import { setStorageAdapter } from "@marketly/core";

const memory = new Map<string, string>();

/** Sync-ish adapter: caches AsyncStorage in memory for core's sync APIs */
export function initMobileStorage() {
  setStorageAdapter({
    getItem(key) {
      return memory.get(key) ?? null;
    },
    setItem(key, value) {
      memory.set(key, value);
      void AsyncStorage.setItem(key, value);
    },
    removeItem(key) {
      memory.delete(key);
      void AsyncStorage.removeItem(key);
    },
  });
}

export async function hydrateMobileStorage() {
  const keys = [
    "marketly_listings_v1",
    "marketly_session_v1",
    "marketly_cms_v1",
  ];
  await Promise.all(
    keys.map(async (key) => {
      const v = await AsyncStorage.getItem(key);
      if (v != null) memory.set(key, v);
    }),
  );
}
