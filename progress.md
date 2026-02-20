# Meridian.AI - Progresso

## Última atualização: 2026-02-19

## 📌 Visão Geral
- Dashboard multi-airdrop desacoplado de qualquer bot
- Stack: Next.js 15, Prisma, Neon PostgreSQL, Railway
- Dados chegam via API REST com autenticação por API Key
- Suporta projetos do tipo TRADING (bots) e POINTS (farming manual)

## ✅ Concluído (v0.1 - MVP)
- [x] Estrutura do projeto Next.js 15
- [x] Schema Prisma (Project, Trade, Snapshot, Event)
- [x] API de ingestion (`POST /api/ingest`) com autenticação por API Key
- [x] CRUD de projetos (`/api/projects`)
- [x] Página Overview (todos os projetos com PnL global)
- [x] Página Projetos (criação + listagem + API Key)
- [x] Página detalhe do projeto (trades, snapshot, eventos)
- [x] Health check (`/api/health`)
- [x] railway.toml configurado
- [x] .gitignore e .env.example

## 🚧 Próximos passos
- [ ] Criar banco no Neon e rodar `prisma db push`
- [ ] Criar repo no GitHub e fazer push
- [ ] Criar projeto no Railway e configurar DATABASE_URL
- [ ] Testar ingestion com o bot Ethereal
- [ ] Adicionar gráficos de PnL (recharts ou similar)
- [ ] Adicionar entrada manual de eventos na UI (POINTS projects)
- [ ] Adicionar paginação na tabela de trades

## 🔧 Configurações importantes
- `DATABASE_URL` → Neon PostgreSQL connection string
- Cada projeto tem uma `api_key` única gerada no momento da criação
- Bot envia dados via `POST /api/ingest` com header `X-Api-Key: <key>`
- **URL produção:** https://meridian-ai.up.railway.app

## 🔑 API Keys dos projetos
| Projeto | ID | API Key |
|---------|-----|---------|
| Ethereal | cmltn7vtn0000ydlea6wmdgj7 | `10efeab0-de53-4246-a937-8bdcb9ae42c2` |

## 📚 Dependências principais
- next: ^15.5.12
- @prisma/client: ^5.22.0
- tailwindcss: ^3.4.17
