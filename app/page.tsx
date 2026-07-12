const highlights = [
  { label: "App Router", value: "Ready" },
  { label: "TypeScript", value: "Configured" },
  { label: "Tailwind CSS", value: "Working" },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_35%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)]" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-16 sm:px-10 lg:px-12">
        <div className="w-full rounded-[2rem] border border-slate-200/80 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-sm sm:p-10 lg:p-14">
          <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-sky-700">
            Initial foundation
          </div>

          <div className="mt-6 max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              TransitOps
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              A lean foundation for modern fleet operations.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5"
              >
                <div className="text-sm font-medium text-slate-500">
                  {item.label}
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-950">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
