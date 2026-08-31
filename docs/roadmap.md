# Roadmap

## Status geral
Projeto com o `slice paciente/agenda/WhatsApp implementado` e a superfície
principal do protótipo reconstruída em Next.js. A feature `003` continua aberta
somente para o fechamento formal da matriz granular, auditorias transversais e
smoke manual; as rotas e interações centrais já estão disponíveis em desktop e
mobile sem persistência falsa.

Marco atual:
- documentacao base pronta
- workflow do `Spec Kit` inicializado
- skills auxiliares criadas
- primeira feature oficial implementada: `001-bootstrap-landing-login`
- app web Next.js movido para `apps/web` para preparar o repositorio como monorepo
- arquitetura base real adicionada: `src/app/(public)`, `src/app/(private)`, middleware, server actions, services, API wrapper, Prisma e Postgres local
- middleware ajustado para permitir Server Actions em rotas de auth sem travar o redirect client-side em 307
- guia rapido de Prisma criado em `docs/prisma-development-guide.md`
- login/cadastro agora sao funcionais com sessao em cookie HttpOnly
- validadores de formulario/API centralizados em `apps/web/src/utils/validators`, com um arquivo por fluxo e exports de `schema`, `resolver` e tipos de input
- decisao arquitetural reafirmada: services internos podem chamar Prisma diretamente no servidor; Route Handlers ficam para APIs HTTP, webhooks e integracoes externas
- spec `002` revisada para incluir financeiro inicial: metodo/dados de pagamento do paciente sao pre-condicao para criar consulta, junto com configuracao de WhatsApp
- slice `002-paciente-agenda-whatsapp` implementado em `apps/web`: pacientes, financeiro inicial por metodo, agenda com bloqueios e tentativa de confirmacao WhatsApp
- submodulo de referencia atualizado de `1ecff9d` para `226e5ab`, incorporando
  mudancas amplas em dashboard, agenda, pacientes, financeiro, mensagens,
  onboarding e configuracoes
- migration Prisma `20260527000200_paciente_agenda_whatsapp` aplicada com sucesso
  no PostgreSQL local em 2026-08-27
- validacao de 2026-08-27: `lint`, `typecheck` e `build` passaram; `test`
  terminou com 45/47 testes passando e 2 falhas porque datas fixas do teste de
  agendamento agora estao no passado
- `npm install` reportou 10 vulnerabilidades (1 low, 8 high, 1 critical), ainda
  pendentes de auditoria e correcao controlada
- inventario integral do prototipo criado em
  `docs/prototype-feature-inventory.md`
- proximo prompt de spec criado em
  `docs/next-spec-prototype-front-reconstruction.md`
- feature `003-prototype-front-reconstruction` especificada, esclarecida, planejada
  e decomposta em tarefas; fundacao e User Story 1 concluidas (T001-T043)
- migration `20260827000300_prototype_front_reconstruction` aplicada no PostgreSQL
  local e Prisma Client normal regenerado
- login, criacao de conta, recuperacao indisponivel honesta, shell responsivo,
  notificacoes reais, logout e onboarding persistente reconstruidos com shadcn/ui
- validacao Playwright do gate US1: 17 cenarios, 15 aprovados e 2 pulados de forma
  intencional para nao duplicar mutacoes reais no projeto mobile
- dashboard completo com atalhos, próximos atendimentos, lembretes, gráficos,
  mensagens e preferências de layout alimentados pelos services existentes
- pacientes reconstruídos com busca/filtros, wizard real de duas etapas, perfil
  com seis abas, Anamnese completa, evolução livre/SOAP e documentos com
  editor, preview e assinatura em canvas mantidos somente em memória
- agenda reconstruída em dia/semana/mês, com criação real, detalhes e workspace
  de sessão; mutações sem service continuam explicitamente indisponíveis
- financeiro e previsibilidade reconstruídos a partir de pacientes,
  perfis financeiros e consultas reais, sem inventar ledger, recibo ou cobrança
- configurações reconstruídas nas cinco abas, com validações brasileiras e
  bloqueio honesto das persistências ainda não implementadas
- checkpoint automatizado de 2026-08-31: 79/79 testes Vitest, lint, typecheck e
  build aprovados; suíte Playwright integral aprovada com 17 cenários
  executados e 2 mutações reais puladas intencionalmente no projeto mobile,
  cobrindo desktop `1440x900` e mobile `390x844`
- feedback visual final de 2026-08-31 incorporado: a lista de pacientes não
  reserva altura vazia com poucos registros; dropdowns ocupam a largura do
  gatilho; e os horários da Agenda usam seletor clicável em 24 horas, com ícone
  de relógio e intervalos de 10 minutos

## Fases
### Fase 0 - Fundacao documental e workflow
Status: `concluida para o bootstrap inicial`

Objetivo:
- consolidar escopo, stack e backlog
- preparar contexto para outros modelos
- preparar fluxo de especificacao com Spec Kit

Entregas:
- [x] `docs/project-overview.md`
- [x] `docs/project-requirements.md`
- [x] `docs/lovable-prototype-prompt.md`
- [x] `docs/specs/mvp-product-spec.md`
- [x] `docs/decisions/0001-mvp-stack.md`
- [x] `docs/backlog/spec-kit-backlog.md`
- [x] `docs/handoff.md`
- [x] `docs/roadmap.md`
- [x] `docs/prisma-development-guide.md`
- [x] constituição do projeto ratificada em `.specify/memory/constitution.md`
- [x] skill `specify-prompt-engineer`
- [x] skill `lovable-prompt-engineer`
- [x] integracao leve da skill de specify ao Spec Kit
- [x] integracao da skill `specify-prompt-engineer` ao comando de constitution
- [x] primeira feature real criada com `/speckit.specify`
- [x] primeiro slice implementado em `apps/web`
- [x] arquitetura server-first definida como padrao do projeto
- [x] login/cadastro/dashboard privados funcionais
- [x] convencao de validators em `src/utils/validators`

### Fase 1 - Primeiro slice especificado
Status: `concluido`

Objetivo:
- criar a primeira feature oficial do projeto via Spec Kit

Slice entregue:
- `bootstrap landing + login placeholder`

Entregas esperadas:
- [x] feature criada em `specs/001-bootstrap-landing-login/spec.md`
- [x] clarificacoes resolvidas
- [x] plano tecnico gerado
- [x] tasks geradas
- [x] implementacao validada com `test`, `lint`, `typecheck` e `build`
- [x] smoke test real de auth validado com Postgres local

### Fase 1.1 - Paciente, agenda e WhatsApp
Status: `implementado; migration local aplicada; validacao manual/integracoes pendentes`

Slice alvo:
- `criar paciente -> cadastrar financeiro inicial -> agendar consulta -> enviar WhatsApp`

Entregas esperadas:
- [x] brief pronto em `docs/next-spec-paciente-agenda-whatsapp.md`
- [x] feature criada via `/speckit.specify` em `specs/002-paciente-agenda-whatsapp/spec.md`
- [x] clarificacoes resolvidas, incluindo conflito de agenda, duplicidade, webhook fora do slice, status de notificacao e pre-condicoes de WhatsApp/pagamento
- [x] plano tecnico gerado em `specs/002-paciente-agenda-whatsapp/plan.md`
- [x] tasks geradas em `specs/002-paciente-agenda-whatsapp/tasks.md`
- [x] implementacao criada em `apps/web`
- [x] testes unitarios/integracao adicionados para validadores, services, actions e notificacao
- [x] checks originais passaram: `lint`, `typecheck`, `test`, `build`
- [x] aplicar migration no Postgres local
- [ ] estabilizar os 2 testes de agendamento dependentes de data
- [ ] validar fluxo manual completo com banco e credenciais/sandbox de WhatsApp

### Fase 1.2 - Reconstrucao integral do frontend
Status: `superfície funcional reconstruída; fechamento formal da matriz e auditorias finais em andamento`

Slice alvo:
- `paridade integral do frontend Lovable -> arquitetura reutilizavel -> services progressivos`

Entregas esperadas:
- [x] referencia Lovable atualizada para `226e5ab`
- [x] inventario funcional/mercadologico em `docs/prototype-feature-inventory.md`
- [x] brief pronto em `docs/next-spec-prototype-front-reconstruction.md`
- [x] requisitos de Zod, CPF, mascaras e datas `dd/mm/aaaa` registrados
- [x] padrao de `constants.ts`, hooks, formatters/validators/masks separados e
  funcoes puras registrado
- [x] feature criada via `/speckit.specify`
- [x] clarificacoes resolvidas
- [x] plano tecnico gerado
- [x] tasks geradas
- [x] matriz de paridade criada por rota/fluxo em desktop e mobile
- [x] infraestrutura compartilhada, validacoes brasileiras e contratos de capacidade
- [x] gate de autenticacao publica, shell privado e onboarding (US1/T001-T043)
- [x] revalidacao corretiva do shell/onboarding: rail compacto, Sheet sobreposto,
  spotlight por `clip-path`, alvos por id, posicionamento adaptativo, URL
  `?onboarding=<passo>` e travessia ate Configuracoes nos 16 passos
- [x] superfície de pacientes: lista, wizard real e perfil com seis abas
- [x] superfícies de agenda, dashboard, financeiro, previsibilidade e configurações
- [x] fluxos clínicos/documentais transitórios completos, sem persistência sensível
- [x] evidência Playwright central em desktop e mobile em
  `output/playwright/evidence`
- [ ] fechamento integral da matriz e validacao final da feature

Métricas do fechamento formal em 2026-08-31:
- 78/384 linhas da matriz decididas e 306 ainda `pending`;
- 43/130 tarefas concluídas e 87 abertas, incluindo tarefas cuja implementação
  equivalente já existe em componentes consolidados e precisa ser reconciliada;
- lacunas funcionais restantes: confirmação de descarte de rascunhos clínicos e
  documentais, auditorias transversais, regressão final e smoke manual.

### Fase 2 - MVP operacional do terapeuta
Status: `nao iniciado`

Objetivo:
- entregar o nucleo vendavel para autonomos individuais

Modulos:
- [ ] auth inicial
- [ ] pacientes
- [ ] agenda
- [ ] notificacoes via WhatsApp
- [ ] prontuario
- [ ] financeiro
- [ ] documentos
- [ ] assinatura simples
- [ ] dashboard

### Fase 3 - Hardening e producao
Status: `nao iniciado`

Objetivo:
- tornar o MVP seguro e operavel em ambiente real

Entregas:
- [ ] auditoria basica
- [ ] politicas LGPD essenciais
- [ ] exportacao/exclusao minima
- [ ] validacao com usuarios reais
- [ ] ajustes de UX

### Fase 4 - Expansao de produto
Status: `futuro`

Objetivo:
- abrir novas frentes apos validar o nucleo

Possiveis frentes:
- [ ] conta do paciente
- [ ] portal do paciente
- [ ] solicitacao de agendamento com aprovacao do terapeuta
- [ ] IA para transcricao e automacoes internas
- [ ] servico separado em `FastAPI` se a complexidade justificar
- [ ] assinatura avancada com provider externo

## Decisoes congeladas por agora
- MVP = `profissional autonomo individual`
- prototipo Lovable = fonte padrao de verdade para produto/UX quando houver duvida, salvo override explicito por seguranca, LGPD, acessibilidade, arquitetura production-ready ou escopo reduzido
- implementacao = production-ready em `Next.js`, com foco em seguranca, performance e escalabilidade
- UI = `shadcn/ui` mantendo continuidade visual do Lovable
- WhatsApp = `sim/nao`
- `DSM/CID` = campo manual
- recibo = PDF interno
- assinatura = simples, em modal, com `IP` e `sessao`
- patient portal = futuro
- metodo/dados de pagamento do paciente = pre-condicao para criar consulta no fluxo operacional inicial
- metodos de pagamento iniciais = PIX, cartao, dinheiro e convenio, exigindo apenas os dados necessarios ao metodo escolhido
- planos de atendimento/cobranca devem viver no `Financeiro` como aba/subsecao, nao na anamnese
- campo `contrato terapeutico` nao deve ficar em anamnese; contratos/planos pertencem ao financeiro
- services server-side chamam Prisma diretamente para regras internas do app
- route handlers sao usados quando a fronteira HTTP e necessaria: API externa, webhook, integracao, mobile/futuro cliente separado ou cache HTTP especifico
- formularios com `react-hook-form` devem usar resolvers exportados de `src/utils/validators/<fluxo>.ts`
- frontend do prototipo no commit `226e5ab` = baseline congelada de paridade para
  a proxima spec
- datas de entrada/exibicao = `dd/mm/aaaa`; o usuario nao deve ver `mm/dd/yyyy`
- CPF/CNPJ/telefone/CEP/moeda = mascaras e schemas reais reutilizaveis, com Zod no
  cliente e servidor
- helpers deterministicos = funcoes puras e imutaveis; formatters, validators e
  masks ficam em pastas separadas
- opcoes e metadados fixos = `constants.ts` proximos ao dominio; paginas nao devem
  concentrar todo estado e logica, usando componentes e hooks quando agregarem valor
- controle visual sem service pronto deve informar indisponibilidade, sem sucesso ou
  persistencia falsos

## Bloqueios e duvidas
- padrao juridico/contabil do recibo
- nivel juridico necessario da assinatura
- modelo inicial de cobranca online
- auth inicial so Google ou Google + e-mail/senha
- nivel de auditoria/versionamento do prontuario no primeiro corte

## Proxima acao recomendada
Fechar a feature `003` sem ampliar escopo: decidir cada linha ainda `pending`
da matriz, executar os smokes manuais do quickstart e concluir as auditorias de
acessibilidade, LGPD e bundle. Depois disso, executar
`/speckit.specify` com `docs/next-spec-clinical-persistence-encryption.md`
para transformar Anamnese, evolução/SOAP e finalização de sessão em registros
clínicos reais, versionados e auditáveis.

O service de mensagens deve entrar em slice próprio depois desse gate clínico.
Antes de implementá-lo, a spec deve congelar um catálogo tipado de variáveis
dinâmicas, regras para dados ausentes, momento de resolução, preview idêntico ao
envio, versionamento do template e snapshot auditável da mensagem renderizada.

Checkpoint funcional de 2026-08-31:
- rotas centrais do protótipo reconstruídas com shell, tour de 16 passos,
  dashboard, pacientes, agenda, financeiro, previsibilidade e configurações;
- criação de paciente e perfil financeiro usam as fronteiras reais existentes;
  agregados financeiros são derivados de consultas reais;
- Anamnese, Prontuário, documentos, assinatura, recibos, ledger editável, planos,
  templates e configurações avançadas não reportam sucesso falso;
- Playwright cria paciente real, percorre as superfícies clínicas/documentais e
  valida overlays e responsividade nos dois viewports fixos.

Checkpoint corretivo de 2026-08-27:
- o onboarding anterior foi rejeitado por funcionar como modal central; foi
  substituido pelo fluxo guiado do prototipo, com recorte clicavel, Sheet/menu
  controlados, persistencia e continuidade de rota;
- `/configuracoes`, `/financeiro` e `/financeiro/previsibilidade` deixaram de
  retornar 404, mas continuam incrementos parciais e nao tiveram seus gates de
  pagina marcados como concluidos;
- Dashboard recebeu resumo real inicial e Agenda deixou de expor data americana,
  sem antecipar a aceitacao dos respectivos gates de paridade;
- validacao: 79 testes Vitest, typecheck e build passaram; o E2E dos 16 passos
  passou em desktop `1440x900` e mobile `390x844`.
