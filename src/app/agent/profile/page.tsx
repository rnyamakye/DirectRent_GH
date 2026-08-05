"use client";

import Link from "next/link";

const SETTINGS_SECTIONS = [
  {
    href: "/agent/profile/personal",
    title: "Personal information",
    description: "Provide your legal name, address, phone number and emergency contact details.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    href: "/agent/profile/security",
    title: "Login & security",
    description: "Change your password, manage connected accounts, review active sessions and deactivate your account.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
  {
    href: "/agent/profile/notifications",
    title: "Notifications",
    description: "Choose what types of emails and alerts you want to receive from DirectRent.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
  {
    href: "/agent/profile/payments",
    title: "Payments & methods",
    description: "Add and manage your mobile money accounts and payment cards.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
];

export default function AgentProfileSettingsHub() {
  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-heading">Account settings</h1>
        <p className="text-base text-body/80">Manage your personal info, security, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SETTINGS_SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group rounded-3xl border border-border bg-card p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-heading/20 transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-2xl bg-mint flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
              {section.icon}
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <h2 className="text-base font-bold text-heading group-hover:text-primary transition-colors">{section.title}</h2>
              <p className="text-sm text-body/70 leading-relaxed">{section.description}</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-body/50 group-hover:text-primary transition-colors">
              Manage
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}