CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Anyone (or just authenticated users) can insert messages
CREATE POLICY "Public can insert support messages" ON public.support_messages
    FOR INSERT
    WITH CHECK (true);

-- Only admins (or authenticated for now) can view/update
CREATE POLICY "Authenticated users can view support messages" ON public.support_messages
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can update support messages" ON public.support_messages
    FOR UPDATE
    TO authenticated
    USING (true);
