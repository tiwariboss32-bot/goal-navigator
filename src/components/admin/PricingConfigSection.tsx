import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

interface PricingPlan {
  id: string;
  name: string;
  price_cents: number;
  goal_limit: number;
  is_active: boolean;
  sort_order: number;
}

interface Props {
  pricingEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const PricingConfigSection = ({ pricingEnabled, onToggle }: Props) => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);

  useEffect(() => {
    supabase
      .from("pricing_plans")
      .select("*")
      .order("sort_order")
      .then(({ data }) => setPlans((data as any) || []));
  }, []);

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <DollarSign className="h-4 w-4" /> Pricing & Paywall
      </h2>

      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Enable Pricing</Label>
            <p className="text-xs text-muted-foreground">
              When enabled, users must purchase a plan to create goals.
            </p>
          </div>
          <Switch checked={pricingEnabled} onCheckedChange={onToggle} />
        </div>

        {pricingEnabled && plans.length > 0 && (
          <div className="border-t border-border pt-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground">Active Plans</p>
            <div className="space-y-2">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">{plan.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {plan.goal_limit} goal{plan.goal_limit > 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    ${(plan.price_cents / 100).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              To modify plans, update them in the database directly for now.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingConfigSection;
