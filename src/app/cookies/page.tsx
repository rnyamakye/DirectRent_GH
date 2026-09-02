export const metadata = {
  title: 'Cookies Policy | DirectRent GH',
  description: 'Our cookies policy',
};

export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-5">
      <h1 className="text-3xl font-bold text-heading mb-6">Cookies Policy</h1>
      <div className="prose prose-slate max-w-none text-body/80">
        <p>This is the Cookies Policy for DirectRent GH.</p>
        <p>We use cookies to improve your experience on our platform, analyze site usage, and assist in our marketing efforts.</p>
        <h2 className="text-xl font-semibold text-heading mt-6 mb-3">1. What are cookies?</h2>
        <p>Cookies are small text files that are placed on your computer or mobile device when you browse websites.</p>
        <h2 className="text-xl font-semibold text-heading mt-6 mb-3">2. How we use cookies</h2>
        <p>We use essential cookies to maintain your session and preferences. We may also use analytics cookies to understand how our site is used.</p>
      </div>
    </div>
  );
}
