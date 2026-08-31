import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy & Cookie Policy - DirectRent GH",
  description: "Privacy policy and cookie guidelines for DirectRent GH.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="flex-1 w-full flex flex-col items-center bg-canvas pt-[104px] pb-24">
      <div className="w-full max-w-4xl px-4 md:px-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm font-semibold text-body hover:text-primary transition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
        
        <div className="bg-card border border-border shadow-sm rounded-3xl p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-heading mb-4">Privacy & Cookie Policy</h1>
          <p className="text-body text-sm mb-8 pb-8 border-b border-border">Last updated: August 2026</p>

          <div className="space-y-8 text-body text-base leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-heading mb-4">1. Introduction</h2>
              <p>
                Welcome to DirectRent GH. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you as to how we look after your personal data when you visit our website 
                and tell you about your privacy rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-4">2. The Data We Collect About You</h2>
              <p>
                Personal data, or personal information, means any information about an individual from which that person can be identified. 
                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
              </p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
                <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-4">3. Cookie Policy</h2>
              <p>
                Cookies are small text files that are placed on your computer or mobile device when you browse websites. 
                We use cookies to help us provide you with the best possible experience when you browse our website and also 
                allows us to improve our site.
              </p>
              <p className="mt-4">We use the following types of cookies:</p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li><strong>Strictly necessary cookies:</strong> These are cookies that are required for the operation of our website. They include, for example, cookies that enable you to log into secure areas of our website.</li>
                <li><strong>Analytical/performance cookies:</strong> They allow us to recognise and count the number of visitors and to see how visitors move around our website when they are using it. This helps us to improve the way our website works.</li>
                <li><strong>Functionality cookies:</strong> These are used to recognise you when you return to our website. This enables us to personalise our content for you, greet you by name and remember your preferences.</li>
              </ul>
              <p className="mt-4">
                You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. 
                If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-4">4. How We Use Your Data</h2>
              <p>
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              </p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                <li>Where we need to comply with a legal obligation.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-heading mb-4">5. Contact Us</h2>
              <p>
                If you have any questions about this privacy policy or our privacy practices, please contact us at:
              </p>
              <p className="mt-2 font-medium">privacy@directrentgh.com</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
