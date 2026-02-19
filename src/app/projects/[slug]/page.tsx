import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      trades: { orderBy: { created_at: "desc" }, take: 100 },
      snapshots: { orderBy: { created_at: "desc" }, take: 1 },
      events: { orderBy: { created_at: "desc" }, take: 50 },
      _count: { select: { trades: true, events: true } },
    },
  });

  if (!project) notFound();

  const closedTrades = project.trades.filter((t) => t.pnl !== null);
  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const winTrades = closedTrades.filter((t) => (t.pnl ?? 0) > 0).length;
  const winRate =
    closedTrades.length > 0 ? (winTrades / closedTrades.length) * 100 : 0;

  const latestSnapshot = project.snapshots[0];

  return (
    <div>
      {/* Cabeçalho do projeto */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
          style={{
            backgroundColor: project.color + "25",
            color: project.color,
          }}
        >
          {project.name[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-white/40 text-sm">
            {project.type} ·{" "}
            <span className={project.active ? "text-green-400" : "text-white/30"}>
              {project.active ? "🟢 Ativo" : "🔴 Inativo"}
            </span>
          </p>
        </div>
      </div>

      {/* Stats principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-white/40 text-xs mb-1">PnL Total</p>
          <p
            className={`text-xl font-bold ${
              totalPnl >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-white/40 text-xs mb-1">Saldo atual</p>
          <p className="text-xl font-bold">
            {latestSnapshot?.balance
              ? `$${latestSnapshot.balance.toFixed(2)}`
              : "—"}
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-white/40 text-xs mb-1">Win Rate</p>
          <p
            className={`text-xl font-bold ${
              winRate >= 60
                ? "text-green-400"
                : winRate >= 40
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {closedTrades.length > 0 ? `${winRate.toFixed(0)}%` : "—"}
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-white/40 text-xs mb-1">Total Trades</p>
          <p className="text-xl font-bold">{project._count.trades}</p>
        </div>
      </div>

      {/* Último snapshot (trading) */}
      {latestSnapshot && project.type === "TRADING" && (
        <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-white/40 text-xs mb-3 uppercase tracking-wider font-medium">
            Último snapshot do bot
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-white/40">Estado: </span>
              <span className="font-medium">{latestSnapshot.state ?? "—"}</span>
            </div>
            <div>
              <span className="text-white/40">Lado: </span>
              <span
                className={`font-medium ${
                  latestSnapshot.side === "long"
                    ? "text-green-400"
                    : latestSnapshot.side === "short"
                    ? "text-red-400"
                    : ""
                }`}
              >
                {latestSnapshot.side?.toUpperCase() ?? "—"}
              </span>
            </div>
            <div>
              <span className="text-white/40">Trend: </span>
              <span className="font-medium">
                {latestSnapshot.trend === "BULLISH"
                  ? "🟢 BULLISH"
                  : latestSnapshot.trend === "BEARISH"
                  ? "🔴 BEARISH"
                  : "⚪ NEUTRAL"}
              </span>
            </div>
            <div>
              <span className="text-white/40">Funding: </span>
              <span className="font-medium">
                {latestSnapshot.funding_rate != null
                  ? `${latestSnapshot.funding_rate.toFixed(4)}%`
                  : "—"}
              </span>
            </div>
            <div>
              <span className="text-white/40">Preço entrada: </span>
              <span className="font-medium">
                {latestSnapshot.entry_price
                  ? `$${latestSnapshot.entry_price.toFixed(0)}`
                  : "—"}
              </span>
            </div>
            <div>
              <span className="text-white/40">Preço atual: </span>
              <span className="font-medium">
                {latestSnapshot.current_price
                  ? `$${latestSnapshot.current_price.toFixed(0)}`
                  : "—"}
              </span>
            </div>
            <div>
              <span className="text-white/40">PnL não realizado: </span>
              <span
                className={`font-medium ${
                  (latestSnapshot.unrealized_pnl ?? 0) >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {latestSnapshot.unrealized_pnl != null
                  ? `${latestSnapshot.unrealized_pnl >= 0 ? "+" : ""}$${latestSnapshot.unrealized_pnl.toFixed(2)}`
                  : "—"}
              </span>
            </div>
            <div>
              <span className="text-white/40">Ticker: </span>
              <span className="font-medium">{latestSnapshot.ticker ?? "—"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de trades */}
      {project.type === "TRADING" && (
        <div className="mb-8">
          <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/60">
            Histórico de Trades
          </h2>
          {project.trades.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl text-white/30 text-sm">
              Nenhum trade ainda. Configure o bot para enviar dados ao Meridian.
            </div>
          ) : (
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-4 py-3 text-left text-white/40 font-normal">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-white/40 font-normal">
                      Lado
                    </th>
                    <th className="px-4 py-3 text-left text-white/40 font-normal">
                      Ticker
                    </th>
                    <th className="px-4 py-3 text-right text-white/40 font-normal">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right text-white/40 font-normal">
                      Preço
                    </th>
                    <th className="px-4 py-3 text-right text-white/40 font-normal">
                      PnL
                    </th>
                    <th className="px-4 py-3 text-right text-white/40 font-normal">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {project.trades.map((trade) => (
                    <tr
                      key={trade.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/70">
                          {trade.tx_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            trade.side === "long"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {trade.side.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/60 text-xs">
                        {trade.ticker}
                      </td>
                      <td className="px-4 py-3 text-right text-white/70">
                        {trade.quantity.toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-right text-white/70">
                        ${trade.price.toFixed(0)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-medium ${
                          trade.pnl == null
                            ? "text-white/30"
                            : trade.pnl >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {trade.pnl == null
                          ? "—"
                          : `${trade.pnl >= 0 ? "+" : ""}$${trade.pnl.toFixed(2)}`}
                      </td>
                      <td className="px-4 py-3 text-right text-white/40 text-xs">
                        {new Date(trade.created_at).toLocaleString("pt-BR", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Eventos (projetos de pontos) */}
      {project.type !== "TRADING" && (
        <div>
          <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/60">
            Eventos & Pontos
          </h2>
          {project.events.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl text-white/30 text-sm">
              Nenhum evento ainda. Envie via API ou adicione manualmente.
            </div>
          ) : (
            <div className="space-y-2">
              {project.events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{event.title}</p>
                    {event.description && (
                      <p className="text-white/40 text-xs mt-0.5">
                        {event.description}
                      </p>
                    )}
                    <p className="text-white/30 text-xs mt-1">
                      {new Date(event.created_at).toLocaleString("pt-BR")} ·{" "}
                      {event.event_type}
                    </p>
                  </div>
                  {event.value != null && (
                    <span className="text-yellow-400 font-semibold text-sm">
                      +{event.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
