# Deploy na VPS com Docker, Caddy e DNS da Vercel

Este guia usa `clinica.seudominio.com` como exemplo. Troque esse texto pelo
subdominio real escolhido.

## Como as pecinhas se conectam

1. O DNS da Vercel aponta `clinica.seudominio.com` para `216.158.236.156`.
2. O Caddy recebe a visita nas portas publicas 80/443 e cria o HTTPS.
3. O Caddy entrega a visita para `127.0.0.1:3101`.
4. O Docker entrega a porta 3101 do host para a porta 3000 do Next.js.
5. O PostgreSQL fica somente na rede interna do Docker, sem porta publica.

## 1. Entrar na VPS e olhar as portas

```bash
ssh root@216.158.236.156
ss -ltnp
docker ps --format 'table {{.Names}}\t{{.Ports}}\t{{.Status}}'
pm2 list
```

O inventario de 2026-09-01 mostrou a porta 3100 ocupada pelo projeto Persuando e
a porta 3101 livre. Confirme novamente a porta escolhida antes do deploy:

```bash
if ss -ltn | grep -q ':3101 '; then
  echo 'PORTA 3101 OCUPADA — pare antes do deploy'
else
  echo 'PORTA 3101 LIVRE'
fi
```

Se ela tiver sido ocupada depois do inventario, pare e escolha outra porta alta,
atualizando `APP_PORT` e o Caddy juntos. Nao mexa nos servicos que ja usam
80, 443, 3000, 3001, 3100, 4100, 5432, 5433, 6379, 8000 ou 15433.

## 2. Criar o subdominio no DNS da Vercel

Esta aplicacao ficara na VPS, nao em um deployment da Vercel. Portanto, crie um
registro DNS apontando diretamente para o IP da VPS:

1. Entre em `vercel.com/dashboard`.
2. Escolha a conta ou equipe que possui o dominio.
3. Abra **Domains** na barra lateral.
4. Clique no dominio principal.
5. Na area **DNS Records**, clique em **Add**.
6. Em **Name**, escreva somente `clinica`.
7. Em **Type**, escolha `A`.
8. Em **Value**, escreva `216.158.236.156`.
9. Deixe o TTL padrao e salve.

O campo Name recebe somente `clinica`, e nao o dominio inteiro. Se o dominio nao
usa os nameservers da Vercel, crie o mesmo registro A no provedor DNS que aparece
como autoridade do dominio.

Confirme a propagacao a partir do seu computador:

```bash
nslookup clinica.seudominio.com
```

O resultado precisa mostrar `216.158.236.156`. A propagacao pode levar alguns
minutos e, em casos raros, ate 24 horas.

Referencias oficiais:

- https://vercel.com/docs/domains/managing-dns-records
- https://vercel.com/kb/guide/pointing-subdomains-to-external-services

## 3. Baixar somente o projeto de producao

```bash
cd /srv/projects
git clone https://github.com/guiduck/clinica-full-v0.1.0.git
cd clinica-full-v0.1.0
```

O submodulo privado `references/clinica-full` e apenas uma referencia visual e
nao participa do build. Nao o baixe na VPS. Para impedir atualizacoes acidentais
nesse clone:

```bash
git config submodule.references/clinica-full.update none
```

## 4. Criar o arquivo secreto da VPS

```bash
cd /srv/projects/clinica-full-v0.1.0/apps/web
cp .env.vps.example .env
openssl rand -hex 24
openssl rand -hex 32
nano .env
```

Cole o primeiro valor em `POSTGRES_PASSWORD` e o segundo em `SESSION_SECRET`.
Troque as tres URLs pelo subdominio real. Em `APP_PORT`, coloque a porta livre
encontrada no passo 1. Nunca envie o arquivo `.env` para o Git.

## 5. Construir e iniciar

Ainda dentro de `apps/web`:

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
docker compose -f docker-compose.prod.yml --env-file .env ps
docker compose -f docker-compose.prod.yml --env-file .env logs --tail=100 web
```

O Compose usa o nome fixo `clinica-agil`, evitando colisao com os projetos
Docker que ja existem na VPS.

Teste na propria VPS:

```bash
curl http://127.0.0.1:3101/api/health
```

A resposta esperada e `{"status":"ok"}`.

## 6. Configurar o Caddy

Faca uma copia antes de editar:

```bash
cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup
nano /etc/caddy/Caddyfile
```

Acrescente ao final, trocando dominio e porta quando necessario:

```caddyfile
clinica.seudominio.com {
    encode zstd gzip
    reverse_proxy 127.0.0.1:3101
}
```

Valide antes de recarregar:

```bash
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
systemctl status caddy --no-pager
```

Quando o DNS ja apontar para a VPS e as portas 80/443 chegarem ao Caddy, ele
solicitara e renovara o certificado HTTPS automaticamente.

## 7. Atualizar o projeto no futuro

```bash
cd /srv/projects/clinica-full-v0.1.0
git pull --ff-only
cd apps/web
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

## Submodulos, explicado de forma simples

Um submodulo e um repositorio Git colocado dentro de outro repositorio Git. O
projeto ja possui `references/clinica-full` como submodulo; nao o adicione de novo.

Para criar um novo submodulo em outro caminho:

```bash
git submodule add https://github.com/USUARIO/OUTRO-REPO.git caminho/do/submodulo
git add .gitmodules caminho/do/submodulo
git commit -m "Add reference submodule"
git push
```

Esse procedimento serve para ambientes de desenvolvimento que realmente precisam
da referencia. O deploy da VPS deve ignorar `references/clinica-full`.

## Docker ou PM2?

Use Docker para este projeto. O Compose ja contem `restart: unless-stopped`, que
reinicia o app apos falha ou reinicializacao da VPS. PM2 e otimo para processos
Node executados diretamente no host, mas coloca-lo por cima do Docker cria dois
gerenciadores tentando cuidar do mesmo servico e dificulta diagnostico e logs.
