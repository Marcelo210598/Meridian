"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  slug: string;
  type: string;
  color: string;
  api_key: string;
  active: boolean;
  created_at: string;
  _count?: { trades: number; events: number };
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    type: "TRADING",
    color: "#6366f1",
    wallet_address: "",
    subaccount_id: "",
  });
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });
      const data = await res.json();
      if (res.ok) {
        setProjects((prev) => [data, ...prev]);
        setCreatedKey(data.api_key);
        setShowForm(false);
        setNewProject({ name: "", type: "TRADING", color: "#6366f1", wallet_address: "", subaccount_id: "" });
      } else {
        alert(data.error);
      }
    } finally {
      setCreating(false);
    }
  }

  function handleCopy(key: string) {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return <div className="text-white/40 text-sm">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Projetos</h1>
          <p className="text-white/50 text-sm mt-1">
            Gerencie seus airdrops e obtenha as API Keys
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors"
        >
          + Novo Projeto
        </button>
      </div>

      {/* API Key recém criada */}
      {createdKey && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <p className="text-green-400 font-medium text-sm mb-2">
            ✅ Projeto criado! Salve a API Key — ela aparece só uma vez:
          </p>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-black/40 px-3 py-2 rounded-lg text-sm font-mono text-green-300 break-all">
              {createdKey}
            </code>
            <button
              onClick={() => handleCopy(createdKey)}
              className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 text-xs rounded-lg transition-colors whitespace-nowrap"
            >
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
          <p className="text-white/30 text-xs mt-2">
            Use no header: <code className="text-white/50">X-Api-Key: {createdKey.slice(0, 8)}...</code>
          </p>
          <button
            onClick={() => setCreatedKey(null)}
            className="mt-2 text-white/30 text-xs hover:text-white/60 transition-colors"
          >
            Entendi, fechar →
          </button>
        </div>
      )}

      {/* Formulário novo projeto */}
      {showForm && (
        <div className="mb-6 p-5 border border-white/10 rounded-xl bg-white/5">
          <h2 className="font-medium mb-4 text-sm">Novo Projeto</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm text-white/60 block mb-1">Nome</label>
              <input
                type="text"
                value={newProject.name}
                onChange={(e) =>
                  setNewProject((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Ex: Ethereal, Berachain, Monad..."
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-sm text-white/60 block mb-1">Tipo</label>
              <select
                value={newProject.type}
                onChange={(e) =>
                  setNewProject((p) => ({ ...p, type: e.target.value }))
                }
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="TRADING">Trading — bot automático</option>
                <option value="POINTS">Points — farming manual</option>
                <option value="OTHER">Outro</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-white/60 block mb-1">Cor</label>
              <input
                type="color"
                value={newProject.color}
                onChange={(e) =>
                  setNewProject((p) => ({ ...p, color: e.target.value }))
                }
                className="h-9 w-20 bg-black/30 border border-white/10 rounded-lg cursor-pointer"
              />
            </div>
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-white/40 mb-3">
                Integração Ethereal (opcional) — busca pontos e trades automaticamente
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-white/60 block mb-1">Wallet Address</label>
                  <input
                    type="text"
                    value={newProject.wallet_address}
                    onChange={(e) =>
                      setNewProject((p) => ({ ...p, wallet_address: e.target.value }))
                    }
                    placeholder="0x857550257aee74075d955c166761a7f9d922f232"
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 block mb-1">Subaccount ID</label>
                  <input
                    type="text"
                    value={newProject.subaccount_id}
                    onChange={(e) =>
                      setNewProject((p) => ({ ...p, subaccount_id: e.target.value }))
                    }
                    placeholder="4a408285-9cd9-4e6e-a758-3d379583de19"
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
              >
                {creating ? "Criando..." : "Criar Projeto"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-white/10 rounded-lg text-sm text-white/60 hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de projetos */}
      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex items-center justify-between p-4 border border-white/10 rounded-xl hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                style={{
                  backgroundColor: project.color + "25",
                  color: project.color,
                }}
              >
                {project.name[0].toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-sm">{project.name}</p>
                <p className="text-white/40 text-xs">
                  {project.type} ·{" "}
                  {project._count?.trades ?? 0} trades ·{" "}
                  {project._count?.events ?? 0} eventos ·{" "}
                  <span className={project.active ? "text-green-400" : "text-white/30"}>
                    {project.active ? "Ativo" : "Inativo"}
                  </span>
                </p>
              </div>
            </div>
            <Link
              href={`/projects/${project.slug}`}
              className="px-3 py-1.5 text-sm text-indigo-400 hover:text-indigo-300 border border-indigo-400/20 hover:border-indigo-400/40 rounded-lg transition-colors"
            >
              Ver →
            </Link>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="text-center py-16 text-white/30 text-sm">
            Nenhum projeto ainda. Crie o primeiro!
          </div>
        )}
      </div>
    </div>
  );
}
