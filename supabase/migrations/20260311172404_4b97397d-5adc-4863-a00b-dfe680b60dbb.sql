
CREATE TABLE public.task_completion_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES public.goal_tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reflection_text text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.task_completion_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completion logs" ON public.task_completion_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completion logs" ON public.task_completion_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
