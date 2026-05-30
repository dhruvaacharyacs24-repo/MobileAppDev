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
  roadmap: ["Build 2 portfolio projects", "Practice interview questions weekly", "Update resume with quantified outcomes"],
  recommendations: ["Take one advanced course this month", "Contribute to open-source twice per month"],
  atsFeedback: ["Add action verbs", "Include role-specific keywords from market demand", "Keep resume to one page with measurable outcomes"],
});

export const aiService = {
  analyze: async (payload: Payload): Promise<AiAnalysis> => {
    // #region agent log
    fetch("http://127.0.0.1:7688/ingest/8e61f5bc-1219-4ad9-a432-ae08fa2ba365",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"501c1c"},body:JSON.stringify({sessionId:"501c1c",runId:"pre-fix",hypothesisId:"H4",location:"ai-service.ts:analyze:start",message:"analysis invoked",data:{hasGeminiKey:Boolean(env.EXPO_PUBLIC_GEMINI_API_KEY),marketDemand:payload.market.demandScore,skillsCount:payload.skills.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!env.EXPO_PUBLIC_GEMINI_API_KEY) return fallback(payload.market);

    try {
      const prompt = `Analyze this student profile against market trend and return strict JSON with keys: readinessScore, strengths, weaknesses, missingSkills, roadmap, recommendations, atsFeedback.
Profile: ${JSON.stringify(payload.profile)}
Skills: ${payload.skills.join(", ")}
Market: ${JSON.stringify(payload.market)}
Rules: readinessScore 0-100, max 5 items in each array, concise professional actionable text.`;

      const { data } = await geminiClient.post(
        `/gemini-1.5-flash:generateContent?key=${env.EXPO_PUBLIC_GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, responseMimeType: "application/json" },
        },
      );

      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) return fallback(payload.market);
      const parsed = JSON.parse(raw) as AiAnalysis;
      // #region agent log
      fetch("http://127.0.0.1:7688/ingest/8e61f5bc-1219-4ad9-a432-ae08fa2ba365",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"501c1c"},body:JSON.stringify({sessionId:"501c1c",runId:"pre-fix",hypothesisId:"H4",location:"ai-service.ts:analyze:success",message:"gemini analysis parsed",data:{readinessScore:parsed.readinessScore,strengthsCount:parsed.strengths?.length??0},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return parsed;
    } catch {
      // #region agent log
      fetch("http://127.0.0.1:7688/ingest/8e61f5bc-1219-4ad9-a432-ae08fa2ba365",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"501c1c"},body:JSON.stringify({sessionId:"501c1c",runId:"pre-fix",hypothesisId:"H4",location:"ai-service.ts:analyze:catch",message:"gemini failed, fallback used",data:{marketDemand:payload.market.demandScore},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return fallback(payload.market);
    }
  },
};
