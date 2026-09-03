-- Drop the old constraint and add a new one that includes 'completed'
ALTER TABLE public.tour_requests DROP CONSTRAINT IF EXISTS tour_requests_status_check;
ALTER TABLE public.tour_requests ADD CONSTRAINT tour_requests_status_check CHECK (status in ('pending', 'confirmed', 'cancelled', 'completed'));
