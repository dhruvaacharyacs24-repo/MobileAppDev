import * as DocumentPicker from "expo-document-picker";

export const pdfTest = {
  pick: async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) {
      console.log("PDF PICKER CANCELLED");
      return null;
    }

    console.log("PDF URI:", result.assets[0].uri);
    console.log("PDF NAME:", result.assets[0].name);
    console.log("PDF SIZE:", result.assets[0].size);

    return result.assets[0];
  },
};