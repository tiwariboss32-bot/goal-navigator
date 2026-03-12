
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS twitter_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text;

ALTER TABLE public.task_completion_logs
  ADD COLUMN IF NOT EXISTS linkedin_post text,
  ADD COLUMN IF NOT EXISTS twitter_post text;
