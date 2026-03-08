import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, PanelRightOpen, PanelRightClose, ArrowRight, Bot } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import PlanPreview from "@/components/chat/PlanPreview";
import { ChatMessage, GoalPlan, extractPlan } from "@/lib/goalPlan";
import { streamGoalChat } from "@/lib/streamChat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const GoalChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your GoalBuilder AI assistant. 🎯\n\nI'll help you turn your goal into a clear, actionable plan. **What goal would you like to work on?**",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<GoalPlan | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  const handleSend = useCallback(
    async (input: string) => {
      const userMsg: ChatMessage = { role: "user", content: input };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setIsLoading(true);

      let assistantSoFar = "";

      const upsertAssistant = (chunk: string) => {
        assistantSoFar += chunk;

        const foundPlan = extractPlan(assistantSoFar);
        if (foundPlan) {
          setPlan(foundPlan);
          if (!showPreview) setShowPreview(true);
        }

        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
            );
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      try {
        await streamGoalChat({
          messages: updatedMessages,
          onDelta: upsertAssistant,
          onDone: () => setIsLoading(false),
        });
      } catch (e: any) {
        console.error(e);
        toast.error(e.message || "Something went wrong");
        setIsLoading(false);
      }
    },
    [messages, showPreview]
  );

  const handleFinalize = () => {
    if (!plan) return;
    navigate("/goal/finalize", { state: { plan } });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Chat panel */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-3 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              to="/dashboard"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-gradient-primary">
                <Zap className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground truncate">Goal Planning</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {plan && (
              <Button variant="hero" size="sm" className="gap-1.5 text-xs sm:text-sm sm:gap-2" onClick={handleFinalize}>
                <span className="hidden sm:inline">Finalize Plan</span>
                <span className="sm:hidden">Finalize</span>
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPreview(!showPreview)}
              className="h-8 w-8 hidden md:flex"
            >
              {showPreview ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelRightOpen className="h-4 w-4" />
              )}
            </Button>
          </div>
        </header>

        <ChatMessages messages={messages} isLoading={isLoading} />
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>

      {/* Plan preview panel */}
      {showPreview && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 400, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="hidden md:flex flex-col border-l border-border bg-card overflow-hidden"
          style={{ width: 400 }}
        >
          <div className="flex h-14 items-center justify-between border-b border-border px-6">
            <span className="text-sm font-semibold text-foreground">Live Plan</span>
            {plan && (
              <Button
                variant="hero"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={handleFinalize}
              >
                Finalize <ArrowRight className="h-3 w-3" />
              </Button>
            )}
          </div>
          <PlanPreview plan={plan} />
        </motion.aside>
      )}
    </div>
  );
};

export default GoalChat;
