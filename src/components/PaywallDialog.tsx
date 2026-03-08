import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Zap, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PLAN_TIERS } from "@/lib/subscriptionPlans";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaywallDialog = ({ open, onOpenChange }: Props) => {
  const { subscription } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const paidPlans = PLAN_TIERS.filter((p) => p.price > 0);

  const handleBuy = async (planKey: string) => {
    setLoadingPlan(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { planKey },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to start checkout");
      setLoadingPlan(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Upgrade Your Plan</DialogTitle>
          <DialogDescription className="text-center">
            You're on the <span className="font-semibold capitalize">{subscription.tier}</span> plan.
            Upgrade to unlock more goals and premium features.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {paidPlans.map((plan) => (
            <div
              key={plan.key}
              className="flex items-center justify-between rounded-xl border border-border p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                <p className="text-xs text-muted-foreground">
                  {plan.goalLimit === -1 ? "Unlimited goals" : `${plan.goalLimit} goals/mo`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-foreground">${plan.price}/mo</span>
                <Button
                  size="sm"
                  variant="hero"
                  className="gap-1.5"
                  disabled={loadingPlan !== null}
                  onClick={() => handleBuy(plan.key)}
                >
                  {loadingPlan === plan.key ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Zap className="h-3.5 w-3.5" />
                  )}
                  Subscribe
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          Secure payment powered by Stripe. Cancel anytime.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default PaywallDialog;
