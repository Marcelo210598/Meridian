# Meridian.AI — Resumo Geral

## O que é
Dashboard centralizado para acompanhar múltiplos airdrops (bots de trading + farming manual).
Completamente desacoplado dos bots — cada bot envia dados via API Key.

## Stack
- Next.js 15 (App Router) + TypeScript + Tailwind
- Prisma 5 + Neon PostgreSQL (sa-east-1)
- Deploy: Railway (meridian-ai.up.railway.app)
- GitHub: https://github.com/Marcelo210598/Meridian.git

## Projetos registrados
| Nome | Tipo | API Key |
|------|------|---------|
| Ethereal | TRADING | `10efeab0-de53-4246-a937-8bdcb9ae42c2` |

## Como adicionar novo projeto
1. Acessar /projects no dashboard
2. Clicar "+ Novo Projeto"
3. Preencher nome, tipo, cor
4. Salvar a API Key imediatamente (aparece só uma vez)
5. Colocar no .env do bot: MERIDIAN_URL + MERIDIAN_API_KEY

## Como o bot envia dados
- Bot usa integrations/meridian_client.py (fire-and-forget)
- Cada trade fechado/aberto é enviado via POST /api/ingest
- Header: X-Api-Key: <api_key_do_projeto>

## Estado atual (2026-02-19)
- Deploy funcionando ✅
- Recebendo trades do bot Ethereal ✅
- Snapshots (saldo/trend em tempo real) — pendente para próxima sessão
