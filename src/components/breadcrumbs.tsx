import Link from "next/link";
import React from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, alignLeft }: { items: BreadcrumbItem[], alignLeft?: boolean }) {
  return (
    <nav className={`flex items-center space-x-2 text-xs md:text-sm text-body/70 mb-4 font-medium flex-wrap gap-y-2 ${alignLeft ? "md:justify-start" : "md:justify-center"}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-heading transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-heading" : ""}>{item.label}</span>
            )}
            {!isLast && (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-3.5 h-3.5 opacity-50 flex-shrink-0"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
