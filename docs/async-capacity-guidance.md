# Capacidade Atual e Estratégia de Filas

## Resposta curta

A fila agora existe. PostgreSQL guarda a mensagem e seu estado como fonte de verdade; BullMQ/Redis agenda e distribui; um worker Node/TypeScript separado envia e atualiza o histórico. `web`, `worker`, `redis` e `postgres` podem rodar na mesma VPS e no mesmo Compose durante o piloto. Não é necessário pagar outro servidor agora.

O número de contas cadastradas não determina sozinho a capacidade. Até existir benchmark no hardware real, o envelope conservador continua sendo:

- 10–20 profissionais simultaneamente ativos numa instância web modesta;
- dezenas a poucas centenas de profissionais ativos distribuídos ao longo do dia, se o uso for leve;
- centenas ou milhares de contas de baixo uso podem caber, mas isso não é capacidade comprovada nem SLA.

A fila melhora principalmente confiabilidade e latência percebida; ela não transforma essa estimativa em benchmark.

## Arquitetura implementada

- `ScheduledMessage` no PostgreSQL guarda destinatário, canal, finalidade, horário, tentativas, deduplicação e estado;
- BullMQ usa Redis para delayed jobs, retry exponencial e concorrência;
- o worker usa concorrência 5 por padrão, configurável por `MESSAGE_WORKER_CONCURRENCY`;
- ao iniciar e a cada 15 segundos, o worker recupera do PostgreSQL mensagens ainda `queued`, portanto um job perdido no Redis volta à fila;
- `ConversationMessage` registra enviados, entregues, lidos, falhos e recebidos;
- webhook Twilio valida assinatura, atualiza delivery status e persiste respostas na inbox;
- falha definitiva gera notificação persistente no app;
- cadastro/agenda não aguardam o provider externo.

PostgreSQL continua sendo a fonte durável; Redis pode ser reconstruído. Essa combinação evita que o transporte seja a única cópia da intenção de envio.

## Capacidade prática do worker

A concorrência 5 significa no máximo cinco handlers em voo por réplica, não cinco mensagens por segundo garantidas. O limite real é o menor entre latência/restrição do provider, CPU, conexões e taxa autorizada do sender. O Sandbox da Twilio, por exemplo, é explicitamente limitado e não serve para teste de carga.

Adicionar uma segunda réplica do worker no mesmo Compose é possível depois de medir. Separar o worker em outro servidor passa a fazer sentido quando:

- CPU/memória do worker interfere no p95 do web;
- profundidade/idade da fila cresce mesmo aumentando concorrência com segurança;
- conexões do PostgreSQL ou Redis ficam saturadas;
- é necessário isolamento de falha/deploy;
- há exigência operacional de alta disponibilidade.

## Métricas e gatilhos

Monitorar pelo menos:

- quantidade `queued`, `processing` e `failed`;
- idade da mensagem pendente mais antiga;
- tempo e taxa de erro por provider;
- retries e falhas definitivas;
- CPU, memória e conexões de Postgres/Redis;
- p95 das mutações web.

Alertas iniciais sugeridos: job vencido há mais de 2 minutos, falha definitiva maior que 1%, fila crescendo por 10 minutos ou p95 web acima de 2 segundos.

## Benchmark necessário

1. Medir agenda/financeiro com 10, 25 e 50 profissionais concorrentes.
2. Simular providers com 100 ms, 1 s, rate limit e timeout.
3. Disparar 500 jobs na mesma janela e medir throughput, p50, p95, erro e idade máxima.
4. Repetir com worker reiniciado e Redis vazio para comprovar recuperação pelo PostgreSQL.
5. Definir capacidade comercial somente a partir dos resultados e com margem de pico.