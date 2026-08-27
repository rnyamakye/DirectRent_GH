CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Anyone can view FAQs
CREATE POLICY "Public can view FAQs" ON public.faqs
    FOR SELECT
    USING (true);

-- Only admins/authenticated can modify FAQs
CREATE POLICY "Authenticated users can manage FAQs" ON public.faqs
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert some initial dummy data so the help page isn't empty
INSERT INTO public.faqs (question, answer, category, sort_order) VALUES
('How do I find a listing?', 'You can browse all available listings on the Listings page. Use the filters to narrow down by price, bedrooms, and property type to find your perfect match.', 'general', 1),
('Are the agents verified?', 'We strive to vet agents on our platform. Always remember to view the property in person before making any payments or deposits.', 'safety', 2),
('How do I contact an artisan?', 'Navigate to the Artisans directory and click on an artisan''s profile. You''ll find their contact information and services offered there.', 'artisans', 3),
('Can I list my own property?', 'Yes! If you are a real estate agent or landlord, sign up for an Agent account to start adding your own listings to the platform.', 'agents', 4);
