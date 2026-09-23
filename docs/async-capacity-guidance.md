# Capacidade Atual e Estratégia de Filas

## Resposta curta

O sistema atual atende um piloto sem fila, desde que as automações programadas
ainda não sejam habilitadas. O número de usuários cadastrados não determina a
capacidade: uma conta parada quase não consome recursos. O que importa é quantos
profissionais fazem mutações ao mesmo tempo e quantas chamadas de e-mail,
WhatsApp e Google Agenda acontecem em picos.

Até existir benchmark no hardware real da VPS, o envelope conservador de
planejamento é:

- 10–20 profissionais simultaneamente ativos em uma instância web modesta;
- dezenas a poucas centenas de profissionais ativos distribuídos ao longo do
  dia, se o uso continuar leve;
- centenas ou milhares de contas registradas de baixo uso podem caber, mas isso
  não representa capacidade comprovada nem SLA.

Esses números são limites de planejamento, não resultados de teste de carga. A
VPS, o pool de conexões, o volume de dados e os providers podem antecipar ou
ampliar o limite.

## Estado arquitetural atual

O Compose de produção possui `web`, `migrate` e `postgres`. Não existe processo
worker. E-mail, Twilio WhatsApp e Google Agenda são chamados pelo processo web;
algumas falhas são tratadas como best-effort para não desfazer a mutação principal.

Esse desenho tem duas consequências:

1. A requisição do usuário pode ficar mais lenta quando o provider externo demora.
2. Se o processo reiniciar ou o provider ficar indisponível depois do commit, o
   efeito externo pode precisar de reconciliação manual.

Por isso, fila é primeiro uma decisão de confiabilidade e só depois de throughput.
Um único profissional já precisa dela se depender de um lembrete automático que
não pode ser perdido.

## Quando a fila passa a ser obrigatória

Implementar a outbox/worker antes de liberar qualquer uma destas capacidades:

- lembretes automáticos ou mensagens para horário futuro;
- reengajamento, campanhas ou envio em lote;
- promessa de entrega/retry sem intervenção manual;
- sincronização em massa do Google Agenda em segundo plano.

Mesmo sem essas features, antecipar a fila quando ocorrer qualquer sinal:

- mais de 20 profissionais fazendo operações simultâneas de agenda/comunicação;
- p95 de mutações acima de 2 segundos por dependência externa;
- mais de 1% de timeout/falha transitória de provider;
- requisições frequentemente acima de 5 segundos;
- rate limit do Google, Twilio ou e-mail;
- necessidade recorrente de clicar em reconciliação manual;
- deploy/restart causando efeitos externos perdidos.

Os limiares são alertas operacionais, não garantias de capacidade.

## Primeira arquitetura recomendada

Manter o modular monolith e adicionar:

- outbox durável no PostgreSQL gravada na mesma transação do evento de domínio;
- worker Node/TypeScript separado no Docker Compose;
- consumo com lease e `FOR UPDATE SKIP LOCKED`;
- processamento `at least once` com chave de idempotência;
- retry exponencial com jitter, limite de tentativas e dead-letter;
- payload mínimo por IDs, sem prontuário ou conteúdo clínico;
- métricas de profundidade, idade do job mais antigo, p95 e taxa de falha;
- réplicas adicionais do worker somente depois de medir saturação.

Redis/BullMQ ou fila gerenciada não são necessários no primeiro corte. A outbox
PostgreSQL resolve durabilidade e mantém uma migração futura possível.

## Benchmark necessário para transformar estimativa em capacidade

Executar em ambiente equivalente à VPS:

1. Medir agenda e financeiro sem providers com 10, 25 e 50 profissionais
   concorrentes.
2. Medir criação e remarcação com providers simulando 100 ms, 1 s e timeout.
3. Após o worker, disparar 500 jobs na mesma janela e medir throughput, p50, p95,
   falhas, retries e idade máxima da fila.
4. Monitorar CPU, memória, conexões PostgreSQL, event loop e respostas 5xx.
5. Definir capacidade comercial somente a partir desses resultados e com margem
   para pico e falha de provider.
