import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-canvas pb-24">
      {/* 1. Hero Section */}
      <section className="relative w-full h-[60vh] min-h-screen flex items-center justify-center -mt-[76px] overflow-hidden">
        <Image
          src="/about/hero.png"
          alt="Modern Home in Ghana"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/50" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-canvas to-transparent" />

        <div className="relative z-10 text-center px-4 pt-26">
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-md">
            About DirectRent GH
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-sm font-medium">
            Redefining the real estate experience in Ghana through trust, transparency, and innovation.
          </p>
        </div>
      </section>

      {/* 2. Our Story */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-heading">Our Story</h2>
          <div className="w-16 h-1 bg-primary mx-auto mt-4 rounded-full" />
        </div>
        <div className="space-y-6 text-lg text-body leading-relaxed font-supporting">
          <p>
            <strong className="text-heading">What we do:</strong> DirectRent GH is Ghana's premier platform for connecting renters with verified landlords, dedicated agents, and highly skilled artisans. We streamline the entire property lifecycle—from finding the perfect home to ensuring it's beautifully maintained.
          </p>
          <p>
            <strong className="text-heading">When we were established:</strong> Founded in 2023, we recognized the growing need for a digital-first approach to a rapidly expanding urban housing market in Accra, Kumasi, and beyond.
          </p>
          <p>
            <strong className="text-heading">Why we were established:</strong> The Ghanaian real estate market has historically been plagued by informal agreements, hidden fees, and unverified listings. We built DirectRent GH to eliminate these pain points. By introducing rigorous verification processes and a seamless user interface, we bring unprecedented transparency, trust, and convenience to property searching.
          </p>
        </div>
      </section>

      {/* 3. Fast Facts */}
      <section className="bg-white py-16 border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-heading mb-10">Fast Facts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-canvas border border-border transition-transform hover:-translate-y-1 hover:shadow-md">
              <div className="text-4xl font-black text-primary mb-2">50k+</div>
              <div className="text-heading font-semibold">Active Users</div>
              <div className="text-sm text-body mt-2">Renters and professionals across Ghana.</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-canvas border border-border transition-transform hover:-translate-y-1 hover:shadow-md">
              <div className="text-4xl font-black text-primary mb-2">10k+</div>
              <div className="text-heading font-semibold">Verified Properties</div>
              <div className="text-sm text-body mt-2">Carefully vetted for your peace of mind.</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-canvas border border-border transition-transform hover:-translate-y-1 hover:shadow-md">
              <div className="text-4xl font-black text-primary mb-2">500+</div>
              <div className="text-heading font-semibold">Trusted Artisans</div>
              <div className="text-sm text-body mt-2">Ready to assist with maintenance and repairs.</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Founders Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-left mb-16">
          <h2 className="text-3xl font-bold text-heading">Founders</h2>

        </div>

        <div className="flex flex-col gap-10">
          {/* Founder 1 */}
          <div className="group flex flex-col md:flex-row gap-10 items-center md:items-start text-left">
            <div className="relative shrink-0 w-[400px] h-[480px] overflow-hidden rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-100">
              <Image
                src="/about/founder_1.png"
                alt="Kwame Mensah - CEO & Co-Founder"
                fill
                className="object-cover"
              />
            </div>
            
            <div className="flex flex-col justify-center md:pt-10 max-w-2xl">
              <h3 className="text-3xl font-bold text-heading mb-2">Kwame Mensah</h3>
              <p className="text-xl text-primary font-medium mb-6">CEO & Co-Founder</p>
              <div className="space-y-4 text-lg text-body leading-relaxed font-supporting">
                <p>
                  Kwame is a visionary entrepreneur with over 15 years of experience in the African real estate and technology sectors. Before founding DirectRent GH, he led the digital transformation of several major property firms across West Africa.
                </p>
                <p>
                  His passion for eliminating friction in property renting comes from his own experiences finding reliable housing in Accra. He brings a wealth of expertise in product development, strategic growth, and operations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Join Us Banner */}
      <section className="max-w-5xl mx-auto px-6 mb-12">
        <div className="relative overflow-hidden rounded-3xl bg-heading text-white shadow-xl">
          <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-transparent pointer-events-none" />
          <div className="relative z-10 px-8 py-16 md:p-20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience Better Real Estate?</h2>
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
              Whether you are looking for your next home, or you're a professional looking to expand your reach, DirectRent GH is the place for you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/register?type=renter"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition shadow-lg hover:shadow-primary/30"
              >
                Join as a Renter
              </Link>
              <Link
                href="/auth/register?type=professional"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-heading font-bold hover:bg-slate-50 transition shadow-lg"
              >
                Join as a Professional
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
