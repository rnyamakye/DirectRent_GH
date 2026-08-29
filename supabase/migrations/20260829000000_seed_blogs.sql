ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS author_name TEXT,
ADD COLUMN IF NOT EXISTS author_role TEXT;

-- Clear existing data for seed
DELETE FROM public.blog_posts;

INSERT INTO public.blog_posts (id, title, slug, excerpt, content, category, published_at, image, author_name, author_role)
VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'How to Find the Perfect Room in Accra',
  'how-to-find-the-perfect-room-in-accra',
  'Searching for a room in Accra can be daunting. Follow these simple tips to navigate the rental market like a pro.',
  '<p>Searching for a room in Accra can be daunting. With the fast-paced nature of the real estate market in Ghana''s capital, you need to be prepared before you even start looking.</p>
      <h2>Understand Your Budget</h2>
      <p>Before you begin your search, it''s crucial to understand exactly what you can afford. In Accra, many landlords require a 1 or 2-year rent advance. Make sure you factor this massive upfront cost into your budget. Look for properties that offer flexible payment plans if a massive upfront payment is a hurdle.</p>
      <h2>Location is Everything</h2>
      <p>Accra traffic is notoriously bad. Try to find a place that is relatively close to your workplace, or at least along a route that avoids the worst bottlenecks during rush hour. Neighborhoods like East Legon and Cantonments are premium, but emerging areas offer great value.</p>
      <h2>Use Trusted Agents</h2>
      <p>There are many unscrupulous individuals posing as agents. Always use verified platforms like DirectRent GH to ensure the agent you are dealing with is legitimate and vetted. Never pay viewing fees to an agent you haven''t thoroughly verified.</p>',
  'Guides',
  '2026-07-24T00:00:00Z',
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600',
  'Kwame Mensah',
  'Real Estate Expert'
),
(
  '22222222-2222-2222-2222-222222222222',
  'Top 5 Questions to Ask Your Landlord',
  'top-5-questions-to-ask-your-landlord',
  'Before signing any lease, make sure you ask your potential landlord these critical questions.',
  '<p>Before signing any lease, make sure you ask your potential landlord these critical questions to avoid unpleasant surprises down the line.</p>
      <h2>1. Are utilities included?</h2>
      <p>Always clarify if water and electricity bills are included in the rent or if you will be paying them separately. Ask about the reliability of water supply in the compound—is there a backup poly tank?</p>
      <h2>2. What is the maintenance policy?</h2>
      <p>If the plumbing breaks or the roof leaks, whose responsibility is it to fix it? Get this clearly stated in writing in your tenancy agreement.</p>
      <h2>3. Who are the other tenants?</h2>
      <p>If you are renting an apartment in a shared compound, it''s good to know who your neighbors are going to be. Are they families, young professionals, or students?</p>
      <h2>4. Can I make modifications?</h2>
      <p>Find out if you are allowed to paint the walls, drill holes for TVs, or change the locks.</p>',
  'Tips',
  '2026-07-18T00:00:00Z',
  'https://images.unsplash.com/photo-1556910103-1c02745a872e?w=1600',
  'Ama Serwaa',
  'Legal Advisor'
),
(
  '33333333-3333-3333-3333-333333333333',
  'The Importance of Using Verified Artisans',
  'the-importance-of-using-verified-artisans',
  'Why it''s crucial to hire verified artisans for your home repairs and maintenance tasks.',
  '<p>Maintaining a property is hard work, and finding the right people to do it can be even harder. Here is why it''s crucial to hire verified artisans for your home repairs and maintenance tasks.</p>
      <h2>Quality of Work</h2>
      <p>Verified artisans have a track record of delivering quality work. You don''t want to hire someone who will do a shoddy job that ends up costing you more in the long run to fix.</p>
      <h2>Security</h2>
      <p>Inviting strangers into your home is a security risk. Using a platform that verifies the identity of the artisans gives you peace of mind that the person entering your home is known and tracked.</p>
      <h2>Accountability</h2>
      <p>If something goes wrong, verified artisans on platforms like DirectRent GH can be held accountable through reviews and ratings. Their reputation is on the line, so they are more likely to deliver excellent service.</p>',
  'Maintenance',
  '2026-07-10T00:00:00Z',
  'https://images.unsplash.com/photo-1581141849291-1125c7b692b5?w=1600',
  'Kofi Owusu',
  'Facilities Manager'
);
