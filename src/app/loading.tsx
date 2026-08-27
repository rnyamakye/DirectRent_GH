import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full blur-xl bg-primary/20 animate-pulse" />
          <Spinner className="w-12 h-12 text-primary relative z-10" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-body/60 uppercase animate-pulse">
          Loading DirectRent
        </p>
      </div>
    </div>
  );
}
