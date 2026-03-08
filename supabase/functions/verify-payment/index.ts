import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map DB plan IDs to goal limits
const PLAN_GOALS: Record<string, number> = {
  "3f2ca502-4e18-475d-b53d-50109843a1ae": 1, // Starter
  "6d3000b9-2195-4bdd-8876-f46d63364e9e": 3, // Pro
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Missing session_id");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ success: false, error: "Payment not completed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const planId = session.metadata?.plan_id;
    const sessionUserId = session.metadata?.user_id;

    // Verify the session belongs to this user
    if (sessionUserId !== user.id) {
      throw new Error("Unauthorized");
    }

    // Check if already recorded
    const { data: existing } = await supabaseAdmin
      .from("user_purchases")
      .select("id")
      .eq("payment_id", session.id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ success: true, already_recorded: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const goalsAllowed = planId ? (PLAN_GOALS[planId] || 0) : 0;

    // Insert purchase record using service role (bypasses RLS)
    const { error: insertError } = await supabaseAdmin.from("user_purchases").insert({
      user_id: user.id,
      plan_id: planId,
      payment_id: session.id,
      payment_provider: "stripe",
      goals_allowed: goalsAllowed,
      status: "active",
    });

    if (insertError) throw new Error(`Failed to record purchase: ${insertError.message}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
