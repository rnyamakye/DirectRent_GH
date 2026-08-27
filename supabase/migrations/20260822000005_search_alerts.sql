-- ============================================================
-- SEARCH ALERTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.search_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    renter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    city TEXT,
    property_type TEXT,
    min_price NUMERIC,
    max_price NUMERIC,
    bedrooms INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.search_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Renters can view their own search alerts" 
    ON public.search_alerts FOR SELECT 
    USING (auth.uid() = renter_id);

CREATE POLICY "Renters can insert their own search alerts" 
    ON public.search_alerts FOR INSERT 
    WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Renters can delete their own search alerts" 
    ON public.search_alerts FOR DELETE 
    USING (auth.uid() = renter_id);

-- Admins and Service Role can read all (needed for API backend matching)
CREATE POLICY "Admins and Service Role can read all search alerts" 
    ON public.search_alerts FOR SELECT 
    USING (true); -- Service role bypasses RLS anyway, but good to be explicit
