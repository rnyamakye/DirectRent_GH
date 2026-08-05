import Link from "next/link";

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I find a listing?",
      answer: "You can browse all available listings on the Listings page. Use the filters to narrow down by price, bedrooms, and property type to find your perfect match."
    },
    {
      question: "Are the agents verified?",
      answer: "We strive to vet agents on our platform. Always remember to view the property in person before making any payments or deposits."
    },
    {
      question: "How do I contact an artisan?",
      answer: "Navigate to the Artisans directory and click on an artisan's profile. You'll find their contact information and services offered there."
    },
    {
      question: "Can I list my own property?",
      answer: "Yes! If you are a real estate agent or landlord, sign up for an Agent account to start adding your own listings to the platform."
    }
  ];

  return (
    <main className="flex-1 px-6 py-16 max-w-3xl mx-auto w-full flex flex-col gap-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-heading mb-4">Help Center</h1>
        <p className="font-supporting text-lg text-body max-w-xl mx-auto">
          Need assistance? Find answers to common questions below or reach out to our team.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-heading">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-bold text-heading mb-2">{faq.question}</h3>
              <p className="font-supporting text-base text-body leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-mint/40 border border-primary/20 p-8 text-center flex flex-col gap-4 items-center">
        <h2 className="text-xl font-bold text-heading">Still need help?</h2>
        <p className="font-supporting text-body mb-2">
          If you couldn't find the answer to your question, our support team is ready to assist you.
        </p>
        <Link 
          href="/contact" 
          className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold transition shadow-sm"
        >
          Contact Support
        </Link>
      </div>
    </main>
  );
}
