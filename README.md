# SUEDFLOW Web Frontend v1.0

Frontend Next.js 14 conectado ao backend SUEDFLOW (Railway).

## Stack

- Next.js 14.2.5 + React 18 + TypeScript
- Tailwind CSS com paleta SUEDFLOW (navy + orange + glass-morphism)
- Tema claro/escuro com toggle persistente
- API client tipado conectando ao backend Railway

## Páginas implementadas (12)

### Público
- `/` Splash · landing
- `/auth/login` Login
- `/auth/cadastro` Cadastro (Cliente / Profissional)

### Cliente
- `/cliente` Home com KPIs e demandas
- `/cliente/demandas` Lista filtrável
- `/cliente/demandas/[id]` Detalhe com FSM completo
- `/cliente/nova-demanda` Wizard 3 etapas (SVC → Imóvel + Motor UTS → Confirmação)

### Admin
- `/admin` Dashboard com KPIs e atalhos
- `/admin/demandas` Listagem
- `/admin/profissionais` KYC + listagem
- `/admin/teste` Ferramentas v4.4.5 (criar prof teste, login-as, marcar pago, forçar status)

## Como rodar localmente

```bash
cd frontend
npm install
cp .env.example .env.local
# Edite .env.local apontando para o backend Railway
npm run dev
```

Aplicação roda em `http://localhost:3000`.

## Variáveis de ambiente

```
NEXT_PUBLIC_API_BASE=https://suedflow-backend-production.up.railway.app
```

Quando tiver domínio próprio configurado:
```
NEXT_PUBLIC_API_BASE=https://api.suedflow.com.br
```

## Deploy na Vercel

1. Crie conta gratuita em [vercel.com](https://vercel.com)
2. Conecte sua conta GitHub
3. Suba este projeto para um repositório (`suedflow-web`)
4. Em Vercel: New Project → escolha o repositório
5. Adicione a env var `NEXT_PUBLIC_API_BASE` com URL do Railway
6. Deploy automático em cada `git push`

## Domínio próprio (GoDaddy → Vercel)

1. Vercel → Settings → Domains → Add Domain → `suedflow.com.br`
2. Vercel mostra registros CNAME / A para configurar
3. GoDaddy → Meus domínios → suedflow.com.br → DNS
4. Adicione os registros conforme orientação Vercel
5. Aguarde propagação (até 48h, geralmente em minutos)

Mesmo processo para `suedflow.com` apontando para o mesmo deploy.

Para a API:
- Em Railway: configure custom domain `api.suedflow.com.br`
- Em GoDaddy: adicione CNAME `api` → endereço Railway

## Recursos

- Toggle tema claro/escuro (botão 🌙/☀️ canto superior direito)
- Modal de configurações (botão ⚙️) com 4 seções: Aparência / Notificações / LGPD / Conta
- Toast notifications
- API client tipado com 30+ funções
- JWT em localStorage
- Mobile-first responsivo
- Glass-morphism estilo UX v8/v9 que você aprovou

## Próximos passos (sessões futuras)

- Web Profissional completo (feed, KYC, marcos, QA, saque)
- Mobile Expo (app dedicado para profissional em campo)
- Integração real Pagar.me v5
- Selo público anonimizado (LGPD)
