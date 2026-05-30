import axios from "axios";

import { env } from "@/lib/env";
import { MarketTrend } from "@/types";

const trackedSkills = [
  "React",
  "TypeScript",
  "JavaScript",
  "Node",
  "SQL",
  "Python",
  "AWS",
  "Docker",
  "Kubernetes",
  "Next.js",
  "Git",
  "Communication",
  "Problem Solving",
];

const jsearch = axios.create({
  baseURL: "https://jsearch.p.rapidapi.com",
  headers: {
    "X-RapidAPI-Key": env.EXPO_PUBLIC_RAPIDAPI_KEY,
    "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
  },
});

const newsApi = axios.create({
  baseURL: "https://newsapi.org/v2",
});

export const marketService = {
  getJobDemand: async (query: string): Promise<MarketTrend> => {
    // #region agent log
    fetch("http://127.0.0.1:7688/ingest/8e61f5bc-1219-4ad9-a432-ae08fa2ba365",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"501c1c"},body:JSON.stringify({sessionId:"501c1c",runId:"pre-fix",hypothesisId:"H3",location:"market-service.ts:getJobDemand:start",message:"getJobDemand invoked",data:{query,hasRapidKey:Boolean(env.EXPO_PUBLIC_RAPIDAPI_KEY)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!env.EXPO_PUBLIC_RAPIDAPI_KEY) {
      return {
        role: query,
        demandScore: 68,
        topSkills: ["React", "TypeScript", "SQL", "Problem Solving", "Git"],
        source: "Local fallback",
      };
    }

    try {
      const { data } = await jsearch.get("/search", {
        params: { query, page: 1, num_pages: 1, country: "in" },
      });
      const jobs = (data?.data ?? []) as Array<{
        job_title?: string;
        job_description?: string;
        job_required_skills?: string[] | string;
        job_highlights?: { Qualifications?: string[]; Responsibilities?: string[] };
      }>;
      const skillCounts = new Map<string, number>();
      const top = jobs.slice(0, 10);

      top.forEach((job) => {
        const highlights = [
          ...(job.job_highlights?.Qualifications ?? []),
          ...(job.job_highlights?.Responsibilities ?? []),
        ].join(" ");
        const requiredSkills =
          typeof job.job_required_skills === "string"
            ? job.job_required_skills
            : (job.job_required_skills ?? []).join(" ");
        const searchableText = `${job.job_title ?? ""} ${job.job_description ?? ""} ${requiredSkills} ${highlights}`.toLowerCase();

        trackedSkills.forEach((skill) => {
          if (searchableText.includes(skill.toLowerCase())) {
            skillCounts.set(skill, (skillCounts.get(skill) ?? 0) + 1);
          }
        });
      });

      const topSkills = [...skillCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([skill]) => skill)
        .slice(0, 6);
      // #region agent log
      fetch("http://127.0.0.1:7688/ingest/8e61f5bc-1219-4ad9-a432-ae08fa2ba365",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"501c1c"},body:JSON.stringify({sessionId:"501c1c",runId:"pre-fix",hypothesisId:"H3",location:"market-service.ts:getJobDemand:success",message:"computed market trend",data:{jobsCount:jobs.length,topCount:top.length,demandScore:Math.min(100, top.length * 10),topSkills},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      return {
        role: query,
        demandScore: Math.min(100, top.length * 10),
        topSkills: topSkills.length ? topSkills : ["React", "TypeScript", "SQL", "Git"],
        source: "JSearch",
      };
    } catch {
      // #region agent log
      fetch("http://127.0.0.1:7688/ingest/8e61f5bc-1219-4ad9-a432-ae08fa2ba365",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"501c1c"},body:JSON.stringify({sessionId:"501c1c",runId:"pre-fix",hypothesisId:"H3",location:"market-service.ts:getJobDemand:catch",message:"job demand API failed, fallback used",data:{query},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return {
        role: query,
        demandScore: 65,
        topSkills: ["React", "TypeScript", "SQL", "Problem Solving", "Communication"],
        source: "Fallback (API unavailable)",
      };
    }
  },

  getMarketNews: async () => {
    // #region agent log
    fetch("http://127.0.0.1:7688/ingest/8e61f5bc-1219-4ad9-a432-ae08fa2ba365",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"501c1c"},body:JSON.stringify({sessionId:"501c1c",runId:"pre-fix",hypothesisId:"H1",location:"market-service.ts:getMarketNews:start",message:"getMarketNews invoked",data:{hasNewsKey:Boolean(env.EXPO_PUBLIC_NEWS_API_KEY),newsKeyLength:env.EXPO_PUBLIC_NEWS_API_KEY?env.EXPO_PUBLIC_NEWS_API_KEY.length:0},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!env.EXPO_PUBLIC_NEWS_API_KEY) {
      throw new Error("EXPO_PUBLIC_NEWS_API_KEY is not available in Expo runtime.");
    }

    try {
      const { data } = await newsApi.get("/everything", {
        params: {
          q: "technology jobs OR AI hiring trends",
          language: "en",
          sortBy: "publishedAt",
          pageSize: 5,
          apiKey: env.EXPO_PUBLIC_NEWS_API_KEY,
        },
      });
      const articles = data?.articles ?? [];
      // #region agent log
      fetch("http://127.0.0.1:7688/ingest/8e61f5bc-1219-4ad9-a432-ae08fa2ba365",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"501c1c"},body:JSON.stringify({sessionId:"501c1c",runId:"pre-fix",hypothesisId:"H2",location:"market-service.ts:getMarketNews:everything",message:"news everything response",data:{count:articles.length,status:data?.status},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      if (articles.length) return articles;

      const headlines = await newsApi.get("/top-headlines", {
        params: {
          category: "technology",
          pageSize: 5,
          country: "us",
          apiKey: env.EXPO_PUBLIC_NEWS_API_KEY,
        },
      });
      const headlineArticles = headlines.data?.articles ?? [];
      // #region agent log
      fetch("http://127.0.0.1:7688/ingest/8e61f5bc-1219-4ad9-a432-ae08fa2ba365",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"501c1c"},body:JSON.stringify({sessionId:"501c1c",runId:"pre-fix",hypothesisId:"H2",location:"market-service.ts:getMarketNews:top-headlines",message:"top-headlines response",data:{count:headlineArticles.length,status:headlines.data?.status},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      if (headlineArticles.length) return headlineArticles;
      throw new Error("NewsAPI returned empty results.");
    } catch (error) {
      try {
        const headlines = await newsApi.get("/top-headlines", {
          params: {
            category: "business",
            q: "hiring",
            pageSize: 5,
            country: "us",
            apiKey: env.EXPO_PUBLIC_NEWS_API_KEY,
          },
        });
        const articles = headlines.data?.articles ?? [];
        if (articles.length) return articles;
        throw new Error("NewsAPI returned empty fallback results.");
      } catch {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const message = error.response?.data?.message ?? error.message;
          throw new Error(`News API failed (${status ?? "no-status"}): ${message}`);
        }
        throw error;
      }
    }
  },
};
