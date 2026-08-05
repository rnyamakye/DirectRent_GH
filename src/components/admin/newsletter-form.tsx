"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!subject || !html || !secret) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, html, secret }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send emails");
      }

      setMessage({ type: "success", text: data.message || "Emails sent successfully!" });
      setSubject("");
      setHtml("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "An error occurred." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Send Newsletter</h2>
      
      {message && (
        <div className={`p-4 mb-6 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label htmlFor="secret" className="block text-sm font-medium text-gray-700 mb-1">
            Admin Secret Key
          </label>
          <input
            id="secret"
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
            placeholder="Enter the NEWSLETTER_SECRET"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
            placeholder="e.g., This week's top properties in Accra"
          />
        </div>

        <div>
          <label htmlFor="html" className="block text-sm font-medium text-gray-700 mb-1">
            Email Content (HTML)
          </label>
          <textarea
            id="html"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            required
            rows={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-mono text-sm"
            placeholder="<h1>Hello!</h1><p>Check out our new listings.</p>"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0f5c3a] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#1a8a5a] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending Emails..." : "Send Newsletter to All Active Subscribers"}
        </button>
      </form>
    </div>
  );
}
