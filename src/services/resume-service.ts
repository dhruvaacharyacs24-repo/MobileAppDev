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

  uploadToPdfCo: async (
    file: ResumeAsset
  ): Promise<string> => {
    const presignedResponse = await axios.get(
      "https://api.pdf.co/v1/file/upload/get-presigned-url",
      {
        params: {
          name: file.name,
        },
        headers: {
          "x-api-key": env.EXPO_PUBLIC_PDFCO_API_KEY,
        },
      }
    );

    const presignedUrl =
      presignedResponse.data?.presignedUrl;

    const uploadedFileUrl =
      presignedResponse.data?.url;

    if (!presignedUrl || !uploadedFileUrl) {
      throw new Error(
        "Failed to get PDF.co upload URL"
      );
    }

    const fileResponse = await fetch(file.uri);

    const blob = await fileResponse.blob();

    const uploadResponse = await fetch(
      presignedUrl,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/pdf",
        },
        body: blob,
      }
    );

    if (!uploadResponse.ok) {
      throw new Error(
        "Failed to upload PDF to PDF.co"
      );
    }

    return uploadedFileUrl;
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

    if (!data?.url) {
      throw new Error(
        "PDF.co text extraction failed"
      );
    }

    const textResponse = await axios.get(
      data.url
    );

    return textResponse.data;
  },

  parseResume: async (
  resumeText: string
): Promise<ParsedResume> => {
  const trimmedResume = resumeText.slice(0, 12000);

  const prompt = `
You are an expert resume parser.

Return ONLY valid JSON.

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
- resumeQuality between 0 and 100
- nonsense resumes = 0
- extract technical skills
- infer interests
- infer career path
- summary max 120 words
- return only JSON

Resume:

${trimmedResume}
`;

  try {
    console.log("[RESUME] Trying Gemini");

    const { data } =
      await geminiClient.post(
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
            responseMimeType:
              "application/json",
          },
        }
      );

    const raw =
      data?.candidates?.[0]?.content
        ?.parts?.[0]?.text;

    if (!raw) {
      throw new Error(
        "Gemini returned empty response"
      );
    }

    console.log(
      "[RESUME] Parsed using Gemini"
    );

    return JSON.parse(raw) as ParsedResume;
  } catch (error: any) {
    const status =
      error?.response?.status;

    if (
      status !== 429 ||
      !env.EXPO_PUBLIC_GROQ_API_KEY
    ) {
      throw error;
    }

    console.log(
      "[RESUME] Gemini rate limited. Falling back to Groq."
    );

    const groqResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model:
          "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        response_format: {
          type: "json_object",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${env.EXPO_PUBLIC_GROQ_API_KEY}`,
          "Content-Type":
            "application/json",
        },
      }
    );

    const raw =
      groqResponse.data?.choices?.[0]
        ?.message?.content;

    if (!raw) {
      throw new Error(
        "Groq returned empty response"
      );
    }

    console.log(
      "[RESUME] Parsed using Groq"
    );

    return JSON.parse(raw) as ParsedResume;
  }
},

  processResume: async (
    file: ResumeAsset
  ): Promise<ParsedResume> => {
    const uploadedUrl =
      await resumeService.uploadToPdfCo(
        file
      );

    const extractedText =
      await resumeService.extractTextFromPdf(
        uploadedUrl
      );

    return await resumeService.parseResume(
      extractedText
    );
  },
};