"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  projectId: string;
  walletAddress: string | null;
  subaccountId: string | null;
};

export default function EtherealConfig({ projectId, walletAddress, subaccountId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [wallet, setWallet] = useState(walletAddress ?? "");
  const [subaccount, setSubaccount] = useState(subaccountId ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet_address: wallet, subaccount_id: subaccount }),
      });
      setSaved(true);
      setTimeout(() => {
        setOpen(false);
        setSaved(false);
        router.refresh();
      }, 800);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mb-8">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg"
        >
          ⚙️ {walletAddress ? "Editar" : "Configurar"} integração Ethereal
        </button>
      ) : (
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-sm font-medium mb-3">Integração Ethereal</p>
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs text-white/50 block mb-1">Wallet Address</label>
              <input
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder="0x..."
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Subaccount ID</label>
              <input
                value={subaccount}
                onChange={(e) => setSubaccount(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
            >
              {saved ? "✅ Salvo!" : saving ? "Salvando..." : "Salvar"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-1.5 border border-white/10 rounded-lg text-sm text-white/50 hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
