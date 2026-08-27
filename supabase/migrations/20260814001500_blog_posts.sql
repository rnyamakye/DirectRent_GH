CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published posts
CREATE POLICY "Public can view blog posts" ON public.blog_posts
    FOR SELECT
    USING (true);

-- Allow authenticated users with an admin role (if applicable) or any authenticated user to create/update
CREATE POLICY "Authenticated users can insert blog posts" ON public.blog_posts
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update blog posts" ON public.blog_posts
    FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can delete blog posts" ON public.blog_posts
    FOR DELETE
    TO authenticated
    USING (true);
