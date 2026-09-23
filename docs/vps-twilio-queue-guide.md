# Guia rápido — fila, worker e Twilio WhatsApp na VPS

## Arquitetura implantada

O PostgreSQL é a fonte durável das mensagens. BullMQ/Redis agenda e distribui os jobs; o `worker` envia para Resend/SendGrid ou Twilio, atualiza tentativas/status e grava a conversa. `web`, `worker`, `redis` e `postgres` rodam em containers separados no mesmo Compose e na mesma VPS. Não é necessário outro servidor no piloto.

## 1. Atualizar o `.env` sem apagar segredos existentes

Na VPS:

```bash
ssh root@216.158.236.156
cd /srv/projects/clinica-full-v0.1.0/apps/web
nano .env
```

Acrescente/ajuste:

```dotenv
REDIS_PASSWORD=GERE_UM_HEX_FORTE
MESSAGE_WORKER_CONCURRENCY=5

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=SEU_AUTH_TOKEN
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_WEBHOOK_URL=https://clinica-full.gfig.space/api/webhooks/twilio/whatsapp
TWILIO_STATUS_CALLBACK_URL=https://clinica-full.gfig.space/api/webhooks/twilio/whatsapp
TWILIO_VALIDATE_SIGNATURE=true
```

Gere a senha do Redis localmente na VPS com `openssl rand -hex 24`. Não coloque o valor em chat, Git ou logs. `REDIS_URL` é montada internamente pelo Compose; não precisa ser escrita no `.env` da VPS.

## 2. Configurar o Twilio Sandbox

1. Na Twilio, abra **Messaging > Try it out > Send a WhatsApp message** (ou o Sandbox no Console legado).
2. Copie `Account SID` e `Auth Token` para o `.env`.
3. Mantenha `TWILIO_WHATSAPP_FROM=whatsapp:+14155238886` no Sandbox.
4. Em **When a message comes in**, use `https://clinica-full.gfig.space/api/webhooks/twilio/whatsapp` com método `POST`.
5. Em **Status callback URL**, use a mesma URL com método `POST`.
6. No WhatsApp de cada telefone de teste, envie `join <código do sandbox>` ao número mostrado pela Twilio.

O Sandbox é somente para teste: usa número compartilhado, aceita apenas telefones que entraram no seu Sandbox, limita o ritmo e a associação expira. Mensagens livres funcionam na janela de atendimento de 24 horas após uma mensagem do paciente; fora dela, WhatsApp exige template aprovado. Portanto, teste primeiro respondendo do telefone do paciente e programando um envio para poucos minutos depois. Para produção, registrar um sender real e implementar/associar os templates aprovados das confirmações e lembretes.

## 3. Fazer backup e atualizar

```bash
cd /srv/projects/clinica-full-v0.1.0
git status --short
git pull --ff-only origin master
cd apps/web

set -a
. ./.env
set +a
mkdir -p /root/backups/clinica-full
docker compose -f docker-compose.prod.yml --env-file .env exec -T postgres \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc \
  > "/root/backups/clinica-full-$(date +%F-%H%M).dump"

docker compose -f docker-compose.prod.yml --env-file .env config --quiet
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

O serviço `migrate` aplica `20260923000100_reliable_message_queue` antes de iniciar `web` e `worker`.

## 4. Verificar

```bash
docker compose -f docker-compose.prod.yml --env-file .env ps -a
docker compose -f docker-compose.prod.yml --env-file .env logs --tail=150 migrate web worker redis
curl -fsS http://127.0.0.1:3101/api/health
curl -fsS https://clinica-full.gfig.space/api/health
```

Esperado: `postgres` e `redis` saudáveis, `web` e `worker` em execução, `migrate` finalizado com código 0. No app, programe uma mensagem e confirme que ela sai de **Programadas** e aparece em **Conversas**. Responda pelo WhatsApp e confirme a mensagem inbound e a notificação no sino.

## Números próprios de cada profissional

Não somos obrigados tecnicamente a manter um único número global. A Twilio aceita números Twilio ou números externos registrados como WhatsApp Sender. Para um SaaS, o caminho correto é onboarding de cada cliente como sender/conta (normalmente via programa de Tech Provider/Embedded Signup e, conforme o desenho comercial, subcontas). Isso exige verificação Meta, armazenamento de credenciais/sender por profissional, templates e roteamento por tenant.

Para o piloto atual, um sender global é mais simples. A inbox associa respostas ao último envio feito ao paciente; isso é suficiente para validação, mas fica ambíguo se o mesmo telefone de paciente conversar com dois profissionais. Antes de escala comercial, evoluir para sender próprio por profissional conforme `docs/next-spec-whatsapp-senders-per-professional.md`.

Referências oficiais: [Twilio Sandbox](https://www.twilio.com/docs/whatsapp/sandbox), [WhatsApp Self Sign-up](https://www.twilio.com/docs/whatsapp/self-sign-up), [subcontas Twilio](https://www.twilio.com/docs/iam/api/subaccounts).
