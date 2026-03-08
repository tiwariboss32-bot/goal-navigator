import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Zap,
  Shield,
  Bot,
  Key,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

const AVAILABLE_MODELS = [
  { value: "google/gemini-3-flash-preview", label: "Gemini 3 Flash Preview", provider: "lovable" },
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "lovable" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro", provider: "lovable" },
  { value: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", provider: "lovable" },
  { value: "google/gemini-3.1-pro-preview", label: "Gemini 3.1 Pro Preview", provider: "lovable" },
  { value: "openai/gpt-5", label: "GPT-5", provider: "lovable" },
  { value: "openai/gpt-5-mini", label: "GPT-5 Mini", provider: "lovable" },
  { value: "openai/gpt-5-nano", label: "GPT-5 Nano", provider: "lovable" },
  { value: "openai/gpt-5.2", label: "GPT-5.2", provider: "lovable" },
  { value: "custom", label: "Custom Model (own API key)", provider: "custom" },
];

const AdminSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedModel, setSelectedModel] = useState("google/gemini-3-flash-preview");
  const [provider, setProvider] = useState("lovable");
  const [customModelName, setCustomModelName] = useState("");
  const [customApiKey, setCustomApiKey] = useState("");
  const [customEndpoint, setCustomEndpoint] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (!user) return;
    checkAdminAndLoadConfig();
  }, [user]);

  const checkAdminAndLoadConfig = async () => {
    try {
      // Check admin role
      const { data: roles } = await (supabase
        .from("user_roles" as any)
        .select("role") as any)
        .eq("user_id", user!.id)
        .eq("role", "admin");

      const admin = roles && roles.length > 0;
      setIsAdmin(admin);

      if (!admin) {
        setLoading(false);
        return;
      }

      // Load current config
      const { data: configs } = await (supabase
        .from("app_config" as any)
        .select("key, value") as any);

      const configMap: Record<string, string> = {};
      (configs || []).forEach((c: any) => {
        configMap[c.key] = c.value;
      });

      const model = configMap["ai_model"] || "google/gemini-3-flash-preview";
      const prov = configMap["ai_provider"] || "lovable";

      if (prov === "custom") {
        setSelectedModel("custom");
        setCustomModelName(model);
        setProvider("custom");
      } else {
        setSelectedModel(model);
        setProvider("lovable");
      }

      setCustomApiKey(configMap["custom_api_key"] || "");
      setCustomEndpoint(configMap["custom_endpoint"] || "");
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const isCustom = selectedModel === "custom";
      const modelValue = isCustom ? customModelName : selectedModel;
      const providerValue = isCustom ? "custom" : "lovable";

      const updates = [
        { key: "ai_model", value: modelValue },
        { key: "ai_provider", value: providerValue },
        { key: "custom_api_key", value: isCustom ? customApiKey : "" },
        { key: "custom_endpoint", value: isCustom ? customEndpoint : "" },
      ];

      for (const { key, value } of updates) {
        const { error } = await (supabase
          .from("app_config" as any)
          .update({ value, updated_at: new Date().toISOString(), updated_by: user!.id }) as any)
          .eq("key", key);

        if (error) {
          // If key doesn't exist yet, insert it
          if (error.code === "PGRST116") {
            await (supabase.from("app_config" as any).insert({ key, value, updated_by: user!.id }) as any);
          } else {
            throw error;
          }
        }
      }

      toast.success("Model configuration saved!");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">Access Denied</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            You need admin privileges to access this page.
          </p>
          <Button variant="hero" asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isCustom = selectedModel === "custom";
  const currentModelLabel = AVAILABLE_MODELS.find((m) => m.value === selectedModel)?.label || selectedModel;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary">
                <Shield className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">Admin Settings</span>
            </div>
          </div>
          <Button
            variant="hero"
            size="sm"
            className="gap-2"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-6 sm:py-8 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Current config */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-3">
              <Bot className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Currently Active Model</p>
                <p className="text-xs text-muted-foreground">
                  {isCustom ? customModelName || "Not configured" : currentModelLabel} · via{" "}
                  {isCustom ? "Custom API" : "Lovable AI"}
                </p>
              </div>
            </div>
          </div>

          {/* Model selector */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Bot className="h-4 w-4" /> AI Model Configuration
            </h2>

            <div className="space-y-4 rounded-xl border border-border bg-card p-5">
              <div className="space-y-2">
                <Label>Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_MODELS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        <div className="flex items-center gap-2">
                          <span>{m.label}</span>
                          {m.provider === "lovable" && (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                              Lovable AI
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {isCustom
                    ? "Use your own OpenAI-compatible API endpoint and key."
                    : "Powered by Lovable AI — no API key needed."}
                </p>
              </div>

              {isCustom && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 border-t border-border pt-4"
                >
                  <div className="space-y-2">
                    <Label>Custom Model Name</Label>
                    <Input
                      value={customModelName}
                      onChange={(e) => setCustomModelName(e.target.value)}
                      placeholder="e.g. gpt-4o, claude-3.5-sonnet"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>API Endpoint</Label>
                    <Input
                      value={customEndpoint}
                      onChange={(e) => setCustomEndpoint(e.target.value)}
                      placeholder="e.g. https://api.openai.com/v1/chat/completions"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <div className="relative">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value={customApiKey}
                        onChange={(e) => setCustomApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Stored securely. Only admins can view or change this.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </section>

          {/* Info section */}
          <section className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Key className="h-4 w-4" /> How it works
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex gap-2">
                <Zap className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
                <span>
                  <strong className="text-foreground">Lovable AI models</strong> work out of the box — no
                  API key needed. Usage is billed through your Lovable workspace.
                </span>
              </li>
              <li className="flex gap-2">
                <Key className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
                <span>
                  <strong className="text-foreground">Custom models</strong> let you use any
                  OpenAI-compatible API. Provide your endpoint, model name, and API key.
                </span>
              </li>
              <li className="flex gap-2">
                <Shield className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
                <span>
                  Changes take effect immediately for all new chat sessions. Only admins can
                  modify these settings.
                </span>
              </li>
            </ul>
          </section>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminSettings;
