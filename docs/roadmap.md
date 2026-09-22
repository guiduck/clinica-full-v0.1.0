# Roadmap

## Checkpoint corretivo de agenda e cadastro — 2026-09-19

Status: `implementado e validado localmente; publicação e smoke na VPS pendentes`.

- A Agenda passa a gravar datas/horários com offset explícito de São Paulo e a
  posicionar consultas pelo mesmo fuso; registros antigos não são reescritos
  automaticamente, pois uma correção em massa poderia mover consultas válidas.
- Editar/remarcar uma consulta futura e não iniciada é uma mutação real: verifica
  dono e conflito, atualiza a receita prevista vinculada com auditoria e tenta
  atualizar o evento existente no Google Agenda. Consultas efetivadas mantêm a
  data financeira de realização. Cancelar/excluir e horário fixo seguem fora.
- A conexão do Google Agenda fica visível na Agenda; o profissional pode conectar
  a conta e sincronizar até 25 consultas futuras pendentes por ação explícita.
  Falhas do provider não desfazem a consulta e são comunicadas. Não há envio
  automático novo por WhatsApp na remarcação; o profissional deve avisar o paciente.
- CPF de novos profissionais passa a ser persistido. Nome, CPF, especialidade e
  conselho são salvos em Configurações por Server Action; e-mail continua somente
  leitura até haver verificação própria. A migration
  `20260919000100_professional_profile` é necessária antes do novo app na VPS.
- Endereço e contato de emergência opcionais do paciente agora abrem campos reais
  e são persistidos com validação server-side de CEP, telefone e CPF.
- O e-mail de recuperação direciona ao passo de código com o endereço pré-selecionado;
  o tour recalcula o alvo após a animação do menu. Erro de chave clínica deixa de
  expor detalhes internos, mas a chave válida ainda precisa ser configurada.
- Gate local: `prisma generate`, lint, typecheck, 58 arquivos/172 testes Vitest,
  build de produção com 29 rotas e `git diff --check` aprovados. Smoke em navegador
  e inspeção dos logs da VPS não foram executados neste checkpoint.
- Próximo passo: publicar com a migration, verificar a chave AES-256-GCM sem
  substituí-la se já cifra dados, executar smoke de auth/agenda/Google/clínica e
  diagnosticar o `ChunkLoadError` em logs e rede reais. Depois, especificar
  documentos/recibos/assinatura com o brief atualizado.

## Checkpoint auth, e-mail, clínica e calendário — 2026-09-18

- login Google real integrado à sessão própria do sistema, usando o callback
  `https://clinica-full.gfig.space/api/auth/callback/google`;
- confirmação de conta por link e recuperação de senha por código de 6 dígitos,
  expirado em 15 minutos, limitado a 5 tentativas e armazenado somente como hash;
  envio compatível com Resend ou SendGrid;
- Anamnese e evoluções clínicas persistidas no PostgreSQL com payload AES-256-GCM
  e autorização pelo profissional proprietário;
- início/finalização de sessão persistidos; finalizar grava evolução vinculada e
  marca a consulta como `realizada`;
- novas consultas continuam criando receita prevista vinculada ao paciente e
  podem ser copiadas ao Google Agenda quando a integração estiver conectada;
- busca/status de pacientes e data/visão da agenda agora usam query string
  canônica e sobrevivem a reload/compartilhamento;
- migrations `20260918000100_auth_email_clinical_calendar` e
  `20260918000200_password_reset_codes` adicionadas; o ambiente de produção deve
  mostrar **5 migrations** após o próximo deploy;
- gate local aprovado: Prisma generate, lint, typecheck, 55 arquivos/162
  testes e build de produção com 29 rotas/páginas geradas;
- próximo slice recomendado: documentos clínicos, recibos PDF e assinatura
  simples, descrito em `docs/next-spec-documentos-recibos-assinatura.md`.

## Checkpoint financeiro persistente — 2026-09-14

- ledger financeiro real adicionado ao PostgreSQL com receitas, despesas,
  origem manual/consulta, status previsto/efetivado/cancelado e auditoria;
- criação de consulta elegível passa a criar exatamente uma receita prevista na
  mesma transação, usando valor e método do perfil financeiro do paciente;
- migration converte consultas antigas elegíveis sem apagar ou reescrever agenda;
- Financeiro, Previsibilidade, Dashboard e aba Financeiro do paciente leem a
  mesma fonte canônica persistida;
- criação manual, correção, efetivação e cancelamento são ações reais, isoladas
  pelo usuário autenticado e revalidam todos os consumidores;
- gate local: Prisma schema, lint, typecheck, build de 22 rotas e 52 arquivos/
  156 testes aprovados; aplicação da migration ficou pendente para o Compose/VPS
  porque o Docker Desktop local não concluiu a inicialização;
- recibo PDF, cobrança Stripe, pagamentos parciais e planos recorrentes continuam
  em slices próprios, sem sucesso simulado.

## Status geral

Checkpoint definitivo da feature 003 em 2026-09-03:
- validação compartilhada conectada às telas clínicas e de Configurações;
- Dashboard e Previsibilidade sem números financeiros estáticos e com recortes
  derivados da projeção canônica de consultas elegíveis;
- jornada real de Agenda aprovada sem WhatsApp, com bloqueio de término
  anterior/igual ao início e persistência verificada após recarga;
- gate aprovado com lint, typecheck, 49 arquivos/147 testes, build de 22 rotas
  e Playwright 11/11 em desktop/mobile;
- próxima entrega: persistência clínica e proteção de dados sensíveis; o ledger
  financeiro foi antecipado e implementado em 2026-09-14.
Projeto com o `slice paciente/agenda/WhatsApp implementado`, a superfície
principal do protótipo reconstruída em Next.js e o gate visual da feature `003`
formalmente reconciliado. As 384 linhas da matriz estão decididas, os gates
transversais passaram e o primeiro avanço prático de services tornou a criação
de paciente + perfil financeiro uma única transação Prisma.

Checkpoint final da feature 003 em 2026-08-31:
- matriz: 384/384 decididas (`284 equivalent`, `72 unavailable-capability`,
  `28 approved-divergence`, `0 pending`);
- tarefas: 130/130 concluídas após o hardening unitário/de componente final;
- qualidade: lint, typecheck, 87 testes Vitest, build de 22 rotas e Playwright
  com 17 aprovados/2 pulados intencionalmente;
- segurança: audit de produção zerado após upgrade compatível de Next/PostCSS/
  Sharp; relatório em `docs/security-best-practices-report.md`;
- próximo slice: persistência clínica e proteção de dados sensíveis, usando
  `docs/next-spec-clinical-persistence-encryption.md`.

Checkpoint arquitetural de 2026-09-01:
- `AppShell`, `OnboardingTour` e `Tooltip` migrados para pastas de componente
  camelCase com `index.tsx` público e partes internas em kebab-case;
- tour refeito como compound component com store Zustand única, Context de
  composição, hooks de integração e constantes/tipos/utilitários separados;
- removidos estado duplicado, prop drilling do shell, barramento global de
  `CustomEvent`, ternários aninhados e loop contínuo de medição por RAF;
- padrão completo registrado em `docs/frontend-architecture.md` e `AGENTS.md`,
  com enforcement por ESLint e teste arquitetural;
- regressão aprovada: lint, typecheck, 95 testes Vitest, build de 22 rotas e
  Playwright com 17 aprovados/2 pulados em desktop e mobile.

Checkpoint de identidade e onboarding de 2026-09-01:
- [x] substituir a marca pública anterior por `clinica-full` e fixar a URL
  canônica `https://clinica-full.gfig.space` em uma constante compartilhada;
- [x] revisar código, testes e documentação para remover referências públicas à
  marca e ao domínio anteriores;
- [x] alinhar dinamicamente a seta do balão ao centro do alvo destacado usando a
  largura real do cartão e limites seguros nas bordas;
- [x] animar deslocamento do cartão, conteúdo, `clip-path` e spotlight, respeitando
  a preferência de redução de movimento;
- [x] tornar `Especialidade` opcional sem relaxar a validação obrigatória de CPF;
- [x] validar com lint, typecheck, 96/96 testes Vitest e o onboarding completo em
  Playwright desktop `1440x900` e mobile `390x844`.

Checkpoint de hardening de pacientes de 2026-09-01:
- [x] concluir T047/T048 para lista e perfil de pacientes;
- [x] cobrir filtros, estados vazios, abas/URL, dados legados e ações contextuais;
- [x] distinguir `Restaurar paciente` de `Arquivar paciente` sem simular mutação;
- [x] validar lint, typecheck, 35 arquivos/102 testes e build de 22 rotas.

Checkpoint de encerramento da feature 003 em 2026-09-01:
- [x] abrir a Agenda com o paciente criado sem corrida com o fechamento do wizard;
- [x] desabilitar horários finais anteriores ou iguais ao início;
- [x] permitir consulta sem WhatsApp com aviso e sem notificação falsa;
- [x] concluir T070/T071, T081-T084, T097-T099 e T111/T112;
- [x] documentar o ledger futuro em `docs/next-spec-financial-ledger-persistence.md`;
- [x] encerrar a feature com 130/130 tarefas e 384/384 linhas decididas.
- [x] validar typecheck, lint, 48 arquivos/141 testes e build de 22 rotas.

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
- as vulnerabilidades históricas foram revisadas e corrigidas sem upgrade major;
  `npm audit --omit=dev` reporta 0 em 2026-08-31
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
- financeiro e previsibilidade foram inicialmente reconstruídos a partir de
  pacientes/perfis/consultas; desde 2026-09-14 usam o ledger real, enquanto
  recibo e cobrança externa continuam sem simulação
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
Status: `concluída`

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
- [x] fechamento integral da matriz e validacao final da feature

Métricas do fechamento formal em 2026-09-01:
- 384/384 linhas da matriz decididas e nenhuma `pending`;
- 130/130 tarefas concluídas;
- descarte de rascunhos, auditorias transversais, regressão, bundle e smoke
  desktop/mobile foram executados.

### Fase 2 - MVP operacional do terapeuta
Status: `em andamento; núcleo operacional persistente disponível`

Objetivo:
- entregar o nucleo vendavel para autonomos individuais

Modulos:
- [x] auth por e-mail/senha com sessão persistida e cookie HttpOnly
- [x] criação, listagem e perfil de pacientes persistidos no PostgreSQL
- [x] agenda (criação, conflito, sessão e sincronização opcional com Google)
- [ ] notificacoes via WhatsApp
- [x] prontuario básico (Anamnese e evolução/SOAP criptografadas)
- [x] financeiro básico persistente (ledger, previsão, efetivação e despesas)
- [ ] documentos
- [ ] assinatura simples
- [x] dashboard

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
Concluir primeiro o gate de produção do checkpoint de 2026-09-19, incluindo
migration, chave clínica, smoke manual e diagnóstico do carregamento de chunks.
O próximo slice de produto é `docs/next-spec-documentos-recibos-assinatura.md`;
usar `/speckit.specify` após estabilizar o ambiente. Mensageria de remarcação,
horário fixo e cancelamento continuam decisões separadas, sem sucesso simulado.

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

## Checkpoint de infraestrutura de produção — 2026-08-31

Status: `scaffold de VPS implementado e validado localmente; ativação remota pendente`.

- [x] configurar Next.js standalone para self-hosting;
- [x] criar Dockerfile multi-stage com OpenSSL compatível com Prisma;
- [x] criar Compose de produção com migration, app e PostgreSQL sem porta pública;
- [x] tornar a porta local do app configurável por `APP_PORT`;
- [x] criar exemplo de ambiente da VPS e endpoint de saúde;
- [x] documentar Vercel DNS, Caddy, submódulos, deploy e atualização;
- [x] validar Compose, typecheck, build, imagem e healthcheck do container;
- [x] autenticar na VPS, inventariar serviços e reservar a porta local 3101;
- [ ] criar registro A do subdomínio para `216.158.236.156`;
- [ ] executar primeiro deploy, migration e smoke persistente;
- [ ] validar e recarregar o Caddy real sem interromper os sites existentes;
- [ ] confirmar HTTPS, login e persistência depois de reiniciar containers.
