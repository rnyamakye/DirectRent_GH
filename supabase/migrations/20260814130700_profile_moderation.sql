ALTER TABLE public.profiles ADD COLUMN is_suspended BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN is_verified BOOLEAN DEFAULT false;
