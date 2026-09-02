import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://directrentgh.com'

  // Fetch all listings
  const { data: listings } = await supabase
    .from('listings')
    .select('id, updated_at')
    
  // Fetch all agents
  const { data: agents } = await supabase
    .from('profiles')
    .select('id, updated_at')
    .eq('role', 'agent')
    
  // Fetch all artisans
  const { data: artisans } = await supabase
    .from('profiles')
    .select('id, updated_at')
    .eq('role', 'artisan')
    
  // Fetch all blog posts
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, published_at')

  const listingUrls = (listings || []).map((listing) => ({
    url: `${baseUrl}/listings/${listing.id}`,
    lastModified: listing.updated_at ? new Date(listing.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const agentUrls = (agents || []).map((agent) => ({
    url: `${baseUrl}/agents/${agent.id}`,
    lastModified: agent.updated_at ? new Date(agent.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const artisanUrls = (artisans || []).map((artisan) => ({
    url: `${baseUrl}/artisans/${artisan.id}`,
    lastModified: artisan.updated_at ? new Date(artisan.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const postUrls = (posts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.published_at ? new Date(post.published_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/blog',
    '/listings',
    '/agents',
    '/artisans',
    '/auth/login',
    '/auth/register',
    '/privacy-policy',
    '/terms',
    '/cookies'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return [...staticRoutes, ...listingUrls, ...agentUrls, ...artisanUrls, ...postUrls]
}
