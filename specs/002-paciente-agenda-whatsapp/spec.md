# Feature Specification: Paciente, Agenda, Financeiro Inicial e WhatsApp

**Feature Branch**: `002-paciente-agenda-whatsapp`  
**Created**: 2026-05-24  
**Status**: Draft  
**Input**: User description: "docs/next-spec-paciente-agenda-whatsapp.md"

## Clarifications

### Session 2026-05-24

- Q: Como a agenda deve tratar consultas com horarios sobrepostos para o mesmo terapeuta? -> A: Prevent overlapping appointments for the same therapist.
- Q: Como o sistema deve tratar possiveis pacientes duplicados? -> A: Prevent duplicate patient when CPF or phone already exists for the same therapist.
- Q: O webhook de resposta `sim/nao` do WhatsApp entra neste slice? -> A: Defer inbound `sim/nao` webhook to the next slice.
- Q: Quais status de notificacao devem existir neste slice? -> A: Use statuses: `pendente`, `enviado`, `falhou`.
- Q: Como o sistema deve se comportar quando credenciais de WhatsApp estiverem ausentes? -> A: Missing credentials block appointment creation.

### Session 2026-05-26

- Q: Alem de WhatsApp configurado, qual outra dependencia deve bloquear a criacao de consulta? -> A: Metodo/dados de pagamento do paciente tambem devem estar cadastrados.
- Q: Quais dados financeiros minimos do paciente devem ser obrigatorios neste slice? -> A: Metodo preferido, valor padrao da sessao e dados obrigatorios do metodo escolhido.
- Q: Em caso de duvida de produto/UX, qual referencia deve prevalecer? -> A: Obedecer ao prototipo Lovable, desde que nao conflite com seguranca, LGPD ou escopo ja decidido.
- Q: Quais metodos de pagamento devem existir neste slice? -> A: PIX, cartao, dinheiro e convenio; exigir apenas os dados necessarios para o metodo escolhido.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar Paciente (Priority: P1)

Como terapeuta autonomo, quero cadastrar um paciente com os dados essenciais de identificacao, contato e consentimento de comunicacao para que eu possa usar esse registro em agendamentos e operacao clinica.

**Why this priority**: O paciente e a entidade base do fluxo operacional; sem um paciente confiavel nao ha consulta, agenda ou notificacao.

**Independent Test**: Pode ser testado criando um paciente com dados validos, verificando sua aparicao na lista/busca e confirmando que dados obrigatorios, consentimento e erros de validacao sao tratados de forma clara.

**Acceptance Scenarios**:

1. **Given** um terapeuta autenticado em uma area privada, **When** ele informa nome e telefone validos e salva o paciente, **Then** o paciente fica disponivel para busca e selecao em agendamentos.
2. **Given** um terapeuta preenchendo o formulario de paciente, **When** um dado obrigatorio ou formato de contato esta invalido, **Then** o sistema impede o cadastro e mostra uma mensagem acionavel em portugues.
3. **Given** um paciente cadastrado com aceite para WhatsApp, **When** o terapeuta visualiza o cadastro, **Then** o indicador de consentimento de comunicacao aparece de forma clara.
4. **Given** um paciente existente com o mesmo CPF ou telefone normalizado na conta do terapeuta, **When** o terapeuta tenta cadastrar outro paciente com esses dados, **Then** o sistema bloqueia o cadastro duplicado e indica o registro conflitante quando permitido.
5. **Given** um paciente criado com sucesso, **When** o terapeuta escolhe "Salvar e ir para o financeiro", **Then** o sistema abre a aba financeira do paciente recem criado para cadastro dos dados de pagamento.

---

### User Story 2 - Completar Financeiro Inicial do Paciente (Priority: P2)

Como terapeuta autonomo, quero registrar os dados de pagamento do paciente logo apos o cadastro para que consultas e futuras cobrancas nao fiquem travadas por informacao financeira ausente.

**Why this priority**: O fluxo operacional completo depende de agenda e financeiro conectados; sem dados de pagamento, a consulta nao deve avancar para confirmacao e cobranca.

**Independent Test**: Pode ser testado criando um paciente, acionando "Salvar e ir para o financeiro", registrando metodo preferido entre PIX, cartao, dinheiro e convenio, valor padrao da sessao e apenas os dados exigidos pelo metodo escolhido, e verificando que o paciente passa a estar apto para agendamento.

**Acceptance Scenarios**:

1. **Given** um paciente recem criado, **When** o terapeuta escolhe ir ao financeiro, **Then** a aba financeira do paciente abre com o cadastro de dados de pagamento em foco.
2. **Given** um paciente sem dados de pagamento cadastrados, **When** o terapeuta tenta agendar consulta, **Then** o sistema bloqueia o agendamento e orienta o cadastro financeiro do paciente.
3. **Given** um paciente com metodo preferido, valor padrao da sessao e dados obrigatorios do metodo escolhido, **When** o terapeuta cria uma consulta valida, **Then** o fluxo pode seguir para tentativa de confirmacao por WhatsApp.
4. **Given** um paciente com PIX, cartao, dinheiro ou convenio selecionado, **When** faltam dados necessarios para aquele metodo, **Then** o sistema nao considera o financeiro inicial completo e orienta o preenchimento.

---

### User Story 3 - Agendar Consulta (Priority: P3)

Como terapeuta autonomo, quero criar uma consulta vinculada a um paciente existente para organizar minha agenda minima de atendimentos.

**Why this priority**: O agendamento transforma o cadastro e o financeiro inicial em fluxo operacional diario e cria o evento que dispara a confirmacao.

**Independent Test**: Pode ser testado selecionando um paciente existente, escolhendo data/horario e salvando uma consulta que aparece na agenda/lista minima com status inicial.

**Acceptance Scenarios**:

1. **Given** um paciente existente, **When** o terapeuta cria uma consulta com data, horario de inicio e horario de fim validos, **Then** a consulta aparece na agenda com paciente, periodo e status inicial.
2. **Given** uma tentativa de consulta com horario final anterior ou igual ao inicio, **When** o terapeuta tenta salvar, **Then** o sistema bloqueia o agendamento e explica o problema.
3. **Given** uma agenda com consultas ja cadastradas, **When** o terapeuta acessa a agenda minima, **Then** ele ve as proximas consultas em ordem cronologica e consegue identificar status de consulta e confirmacao.
4. **Given** uma consulta existente para o mesmo terapeuta, **When** ele tenta criar outra consulta com horario sobreposto, **Then** o sistema bloqueia o agendamento e informa o conflito.

---

### User Story 4 - Enviar Confirmacao por WhatsApp (Priority: P4)

Como terapeuta autonomo, quero que a criacao de uma consulta tente enviar automaticamente uma confirmacao por WhatsApp para reduzir trabalho manual e registrar o resultado operacional do envio.

**Why this priority**: A confirmacao por WhatsApp e o primeiro ganho operacional alem do cadastro/agenda e prepara o produto para notificacoes transacionais.

**Independent Test**: Pode ser testado criando uma consulta para paciente com telefone e consentimento, verificando que o sistema tenta enviar a mensagem e registra o status como pendente, enviado ou falhou.

**Acceptance Scenarios**:

1. **Given** um paciente com telefone valido e consentimento para WhatsApp, **When** o terapeuta cria uma consulta, **Then** o sistema tenta enviar uma confirmacao e registra o resultado do envio.
2. **Given** um paciente sem consentimento para WhatsApp, **When** o terapeuta cria uma consulta, **Then** a consulta e criada, mas a confirmacao nao e enviada e o motivo fica visivel para o terapeuta.
3. **Given** uma falha de envio da confirmacao, **When** a consulta e salva, **Then** o sistema preserva a consulta, registra a falha e mostra feedback operacional sem esconder o erro.
4. **Given** o canal de WhatsApp sem credenciais configuradas, **When** o terapeuta tenta criar uma consulta, **Then** o sistema bloqueia a criacao e informa que o canal precisa ser configurado.

### Edge Cases

- Paciente sem telefone ou com telefone invalido deve poder ser cadastrado apenas se o fluxo nao exigir WhatsApp; ao agendar, a tentativa de confirmacao deve ser marcada como falhou com motivo claro quando consentimento ou dados impedirem envio.
- Paciente com CPF ou telefone normalizado ja usado por outro paciente do mesmo terapeuta deve ser tratado como duplicado e nao deve gerar novo cadastro.
- Consultas com data no passado devem exigir correcao antes de salvar.
- Consultas com duracao invalida devem ser rejeitadas antes de criar notificacao.
- Consultas com horario sobreposto para o mesmo terapeuta devem ser rejeitadas antes de criar notificacao.
- Ausencia de credenciais/configuracao do WhatsApp deve bloquear a criacao de consulta neste slice, pois a confirmacao automatica faz parte do fluxo principal.
- Ausencia de metodo preferido, valor padrao da sessao ou dados necessarios para o metodo escolhido deve bloquear a criacao de consulta neste slice e direcionar o terapeuta para a aba financeira do paciente.
- Falha do provedor de WhatsApp nao deve desfazer automaticamente o cadastro do paciente nem a consulta criada.
- Pacientes arquivados ou inativos nao devem ser selecionados por padrao para novos agendamentos.
- Mensagens de erro nao devem expor dados sensiveis do paciente em logs, URLs, notificacoes publicas ou estados compartilhaveis.

## Prototype & Constitution Alignment *(mandatory)*

### Prototype References

- **Lovable screens**: `references/images/WhatsApp Image 2026-04-24 at 16.05.42 (3).jpeg` a `references/images/WhatsApp Image 2026-04-24 at 16.05.42 (10).jpeg` para pacientes, perfil e agenda; demais imagens do conjunto para continuidade visual do app privado.
- **Lovable prompt sections**: "Main app shell", "Patients / Gestao de Carteira", "New / edit patient", "Global agenda", "Patient agenda tab" e "Notifications".
- **Required UI continuity**: sidebar privada com navegacao para Dashboard, Pacientes e Agenda; formularios em portugues; status chips; busca simples de pacientes; CTAs "Novo Paciente" e "Novo Agendamento"; feedback visivel para envio WhatsApp.
- **Allowed UX improvements**: reduzir o formulario inicial ao essencial do MVP, usar estados vazios orientados a acao, adicionar "Salvar e ir para o financeiro" no cadastro de paciente, trocar a grade completa de agenda por lista/minivisualizacao se isso mantiver o fluxo mais simples, e deixar remarcacao/recorrencia para specs futuras.
- **Explicit scope boundary**: recebimento de resposta `sim/nao` por webhook e atualizacao automatica do status a partir dessa resposta ficam fora deste slice.
- **Financial scope boundary**: este slice inclui apenas cadastro de metodo/dados de pagamento do paciente como pre-condicao operacional. Geracao de cobranca, planos cadastrados, planos personalizados, recibos, filtros financeiros avancados e graficos ficam para a proxima spec.
- **Prototype precedence**: quando houver duvida de produto ou UX, seguir o prototipo Lovable como fonte de verdade, exceto quando ele conflitar com seguranca, LGPD, arquitetura production-ready ou escopo explicitamente decidido nesta spec.

### Security, Privacy & Compliance

- **Sensitive data touched**: dados de identificacao, contato, agenda de atendimento, consentimento de comunicacao e dados financeiros de paciente.
- **Auth/authorization requirement**: somente o terapeuta autenticado dono da conta pode criar, listar, buscar ou alterar pacientes, consultas e registros de notificacao.
- **LGPD requirement**: coletar apenas dados necessarios para cadastro, contato e agenda; registrar consentimento para WhatsApp; evitar exposicao publica; permitir que dados sensiveis fiquem restritos a rotas privadas.
- **Audit/logging requirement**: registrar eventos operacionais de criacao de paciente, criacao de consulta e tentativa de confirmacao sem gravar conteudo clinico sensivel em logs tecnicos.

### Performance & Accessibility Expectations

- **Next.js rendering/data strategy**: priorizar paginas privadas renderizadas no servidor, mutacoes via server actions, validacao compartilhada nos formularios, services de dominio para pacientes/consultas/notificacoes e cache nativo invalidado apos criacao.
- **Performance risk**: listas de pacientes e consultas podem crescer; o MVP deve carregar buscas simples e proximas consultas rapidamente sem exigir grade mensal pesada.
- **Accessibility requirement**: todos os campos precisam de labels, mensagens de erro associadas, foco visivel, navegacao por teclado, alvos de toque adequados e status de envio compreensivel sem depender apenas de cor.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir que um terapeuta autenticado cadastre paciente com nome e telefone como dados obrigatorios minimos para o fluxo de agenda e WhatsApp.
- **FR-002**: O sistema MUST permitir e-mail, CPF, data de nascimento, observacoes e consentimento para WhatsApp como dados opcionais ou condicionais do paciente.
- **FR-003**: O sistema MUST validar dados de paciente antes de salvar e apresentar erros em portugues junto aos campos afetados.
- **FR-004**: O sistema MUST listar pacientes cadastrados com busca simples por nome, telefone, e-mail ou CPF quando esses dados existirem.
- **FR-004a**: O sistema MUST impedir cadastro duplicado de paciente quando CPF ou telefone normalizado ja existir para o mesmo terapeuta.
- **FR-004b**: O sistema MUST oferecer no cadastro de paciente uma acao "Salvar e ir para o financeiro" que leve para a aba financeira do paciente recem criado.
- **FR-004c**: O sistema MUST permitir cadastrar metodo preferido de pagamento, valor padrao da sessao e dados obrigatorios do metodo escolhido.
- **FR-004d**: O sistema MUST suportar os metodos de pagamento PIX, cartao, dinheiro e convenio neste slice.
- **FR-004e**: O sistema MUST exigir somente os dados necessarios para o metodo de pagamento escolhido.
- **FR-005**: O sistema MUST permitir criar consulta apenas para paciente existente e selecionavel pelo terapeuta autenticado.
- **FR-006**: O sistema MUST validar data, horario de inicio, horario de fim e vinculo com paciente antes de salvar uma consulta.
- **FR-007**: O sistema MUST atribuir a nova consulta um status inicial de agendada e um status inicial de confirmacao separado.
- **FR-008**: O sistema MUST exibir uma agenda minima com consultas criadas, incluindo paciente, data, horario, status da consulta e status de confirmacao.
- **FR-008a**: O sistema MUST impedir consultas com horarios sobrepostos para o mesmo terapeuta.
- **FR-009**: O sistema MUST tentar enviar confirmacao por WhatsApp automaticamente quando uma consulta e criada para paciente com telefone valido e consentimento registrado.
- **FR-010**: O sistema MUST registrar cada tentativa de confirmacao com status operacional, data/hora, canal, consulta vinculada e motivo de falha quando houver.
- **FR-011**: O sistema MUST permitir que falhas de WhatsApp sejam visiveis ao terapeuta sem impedir que a consulta salva continue disponivel na agenda.
- **FR-012**: O sistema MUST evitar envio de WhatsApp quando o paciente nao tiver consentimento, telefone valido ou quando o canal estiver indisponivel, registrando status falhou e motivo.
- **FR-012a**: O sistema MUST usar apenas os status de notificacao `pendente`, `enviado` e `falhou` neste slice.
- **FR-012b**: O sistema MUST bloquear a criacao de consulta quando as credenciais/configuracao de WhatsApp estiverem ausentes.
- **FR-012c**: O sistema MUST bloquear a criacao de consulta quando o paciente nao tiver metodo preferido, valor padrao da sessao ou dados obrigatorios do metodo escolhido.
- **FR-013**: A mensagem de confirmacao MUST orientar o paciente a responder apenas "sim" ou "nao", sem introduzir conversa livre ou automacao por IA neste slice.
- **FR-013a**: O sistema MUST NOT processar respostas recebidas por webhook ou atualizar automaticamente o status de confirmacao a partir de resposta do paciente neste slice.
- **FR-014**: O sistema MUST manter paciente, consulta e notificacao isolados por terapeuta autenticado.
- **FR-015**: O sistema MUST cobrir por testes a validacao de paciente, criacao de consulta e comportamento de notificacao nos cenarios de envio permitido, envio impedido por consentimento/dados e falha operacional.
- **FR-016**: O sistema MUST cobrir por testes o bloqueio de agendamento quando metodo/dados de pagamento do paciente estiverem ausentes.

### Key Entities *(include if feature involves data)*

- **Paciente**: pessoa atendida pelo terapeuta; inclui nome, telefone, dados opcionais de contato/identificacao, status operacional e consentimento para WhatsApp. CPF e telefone normalizado identificam possiveis duplicidades dentro da conta do mesmo terapeuta.
- **Perfil Financeiro do Paciente**: dados de pagamento vinculados ao paciente e ao terapeuta; inclui metodo preferido entre PIX, cartao, dinheiro e convenio, valor padrao da sessao e dados obrigatorios do metodo escolhido, indicando se o paciente esta apto para agendamento e futuras cobrancas.
- **Consulta**: compromisso agendado para um paciente; inclui data, horario de inicio, horario de fim, status da consulta, status de confirmacao e vinculo ao terapeuta.
- **Registro de Notificacao**: tentativa de comunicacao transacional associada a uma consulta; inclui canal, destinatario, status, data/hora, erro operacional quando houver e referencia ao envio externo quando existir.
- **Terapeuta**: usuario autenticado que possui e gerencia seus pacientes, consultas e notificacoes neste MVP individual.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% dos terapeutas em teste conseguem cadastrar um paciente valido em menos de 2 minutos sem suporte externo.
- **SC-002**: 90% dos terapeutas em teste conseguem criar uma consulta para paciente existente em menos de 90 segundos.
- **SC-003**: 100% das consultas criadas aparecem na agenda minima imediatamente apos salvamento bem-sucedido.
- **SC-004**: 100% das tentativas de confirmacao por WhatsApp ficam registradas com status rastreavel: pendente, enviado ou falhou.
- **SC-005**: 0% das confirmacoes sao enviadas para pacientes sem telefone valido ou sem consentimento de WhatsApp registrado.
- **SC-006**: Pelo menos 95% dos erros de formulario em teste apontam o campo correto e oferecem mensagem compreensivel em portugues.
- **SC-007**: 0% das consultas sao criadas para pacientes sem metodo preferido, valor padrao da sessao ou dados obrigatorios do metodo escolhido.

## Assumptions

- O primeiro corte usa um unico papel: terapeuta/profissional autonomo individual.
- Nome e telefone sao obrigatorios para o fluxo principal porque a consulta precisa de um paciente identificavel e a confirmacao depende de contato por WhatsApp.
- E-mail, CPF e data de nascimento entram como opcionais neste slice para reduzir friccao e evitar coleta desnecessaria.
- Em qualquer ambiente, a criacao de consulta exige credenciais/configuracao de WhatsApp disponiveis para tentar a confirmacao automatica.
- Em qualquer ambiente, a criacao de consulta exige metodo preferido, valor padrao da sessao e dados obrigatorios do metodo escolhido para manter agenda e financeiro conectados desde o primeiro fluxo operacional.
- Quando o prototipo Lovable e a spec divergirem em detalhe de UX, seguir o prototipo Lovable, exceto se isso conflitar com seguranca, LGPD, arquitetura production-ready ou escopo explicitamente decidido.
- Recebimento de respostas "sim" ou "nao" por webhook fica fora deste slice; esta feature apenas prepara a mensagem e registra status de envio/confirmacao inicial.
- Remarcacao, cancelamento avancado, recorrencia, agenda por semana/mes, portal do paciente e lembrete no dia anterior ficam para specs futuras.
