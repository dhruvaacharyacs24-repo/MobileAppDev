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
    console.log(
      "[GEMINI] API KEY EXISTS:",
      Boolean(env.EXPO_PUBLIC_GEMINI_API_KEY)
    );

    // #region agent log
    fetch(
      "http://127.0.0.1:7688/ingest/8e61f5bc-1219-4ad9-a432-ae08fa2ba365",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "501c1c",
        },
        body: JSON.stringify({
          sessionId: "501c1c",
          runId: "gemini-debug",
          hypothesisId: "H4",
          location: "ai-service.ts:analyze:start",
          message: "analysis invoked",
          data: {
            hasGeminiKey: Boolean(env.EXPO_PUBLIC_GEMINI_API_KEY),
            marketDemand: payload.market.demandScore,
            skillsCount: payload.skills.length,
          },
          timestamp: Date.now(),
        }),
      }
    ).catch(() => {});
    // #endregion

    if (!env.EXPO_PUBLIC_GEMINI_API_KEY) {
      console.log("[GEMINI] Missing API key. Using fallback.");
      return fallback(payload.market);
    }

    try {
      const prompt = `
Analyze this student profile against market demand.

Return ONLY valid JSON.

Required JSON shape:

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

      console.log(
        "[GEMINI] FULL RESPONSE:",
        JSON.stringify(data, null, 2)
      );

      const raw =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

      console.log("[GEMINI] RAW TEXT:", raw);

      if (!raw) {
        console.log("[GEMINI] Empty response. Using fallback.");
        return fallback(payload.market);
      }

      try {
        const parsed = JSON.parse(raw) as AiAnalysis;

        console.log(
          "[GEMINI] Parsed successfully:",
          parsed
        );

        // #region agent log
        fetch(
          "http://127.0.0.1:7688/ingest/8e61f5bc-1219-4ad9-a432-ae08fa2ba365",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Debug-Session-Id": "501c1c",
            },
            body: JSON.stringify({
              sessionId: "501c1c",
              runId: "gemini-debug",
              hypothesisId: "H4",
              location: "ai-service.ts:analyze:success",
              message: "gemini analysis parsed",
              data: {
                readinessScore: parsed.readinessScore,
                strengthsCount:
                  parsed.strengths?.length ?? 0,
              },
              timestamp: Date.now(),
            }),
          }
        ).catch(() => {});
        // #endregion

        return parsed;
      } catch (parseError) {
        console.error(
          "[GEMINI] JSON PARSE ERROR:",
          parseError
        );
        console.error("[GEMINI] RAW CONTENT:", raw);

        return fallback(payload.market);
      }
    } catch (error) {
      console.error("[GEMINI] REQUEST FAILED");

      if (axios.isAxiosError(error)) {
        console.error(
          "[GEMINI] STATUS:",
          error.response?.status
        );

        console.error(
          "[GEMINI] RESPONSE DATA:",
          error.response?.data
        );

        console.error(
          "[GEMINI] MESSAGE:",
          error.message
        );
      } else {
        console.error("[GEMINI] UNKNOWN ERROR:", error);
      }

      // #region agent log
      fetch(
        "http://127.0.0.1:7688/ingest/8e61f5bc-1219-4ad9-a432-ae08fa2ba365",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "501c1c",
          },
          body: JSON.stringify({
            sessionId: "501c1c",
            runId: "gemini-debug",
            hypothesisId: "H4",
            location: "ai-service.ts:analyze:catch",
            message: "gemini failed, fallback used",
            data: {
              marketDemand: payload.market.demandScore,
            },
            timestamp: Date.now(),
          }),
        }
      ).catch(() => {});
      // #endregion

      return fallback(payload.market);
    }
  },
};