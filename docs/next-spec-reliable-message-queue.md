# Próxima Spec: Fila Durável de Mensagens e Agendamentos

> Brief preparado com `specify-prompt-engineer` em 2026-09-22 a partir do
> roadmap, handoff, product spec, ADR e estado real do app. Está pronto para
> `/speckit.specify` após o deploy e smoke do checkpoint atual.

Crie uma feature specification para tornar e-mails e mensagens WhatsApp da
`clinica-full` duráveis, agendáveis, idempotentes e escaláveis sem transformar
prematuramente o modular monolith em microserviços.

Usuário principal: profissional autônomo autenticado que agenda consultas e
configura comunicações consentidas com seus próprios pacientes.

Objetivo: garantir que boas-vindas, confirmações, lembretes e mensagens
programadas sobrevivam a falhas/reinícios, sejam processadas fora do request web
e tenham estado operacional auditável sem expor conteúdo clínico.

## Em escopo

- outbox/fila persistida no PostgreSQL, gravada atomicamente com a mutação de
  domínio que origina a mensagem;
- worker Node/TypeScript separado no Docker Compose, consumindo jobs com lease e
  concorrência segura por `FOR UPDATE SKIP LOCKED` ou mecanismo equivalente;
- canais e-mail e Twilio WhatsApp por adapters existentes, com templates
  versionados e payload mínimo referenciado por IDs;
- tipos iniciais: boas-vindas, confirmação da primeira consulta, lembrete de
  consulta e mensagem programada pelo profissional;
- `scheduledAt`, prioridade, tentativas, próximo retry, lock/heartbeat, sucesso,
  falha permanente, cancelamento e dead-letter;
- chave de idempotência por evento/canal/destinatário/template e tratamento de
  callbacks duplicados do provider;
- retry exponencial com jitter, limites por provider e reprocessamento manual
  autorizado sem duplicar entrega confirmada;
- validação de consentimento, status do paciente e dados de contato novamente no
  momento do envio;
- painel/fila no app com estados reais, filtros, cancelamento antes do envio e
  explicação clara de falhas;
- métricas e logs somente com IDs/metadados seguros: latência, profundidade da
  fila, taxa de erro, tentativas e idade do job mais antigo;
- testes de concorrência, reinício do worker, provider indisponível, retry,
  idempotência, cancelamento, autorização e isolamento entre usuários.

## Restrições

- manter Next.js, Prisma e PostgreSQL como fonte de verdade; nenhuma mensagem
  depende de processo em memória, timeout do browser ou request HTTP aberto;
- executar o worker como serviço separado do container web, escalável por
  réplicas e seguro para processamento `at least once`; efeitos externos devem
  ser idempotentes;
- não persistir prontuário, Anamnese ou evolução no payload da fila; preferir IDs
  e renderizar dados autorizados no momento do envio;
- horários persistidos em UTC e apresentados/agendados em `America/Sao_Paulo`,
  com UI em `dd/mm/aaaa` e 24 horas;
- falha de mensageria não desfaz paciente ou consulta já persistidos, mas deve
  ficar visível e reprocessável;
- credenciais permanecem apenas no ambiente; destinatários e erros sensíveis não
  aparecem em logs;
- não introduzir Redis no primeiro corte. A outbox PostgreSQL deve permitir
  migração futura do transporte para BullMQ/Redis ou fila gerenciada sem mudar o
  contrato de domínio.

## Integrações

- Resend ou SendGrid para e-mail;
- Twilio WhatsApp para confirmação e lembretes;
- PostgreSQL/Prisma para outbox, tentativas, locks e auditoria;
- Docker Compose para o processo worker na VPS.

## Aceite

- criar paciente/consulta retorna sem aguardar o provider e deixa um job
  persistido na mesma transação aplicável;
- reiniciar web ou worker não perde mensagens nem envia novamente um job já
  confirmado;
- duas réplicas do worker não processam o mesmo lease simultaneamente;
- falha transitória agenda retry; falha permanente/dead-letter aparece na UI;
- cancelar consulta ou revogar consentimento impede lembrete ainda pendente;
- mensagens programadas respeitam data/hora e fuso configurados;
- nenhum usuário lê, cancela ou reprocessa jobs de outro usuário;
- testes e smoke comprovam criação, consumo, retry, idempotência e restart.

## Fora do escopo

- chatbot, conversa livre, IA, portal do paciente e campanhas de marketing;
- múltiplos profissionais por conta;
- troca imediata para Kafka, RabbitMQ, Redis ou serviço gerenciado;
- conteúdo clínico em mensagens;
- SLA comercial definitivo antes de benchmark e observabilidade em produção.

## Decisões para `/speckit.clarify`

- janela e cadência exatas dos lembretes;
- limite de tentativas e prazo de retenção de jobs/tentativas;
- quais mensagens programadas podem ser editadas ou canceladas após enfileirar;
- política de rate limit por profissional e por provider;
- campos mínimos que a UI da fila deve expor sem revelar dados excessivos.
