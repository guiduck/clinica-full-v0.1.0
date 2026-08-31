# Guia rapido de Prisma no desenvolvimento

Este guia e uma aulinha curta para voce lembrar o basico sem precisar abrir dez abas.

Pense assim:

- **PostgreSQL** e a caixa onde os dados moram.
- **Prisma schema** e o desenho da caixa, escrito em `apps/web/prisma/schema.prisma`.
- **Prisma Client** e o controle remoto que o codigo usa para falar com o banco.
- **Migration** e uma receita versionada de mudanca no banco.

## Onde fica cada coisa

```txt
apps/web/prisma/schema.prisma   desenho das tabelas e relacoes
apps/web/.env                   DATABASE_URL local, ignorado pelo git
apps/web/.env.example           exemplo de variaveis para copiar
apps/web/docker-compose.yml     PostgreSQL local
apps/web/src/lib/prisma.ts      Prisma Client usado pelo app
```

## Primeira vez no projeto

Entre no app web:

```bash
cd apps/web
```

Suba o banco local:

```bash
docker compose up -d postgres
```

Garanta que o `.env` tem algo assim:

```env
DATABASE_URL="postgresql://clinica:clinica@localhost:5433/clinica_agil?schema=public"
```

Instale deps, gere o client e aplique o schema:

```bash
npm install
npm run db:generate
npm run db:push
```

Depois rode o app:

```bash
npm run dev
```

## Comandos que voce mais vai usar

### Gerar o Prisma Client

Use quando mudou `schema.prisma`, instalou deps de novo, ou o TypeScript nao reconhece campos novos.

```bash
npm run db:generate
```

Explicando como crianca: voce mudou o desenho da tomada, entao precisa entregar um controle remoto novo para o codigo.

### Validar o schema

Use para checar se o `schema.prisma` esta escrito corretamente.

```bash
npx prisma validate
```

### Aplicar schema rapido no banco local

Use durante desenvolvimento inicial quando ainda estamos modelando e nao precisamos guardar historico perfeito da mudanca.

```bash
npm run db:push
```

Explicando como crianca: o Prisma olha o desenho atual e arruma a caixa local para ficar igual.

### Criar migration

Use quando a mudanca ja deve virar historico do projeto.

```bash
npm run db:migrate
```

Ele vai pedir um nome. Use nomes simples:

```txt
add_patients
add_appointments
add_user_profile_fields
```

Explicando como crianca: migration e uma receita guardada. Se outra pessoa pegar o projeto, ela consegue montar a mesma caixa passo a passo.

### Abrir o Prisma Studio

Use para ver e editar dados no navegador.

```bash
npm run db:studio
```

## Quando uso db:push ou db:migrate?

Use `db:push` quando:

- voce esta testando modelo localmente;
- a feature ainda esta sendo descoberta;
- nao precisa registrar a mudanca como historico final.

Use `db:migrate` quando:

- o schema ja representa uma decisao do produto;
- a mudanca vai para outras maquinas ou producao;
- voce quer uma pasta de migration versionada no git.

Regra simples: brincando no local, `db:push`; decidiu de verdade, `db:migrate`.

## Fluxo recomendado para uma feature real

1. Edite `apps/web/prisma/schema.prisma`.
2. Rode:

```bash
npx prisma validate
```

3. Se estiver explorando localmente:

```bash
npm run db:push
```

4. Se a mudanca ficou definitiva:

```bash
npm run db:migrate
```

5. Gere o client:

```bash
npm run db:generate
```

6. Rode os checks:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Problema comum no Windows: EPERM no query_engine

As vezes aparece um erro assim:

```txt
EPERM: operation not permitted, rename ... query_engine-windows.dll.node
```

Isso costuma acontecer porque o servidor Next esta ligado e usando o arquivo do Prisma.

Resolva assim:

1. Pare o servidor `npm run dev` ou `npm run start`.
2. Rode de novo:

```bash
npm run db:generate
```

3. Depois ligue o servidor novamente.

## Como o app usa Prisma hoje

O app nao chama Prisma direto de componentes client.

O caminho correto e:

```txt
Server Component / Server Action / Route Handler
  -> service em src/services
  -> prisma em src/lib/prisma.ts
  -> PostgreSQL
```

Exemplo mental:

```txt
Login form
  -> loginAndSetSession()
  -> loginUser()
  -> prisma.user.findUnique()
  -> cria sessao no banco
  -> cookie HttpOnly
```

## Variaveis para trocar em producao

No ambiente local usamos `apps/web/.env`.

Em producao, a ideia e trocar valores, nao reescrever codigo:

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="https://..."
NEXT_PUBLIC_API_BASE_URL="https://..."
SESSION_COOKIE_NAME="clinica_session"
SESSION_SECRET="..."
```

## Resumo de bolso

```bash
cd apps/web
docker compose up -d postgres
npx prisma validate
npm run db:push
npm run db:migrate
npm run db:generate
npm run db:studio
```

Se esquecer tudo: o banco e a caixa, o schema e o desenho, a migration e a receita, o client e o controle remoto.
