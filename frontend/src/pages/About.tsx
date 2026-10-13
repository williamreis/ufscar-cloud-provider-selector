const REPO_URL = "https://github.com/williamreis/ufscar-cloud-provider-selector";

const SPREADSHEETS_BASE =
  "https://github.com/williamreis/ufscar-cloud-provider-selector/raw/refs/heads/main/docs/simulacoes";

const SPREADSHEETS = [
  {
    icon: "🔒",
    title: "Memória de Cálculo - Segurança",
    accent: "#4a3aa7",
    href: `${SPREADSHEETS_BASE}/Cenario_Seguranca.xlsx`,
  },
  {
    icon: "🌱",
    title: "Memória de Cálculo - Sustentabilidade",
    accent: "#1baf7a",
    href: `${SPREADSHEETS_BASE}/Cenario_Sustentabilidade.xlsx`,
  },
  {
    icon: "⚡",
    title: "Memória de Cálculo - Desempenho Operacional",
    accent: "#2a78d6",
    href: `${SPREADSHEETS_BASE}/Cenario_Desempenho.xlsx`,
  },
];

export default function About() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sobre</h1>
        <p className="mt-1 text-sm text-slate-500">
          Código-fonte do projeto e memórias de cálculo das simulações por cenário.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Repositório
        </h2>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 break-all text-blue-700 hover:underline"
        >
          <span aria-hidden>🐙</span>
          {REPO_URL.replace("https://", "")}
        </a>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Planilhas
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {SPREADSHEETS.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                className="flex h-full items-start gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                style={{ borderLeft: `4px solid ${s.accent}` }}
              >
                <span aria-hidden className="text-xl">
                  {s.icon}
                </span>
                <span>
                  <span className="block text-sm font-medium text-slate-900">{s.title}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">Baixar .xlsx</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
