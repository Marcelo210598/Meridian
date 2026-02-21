const ETHEREAL_API = "https://api.ethereal.trade";

export type EtherealPoints = {
  totalPoints: string;
  rank: number;
  tier: number;
};

export type EtherealFill = {
  orderId: string;
  side: string;       // "buy" | "sell"
  ticker: string;
  price: string;
  quantity: string;
  fee: string;
  realizedPnl: string | null;
  createdAt: string;
};

export type EtherealPosition = {
  ticker: string;
  side: string;       // "long" | "short"
  quantity: string;
  entryPrice: string;
  markPrice: string;
  unrealizedPnl: string;
  leverage: number;
} | null;

export async function fetchEtherealPoints(
  address: string
): Promise<EtherealPoints | null> {
  try {
    const res = await fetch(
      `${ETHEREAL_API}/v1/points/summary?address=${encodeURIComponent(address)}`,
      { next: { revalidate: 300 } } // cache 5 min
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchEtherealFills(
  subaccountId: string,
  limit = 50
): Promise<EtherealFill[]> {
  try {
    const res = await fetch(
      `${ETHEREAL_API}/v1/order/fill?subaccountId=${encodeURIComponent(subaccountId)}&limit=${limit}`,
      { next: { revalidate: 60 } } // cache 1 min
    );
    if (!res.ok) return [];
    const data = await res.json();
    // API pode retornar array direto ou { fills: [...] }
    return Array.isArray(data) ? data : (data.fills ?? data.data ?? []);
  } catch {
    return [];
  }
}

export async function fetchEtherealPosition(
  subaccountId: string
): Promise<EtherealPosition> {
  try {
    const res = await fetch(
      `${ETHEREAL_API}/v1/position?subaccountId=${encodeURIComponent(subaccountId)}`,
      { next: { revalidate: 60 } } // cache 1 min
    );
    if (!res.ok) return null;
    const data = await res.json();
    // API pode retornar array ou objeto único
    const pos = Array.isArray(data) ? data[0] : data;
    return pos ?? null;
  } catch {
    return null;
  }
}
