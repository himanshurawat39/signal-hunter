import type { ReactNode } from "react";

type LegalPageProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function LegalPage({ title, description, children }: LegalPageProps) {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(2,6,23,0.3)] backdrop-blur-xl sm:p-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-100">
            Signal Hunter
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">{title}</h1>
          <p className="text-base leading-7 text-slate-300">{description}</p>
        </div>
        <div className="mt-10 space-y-8 text-sm leading-7 text-slate-300 sm:text-base">
          {children}
        </div>
      </div>
    </main>
  );
}
