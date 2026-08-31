# Brief para Spec Atual: Paciente, Agenda, Financeiro Inicial e WhatsApp

Este brief foi preparado com a skill `specify-prompt-engineer` para ser usado como
entrada do `/speckit.specify`.

Atualizacao em 2026-05-26: este brief foi consolidado na spec
`specs/002-paciente-agenda-whatsapp/spec.md` e revisado para incluir financeiro
inicial do paciente como pre-condicao de agendamento.

## Feature Intent
- Goal: criar o primeiro fluxo operacional do MVP em que o profissional cadastra um paciente, completa os dados financeiros iniciais do paciente, agenda uma consulta e dispara uma confirmacao por WhatsApp.
- Primary actor: terapeuta/psicologo autonomo individual.
- Business value: transformar a Clinica Agil de uma experiencia publica/login em um fluxo util de operacao clinica, reduzindo trabalho manual e preparando a base para agenda, pacientes e notificacoes.

## In Scope
- Cadastro de paciente com dados basicos necessarios para agenda e contato.
- Acao "Salvar e ir para o financeiro" no cadastro de paciente para abrir a aba financeira do paciente recem criado.
- Cadastro de metodo preferido, valor padrao da sessao e dados obrigatorios do metodo escolhido para PIX, cartao, dinheiro ou convenio.
- Listagem/busca simples para selecionar paciente ao agendar.
- Criacao de consulta para um paciente existente.
- Agenda minima com visualizacao das consultas criadas.
- Status inicial da consulta e status de confirmacao.
- Envio de confirmacao automatica por WhatsApp via Twilio quando uma consulta for criada.
- Registro do status de envio da mensagem.
- Copys e UI em portugues, mantendo continuidade visual com o prototipo Lovable e com `apps/web`.
- Fluxo para profissional autonomo individual, sem multi-profissional.

## Constraints
- Usar as decisoes atuais do projeto em `docs/` e a arquitetura em `apps/web`.
- Seguir a arquitetura padrao: `src/app/(public)`, `src/app/(private)`, `src/actions`, `src/services`, `src/lib/api`, `src/lib/errors`, `src/types`, `src/middleware.ts` e `prisma/schema.prisma`.
- Implementar fluxo real de producao, nao prototipo ou placeholder, sempre que for possivel fazer server-side com seguranca.
- Usar server actions, route handlers, Prisma/PostgreSQL e cache nativo do Next (`revalidateTag`, `revalidatePath`, `next: { tags }`) antes de considerar fetch client-side.
- Preservar o comportamento de middleware para Server Actions: redirects automaticos de auth devem valer para navegacao normal, mas nao podem interceptar POST interno de action com `next-action`.
- Consultar `docs/prisma-development-guide.md` antes de alterar schema, migrations ou comandos de banco.
- Manter a UI alinhada ao prototipo Lovable em `references/` e ao design clinical calmo ja iniciado.
- Usar `Next.js`, `shadcn/ui`, `react-hook-form`, `zod`, `Prisma` e `PostgreSQL` conforme ADR.
- Criar novos validadores em `apps/web/src/utils/validators`, com um arquivo por fluxo contendo schema Zod, resolver para `react-hook-form` e tipo de input.
- Manter regras de dominio em `src/services` e chamar Prisma diretamente nesses services quando o uso for interno/server-side; criar Route Handlers apenas para fronteiras HTTP reais, como Twilio webhook ou API externa.
- Considerar LGPD: coletar apenas dados necessarios, evitar exposicao publica e preparar consentimento/opt-in para WhatsApp quando aplicavel.
- A confirmacao por WhatsApp no MVP deve aceitar apenas resposta `sim` ou `nao`.
- Criacao de consulta deve exigir configuracao de WhatsApp e metodo/dados de pagamento do paciente cadastrados.
- Evitar criar portal do paciente, conta de paciente, multi-profissional, secretaria ou IA.

## Integrations
- Twilio WhatsApp para envio da mensagem ao criar consulta.
- PostgreSQL via Prisma para persistir paciente, consulta e registro de notificacao.
- PostgreSQL via Prisma para persistir perfil financeiro/metodo de pagamento basico do paciente.
- Ambiente local deve prever `docker compose` para banco se ainda nao existir.

## Acceptance Shape
- O profissional consegue cadastrar um paciente com validacoes essenciais.
- O profissional consegue salvar paciente e ir direto para a aba financeira para cadastrar metodo/dados de pagamento.
- O profissional consegue criar uma consulta vinculada ao paciente.
- O sistema bloqueia criacao de consulta quando falta configuracao WhatsApp ou metodo/dados de pagamento do paciente.
- A consulta aparece em uma agenda/lista minima.
- Ao criar a consulta, o sistema tenta enviar confirmacao via Twilio.
- O sistema registra se a mensagem foi preparada/enviada/falhou, sem esconder erro operacional.
- O paciente nao precisa acessar portal nem criar conta.
- Testes cobrem validacao de paciente, criacao de consulta e comportamento de notificacao.
- O fluxo respeita o escopo MVP e nao adiciona autenticacao real alem do que for necessario para proteger rotas privadas.

## Out of Scope
- Portal ou login do paciente.
- Remarcacao/cancelamento avancados.
- Lembrete no dia anterior.
- Webhook de resposta `sim/nao`.
- IA, transcricao, agentes ou operacao por audio.
- Multi-profissional, secretaria e permissoes complexas.
- Geracao de cobranca, planos cadastrados/personalizados, recibos, documentos e assinatura.

## Decisoes ja resolvidas na spec
- Horarios sobrepostos para o mesmo terapeuta devem ser bloqueados.
- Paciente duplicado por CPF ou telefone normalizado no mesmo terapeuta deve ser bloqueado.
- Webhook de resposta `sim/nao` fica fora deste slice.
- Status de notificacao neste slice: `pendente`, `enviado`, `falhou`.
- Falta de configuracao WhatsApp bloqueia criacao de consulta.
- Falta de metodo/dados de pagamento do paciente tambem bloqueia criacao de consulta.
