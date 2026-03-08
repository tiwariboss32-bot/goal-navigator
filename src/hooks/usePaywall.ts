import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PaywallState {
  loading: boolean;
  pricingEnabled: boolean;
  goalCount: number;
  goalsAllowed: number;
  canCreateGoal: boolean;
  plans: { id: string; name: string; price_cents: number; goal_limit: number }[];
}

export const usePaywall = (): PaywallState => {
  const { user } = useAuth();
  const [state, setState] = useState<PaywallState>({
    loading: true,
    pricingEnabled: false,
    goalCount: 0,
    goalsAllowed: 0,
    canCreateGoal: true,
    plans: [],
  });

  useEffect(() => {
    if (!user) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    const load = async () => {
      try {
        // Check if pricing is enabled
        const { data: config } = await (supabase
          .from("app_config" as any)
          .select("value") as any)
          .eq("key", "pricing_enabled")
          .single();

        const enabled = config?.value === "true";

        if (!enabled) {
          setState((s) => ({ ...s, loading: false, pricingEnabled: false, canCreateGoal: true }));
          return;
        }

        // Get user's goal count, purchases, and plans in parallel
        const [goalsRes, purchasesRes, plansRes] = await Promise.all([
          supabase.from("goals").select("id", { count: "exact", head: true }).eq("user_id", user.id),
          (supabase.from("user_purchases" as any).select("goals_allowed") as any)
            .eq("user_id", user.id)
            .eq("status", "active"),
          supabase.from("pricing_plans").select("*").eq("is_active", true).order("sort_order"),
        ]);

        const goalCount = goalsRes.count || 0;
        const totalAllowed = (purchasesRes.data || []).reduce(
          (sum: number, p: any) => sum + (p.goals_allowed || 0),
          0
        );

        setState({
          loading: false,
          pricingEnabled: true,
          goalCount,
          goalsAllowed: totalAllowed,
          canCreateGoal: goalCount < totalAllowed,
          plans: (plansRes.data as any) || [],
        });
      } catch {
        setState((s) => ({ ...s, loading: false, canCreateGoal: true }));
      }
    };

    load();
  }, [user]);

  return state;
};
