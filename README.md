# Meridian.AI

Dashboard multi-airdrop desacoplado. Acompanha múltiplos projetos de farming (trading bots, points, etc.) em um único lugar.

## Stack

- **Next.js 15** (App Router)
- **Prisma** + **Neon PostgreSQL**
- **Tailwind CSS**
- **Railway** (deploy)

---

## Setup rápido

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar banco (Neon)

Crie um banco no [neon.tech](https://neon.tech), copie a connection string e crie o `.env`:

```bash
cp .env.example .env
# edite .env e cole sua DATABASE_URL
```

### 3. Criar as tabelas

```bash
npm run db:push
```

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:3000`

---

## Como funciona

### Criando um projeto

1. Acesse `/projects` e clique em **+ Novo Projeto**
2. Escolha nome, tipo (Trading ou Points) e cor
3. **Salve a API Key** — ela aparece só uma vez

### Enviando dados (bot/script)

Qualquer bot ou script envia dados via `POST /api/ingest`:

```bash
curl -X POST https://seu-meridian.up.railway.app/api/ingest \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: SUA_API_KEY" \
  -d '{
    "type": "trade",
    "data": {
      "tx_type": "close",
      "side": "long",
      "ticker": "BTCUSD",
      "quantity": 0.001,
      "price": 95000,
      "notional": 95.0,
      "pnl": 2.50,
      "reason": "trailing TP"
    }
  }'
```

#### Tipos de payload

**trade** — operação de trading:
```json
{
  "type": "trade",
  "data": {
    "tx_type": "open | close | switch_open | switch_close | stop_loss | take_profit",
    "side": "long | short",
    "ticker": "BTCUSD",
    "quantity": 0.001,
    "price": 95000,
    "notional": 95.0,
    "pnl": 2.50,
    "reason": "motivo opcional"
  }
}
```

**snapshot** — estado atual do bot (enviar periodicamente):
```json
{
  "type": "snapshot",
  "data": {
    "state": "holding",
    "side": "long",
    "ticker": "BTCUSD",
    "balance": 200.0,
    "pnl_pct": 2.5,
    "unrealized_pnl": 5.0,
    "funding_rate": 0.01,
    "trend": "BULLISH",
    "entry_price": 94000,
    "current_price": 95000
  }
}
```

**event** — para projetos de points (manual ou via script):
```json
{
  "type": "event",
  "data": {
    "title": "Daily task completa",
    "description": "Descrição opcional",
    "value": 100,
    "event_type": "task | milestone | points | note"
  }
}
```

---

## Deploy no Railway

1. Crie um novo projeto no Railway
2. Conecte o repo GitHub
3. Adicione a variável de ambiente `DATABASE_URL` (Neon)
4. Railway detecta Next.js automaticamente e faz o build

---

## Scripts úteis

```bash
npm run dev          # desenvolvimento local
npm run build        # build de produção
npm run db:push      # sincronizar schema com o banco
npm run db:studio    # abrir Prisma Studio (UI do banco)
npm run db:migrate   # rodar migrations em produção
```
