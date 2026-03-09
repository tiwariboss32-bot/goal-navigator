import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      await supabase.auth.getSession();
      navigate("/dashboard");
    };

    handleAuth();
  }, []);

  return <p>Signing you in...</p>;
}