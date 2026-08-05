import { NewsletterForm } from "@/components/admin/newsletter-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Newsletter | DirectRent GH",
};

export default function AdminNewsletterPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Newsletter Admin Panel</h1>
          <p className="mt-2 text-gray-600">Compose and send emails to all active subscribers.</p>
        </div>
        <NewsletterForm />
      </div>
    </div>
  );
}
