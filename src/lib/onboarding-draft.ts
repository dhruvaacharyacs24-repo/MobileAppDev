import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "skillsync_onboarding_draft";

export const onboardingDraft = {
  save: async (data: Record<string, string>) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error("Failed to save onboarding draft", error);
    }
  },

  load: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);

      if (!data) {
        return null;
      }

      return JSON.parse(data);
    } catch (error) {
      console.error("Failed to load onboarding draft", error);
      return null;
    }
  },

  clear: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear onboarding draft", error);
    }
  },
};