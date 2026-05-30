import * as DocumentPicker from "expo-document-picker";

import { env } from "@/lib/env";

export type ParsedResume = {
  full_name: string;
  education: string;
  skills: string[];
  interests: string[];
  projects: string[];
  certifications: string[];
  preferred_career_path: string;
  resume_summary: string;
  resume_quality: number;
  resume_issues: string[];
};

export const resumeService = {
  pickResume: async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0];
  },
};