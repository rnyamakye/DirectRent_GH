"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to send message");

      toast.success("Message sent! We'll be in touch soon.");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-heading">Name</label>
        <input 
          id="name" 
          type="text" 
          required
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="rounded-xl border border-border bg-canvas px-4 py-2.5 text-sm text-heading outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20" 
          placeholder="Your name" 
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-heading">Email</label>
        <input 
          id="email" 
          type="email" 
          required
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          className="rounded-xl border border-border bg-canvas px-4 py-2.5 text-sm text-heading outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20" 
          placeholder="your@email.com" 
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium text-heading">Message</label>
        <textarea 
          id="message" 
          rows={4} 
          required
          value={formData.message}
          onChange={e => setFormData({ ...formData, message: e.target.value })}
          className="rounded-xl border border-border bg-canvas px-4 py-2.5 text-sm text-heading outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20" 
          placeholder="How can we help?"
        ></textarea>
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className="mt-2 w-full rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-hover disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
