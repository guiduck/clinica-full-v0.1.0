# Próxima Spec: Fila Durável e Mensagens Programadas

> Status de implementação em 2026-09-23: o núcleo de mensagens foi entregue com
> PostgreSQL como fonte durável e BullMQ/Redis como transporte, por decisão
> explícita de produto. Boas-vindas, confirmações, lembretes e mensagens manuais,
> worker, inbox e webhook estão implementados. Sincronização Google assíncrona,
> reprocessamento manual/dead-letter avançado, templates WhatsApp aprovados e
> benchmark de 500 jobs permanecem como evolução; não interpretar este brief
> histórico como estado atual do app.
> Brief atualizado com `specify-prompt-engineer` em 2026-09-23 a partir do
> roadmap, handoff, product spec, ADR e estado real do app. Está pronto para
> `/speckit.specify`.

Crie uma feature specification para tornar e-mails e mensagens WhatsApp da
`clinica-full` duráveis, agendáveis, idempotentes e escaláveis sem transformar
prematuramente o modular monolith em microserviços.

Usuário principal: profissional autônomo autenticado que agenda consultas e
configura comunicações consentidas com seus próprios pacientes.

Objetivo: garantir que boas-vindas, confirmações, lembretes e mensagens
programadas por E-mail ou WhatsApp sobrevivam a falhas/reinícios, sejam
processadas fora do request web e tenham estado operacional auditável sem expor
conteúdo clínico.

## Em escopo

- outbox/fila persistida no PostgreSQL, gravada atomicamente com a mutação de
  domínio que origina a mensagem;
- worker Node/TypeScript separado no Docker Compose, consumindo jobs com lease e
  concorrência segura por `FOR UPDATE SKIP LOCKED` ou mecanismo equivalente;
- canais e-mail e Twilio WhatsApp por adapters existentes, com templates
  versionados e payload mínimo referenciado por IDs;
- tipos iniciais: boas-vindas, confirmação da primeira consulta, lembrete de
  consulta, mensagem programada pelo profissional e sincronização assíncrona de
  criar/atualizar/remover evento no Google Agenda;
- migrar o e-mail de boas-vindas já funcional para a outbox: o cadastro do
  paciente não aguarda o provider e a interface mostra `programado`, `enviado`
  ou uma falha reprocessável, sem alegar envio antes da confirmação do worker;
- compositor real de mensagem programada no contexto do paciente, com template
  ou texto permitido, data, hora e escolha obrigatória de um canal por envio:
  `E-mail` ou `WhatsApp`;
- desabilitar o canal quando faltar endereço/telefone ou consentimento e explicar
  ao profissional como corrigir, sem trocar de canal silenciosamente;
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
- substituir o conteúdo estático de `Configurações > Mensagens automáticas` por
  dados reais, sem simular templates salvos ou uma fila vazia;
- métricas e logs somente com IDs/metadados seguros: latência, profundidade da
  fila, taxa de erro, tentativas e idade do job mais antigo;
- testes de concorrência, reinício do worker, provider indisponível, retry,
  idempotência, cancelamento, autorização e isolamento entre usuários.

## Contexto de capacidade

- o app atual não possui worker; e-mail, Twilio e Google Agenda ainda participam
  diretamente de requisições web ou de tentativas best-effort;
- quantidade de contas cadastradas não é uma métrica suficiente: concorrência,
  tamanho dos picos, latência externa e conexões do banco determinam capacidade;
- o envelope conservador de piloto é 10–20 profissionais simultaneamente ativos
  em uma instância modesta, sem SLA até haver teste de carga no hardware da VPS;
- lembretes e mensagens agendadas exigem fila antes de serem habilitados, mesmo
  com poucos usuários, porque confiabilidade e retomada após reinício são o
  requisito principal;
- o detalhamento e os gatilhos operacionais estão em
  `docs/async-capacity-guidance.md`.

## Restrições

- manter Next.js, Prisma e PostgreSQL como fonte de verdade; nenhuma mensagem
  depende de processo em memória, timeout do browser ou request HTTP aberto;
- executar o worker como serviço separado do container web, escalável por
  réplicas e seguro para processamento `at least once`; no piloto, web e worker
  rodam em containers distintos no mesmo Compose/VPS, sem exigir outro servidor;
  efeitos externos devem ser idempotentes;
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
- selecionar boas-vindas no cadastro cria exatamente um job de E-mail quando
  endereço e consentimento existem; a falha do provider não desfaz o paciente;
- o profissional agenda uma mensagem para um paciente, escolhe E-mail ou
  WhatsApp, vê o estado real e pode cancelá-la antes do lease do worker;
- reiniciar web ou worker não perde mensagens nem envia novamente um job já
  confirmado;
- duas réplicas do worker não processam o mesmo lease simultaneamente;
- falha transitória agenda retry; falha permanente/dead-letter aparece na UI;
- cancelar consulta ou revogar consentimento impede lembrete ainda pendente;
- mensagens programadas respeitam data/hora e fuso configurados;
- nenhum usuário lê, cancela ou reprocessa jobs de outro usuário;
- testes e smoke comprovam criação, consumo, retry, idempotência e restart.
- benchmark reproduz pelo menos 50 profissionais concorrentes criando/remarcando
  consultas e um pico de 500 jobs vencendo na mesma janela, registrando p50,
  p95, taxa de erro, throughput e idade máxima da fila sem prometer SLA antes da
  medição em ambiente equivalente à VPS.

## Fora do escopo

- chatbot, conversa livre, IA, portal do paciente e campanhas de marketing;
- múltiplos profissionais por conta;
- troca imediata para Kafka, RabbitMQ, Redis ou serviço gerenciado;
- criação de uma segunda fila em Redis paralela à outbox PostgreSQL;
- conteúdo clínico em mensagens;
- recorrência semanal indeterminada de consultas. A infraestrutura deve permitir
  que uma spec posterior materialize séries em janela móvel, mas este slice não
  cria o modelo nem a UI da série;
- SLA comercial definitivo antes de benchmark e observabilidade em produção.

## Decisões para `/speckit.clarify`

- janela e cadência exatas dos lembretes;
- limite de tentativas e prazo de retenção de jobs/tentativas;
- quais mensagens programadas podem ser editadas ou canceladas após enfileirar;
- se uma mensagem já enviada pode ser clonada para novo horário e como isso
  aparece no histórico;
- política de rate limit por profissional e por provider;
- campos mínimos que a UI da fila deve expor sem revelar dados excessivos.
