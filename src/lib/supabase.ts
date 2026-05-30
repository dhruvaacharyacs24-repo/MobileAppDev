import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

const CHUNK_SIZE = 1800;
const META_SUFFIX = "__chunks";

const chunkKey = (key: string, index: number) => `${key}__${index}`;
const metaKey = (key: string) => `${key}${META_SUFFIX}`;

const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    const chunkCountRaw = await SecureStore.getItemAsync(metaKey(key));
    const chunkCount = chunkCountRaw ? Number(chunkCountRaw) : 0;

    if (!chunkCount) return SecureStore.getItemAsync(key);

    const parts = await Promise.all(
      Array.from({ length: chunkCount }, (_, i) => SecureStore.getItemAsync(chunkKey(key, i))),
    );
    if (parts.some((part) => part == null)) return null;
    return parts.join("");
  },
  setItem: async (key: string, value: string) => {
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      const oldCountRaw = await SecureStore.getItemAsync(metaKey(key));
      const oldCount = oldCountRaw ? Number(oldCountRaw) : 0;
      if (oldCount > 0) {
        await Promise.all(
          Array.from({ length: oldCount }, (_, i) => SecureStore.deleteItemAsync(chunkKey(key, i))),
        );
        await SecureStore.deleteItemAsync(metaKey(key));
      }
      return;
    }

    const chunks = Math.ceil(value.length / CHUNK_SIZE);
    await Promise.all(
      Array.from({ length: chunks }, (_, i) =>
        SecureStore.setItemAsync(chunkKey(key, i), value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)),
      ),
    );
    await SecureStore.setItemAsync(metaKey(key), String(chunks));
    await SecureStore.deleteItemAsync(key);
  },
  removeItem: async (key: string) => {
    const chunkCountRaw = await SecureStore.getItemAsync(metaKey(key));
    const chunkCount = chunkCountRaw ? Number(chunkCountRaw) : 0;

    await SecureStore.deleteItemAsync(key);
    if (chunkCount > 0) {
      await Promise.all(
        Array.from({ length: chunkCount }, (_, i) => SecureStore.deleteItemAsync(chunkKey(key, i))),
      );
      await SecureStore.deleteItemAsync(metaKey(key));
    }
  },
};

export const supabase = createClient(
  env.EXPO_PUBLIC_SUPABASE_URL,
  env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
