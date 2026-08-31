export function AdSidebar({ side }: { side: "left" | "right" }) {
  return (
    <div className="h-full w-full py-24 px-4 flex flex-col items-center">
      <div className="sticky top-24 w-full h-[600px] rounded-2xl border-2 border-dashed border-border/60 bg-slate-50 flex flex-col items-center justify-center p-6 text-center shadow-sm">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
          Advertisement
        </span>
        <div className="w-16 h-16 rounded-full bg-slate-200 mb-4 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <h4 className="text-lg font-bold text-heading mb-2">Your Ad Here</h4>
        <p className="text-sm text-body/80">
          Reach thousands of renters and artisans across Ghana.
        </p>
      </div>
    </div>
  );
}
