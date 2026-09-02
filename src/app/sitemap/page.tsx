import Link from "next/link";

export const metadata = {
  title: 'Sitemap | DirectRent GH',
  description: 'Sitemap of DirectRent GH',
};

export default function SitemapPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-5">
      <h1 className="text-3xl font-bold text-heading mb-6">Sitemap</h1>
      <div className="flex flex-col gap-2">
        <Link href="/" className="text-primary hover:underline">Home</Link>
        <Link href="/about" className="text-primary hover:underline">About Us</Link>
        <Link href="/listings" className="text-primary hover:underline">Listings</Link>
        <Link href="/artisans" className="text-primary hover:underline">Artisans</Link>
        <Link href="/contact" className="text-primary hover:underline">Contact</Link>
      </div>
    </div>
  );
}
