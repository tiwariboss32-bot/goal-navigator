
-- Pricing plans table
CREATE TABLE public.pricing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price_cents integer NOT NULL,
  goal_limit integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans" ON public.pricing_plans FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can insert plans" ON public.pricing_plans FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update plans" ON public.pricing_plans FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete plans" ON public.pricing_plans FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- User purchases table
CREATE TABLE public.user_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid REFERENCES public.pricing_plans(id),
  goals_allowed integer NOT NULL DEFAULT 0,
  payment_provider text,
  payment_id text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases" ON public.user_purchases FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all purchases" ON public.user_purchases FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert purchases" ON public.user_purchases FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update purchases" ON public.user_purchases FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Seed default pricing plans
INSERT INTO public.pricing_plans (name, price_cents, goal_limit, sort_order) VALUES
  ('Starter', 900, 1, 1),
  ('Pro', 9900, 3, 2);

-- Add unique constraint on app_config key if not exists
ALTER TABLE public.app_config ADD CONSTRAINT app_config_key_unique UNIQUE (key);

-- Seed pricing/payment config
INSERT INTO public.app_config (key, value) VALUES
  ('pricing_enabled', 'false'),
  ('payment_provider', ''),
  ('payment_secret_key', ''),
  ('payment_publishable_key', '')
ON CONFLICT (key) DO NOTHING;
