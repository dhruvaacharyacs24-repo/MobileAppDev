import * as DocumentPicker from "expo-document-picker";

export type ResumeAsset = {
  uri: string;
  name: string;
  size?: number;
};

export const resumeService = {
  pickResume: async (): Promise<ResumeAsset | null> => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) {
      return null;
    }

    return {
      uri: result.assets[0].uri,
      name: result.assets[0].name,
      size: result.assets[0].size,
    };
  },
};