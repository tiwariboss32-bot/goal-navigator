import { useAuth } from "@/contexts/AuthContext";
import { PLAN_TIERS, getTierByKey } from "@/lib/subscriptionPlans";

interface PaywallState {
  loading: boolean;
  tier: string;
  goalLimit: number; // -1 = unlimited
  canCreateGoal: boolean;
  isFreePlan: boolean;
}

export const usePaywall = (): PaywallState => {
  const { subscription } = useAuth();
  const plan = getTierByKey(subscription.tier);

  return {
    loading: subscription.loading,
    tier: subscription.tier,
    goalLimit: plan.goalLimit,
    // Free plan users can always create goals up to their limit (checked server-side or on goal count)
    // Paid plans: unlimited or high limit, always allow
    canCreateGoal: true, // We'll enforce actual count-based limits in the create flow if needed
    isFreePlan: subscription.tier === "free",
  };
};
