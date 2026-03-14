import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Linkedin, Twitter, Download, Copy, CheckCircle2, Zap } from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";

interface ProgressCardData {
  userName: string;
  goalTitle: string;
  taskTitle: string;
  completionNotes: string | null;
  completedTasks: number;
  totalTasks: number;
  completionDate: string;
}

interface ProgressCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ProgressCardData | null;
}

const ProgressCard = ({ data }: { data: ProgressCardData }) => {
  const progress = data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0;

  return (
    <div
      style={{
        width: 600,
        height: 600,
        padding: 48,
        background: "linear-gradient(145deg, hsl(240 10% 5%), hsl(240 6% 10%))",
        borderRadius: 24,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "'Inter', sans-serif",
        color: "hsl(0 0% 95%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative glow */}
      <div
        style={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, hsl(142 72% 50% / 0.15), transparent 70%)",
        }}
      />

      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, hsl(142 72% 50%), hsl(160 72% 40%))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            ⚡
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "hsl(0 0% 70%)" }}>
            {data.userName}
          </span>
        </div>
        <p style={{ fontSize: 13, color: "hsl(240 5% 55%)", marginTop: 4 }}>
          Goal: {data.goalTitle}
        </p>
      </div>

      {/* Main - Task completed */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "hsl(142 72% 50% / 0.12)",
            border: "1px solid hsl(142 72% 50% / 0.25)",
            borderRadius: 999,
            padding: "6px 16px",
            alignSelf: "flex-start",
          }}
        >
          <span style={{ fontSize: 14 }}>✅</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "hsl(142 72% 50%)" }}>
            Task Completed
          </span>
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.3, margin: 0 }}>
          {data.taskTitle}
        </h2>
        {data.completionNotes && (
          <p
            style={{
              fontSize: 14,
              color: "hsl(240 5% 55%)",
              lineHeight: 1.5,
              fontStyle: "italic",
              borderLeft: "3px solid hsl(142 72% 50% / 0.4)",
              paddingLeft: 12,
              margin: 0,
            }}
          >
            "{data.completionNotes.length > 120
              ? data.completionNotes.slice(0, 120) + "..."
              : data.completionNotes}"
          </p>
        )}
      </div>

      {/* Progress */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: "hsl(240 5% 55%)" }}>
            {data.completedTasks} / {data.totalTasks} Tasks Completed
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "hsl(142 72% 50%)" }}>{progress}%</span>
        </div>
        <div
          style={{
            height: 8,
            borderRadius: 999,
            background: "hsl(240 4% 16%)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              borderRadius: 999,
              background: "linear-gradient(90deg, hsl(142 72% 50%), hsl(160 72% 40%))",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid hsl(240 4% 16%)",
          }}
        >
          <span style={{ fontSize: 11, color: "hsl(240 5% 40%)" }}>
            Completed on {data.completionDate}
          </span>
          <span style={{ fontSize: 11, color: "hsl(240 5% 40%)" }}>
            Built with <strong style={{ color: "hsl(142 72% 50%)" }}>GoalBuilderAI</strong> · goalbuilder.online
          </span>
        </div>
      </div>
    </div>
  );
};

const ProgressCardDialog = ({ open, onOpenChange, data }: ProgressCardDialogProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  if (!data) return null;

  const caption = `✅ Just completed: "${data.taskTitle}"\n\n🎯 Goal: ${data.goalTitle}\n📊 Progress: ${data.completedTasks}/${data.totalTasks} tasks done\n\nBuilding in public with @GoalBuilderAI 🚀\nhttps://goalbuilder.online`;

  const downloadImage = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        width: 1200,
        height: 1200,
        style: { transform: "scale(2)", transformOrigin: "top left" },
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `progress-${data.taskTitle.slice(0, 30).replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Image downloaded!");
    } catch {
      toast.error("Failed to generate image");
    } finally {
      setGenerating(false);
    }
  };

  const copyCaption = async () => {
    await navigator.clipboard.writeText(caption);
    toast.success("Caption copied!");
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://goalbuilder.online")}`;
    window.open(url, "_blank");
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(caption);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Share Progress Card
          </DialogTitle>
          <DialogDescription>
            Share your achievement on social media to build in public!
          </DialogDescription>
        </DialogHeader>

        {/* Card preview */}
        <div className="flex justify-center overflow-hidden rounded-xl border border-border bg-muted/30 p-4">
          <div ref={cardRef} className="shrink-0">
            <ProgressCard data={data} />
          </div>
        </div>

        {/* Auto-generated caption */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Suggested Caption</p>
          <div className="rounded-lg border border-border bg-card p-3 text-xs text-foreground whitespace-pre-wrap">
            {caption}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={shareOnLinkedIn}>
            <Linkedin className="h-3.5 w-3.5" /> LinkedIn
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={shareOnTwitter}>
            <Twitter className="h-3.5 w-3.5" /> X / Twitter
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={downloadImage} disabled={generating}>
            <Download className="h-3.5 w-3.5" /> Download
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={copyCaption}>
            <Copy className="h-3.5 w-3.5" /> Caption
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProgressCardDialog;
export type { ProgressCardData };
