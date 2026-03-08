import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FREE_RESPONSE = { subscribed: false, tier: "free", subscription_end: null, is_admin: false };

// Map Stripe price IDs → plan tier names
const PRICE_TIER_MAP: Record<string, string> = {
  price_1T8mQeL1OYecixWrncb5IMb1: "growth",
  price_1T8mRrL1OYecixWrMbIgs25d: "pro",
  price_1T8mSgL1OYecixWrUIaoOhdJ: "power",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json(FREE_RESPONSE);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    const user = data?.user;
    if (authError || !user?.email) return json(FREE_RESPONSE);

    // Check if user is admin (using service role to bypass RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleData) {
      // Admins get full "power" tier access without paying
      return json({
        subscribed: true,
        tier: "power",
        subscription_end: null,
        is_admin: true,
      });
    }

    // Check Stripe subscription for non-admin users
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) return json(FREE_RESPONSE);

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) return json(FREE_RESPONSE);

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;
    const tier = PRICE_TIER_MAP[priceId] || "free";
    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();

    return json({ subscribed: true, tier, subscription_end: subscriptionEnd, is_admin: false });
  } catch (error) {
    console.error("[check-subscription] Error:", (error as Error).message);
    return json({ error: (error as Error).message }, 500);
  }
});
