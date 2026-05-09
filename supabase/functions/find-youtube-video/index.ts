// Find a direct YouTube video URL for a task using Tavily search
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const taskId: string | undefined = body.taskId;
    const query: string | undefined = body.query;
    if (!taskId || !query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "taskId and query are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Read Tavily API key from app_config
    const { data: cfg } = await adminClient
      .from("app_config")
      .select("value")
      .eq("key", "tavily_api_key")
      .maybeSingle();

    const tavilyKey = cfg?.value?.trim();
    if (!tavilyKey) {
      return new Response(
        JSON.stringify({
          error:
            "Tavily API key not configured. Ask an admin to add it in Admin Settings.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call Tavily Search restricted to youtube.com
    const tavilyRes = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tavilyKey}`,
      },
      body: JSON.stringify({
        query: `best popular ${query} tutorial youtube`,
        search_depth: "advanced",
        include_domains: ["youtube.com", "www.youtube.com"],
        max_results: 15,
      }),
    });

    if (!tavilyRes.ok) {
      const txt = await tavilyRes.text();
      return new Response(
        JSON.stringify({ error: `Tavily error [${tavilyRes.status}]: ${txt}` }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const tavilyData = await tavilyRes.json();
    const results: Array<{ url: string; title?: string; score?: number }> =
      tavilyData?.results || [];

    // Keep only direct watch URLs and rank by Tavily score (proxy for popularity/relevance)
    const watchResults = results
      .filter((r) => /^https?:\/\/(www\.)?youtube\.com\/watch\?v=/i.test(r.url))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    const watch = watchResults[0];

    const url =
      watch?.url ||
      `https://www.youtube.com/results?search_query=${encodeURIComponent(query + " tutorial")}`;

    // Persist to task (RLS via userClient ensures ownership)
    await userClient
      .from("goal_tasks")
      .update({ youtube_url: url })
      .eq("id", taskId);

    return new Response(JSON.stringify({ url, found: !!watch }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
