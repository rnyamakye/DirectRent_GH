export function AdHorizontalBanner() {
  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-[970px] h-[90px] md:h-[250px] rounded-2xl border-2 border-dashed border-border/60 bg-slate-50 flex flex-col items-center justify-center p-4 text-center shadow-sm">
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 md:mb-2">
          Advertisement
        </span>
        <h4 className="text-base md:text-lg font-bold text-heading mb-0 md:mb-1">Your Ad Here</h4>
        <p className="hidden md:block text-sm text-body/80">
          Reach thousands of renters and artisans across Ghana.
        </p>
      </div>
    </div>
  );
}
