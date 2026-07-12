import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="relative flex flex-col items-center">
        {/* Animated Truck SVG from public/truck.svg */}
        <div className="w-64 h-48 relative">
          <Image
            src="/truck.svg"
            alt="Loading TransitOps..."
            fill
            priority
            className="object-contain"
          />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">
          Loading TransitOps...
        </p>
      </div>
    </div>
  );
}
