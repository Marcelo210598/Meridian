import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const projects = await prisma.project.findMany({
    orderBy: { created_at: "desc" },
    include: {
      _count: { select: { trades: true, events: true } },
      snapshots: { orderBy: { created_at: "desc" }, take: 1 },
      trades: { select: { pnl: true } },
    },
  });

  const totalPnlGlobal = projects
    .flatMap((p) => p.trades)
    .reduce((sum, t) => sum + (t.pnl ?? 0), 0);

  const activeTradingProjects = projects.filter(
    (p) => p.type === "TRADING" && p.active
  ).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-white/50 text-sm mt-1">
            Todos os seus airdrops em um lugar
          </p>
        </div>
        <Link
          href="/projects"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors"
        >
          + Novo Projeto
        </Link>
      </div>

      {/* Global stats */}
      {projects.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/40 text-xs mb-1">PnL Global</p>
            <p
              className={`text-2xl font-bold ${
                totalPnlGlobal >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {totalPnlGlobal >= 0 ? "+" : ""}${totalPnlGlobal.toFixed(2)}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/40 text-xs mb-1">Projetos ativos</p>
            <p className="text-2xl font-bold">{activeTradingProjects}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/40 text-xs mb-1">Total projetos</p>
            <p className="text-2xl font-bold">{projects.length}</p>
          </div>
        </div>
      )}

      {/* Projects grid */}
      {projects.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-white/10 rounded-xl">
          <p className="text-white/40 mb-4">Nenhum projeto ainda</p>
          <Link
            href="/projects"
            className="text-indigo-400 hover:text-indigo-300 text-sm"
          >
            Criar primeiro projeto →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const totalPnl = project.trades.reduce(
              (sum, t) => sum + (t.pnl ?? 0),
              0
            );
            const latestSnapshot = project.snapshots[0];

            return (
              <Link key={project.id} href={`/projects/${project.slug}`}>
                <div className="border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all hover:bg-white/5 cursor-pointer h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{
                          backgroundColor: project.color + "25",
                          color: project.color,
                        }}
                      >
                        {project.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{project.name}</p>
                        <p className="text-white/40 text-xs">{project.type}</p>
                      </div>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        project.active ? "bg-green-500" : "bg-white/20"
                      }`}
                    />
                  </div>

                  {project.type === "TRADING" ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-white/40 text-xs mb-1">PnL Total</p>
                        <p
                          className={`font-semibold text-sm ${
                            totalPnl >= 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs mb-1">Saldo</p>
                        <p className="font-semibold text-sm">
                          {latestSnapshot?.balance
                            ? `$${latestSnapshot.balance.toFixed(2)}`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs mb-1">Trend</p>
                        <p className="text-sm">
                          {latestSnapshot?.trend === "BULLISH"
                            ? "🟢 BULLISH"
                            : latestSnapshot?.trend === "BEARISH"
                            ? "🔴 BEARISH"
                            : "⚪ —"}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs mb-1">Trades</p>
                        <p className="font-semibold text-sm">
                          {project._count.trades}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-white/40 text-xs mb-1">Eventos</p>
                        <p className="font-semibold text-sm">
                          {project._count.events}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs mb-1">Tipo</p>
                        <p className="font-semibold text-sm text-yellow-400">
                          Points
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
