import Image from "next/image";

export function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <Image 
      src="/logo.png" 
      alt="DirectRent GH Logo" 
      width={160} 
      height={50} 
      className={`object-contain ${className}`}
      priority
    />
  );
}