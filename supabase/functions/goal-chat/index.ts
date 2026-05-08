import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenAI } from "https://esm.sh/@google/genai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are GoalBuilder AI, an expert goal planning assistant. Your job is to help users create structured, actionable plans for their goals.

CONVERSATION FLOW:
1. First, ask the user what their goal is.
2. Then ask follow-up questions ONE AT A TIME about:
   - Their timeline (when do they want to achieve this?)
   - Their current situation (what have they done so far?)
   - Available resources (time per day/week, budget, tools)
   - Expected obstacles
3. After gathering enough info (usually 4-6 exchanges), generate a structured plan.

WHEN GENERATING A PLAN, you MUST output it in this exact JSON format wrapped in <plan> tags:

<plan>
{
  "title": "Goal title",
  "description": "Brief goal description",
  "timeline": "e.g. 3 months",
  "tasks": [
    { "title": "Task name", "description": "Details", "deadline": "relative deadline", "priority": "high|medium|low", "youtube_url": "https://www.youtube.com/results?search_query=..." }
  ],
  "milestones": [
    { "title": "Milestone name", "target_date": "relative date" }
  ],
  "resources": ["Resource 1", "Resource 2"]
}
</plan>

IMPORTANT RULES:
- Be conversational and encouraging
- Ask only ONE question at a time
- Generate 5-10 tasks that are specific and actionable
- For EACH task, include a "youtube_url" field with a relevant YouTube link that helps the user learn or complete that task. Prefer a YouTube search URL using this exact format: "https://www.youtube.com/results?search_query=<URL-ENCODED+KEYWORDS>" with 3-6 focused keywords describing the task topic (e.g. "react hooks tutorial beginner"). Only include a specific video URL ("https://www.youtube.com/watch?v=...") if you are highly confident it exists; otherwise always use the search URL. If the task is not learning-related (e.g. "buy a notebook"), set youtube_url to null.
- Include 2-4 milestones
- After generating the plan, ask if they want to adjust anything
- If they request changes, output an updated <plan> block`;

const LOVABLE_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

function isGeminiEndpoint(endpoint: string): boolean {
  return endpoint.includes("googleapis.com") || endpoint.includes("generativelanguage.googleapis.com");
}

// Convert chat messages to Gemini SDK format
function toGeminiContents(messages: Array<{ role: string; content: string }>) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

// Stream Gemini response as SSE (OpenAI-compatible format) so the frontend parser works unchanged
async function streamGeminiAsSSE(
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>
): Promise<Response> {
  const ai = new GoogleGenAI({ apiKey });

  // Separate system instruction from conversation
  const systemInstruction = SYSTEM_PROMPT;
  const conversationMessages = toGeminiContents(messages);

  const stream = await ai.models.generateContentStream({
    model,
    contents: conversationMessages,
    config: { systemInstruction },
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.text;
          if (text) {
            // Emit in OpenAI SSE format so the frontend parser works as-is
            const ssePayload = JSON.stringify({
              choices: [{ delta: { content: text } }],
            });
            controller.enqueue(encoder.encode(`data: ${ssePayload}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        console.error("Gemini stream error:", err);
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();

    // Load model config from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: configs } = await supabase
      .from("app_config")
      .select("key, value")
      .in("key", ["ai_model", "ai_provider", "custom_api_key", "custom_endpoint"]);

    const configMap: Record<string, string> = {};
    (configs || []).forEach((c: any) => {
      configMap[c.key] = c.value;
    });

    const provider = configMap["ai_provider"] || "lovable";
    const model = configMap["ai_model"] || "google/gemini-3-flash-preview";
    const customApiKey = configMap["custom_api_key"] || "";
    const customEndpoint = configMap["custom_endpoint"] || "";

    // --- Custom provider: Gemini direct ---
    if (provider === "custom" && customApiKey && isGeminiEndpoint(customEndpoint)) {
      return await streamGeminiAsSSE(customApiKey, model, messages);
    }

    // --- Custom provider: OpenAI-compatible ---
    let apiUrl: string;
    let authHeader: string;

    if (provider === "custom" && customApiKey && customEndpoint) {
      apiUrl = customEndpoint;
      authHeader = `Bearer ${customApiKey}`;
    } else {
      // Default to Lovable AI
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
      apiUrl = LOVABLE_GATEWAY;
      authHeader = `Bearer ${LOVABLE_API_KEY}`;
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
