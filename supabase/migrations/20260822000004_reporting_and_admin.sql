-- ============================================================
-- REPORTING AND ADMIN
-- Adds admin role support and the reports table.
-- ============================================================

-- 1. Add is_admin column to profiles
ALTER TABLE public.profiles 
ADD COLUMN is_admin BOOLEAN DEFAULT false;

-- 2. Create reports table
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('listing', 'profile')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS on reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 4. Policies for reports
-- Anyone can insert a report
CREATE POLICY "Users can insert reports" 
    ON public.reports FOR INSERT 
    WITH CHECK (true);

-- Only admins can read reports
CREATE POLICY "Admins can view reports" 
    ON public.reports FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Only admins can update reports (to change status)
CREATE POLICY "Admins can update reports" 
    ON public.reports FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );
