import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Linkedin, Twitter, Download, Copy, Zap, Trophy } from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

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

      {/* Main */}
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
  const isMobile = useIsMobile();

  if (!data) return null;

  const caption = `🏅 Achievement Unlocked\n\nCompleted: "${data.taskTitle}"\nMaking progress toward my goal: ${data.goalTitle} 🚀\n\n📊 Progress: ${data.completedTasks}/${data.totalTasks} tasks done\n\nTracking my journey using GoalBuilderAI.\nhttps://goalbuilder.online`;

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
    toast.success("Caption copied to clipboard!");
  };

  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://goalbuilder.online")}`,
      "_blank"
    );
  };

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`,
      "_blank"
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      className={
        isMobile
          ? "max-w-[95vw] max-h-[90vh] overflow-hidden p-4"
          : "max-w-4xl max-h-[90vh] overflow-hidden p-0"
      }
    >
      {/* Header */}
      <DialogHeader className={isMobile ? "pb-2" : "px-6 pt-6 pb-0"}>
        <DialogTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-primary" />
          Achievement Badge Generated
        </DialogTitle>
      </DialogHeader>

      <div
        className={
          isMobile
            ? "flex flex-col gap-3"
            : "grid grid-cols-2 gap-6 px-6 pb-6"
        }
      >
        {/* Left – Badge Preview */}
        <div className="flex items-center justify-center rounded-xl border border-border bg-muted/30 p-3 overflow-hidden">
          <div
            className="flex items-start justify-center"
            style={{
              width: isMobile ? 250 : 350,
              height: isMobile ? 250 : 350,
            }}
          >
            <div
              ref={cardRef}
              style={{
                transform: `scale(${isMobile ? 0.42 : 0.58})`,
                transformOrigin: "top center",
                width: 600,
                height: 600,
              }}
            >
              <ProgressCard data={data} />
            </div>
          </div>
        </div>

        {/* Right – Actions Panel */}
        <div className="flex flex-col justify-between gap-3">
          {/* Caption */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Suggested Caption
            </p>

            <div
              className={
                "rounded-lg border border-border bg-card p-3 text-xs text-foreground whitespace-pre-wrap " +
                (isMobile
                  ? "max-h-24 overflow-hidden"
                  : "max-h-36 overflow-hidden")
              }
            >
              {caption}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-xs"
              onClick={copyCaption}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy Caption
            </Button>
          </div>

          {/* Share Actions */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Share
            </p>

            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={shareOnLinkedIn}
              >
                <Linkedin className="h-3.5 w-3.5" />
                LinkedIn
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={shareOnTwitter}
              >
                <Twitter className="h-3.5 w-3.5" />
                X
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={downloadImage}
                disabled={generating}
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
    // <Dialog open={open} onOpenChange={onOpenChange}>
    //   <DialogContent
    //     className={
    //       isMobile
    //         ? "max-w-[95vw] max-h-[90vh] overflow-hidden p-4"
    //         : "max-w-4xl max-h-[90vh] overflow-hidden p-0"
    //     }
    //   >
    //     {/* Header */}
    //     <DialogHeader className={isMobile ? "pb-2" : "px-6 pt-6 pb-0"}>
    //       <DialogTitle className="flex items-center gap-2 text-lg">
    //         <Trophy className="h-5 w-5 text-primary" />
    //         Achievement Badge Generated
    //       </DialogTitle>
    //     </DialogHeader>

    //     <div
    //       className={
    //         isMobile
    //           ? "flex flex-col gap-3"
    //           : "grid grid-cols-2 gap-6 px-6 pb-6"
    //       }
    //     >
    //       {/* Left – Badge Preview */}
    //       <div className="flex items-center justify-center rounded-xl border border-border bg-muted/30 p-3">
    //         <div
    //           ref={cardRef}
    //           className="shrink-0"
    //           style={{
    //             transform: isMobile ? "scale(0.42)" : "scale(0.58)",
    //             transformOrigin: "top left",
    //             width: 600,
    //             height: 600,
    //             maxHeight: isMobile ? 252 : 348,
    //             marginBottom: isMobile ? -348 : -252,
    //           }}
    //         >
    //           <ProgressCard data={data} />
    //         </div>
    //       </div>

    //       {/* Right – Actions Panel */}
    //       <div className="flex flex-col justify-between gap-3">
    //         {/* Caption */}
    //         <div className="space-y-1.5">
    //           <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
    //             Suggested Caption
    //           </p>
    //           <div
    //             className={
    //               "rounded-lg border border-border bg-card p-3 text-xs text-foreground whitespace-pre-wrap " +
    //               (isMobile ? "max-h-24 overflow-hidden" : "max-h-36 overflow-hidden")
    //             }
    //           >
    //             {caption}
    //           </div>
    //           <Button
    //             variant="outline"
    //             size="sm"
    //             className="w-full gap-1.5 text-xs"
    //             onClick={copyCaption}
    //           >
    //             <Copy className="h-3.5 w-3.5" />
    //             Copy Caption
    //           </Button>
    //         </div>

    //         {/* Share Actions */}
    //         <div className="space-y-1.5">
    //           <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
    //             Share
    //           </p>
    //           <div className="grid grid-cols-3 gap-2">
    //             <Button
    //               variant="outline"
    //               size="sm"
    //               className="gap-1.5 text-xs"
    //               onClick={shareOnLinkedIn}
    //             >
    //               <Linkedin className="h-3.5 w-3.5" />
    //               LinkedIn
    //             </Button>
    //             <Button
    //               variant="outline"
    //               size="sm"
    //               className="gap-1.5 text-xs"
    //               onClick={shareOnTwitter}
    //             >
    //               <Twitter className="h-3.5 w-3.5" />
    //               X
    //             </Button>
    //             <Button
    //               variant="outline"
    //               size="sm"
    //               className="gap-1.5 text-xs"
    //               onClick={downloadImage}
    //               disabled={generating}
    //             >
    //               <Download className="h-3.5 w-3.5" />
    //               Download
    //             </Button>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </DialogContent>
    // </Dialog>
  );
};

export default ProgressCardDialog;
export type { ProgressCardData };
