import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Search } from "lucide-react";
import { useState } from "react";

interface Props {
  apiKey: string;
  onApiKeyChange: (v: string) => void;
}

const TavilyConfigSection = ({ apiKey, onApiKeyChange }: Props) => {
  const [show, setShow] = useState(false);

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <Search className="h-4 w-4" /> Tavily Search (YouTube Tutorials)
      </h2>
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="space-y-2">
          <Label>Tavily API Key</Label>
          <div className="relative">
            <Input
              type={show ? "text" : "password"}
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="tvly-..."
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Used to find a direct YouTube tutorial link for each task. Get a free key at{" "}
            <a
              href="https://tavily.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              tavily.com
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
};

export default TavilyConfigSection;
