import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toggleTaskComplete } from "@/lib/goalService";
import { toast } from "sonner";

interface TaskReflectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string | null;
  taskTitle: string;
  onCompleted: () => void;
}

const TaskReflectionDialog = ({
  open,
  onOpenChange,
  taskId,
  taskTitle,
  onCompleted,
}: TaskReflectionDialogProps) => {
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!taskId || !reflection.trim()) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("task_completion_logs" as any).insert({
        task_id: taskId,
        user_id: user.id,
        reflection_text: reflection.trim(),
      });
      if (error) throw new Error(error.message);

      await toggleTaskComplete(taskId, true);
      toast.success("Task completed! 🎉");
      setReflection("");
      onOpenChange(false);
      onCompleted();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!saving) { onOpenChange(v); setReflection(""); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Task</DialogTitle>
          <DialogDescription>
            Before marking <span className="font-medium text-foreground">"{taskTitle}"</span> as completed, briefly explain what you did or achieved.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="What did you accomplish? Any learnings or outcomes..."
          rows={4}
          className="resize-none"
          disabled={saving}
        />
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => { onOpenChange(false); setReflection(""); }} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="hero"
            onClick={handleSubmit}
            disabled={!reflection.trim() || saving}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Mark as Completed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskReflectionDialog;
