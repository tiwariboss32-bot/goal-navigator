import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshSubscription } = useAuth();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setStatus("error");
      setErrorMsg("Missing session information");
      return;
    }

    supabase.functions
      .invoke("verify-payment", { body: { sessionId } })
      .then(async ({ data, error }) => {
        if (error || !data?.success) {
          setStatus("error");
          setErrorMsg(error?.message || data?.error || "Verification failed");
        } else {
          await refreshSubscription();
          setStatus("success");
        }
      });
  }, [searchParams, refreshSubscription]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Verifying your subscription...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Subscription Activated!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your plan is now active. Enjoy your upgraded features!
            </p>
            <Button variant="hero" className="mt-6" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted-foreground">{errorMsg}</p>
            <Button variant="hero" className="mt-6" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
