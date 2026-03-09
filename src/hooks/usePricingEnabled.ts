import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const usePricingEnabled = () => {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    supabase
      .from("app_config")
      .select("value")
      .eq("key", "pricing_enabled")
      .maybeSingle()
      .then(({ data }) => {
        setEnabled(data?.value === "true");
      });
  }, []);

  return enabled;
};
