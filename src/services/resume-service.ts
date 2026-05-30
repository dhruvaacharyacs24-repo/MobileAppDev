import axios from "axios";
import * as DocumentPicker from "expo-document-picker";

import { env } from "@/lib/env";
import { ParsedResume } from "@/types";

export type ResumeAsset = {
  uri: string;
  name: string;
  size?: number;
};

const geminiClient = axios.create({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/models",
});

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

  parseResume: async (
    resumeText: string
  ): Promise<ParsedResume> => {
    const prompt = `
You are an expert resume parser.

Analyze this resume and return ONLY valid JSON.

Required JSON:

{
  "full_name": "",
  "education": "",
  "skills": [],
  "interests": [],
  "projects": [],
  "certifications": [],
  "preferred_career_path": "",
  "resume_summary": "",
  "resumeQuality": 0,
  "resumeStrengths": [],
  "resumeIssues": []
}

Rules:

- resumeQuality must be between 0 and 100
- If resume content is nonsense, resumeQuality = 0
- Extract all technical skills
- Infer interests from projects and activities
- Infer career path from skills and projects
- Resume summary max 120 words
- Return ONLY JSON

Resume:

${resumeText}
`;

    const { data } = await geminiClient.post(
      `/gemini-flash-latest:generateContent?key=${env.EXPO_PUBLIC_GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }
    );

    const raw =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) {
      throw new Error("Gemini returned empty response");
    }

    return JSON.parse(raw) as ParsedResume;
  },

  extractTextFromPdf: async (
    fileUrl: string
  ): Promise<string> => {
    const { data } = await axios.post(
      "https://api.pdf.co/v1/pdf/convert/to/text",
      {
        url: fileUrl,
      },
      {
        headers: {
          "x-api-key": env.EXPO_PUBLIC_PDFCO_API_KEY,
        },
      }
    );

    const textUrl = data?.url;

    if (!textUrl) {
      throw new Error(
        "PDF.co did not return extracted text URL"
      );
    }

    const textResponse = await axios.get(textUrl);

    return textResponse.data;
  },
};