import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="flex flex-col items-center gap-4 text-body/50">
        <Spinner className="w-8 h-8 text-primary" />
        <p className="text-sm font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
