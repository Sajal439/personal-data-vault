const implementedModules = [
  "Auth + Profile",
  "Vault + Folder + Tag",
  "Encrypted Document Storage",
  "Secure Share Links + Audit Logs",
  "AI Processing + Assistant",
  "Reminders + Background Worker",
  "Integrations (Google Drive, Dropbox)",
];

const hardeningFocus = [
  "Tenant isolation checks in upload path",
  "Secrets contract and env validation",
  "Encrypted integration token persistence",
  "Concurrency-safe share access limits",
  "CI-ready lint/typecheck/test/build scripts",
];

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-8 sm:px-10 lg:px-16">
      <section className="rise-in mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-7 shadow-[0_18px_45px_rgba(17,32,63,0.08)] sm:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
            Personal Data OS
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">
            Encrypted life-vault platform
            <span className="block text-[var(--accent)]">Phase 6 status board</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-700 sm:text-base">
            Backend modules through integrations are implemented. This workspace is
            now focused on hardening for production and then continuing with the
            next PRD phases.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--line)] bg-white/80 p-4">
              <p className="font-mono text-xs text-slate-500">Core API</p>
              <p className="mt-1 text-xl font-semibold text-[var(--ink)]">Ready</p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-white/80 p-4">
              <p className="font-mono text-xs text-slate-500">Worker</p>
              <p className="mt-1 text-xl font-semibold text-[var(--ink)]">Active</p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-white/80 p-4">
              <p className="font-mono text-xs text-slate-500">Hardening</p>
              <p className="mt-1 text-xl font-semibold text-[var(--accent)]">
                In Progress
              </p>
            </div>
          </div>
        </article>

        <aside className="rise-in rounded-3xl border border-[var(--line)] bg-[#13254a] p-6 text-[#f6f8ff] shadow-[0_14px_32px_rgba(17,32,63,0.25)] [animation-delay:120ms] sm:p-8">
          <h2 className="text-lg font-semibold">Security posture upgrades</h2>
          <p className="mt-2 text-sm text-[#d8def8]">
            Hardening is prioritized before new feature phases to preserve privacy
            guarantees and platform trust.
          </p>
          <div className="mt-5 space-y-3">
            <div className="rounded-xl bg-white/10 p-3">
              <p className="font-mono text-xs uppercase tracking-wider text-[#9ee6cf]">
                Encryption
              </p>
              <p className="mt-1 text-sm">AES-256-GCM for documents and secrets</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="font-mono text-xs uppercase tracking-wider text-[#9ee6cf]">
                Access control
              </p>
              <p className="mt-1 text-sm">Ownership validation on write paths</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="font-mono text-xs uppercase tracking-wider text-[#9ee6cf]">
                Reliability
              </p>
              <p className="mt-1 text-sm">Queue-safe share link access counters</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="mx-auto mt-6 grid w-full max-w-6xl gap-6 lg:grid-cols-2">
        <article className="rise-in rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 [animation-delay:200ms]">
          <h3 className="text-xl font-semibold">Implemented Modules</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {implementedModules.map((module) => (
              <li
                key={module}
                className="rounded-xl border border-[var(--line)] bg-white/70 px-3 py-2"
              >
                {module}
              </li>
            ))}
          </ul>
        </article>

        <article className="rise-in rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 [animation-delay:260ms]">
          <h3 className="text-xl font-semibold">Current Hardening Focus</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {hardeningFocus.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-[var(--line)] bg-white/70 px-3 py-2"
              >
                {item}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
