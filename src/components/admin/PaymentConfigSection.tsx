import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, CreditCard } from "lucide-react";
import { useState } from "react";

interface Props {
  provider: string;
  onProviderChange: (v: string) => void;
  publishableKey: string;
  onPublishableKeyChange: (v: string) => void;
  secretKey: string;
  onSecretKeyChange: (v: string) => void;
}

const PaymentConfigSection = ({
  provider,
  onProviderChange,
  publishableKey,
  onPublishableKeyChange,
  secretKey,
  onSecretKeyChange,
}: Props) => {
  const [showSecret, setShowSecret] = useState(false);

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <CreditCard className="h-4 w-4" /> Payment Provider
      </h2>

      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="space-y-2">
          <Label>Provider</Label>
          <Select value={provider || "none"} onValueChange={onProviderChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No provider configured</SelectItem>
              <SelectItem value="stripe">Stripe</SelectItem>
              <SelectItem value="razorpay">Razorpay</SelectItem>
              <SelectItem value="lemonsqueezy">Lemon Squeezy</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose a payment provider. You can add credentials below.
          </p>
        </div>

        {provider && provider !== "none" && (
          <div className="space-y-4 border-t border-border pt-4">
            <div className="space-y-2">
              <Label>Publishable / Client Key</Label>
              <Input
                value={publishableKey}
                onChange={(e) => onPublishableKeyChange(e.target.value)}
                placeholder="pk_live_... or rzp_live_..."
              />
            </div>

            <div className="space-y-2">
              <Label>Secret Key</Label>
              <div className="relative">
                <Input
                  type={showSecret ? "text" : "password"}
                  value={secretKey}
                  onChange={(e) => onSecretKeyChange(e.target.value)}
                  placeholder="sk_live_..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Stored securely. Only admins can view or change this.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PaymentConfigSection;
