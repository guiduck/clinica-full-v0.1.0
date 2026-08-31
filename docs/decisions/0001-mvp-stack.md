# ADR 0001 - Stack inicial do MVP

## Status
Aceito provisoriamente

## Contexto
O produto sera desenvolvido por um time pequeno, part-time, com maior familiaridade em `JavaScript/TypeScript` e baixa tolerancia a complexidade operacional.

O MVP precisa:
- sair do papel rapido
- ter deploy simples
- suportar dados sensiveis com seguranca razoavel
- incluir WhatsApp transacional
- incluir cobranca online
- permitir adicionar IA depois

O MVP nao precisa:
- microservicos
- backend Python desde o inicio
- multi-tenant complexo
- agentes como eixo principal

## Decisao
Adotar a seguinte stack inicial:
- `Next.js` como app principal
- `Vercel` para deploy
- `shadcn/ui` para interface
- `react-hook-form` + `zod` para formularios
- `zustand` para estado global leve
- `Auth.js / NextAuth` para autenticacao
- `Google Provider` para login social
- `database sessions` com cookie `HttpOnly`
- `Prisma` como ORM
- `PostgreSQL` para banco
- `Resend` para e-mail transacional
- `Stripe` para cobranca online
- `Twilio WhatsApp` para WhatsApp transacional
- `react-pdf` para documentos e recibos em PDF
- `react-konva` para captura de assinatura em modal
- `docker compose` para banco local
- `Postgres` gerenciado em producao

## Justificativa
### Next.js
- reduz necessidade de separar frontend/backend
- facilita rotas server-side, UI e APIs no mesmo projeto
- bom encaixe com Vercel

### Vercel
- deploy simples
- ambiente bom para projeto pequeno
- cron suficiente para jobs diarios iniciais

### Auth.js / NextAuth
- reduz lock-in em auth
- permite manter identidade e sessao alinhadas ao banco do app
- suporta login Google
- permite usar `database sessions` em vez de JWT stateless como sessao principal

### Prisma + PostgreSQL
- modelo relacional combina melhor com agenda, prontuario, financeiro e documentos
- Prisma melhora a experiencia de schema e migrations para o time
- `docker compose` simplifica o ambiente local
- banco gerenciado em producao reduz carga operacional

### Resend
- simples para e-mails transacionais
- suficiente para reset, notificacoes e documentos

### Stripe
- melhor encaixe para cobranca online inicial
- pode conviver com registro manual de PIX, dinheiro e cartao
- nao substitui recibo proprio do sistema

### WhatsApp provider
- mais seguro e realista usar provider oficial/BSP
- reduz complexidade operacional de onboarding

## Consequencias positivas
- time consegue focar em produto
- menos tempo gasto em infraestrutura
- caminho rapido para validar mercado
- stack majoritariamente TypeScript

## Consequencias negativas
- auth exige mais implementacao do que uma solucao totalmente gerenciada
- sessoes no banco criam roundtrips adicionais
- ainda existe dependencia externa em pagamento, email e WhatsApp

## Alternativas consideradas
### Alternativa 1: Next.js + Clerk
Vantagens:
- velocidade maior para subir auth
- UI e fluxo de autenticacao mais prontos

Desvantagens:
- mais lock-in
- menos aderencia a estrategia de manter auth mais proximo do dominio do app

### Alternativa 2: Vite + Fastify
Vantagens:
- separacao mais explicita entre frontend e backend
- familiar para alguns cenarios

Desvantagens:
- mais coordenacao
- mais setup
- menos alinhado com a necessidade de simplicidade

### Alternativa 3: Vite/Fastify + Python/Agno
Vantagens:
- possivel flexibilidade futura para IA

Desvantagens:
- complexidade prematura
- mais deploys e observabilidade
- nao justificado para o MVP atual

## Decisoes derivadas
- recibo sera `PDF proprio`
- recibo sera preenchido com `dados do pagamento do proprio app`
- WhatsApp no MVP sera apenas `transacional`
- confirmacao do paciente sera apenas `sim/nao`
- assinatura no MVP sera `simples com evidencias`
- assinatura sera capturada em `modal` com `react-konva` e aplicada ao documento com `react-pdf`
- a trilha minima da assinatura guardara `IP` e `sessao`
- a assinatura propria nao sera tratada como equivalente automatica a assinatura avancada de provider externo
- `DSM/CID` no MVP sera apenas `campo manual`
- auth usara `Auth.js / NextAuth`
- login Google usara `Google Provider`
- a sessao usara `database sessions` com cookie `HttpOnly`
- `JWT stateless` nao sera a sessao principal
- `Prisma` sera o ORM oficial
- o banco local rodara com `docker compose`
- a producao usara `Postgres` gerenciado
- `Twilio` entra desde o MVP
- IA entra somente depois do nucleo operacional estar validado
- `conta do paciente` fica prevista para fase futura

## Revisitar quando
- houver mais de um profissional por conta
- houver autenticacao separada para pacientes
- a cobranca online ficar mais complexa
- o custo de vendors ficar alto demais
- IA passar a exigir pipelines dedicados
- surgir necessidade forte de auth gerenciada com menos manutencao
