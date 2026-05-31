import axios from "axios";

import { env } from "@/lib/env";
import { AiAnalysis, MarketTrend, Profile } from "@/types";

type Payload = {
  profile: Profile;
  skills: string[];
  market: MarketTrend;
};

const geminiClient = axios.create({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/models",
});

const fallback = (market: MarketTrend): AiAnalysis => ({
  readinessScore: Math.max(40, market.demandScore - 15),
  strengths: ["Clear career direction", "Relevant foundational profile data"],
  weaknesses: ["Projects need stronger impact metrics"],
  missingSkills: market.topSkills.slice(0, 3),
  roadmap: [
    "Build 2 portfolio projects",
    "Practice interview questions weekly",
    "Update resume with quantified outcomes",
  ],
  recommendations: [
    "Take one advanced course this month",
    "Contribute to open-source twice per month",
  ],
  atsFeedback: [
    "Add action verbs",
    "Include role-specific keywords from market demand",
    "Keep resume to one page with measurable outcomes",
  ],
});

export const aiService = {
  analyze: async (payload: Payload): Promise<AiAnalysis> => {
    if (!env.EXPO_PUBLIC_GEMINI_API_KEY) {
      return fallback(payload.market);
    }

    const prompt = `
Analyze this student profile against market demand.

Return ONLY valid JSON.

{
  "readinessScore": number,
  "strengths": string[],
  "weaknesses": string[],
  "missingSkills": string[],
  "roadmap": string[],
  "recommendations": string[],
  "atsFeedback": string[]
}

Profile:
${JSON.stringify(payload.profile)}

Skills:
${payload.skills.join(", ")}

Market:
${JSON.stringify(payload.market)}

Rules:
- readinessScore must be between 0 and 100
- max 5 items per array
- personalized recommendations
- concise professional language
`;

    try {
      console.log("[AI] Trying Gemini");

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
            temperature: 0.4,
            responseMimeType: "application/json",
          },
        }
      );

      const raw =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!raw) {
        throw new Error("Gemini returned empty response");
      }

      console.log("[AI] Analysis generated with Gemini");

      return JSON.parse(raw) as AiAnalysis;
    } catch (error: any) {
      const status = error?.response?.status;

      if (
        status === 429 &&
        env.EXPO_PUBLIC_GROQ_API_KEY
      ) {
        try {
          console.log(
            "[AI] Gemini rate limited. Switching to Groq."
          );

          const groqResponse = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              model: "llama-3.3-70b-versatile",
              messages: [
                {
                  role: "user",
                  content: prompt,
                },
              ],
              temperature: 0.4,
              response_format: {
                type: "json_object",
              },
            },
            {
              headers: {
                Authorization: `Bearer ${env.EXPO_PUBLIC_GROQ_API_KEY}`,
                "Content-Type": "application/json",
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
            "[AI] Analysis generated with Groq"
          );

          return JSON.parse(raw) as AiAnalysis;
        } catch (groqError) {
          console.log(
            "[AI] Groq failed. Using fallback."
          );

          return fallback(payload.market);
        }
      }

      console.log(
        "[AI] Gemini failed. Using fallback."
      );

      return fallback(payload.market);
    }
  },
};