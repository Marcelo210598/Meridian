import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/ingest
 *
 * Header: X-Api-Key: <project_api_key>
 *
 * Body:
 * {
 *   "type": "trade" | "snapshot" | "event",
 *   "data": { ... }
 * }
 *
 * --- trade ---
 * {
 *   "tx_type": "open" | "close" | "switch_open" | "switch_close" | "stop_loss" | "take_profit",
 *   "side": "long" | "short",
 *   "ticker": "BTCUSD",
 *   "quantity": 0.001,
 *   "price": 95000,
 *   "notional": 95.0,
 *   "pnl": 1.5,          (opcional)
 *   "reason": "trailing TP"  (opcional)
 * }
 *
 * --- snapshot ---
 * {
 *   "state": "holding",
 *   "side": "long",
 *   "ticker": "BTCUSD",
 *   "balance": 200.0,
 *   "pnl_pct": 2.5,
 *   "unrealized_pnl": 5.0,
 *   "funding_rate": 0.01,
 *   "trend": "BULLISH",
 *   "entry_price": 94000,
 *   "current_price": 95000
 * }
 *
 * --- event ---
 * {
 *   "title": "Daily task completa",
 *   "description": "...",   (opcional)
 *   "value": 100,           (opcional - pontos, XP)
 *   "event_type": "task"    (task | milestone | points | note)
 * }
 */
export async function POST(request: NextRequest) {
  // Autenticação via API Key
  const apiKey = request.headers.get("X-Api-Key");
  if (!apiKey) {
    return NextResponse.json({ error: "X-Api-Key header obrigatório" }, { status: 401 });
  }

  const project = await prisma.project.findUnique({
    where: { api_key: apiKey, active: true },
  });
  if (!project) {
    return NextResponse.json({ error: "API Key inválida ou projeto inativo" }, { status: 401 });
  }

  let body: { type: string; data: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { type, data } = body;
  if (!type || !data) {
    return NextResponse.json({ error: "'type' e 'data' são obrigatórios" }, { status: 400 });
  }

  try {
    switch (type) {
      case "trade": {
        if (!data.tx_type || !data.side || !data.ticker || data.quantity == null || data.price == null || data.notional == null) {
          return NextResponse.json(
            { error: "trade requer: tx_type, side, ticker, quantity, price, notional" },
            { status: 400 }
          );
        }
        const trade = await prisma.trade.create({
          data: {
            project_id: project.id,
            tx_type: String(data.tx_type),
            side: String(data.side),
            ticker: String(data.ticker),
            quantity: Number(data.quantity),
            price: Number(data.price),
            notional: Number(data.notional),
            pnl: data.pnl != null ? Number(data.pnl) : null,
            reason: data.reason != null ? String(data.reason) : null,
          },
        });
        return NextResponse.json({ ok: true, id: trade.id });
      }

      case "snapshot": {
        const snapshot = await prisma.snapshot.create({
          data: {
            project_id: project.id,
            state: data.state != null ? String(data.state) : null,
            side: data.side != null ? String(data.side) : null,
            ticker: data.ticker != null ? String(data.ticker) : null,
            balance: data.balance != null ? Number(data.balance) : null,
            pnl_pct: data.pnl_pct != null ? Number(data.pnl_pct) : null,
            unrealized_pnl: data.unrealized_pnl != null ? Number(data.unrealized_pnl) : null,
            funding_rate: data.funding_rate != null ? Number(data.funding_rate) : null,
            trend: data.trend != null ? String(data.trend) : null,
            entry_price: data.entry_price != null ? Number(data.entry_price) : null,
            current_price: data.current_price != null ? Number(data.current_price) : null,
          },
        });
        return NextResponse.json({ ok: true, id: snapshot.id });
      }

      case "event": {
        if (!data.title) {
          return NextResponse.json({ error: "event requer: title" }, { status: 400 });
        }
        const event = await prisma.event.create({
          data: {
            project_id: project.id,
            title: String(data.title),
            description: data.description != null ? String(data.description) : null,
            value: data.value != null ? Number(data.value) : null,
            event_type: data.event_type != null ? String(data.event_type) : "note",
          },
        });
        return NextResponse.json({ ok: true, id: event.id });
      }

      default:
        return NextResponse.json(
          { error: `Tipo desconhecido: "${type}". Use: trade, snapshot, event` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[ingest] erro:", error);
    return NextResponse.json({ error: "Erro interno ao salvar dados" }, { status: 500 });
  }
}
