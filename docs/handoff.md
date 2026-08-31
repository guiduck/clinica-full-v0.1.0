# Handoff

## Status atual
Projeto com o `slice paciente/agenda/WhatsApp implementado` e a superfície
funcional da feature `003-prototype-front-reconstruction` reconstruída. Todas
as rotas centrais agora existem e os cenários principais passam em desktop e
mobile. A feature permanece formalmente aberta porque a matriz granular ainda
contém linhas `pending`, e os smokes/auditorias finais não devem ser inferidos a
partir de um único teste de jornada.

## Checkpoint funcional — 2026-08-31
- A rodada final de feedback removeu a altura mínima da tabela de pacientes quando
  existem poucos registros, alinhou todos os dropdowns Radix à largura integral
  do gatilho e substituiu os inputs de horário dependentes do navegador por
  seletores controlados de 24 horas com ícone de relógio e intervalos de 10 minutos.
- Shell responsivo, tour persistente de 16 passos, notificações, conta e logout
  foram mantidos e corrigidos; um `TooltipProvider` global evita exceções em
  ações fora da navegação.
- Dashboard usa leituras reais em paralelo, próximos atendimentos, lembretes,
  métricas, gráficos e preferências de layout.
- Pacientes possui busca/filtros, wizard real de dados + pagamento, confirmação
  pós-cadastro e perfil com Geral, Anamnese, Agenda, Prontuário, Financeiro e
  Documentos.
- Anamnese tem progresso e todas as seções da referência; Prontuário tem humor,
  registro livre e SOAP; Documentos tem seis modelos, upload selecionável,
  editor, preview e assinatura em canvas. Esses conteúdos são transitórios e as
  ações finais exibem indisponibilidade sem persistir dados sensíveis.
- Agenda possui visões dia/semana/mês, criação real, detalhes e workspace de
  sessão. Financeiro e Previsibilidade derivam registros de consultas e perfis
  reais, sem inventar ledger.
- Configurações cobre Conta, Contato/endereço, Planos, Mensagens e Segurança com
  CPF/CNPJ/telefone/CEP e indisponibilidade explícita nas mutações sem service.
- Playwright agora cria um paciente real idempotente e percorre as abas clínicas,
  editor/preview documental, assinatura, agenda, finanças e configurações.

Validação deste checkpoint:
- `npm.cmd run lint`: aprovado sem warnings;
- `npm.cmd run typecheck`: aprovado;
- `npm.cmd run test`: 26 arquivos, 79/79 testes aprovados;
- `npm.cmd run db:generate`: aprovado;
- `npm.cmd run build`: aprovado, 22 rotas;
- `npm.cmd run test:e2e`: suíte integral aprovada com 17 cenários executados e
  2 cenários de mutação real pulados intencionalmente no projeto mobile;
  onboarding e páginas centrais passaram em desktop `1440x900` e mobile
  `390x844`.
- após os ajustes finais, `lint` e `typecheck` passaram; a jornada
  `product-pages.spec.ts` passou isoladamente em desktop e mobile, incluindo
  largura do dropdown e opção `13:00` no seletor de horário.

Situação formal da feature 003:
- 78 de 384 linhas da matriz estão decididas; 306 continuam `pending`;
- 43 de 130 tarefas estão marcadas como concluídas e 87 permanecem abertas;
- parte das tarefas abertas já possui implementação equivalente em arquivos
  consolidados e precisa ser reconciliada com evidência, não marcada por inferência;
- confirmação de descarte de rascunhos clínicos/documentais, auditorias
  transversais, regressão final e smoke manual ainda precisam de fechamento.

Limites reais:
- persistência clínica, documentos/PDF/assinatura, ledger financeiro editável,
  recibos, planos, templates e configurações avançadas continuam sem service;
- o wizard cria paciente e perfil financeiro em duas operações sequenciais, não
  em uma transação única;
- 10 vulnerabilidades npm conhecidas (1 low, 8 high, 1 critical) exigem revisão
  controlada; não usar auto-fix com upgrades maiores;
- Next ainda avisa sobre múltiplos lockfiles e inferência do workspace root;
- Twilio sandbox e o smoke manual completo continuam pendentes.
- o catálogo e a semântica das variáveis dinâmicas de templates de mensagens
  ainda precisam ser especificados antes do service de mensagens.

## Correcao de fidelidade do shell/onboarding — 2026-08-27
- Modal central removido. O tour agora usa 16 passos tipados em
  `onboarding-steps.ts`, query `?onboarding=<passo>`, alvos por id, medicao
  continua e spotlight click-through por `clip-path`.
- O balao evita cobrir o alvo: no perfil desktop fica a esquerda; no viewport
  movel usa fallback inferior quando nao existe largura lateral.
- Rail desktop compacto e Sheet shadcn sobreposto substituem a antiga sidebar
  larga. O Sheet e o dropdown do usuario sao controlados e sincronizados com cada
  passo para nao interceptarem cliques posteriores.
- O fluxo abre o perfil, seleciona Configuracoes, navega para
  `/configuracoes?onboarding=10` e conclui os 16 passos.
- Configuracoes possui Conta e Contato/Endereco com CPF real, telefone e CEP
  mascarados/validados. Saves validos mostram indisponibilidade e nunca sucesso
  ou persistencia falsa.
- O atalho/indicador WhatsApp foi removido do shell conforme direcao do produto.
- Dashboard recebeu greeting, acoes rapidas, KPIs reais basicos e proximos
  atendimentos. Agenda usa entrada visivel `dd/mm/aaaa` e horario 24h.
- Rotas `/financeiro` e `/financeiro/previsibilidade` agora existem e mostram
  estrutura/estado vazio honesto. Esses incrementos, assim como Dashboard,
  Agenda e Configuracoes completas, permanecem com linhas de paridade pendentes.

Validacao deste checkpoint:
- `npm.cmd run test`: 26 arquivos, 79 testes aprovados;
- `npm.cmd run typecheck`: aprovado;
- `npm.cmd run build`: aprovado, incluindo Configuracoes e as duas rotas
  financeiras;
- `app-shell.spec.ts --project=desktop`: fluxo completo aprovado em `1440x900`;
- `app-shell.spec.ts --project=mobile --no-deps`: fluxo completo aprovado em
  `390x844`.

## Checkpoint feature 003 - US1
- Login e criacao de conta reproduzem o fluxo visual do prototipo com formularios
  reais, Zod compartilhado, CPF valido, mascara e aceite obrigatorio.
- Google e recuperacao de senha estao visiveis e acionaveis, mas mostram
  indisponibilidade explicita sem enviar link ou criar sessao falsa.
- O shell autenticado possui sidebar desktop, sheet mobile, estado ativo,
  notificacoes baseadas em `NotificationAttempt`, indicador de mensagens, menu do
  usuario, Configuracoes e logout real.
- O onboarding possui 16 passos, avancar/voltar/pular/retomar/reiniciar e persistencia
  em `UserUiPreference`; pre-condicoes podem bloquear o avanco com feedback.
- Reiniciar o tour persiste no servidor e reabre imediatamente no layout atual.
- A navegacao do tour entre Dashboard e Configuracoes esta funcional; as paginas
  dependentes continuam sem gate completo ate todas as linhas da matriz passarem.
- A migration `20260827000300_prototype_front_reconstruction` foi aplicada no
  PostgreSQL local. O Prisma Client foi regenerado normalmente apos liberar o DLL.
- O dashboard provisoriamente mantido deixou de renderizar cabecalho/logout
  duplicados dentro do novo shell; seu redesign completo continua em T085-T090.
- A matriz de paridade decidiu todas as linhas de login, cadastro, recuperacao,
  shell e onboarding em desktop/mobile.

Arquivos centrais deste checkpoint:
- `apps/web/src/components/auth/`
- `apps/web/src/components/app-shell/`
- `apps/web/src/actions/ui-preferences.ts`
- `apps/web/src/services/app-shell/app-shell.ts`
- `apps/web/src/services/ui-preferences/ui-preferences.ts`
- `apps/web/prisma/migrations/20260827000300_prototype_front_reconstruction/`
- `apps/web/tests/e2e/`
- `specs/003-prototype-front-reconstruction/parity-matrix.md`

O primeiro slice oficial do Spec Kit foi entregue:
- feature: `001-bootstrap-landing-login`
- implementacao: `apps/web`
- rotas publicas: `/`, `/login`, `/termos`, `/privacidade`, `/criar-conta`, `/recuperar-senha`
- rotas privadas: `/dashboard`
- APIs nativas Next: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- SEO: `robots.txt` e `sitemap.xml` com indexacao limitada a landing e login
- login/cadastro: funcionais com Prisma/PostgreSQL, senha hasheada, sessao em banco e cookie HttpOnly
- middleware: protege rotas privadas e redireciona usuario logado para dashboard ao acessar login/cadastro
- middleware corrigido para nao transformar POST interno de Server Action em redirect 307 durante login/cadastro
- guia de Prisma criado em `docs/prisma-development-guide.md`
- validadores de auth refatorados para `apps/web/src/utils/validators/login.ts` e `apps/web/src/utils/validators/register.ts`
- componentes de login/cadastro agora importam `loginResolver` e `registerResolver` em vez de montar `zodResolver(...)` localmente

O segundo slice foi criado via `/speckit.specify`:
- feature: `002-paciente-agenda-whatsapp`
- spec: `specs/002-paciente-agenda-whatsapp/spec.md`
- plan: `specs/002-paciente-agenda-whatsapp/plan.md`
- research: `specs/002-paciente-agenda-whatsapp/research.md`
- data model: `specs/002-paciente-agenda-whatsapp/data-model.md`
- contracts: `specs/002-paciente-agenda-whatsapp/contracts/`
- quickstart: `specs/002-paciente-agenda-whatsapp/quickstart.md`
- tasks: `specs/002-paciente-agenda-whatsapp/tasks.md`
- checklist: `specs/002-paciente-agenda-whatsapp/checklists/requirements.md`
- escopo: cadastrar paciente, cadastrar financeiro inicial do paciente, agendar consulta e tentar confirmacao por WhatsApp
- premissas principais: nome e telefone como obrigatorios no fluxo principal, e-mail/CPF/nascimento opcionais, pacientes duplicados bloqueados por CPF/telefone normalizado, conflito de agenda bloqueado, metodo/dados de pagamento e configuracao WhatsApp como pre-condicoes para consulta, metodos de pagamento PIX/cartao/dinheiro/convenio com dados exigidos conforme o metodo, status de notificacao limitados a `pendente`, `enviado`, `falhou`, webhook de resposta `sim/nao` fora deste corte
- decisao de planejamento: cartao deve preservar o fluxo do prototipo sem armazenar numero/CVV bruto; usar referencia/token seguro do provedor ou metadata nao sensivel
- implementacao concluida em `apps/web`:
  - Prisma models/enums para `Patient`, `PatientFinancialProfile`, `Appointment` e `NotificationAttempt`
  - rotas privadas `/pacientes`, `/pacientes/novo`, `/pacientes/[patientId]`, `/pacientes/[patientId]/financeiro` e `/agenda`
  - server actions para criar paciente, salvar financeiro inicial e criar consulta
  - services server-side para normalizacao, duplicidade, readiness financeiro, conflito de agenda, configuracao WhatsApp e ciclo de notificacao
  - componentes de paciente, financeiro, agenda e status de notificacao
  - Twilio WhatsApp sender adapter com falhas seguras
  - testes unitarios/integracao para validadores, services, actions e notificacao

O prototipo de referencia foi atualizado:
- submodulo: `references/clinica-full`
- commit anterior: `1ecff9d`
- baseline atual: `226e5ab6811c5dce717fa12b404370b4fbb2663e`
- mudancas relevantes: dashboard, agenda, cadastro/perfil de paciente, financeiro,
  planos, recibos, documentos, mensagens, onboarding e configuracoes
- inventario completo: `docs/prototype-feature-inventory.md`

O proximo brief de spec foi substituido:
- brief vigente: `docs/next-spec-prototype-front-reconstruction.md`
- brief anterior: `docs/next-spec-financeiro-dashboard-planos.md` (supersedido e
  incorporado ao escopo amplo)
- escopo: paridade integral do frontend Lovable com services progressivos, Zod,
  validacoes/masks brasileiras, datas `dd/mm/aaaa`, constants/hooks e helpers
  funcionais reutilizaveis
- implementacao desta nova fase ainda nao foi iniciada

Depois da implementacao inicial, o app Next.js foi movido da raiz para
`apps/web` para manter a raiz focada em documentacao, Spec Kit, regras/skills de
IA e referencias. Esta estrutura prepara o repositorio para um monorepo futuro
com outros apps/servicos, como API ou bot em Python.

## Validacao mais recente
Executado no checkpoint US1 da feature 003 em 2026-08-27:
- `npm.cmd run test` - passou: 26 arquivos e 78 testes
- `npm.cmd run lint` - passou
- `npm.cmd run typecheck` - passou
- `npm.cmd run build` - passou: 19 paginas geradas/compiladas
- `npm.cmd run test:e2e` - passou: 17 cenarios, 15 aprovados e 2 pulados
  intencionalmente no projeto mobile para nao repetir as mutacoes reais de
  cadastro/login ja executadas no desktop
- autenticacao E2E cria uma conta isolada pela API real quando credenciais externas
  nao sao fornecidas e salva o estado autenticado fora da arvore observada pelo Next
- os projetos Playwright desktop e mobile rodam em sequencia porque onboarding e
  sessao sao estados reais compartilhados pelo mesmo usuario; isso elimina corrida
  entre viewports sem trocar a fronteira por mocks

Executado pelo usuario em `apps/web` em 2026-08-27:
- `npm.cmd install` - concluiu; 443 pacotes auditados, com 10 vulnerabilidades
  reportadas (1 low, 8 high, 1 critical)
- `docker compose up -d` - PostgreSQL local iniciou corretamente
- `npm.cmd run db:generate` - passou
- `npm.cmd run db:migrate -- --name paciente-agenda-whatsapp` - detectou drift das
  tabelas antigas `User`/`Session`; o usuario confirmou reset do schema e a
  migration `20260527000200_paciente_agenda_whatsapp` foi aplicada com sucesso
- `npm.cmd run lint` - passou
- `npm.cmd run typecheck` - passou
- `npm.cmd run test` - 15/16 arquivos passaram; 45/47 testes passaram; 2 falharam
  em `appointment-actions.test.ts` porque a data fixa do formulario agora esta no
  passado e a validacao interrompe o fluxo antes dos mocks esperados
- `npm.cmd run build` - passou; 19 paginas geradas e rotas dinamicas compiladas
- `npm run dev` - servidor iniciou em `http://localhost:3000` e `GET /` retornou 200

Validacao historica anterior:
- `npm.cmd exec prisma validate` e `npm.cmd run db:generate` passaram em 2026-05-27
- smoke de servidor: `npm.cmd run start -- -H 127.0.0.1 -p 3001` chegou a `Ready`; manter processo em background via PowerShell ficou instavel nesta sessao por limitacao do ambiente Windows
- Tailwind CSS verificado apos limpar build parcial: `/_next/static/css/*.css`
  responde HTTP 200 e contem utilitarios gerados.
- Smoke real anterior de auth com Postgres local:
  - cadastro via `/api/auth/register` retornou 201
  - login via `/api/auth/login` retornou 200
  - `/api/auth/me` retornou 200 com cookie de sessao
- `/dashboard` retornou 200 autenticado
- logout via `/api/auth/logout` retornou 200 e `/api/auth/me` retornou 401 apos encerrar sessao

Observacao de ambiente:
- no Windows, usar `npm.cmd` quando o PowerShell bloquear `npm.ps1`
- Vitest/Next podem precisar de permissao para spawn de workers locais

## Contexto do produto
`Clinica Agil` e um SaaS para terapeutas e psicologos autonomos.

Escopo do MVP:
- um unico profissional por conta
- cadastro de pacientes
- agenda
- prontuario/evolucao
- financeiro com cobranca online
- planos de cobranca configuraveis dentro do financeiro
- documentos e assinatura simples
- confirmacoes por WhatsApp

Fora do MVP:
- multi-profissional
- secretaria
- IA conversacional
- portal do paciente
- integracao DSM rica
- assinatura avancada com provider externo

## Decisoes tecnicas atuais
- repositorio preparado para monorepo, com app web em `apps/web`
- app principal: `Next.js` em `apps/web/src`
- estrutura padrao: `src/app/(public)`, `src/app/(private)`, `src/actions`, `src/services`, `src/lib/api`, `src/lib/errors`, `src/types`, `src/middleware.ts`
- deploy: `Vercel`
- UI: `shadcn/ui`
- referencia visual/funcional: prototipo Lovable em `references/images` e `docs/lovable-prototype-prompt.md`
- forms: `react-hook-form` + `zod`
- validacao: `src/utils/validators/<fluxo>.ts`, exportando `schema`, `resolver` e tipos de input por fluxo
- estado leve futuro: `zustand`
- auth atual: e-mail/senha real com services/server actions; Auth.js/Google Provider pode entrar depois se fizer sentido
- sessao atual: `database-backed` com cookie `HttpOnly`
- ORM atual: `Prisma`
- banco local atual: `PostgreSQL` via `docker compose`, exposto em `localhost:5433`
- producao: `Postgres` gerenciado
- e-mail: `Resend`
- pagamentos: `Stripe`
- WhatsApp: `Twilio`
- PDF: `react-pdf`
- assinatura em canvas: `react-konva`
- IA futura: possivel servico separado em `FastAPI`

## Padrao arquitetural vigente
- O app deve ser tratado como produto real, nao como prototipo.
- O prototipo Lovable em `references/` guia UI e fluxos, mas nao substitui implementacao production-ready.
- Usar server-side por padrao: Server Components, server actions, route handlers, Prisma e Postgres.
- Usar `src/lib/api` para chamadas server-side com `fetch`, resposta estruturada e suporte a cache tags.
- Usar `src/services` para regras de dominio e integracoes.
- Services internos podem chamar Prisma diretamente quando rodam no servidor via Server Component, Server Action ou Route Handler. Nao criar uma rota HTTP separada apenas para o proprio app chamar essa rota.
- Criar Route Handler quando houver fronteira HTTP real: webhook, API para cliente externo/mobile, integracao de terceiros, endpoint publico ou necessidade especifica de semantica/cache HTTP.
- Usar `src/lib/errors/create-api-error.ts` para respostas de erro previsiveis.
- Usar `src/utils/validators` para schemas Zod e resolvers de formularios. Cada fluxo deve ter seu proprio arquivo, por exemplo `login.ts`, `register.ts`, `patient.ts` e `appointment.ts`.
- Usar `revalidateTag` e `revalidatePath` em mutacoes relevantes.
- Evitar React Query/SWR ate existir uma necessidade clara de cache remoto client-side.
- Paginas devem ser pequenas e orientadas a composicao; componentes e hooks devem
  separar responsabilidades e estado interativo complexo.
- Opcoes, labels e metadados fixos devem sair do JSX de pagina para `constants.ts`
  proximos do dominio.
- Formatters, validators e masks devem ficar em pastas separadas e reutilizaveis.
- Helpers deterministicos seguem programacao funcional: funcoes puras, imutaveis,
  com entradas/saidas explicitas e efeitos isolados nas bordas.
- Schemas Zod devem ser compartilhados entre cliente e servidor; CPF usa digitos
  verificadores e datas visiveis/editaveis usam `dd/mm/aaaa`, nunca
  `mm/dd/yyyy`.
- Nao copiar a arquitetura interna do prototipo: store monolitica, mocks,
  `localStorage`, constantes locais de pagina e utils espalhadas.

## Decisoes de produto atuais
- confirmacao de consulta via WhatsApp sera apenas `sim/nao`
- metodo/dados de pagamento do paciente sao pre-condicao para criar consulta no fluxo operacional inicial
- metodos de pagamento iniciais do paciente: PIX, cartao, dinheiro e convenio; exigir apenas os dados necessarios para o metodo escolhido
- em caso de duvida de produto/UX, seguir o prototipo Lovable por padrao, salvo conflito com seguranca, LGPD, acessibilidade, arquitetura production-ready ou escopo explicitamente decidido
- planos de atendimento/cobranca vivem no `Financeiro`, nao na anamnese
- recibo sera um `PDF interno` preenchido com dados do pagamento do proprio app
- assinatura sera feita em modal dentro do app
- assinatura simples guardara `timestamp`, `IP` e `sessao` como evidencia minima
- `DSM/CID` no MVP sera apenas campo manual
- no futuro existira tambem uma `conta de paciente`
- o paciente podera futuramente solicitar agendamento, mas o terapeuta precisara aprovar

## Arquivos principais
- `apps/web` - app Next.js atual
- `specs/002-paciente-agenda-whatsapp/`
- `apps/web/prisma/migrations/20260527000200_paciente_agenda_whatsapp/migration.sql`
- `docs/project-overview.md`
- `docs/project-requirements.md`
- `docs/lovable-prototype-prompt.md`
- `docs/specs/mvp-product-spec.md`
- `docs/decisions/0001-mvp-stack.md`
- `docs/backlog/spec-kit-backlog.md`
- `docs/roadmap.md`
- `docs/prisma-development-guide.md`
- `docs/next-spec-paciente-agenda-whatsapp.md`
- `docs/next-spec-financeiro-dashboard-planos.md`
- `.specify/memory/constitution.md`
- `specs/001-bootstrap-landing-login/`

## Skills e regras importantes
- Usar `specify-prompt-engineer` antes de preparar briefs para `/speckit.specify`, `/speckit.clarify` e `/speckit.plan` quando o pedido for amplo.
- Usar `lovable-prompt-engineer` para prompts de prototipo no Lovable.
- Ao terminar desenvolvimento, atualizar `docs/roadmap.md`, `docs/project-overview.md` e `docs/handoff.md`.
- Ao terminar desenvolvimento, criar/atualizar um brief `.md` da proxima spec usando `specify-prompt-engineer`.
- Levar sempre em conta `docs/`, `docs/handoff.md`, `docs/roadmap.md`, `references/` e o prototipo Lovable.

## Roadmap atual
Ver `docs/roadmap.md`.

Estado atual:
- `Fase 0 - Fundacao documental e workflow`: concluida para bootstrap inicial
- `Fase 1 - Primeiro slice especificado`: concluido com `bootstrap landing + login placeholder`
- `Fase 1.1 - Paciente, financeiro inicial, agenda e WhatsApp`: implementada e com
  migration local aplicada; falta estabilizar testes de data e validar Twilio/manual
- `Fase 1.2 - Reconstrucao integral do frontend`: proxima, inventario e brief prontos
- `Fase 2 - MVP operacional do terapeuta`: ainda nao iniciado

## Ultimos prompts relevantes
> okay, obrigado, lembre-se sempre de quando terminar o desenvolvimento, atualizar documentacao, roadmap, overview, handoff com status atual do projjeto, o que mudou etc
>
> e tb de usar skill de prompt-engineer para fazer um .md da proxima spec a ser desenvolvida de acordo com o roadmap...

> ...vamos criar /apps/web e colocar o projeto next la dentro

## Pendencias em aberto
- estabilizar os 2 testes de agendamento que usam data fixa
- auditar e corrigir as 10 vulnerabilidades npm sem upgrade major automatico
- validar manualmente o slice 002 com Twilio sandbox
- decidir se Auth.js/Google Provider entra agora ou depois do fluxo paciente/agenda
- definir se recibo precisa seguir padrao especifico de contador ou convenio
- definir o primeiro modelo de cobranca online: link avulso, checkout manual ou recorrencia
- definir se assinatura simples sera suficiente juridicamente para o cliente inicial
- definir quando entra a conta do paciente no roadmap
- definir se o primeiro corte tera apenas login Google ou tambem e-mail/senha
- definir se prontuario precisa de versionamento/auditoria detalhada desde o primeiro corte

## Proximo passo recomendado
Continuar a propria feature `003`, sem abrir uma feature concorrente, pelo gate de
Pacientes: executar T044-T068 na ordem `/pacientes` -> `/pacientes/novo` -> perfil
Geral/Financeiro/Agenda, aceitando uma pagina apenas depois dos testes e da matriz
desktop/mobile. O brief da spec posterior, voltada a persistencia clinica e
criptografia, esta em `docs/next-spec-clinical-persistence-encryption.md` e deve ser
revalidado quando toda a reconstrucao frontend terminar.
