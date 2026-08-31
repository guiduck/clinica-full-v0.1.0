# Feature Specification: Reconstrução Integral do Frontend

**Feature Branch**: `003-prototype-front-reconstruction`  
**Created**: 2026-08-27  
**Status**: Draft  
**Input**: User description: `docs/next-spec-prototype-front-reconstruction.md`, com baseline Lovable congelada no commit `226e5ab6811c5dce717fa12b404370b4fbb2663e`

## Clarifications

### Session 2026-08-27

- Q: Qual é o escopo real da autenticação nesta feature? → A: E-mail/senha continuam funcionais; Google e recuperação de senha permanecem visíveis com indisponibilidade explícita.
- Q: Como controles de funcionalidades indisponíveis devem se comportar? → A: Permanecem visíveis e acionáveis; ao serem usados, abrem aviso contextual de indisponibilidade sem executar mutação.
- Q: Como anamnese e prontuário devem funcionar antes da decisão de criptografia e da persistência clínica? → A: Reproduzem integralmente o fluxo interativo do protótipo, incluindo validações, máscaras, campos condicionais e feedbacks, com estado transitório; somente salvar/autosalvar é bloqueado, com aviso de que o conteúdo não será persistido.
- Q: Como a reconstrução deve ser entregue? → A: Incrementalmente, uma página/rota por vez; cada página só é concluída com sua matriz validada, e a feature só termina com 100% da matriz decidida.
- Q: Como divergências do protótipo são aprovadas? → A: Toda divergência é registrada na matriz e exige aprovação do responsável pelo produto; a implementação com shadcn/ui deve reproduzir visual e funcionalmente o protótipo, sem redesign implícito.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Operar pelo shell responsivo (Priority: P1)

Como terapeuta autônomo autenticado, quero reconhecer e navegar pela mesma estrutura do protótipo em desktop e mobile para acessar rapidamente cada área da minha rotina sem perder contexto.

**Why this priority**: O shell, a navegação e os estados globais são a base comum de todas as demais jornadas e permitem validar a paridade incrementalmente.

**Independent Test**: Pode ser testado entrando no aplicativo em larguras desktop e mobile, percorrendo todas as rotas principais, abrindo notificações e menu do usuário e retomando o onboarding entre páginas.

**Acceptance Scenarios**:

1. **Given** um profissional autenticado em desktop, **When** ele percorre Dashboard, Pacientes, Agenda, Fluxo de caixa, Previsibilidade e Configurações, **Then** o item ativo, a hierarquia, os rótulos e o contexto de navegação permanecem equivalentes à baseline.
2. **Given** o mesmo profissional em uma tela móvel, **When** ele usa a navegação, menus, tabelas, dialogs ou sheets, **Then** todas as ações essenciais permanecem visíveis, alcançáveis e sem sobreposição ou corte.
3. **Given** um profissional que iniciou e interrompeu o tour, **When** ele volta ao aplicativo ou muda de rota, **Then** o onboarding retoma do ponto válido e impede avanço somente quando um dado realmente obrigatório estiver ausente.
4. **Given** uma notificação, um lembrete ou um resumo clicável, **When** o profissional o aciona, **Then** ele chega à rota e ao recorte contextual correspondente.

---

### User Story 2 - Gerenciar pacientes de ponta a ponta (Priority: P1)

Como terapeuta, quero cadastrar, localizar e abrir o perfil completo de um paciente para manter dados cadastrais, clínicos, agenda, financeiro e documentos organizados em uma experiência única.

**Why this priority**: Paciente é a entidade central do produto e conecta todos os módulos operacionais do MVP.

**Independent Test**: Pode ser testado criando um paciente pelo wizard de duas etapas, localizando-o na lista, editando seus dados e percorrendo as seis abas do perfil com dados reais ou estados honestamente indisponíveis.

**Acceptance Scenarios**:

1. **Given** dados válidos de um novo paciente, **When** o profissional conclui as duas etapas do cadastro, **Then** o paciente é criado uma única vez, mantém os consentimentos separados e pode seguir para seu financeiro.
2. **Given** CPF inválido, repetido, nascimento futuro, e-mail inválido, telefone incompleto ou campo condicional financeiro ausente, **When** o formulário é enviado, **Then** o envio é bloqueado, os valores digitados permanecem e cada erro aparece em português junto ao campo correspondente.
3. **Given** uma base de pacientes, **When** o profissional pesquisa por nome, CPF, e-mail ou telefone e aplica um status, **Then** a listagem mostra somente os resultados compatíveis e oferece as ações previstas para aquele estado.
4. **Given** um paciente existente, **When** o profissional abre seu perfil, **Then** encontra Geral, Anamnese, Agenda, Prontuário, Financeiro e Documentos na ordem e com o conteúdo da baseline.
5. **Given** um paciente arquivado, **When** o profissional restaura seu cadastro, **Then** o histórico permanece preservado e o paciente volta aos estados ativos aplicáveis.

---

### User Story 3 - Operar a agenda visual completa (Priority: P1)

Como terapeuta, quero visualizar e administrar consultas e bloqueios em calendário diário, semanal e mensal para organizar meu tempo sem conflitos.

**Why this priority**: A agenda é um dos núcleos vendáveis e substitui a experiência provisória atual por um fluxo operacional reconhecível.

**Independent Test**: Pode ser testado alternando Dia, Semana e Mês, navegando no tempo, criando uma consulta em uma faixa livre, abrindo detalhes, editando, remarcando e criando um bloqueio.

**Acceptance Scenarios**:

1. **Given** consultas em diferentes datas e horários, **When** o profissional alterna Dia, Semana e Mês ou usa anterior, Hoje e seguinte, **Then** o cabeçalho, a grade e os compromissos representam corretamente o período escolhido.
2. **Given** um horário livre e um paciente apto, **When** o profissional cria uma consulta, **Then** a consulta aparece na posição temporal correta e a tentativa real de confirmação segue o fluxo já disponível.
3. **Given** um intervalo no passado, horários invertidos ou conflito com consulta/bloqueio, **When** o profissional tenta salvar, **Then** o sistema bloqueia a operação e explica o problema sem descartar os valores preenchidos.
4. **Given** uma consulta existente, **When** o profissional abre o detalhe, edita, remarca, cancela ou inicia a sessão dentro do período permitido, **Then** o status e as ações disponíveis refletem o novo estado sem perder a referência relevante.
5. **Given** uma grade sem compromissos no recorte atual, **When** a agenda é exibida, **Then** o calendário continua visível com um estado vazio contextual e uma próxima ação clara.

---

### User Story 4 - Acompanhar rotina e finanças (Priority: P2)

Como terapeuta, quero usar dashboard, fluxo de caixa e previsibilidade como uma visão conectada da clínica para agir sobre atendimentos, mensagens, receitas, despesas e inadimplência.

**Why this priority**: Essas telas transformam registros dispersos em decisões operacionais e financeiras, mas dependem dos cadastros e da agenda para entregar valor completo.

**Independent Test**: Pode ser testado com registros reais existentes, acionando cards e gráficos do dashboard, aplicando filtros no financeiro, manipulando um lançamento disponível e percorrendo a previsão anual/mensal.

**Acceptance Scenarios**:

1. **Given** atendimentos, lembretes e dados financeiros existentes, **When** o dashboard é aberto, **Then** ações rápidas, próximos atendimentos, mensagens e indicadores mostram valores coerentes e levam ao recorte correspondente.
2. **Given** dados financeiros sensíveis visíveis, **When** o profissional usa o controle de privacidade, **Then** todos os valores protegidos na tela são ocultados ou revelados de modo consistente.
3. **Given** filtros de período, status, categoria ou busca, **When** o profissional os altera, **Then** KPIs, tabelas e gráficos usam o mesmo recorte e esse contexto pode ser recuperado pela navegação.
4. **Given** receitas e despesas reais, **When** o profissional percorre Todos, Receitas, Despesas, Recibos, Categorias, Planos e Previsibilidade, **Then** cada área reproduz seus estados, controles e detalhamentos previstos.
5. **Given** uma ação financeira sem serviço de produção disponível, **When** o profissional tenta executá-la, **Then** recebe aviso contextual de indisponibilidade sem lançamento, recibo, cobrança ou persistência simulados.

---

### User Story 5 - Registrar trabalho clínico e documentos (Priority: P2)

Como terapeuta, quero acessar anamnese, prontuário, sessão em andamento e documentos do paciente para concentrar o trabalho clínico com privacidade e rastreabilidade.

**Why this priority**: O registro clínico e documental completa a proposta de valor do produto e envolve dados especialmente sensíveis.

**Independent Test**: Pode ser testado abrindo as seções de anamnese, criando ou visualizando uma evolução, percorrendo o fluxo de sessão e abrindo os modelos e o repositório de documentos, sem exigir que integrações ainda ausentes simulem sucesso.

**Acceptance Scenarios**:

1. **Given** um perfil de paciente, **When** o profissional percorre a Anamnese, **Then** encontra as seções HDA, históricos, hábitos, Exame do Estado Mental e hipótese/plano, com DSM/CID apenas manual e sem contrato terapêutico nessa aba.
2. **Given** uma sessão ou evolução sem persistência clínica disponível, **When** o profissional preenche texto livre ou SOAP, humor, cronômetro e vínculo opcional com agendamento, **Then** campos condicionais, validações, máscaras e feedbacks acompanham o protótipo durante a interação atual, mas salvar ou autosalvar é bloqueado com aviso explícito de que o conteúdo não será persistido.
3. **Given** a área Documentos, **When** o profissional escolhe um modelo, upload, edição, pré-visualização ou assinatura, **Then** a experiência visual e os requisitos de evidência estão presentes sem afirmar que um arquivo foi salvo ou assinado quando o serviço não existe.
4. **Given** dados clínicos ou documentos em tela, **When** ocorre erro, carregamento ou ausência de conteúdo, **Then** a interface não expõe conteúdo sensível em logs/feedbacks e oferece um estado seguro e compreensível.

---

### User Story 6 - Configurar conta, planos e mensagens (Priority: P3)

Como terapeuta, quero configurar meus dados profissionais, contato, clínica, planos de cobrança, mensagens e segurança para que os fluxos e documentos usem informações consistentes.

**Why this priority**: Configurações sustentam automações e documentos, mas podem ser entregues após a navegação e os fluxos operacionais principais.

**Independent Test**: Pode ser testado percorrendo todas as seções de Configurações, validando campos brasileiros e observando comportamento real ou indisponibilidade explícita de cada controle.

**Acceptance Scenarios**:

1. **Given** dados válidos de conta, contato ou clínica, **When** o profissional salva uma área cuja capacidade está disponível, **Then** os dados persistem e reaparecem de forma consistente nos contextos que os consomem.
2. **Given** um plano de cobrança válido, **When** o profissional cria ou remove o plano, **Then** ele aparece ou deixa de aparecer nos seletores financeiros compatíveis, quando essa capacidade estiver disponível.
3. **Given** templates e fila de mensagens, **When** o profissional revisa, agenda, envia, edita ou cancela, **Then** o sistema mostra o estado real da operação e nunca apresenta sucesso para integração ausente.
4. **Given** a área Segurança, **When** o profissional a abre, **Then** encontra os controles da baseline compatíveis com o MVP, sem gerenciador de sessões e com recursos futuros identificados como indisponíveis.

### Edge Cases

- A baseline visual deixa de estar disponível ou diverge do commit congelado durante a validação; a comparação deve parar e registrar a divergência, sem aceitar silenciosamente a nova versão.
- Uma rota é aberta por query params inválidos, incompletos ou incompatíveis; o sistema deve cair em um estado padrão seguro, preservar a rota válida e informar filtros descartados quando isso afetar o entendimento.
- Uma ação exibida no protótipo não possui service, dado real ou autorização correspondente; o controle permanece reconhecível, mas informa indisponibilidade antes de qualquer confirmação de sucesso.
- Dados existentes do slice `002` não cobrem todos os campos novos; a tela deve mostrar ausência real, permitir complemento quando suportado e não inventar valores.
- Listas, tabelas, gráficos ou calendários não possuem dados; o contêiner e o contexto da área permanecem visíveis com uma ação seguinte apropriada.
- Texto longo, zoom, teclado, leitor de tela ou largura móvel extrema não podem ocultar ações críticas, sobrepor conteúdo nem impedir o fechamento de overlays.
- Máscara é editada no meio do valor ou conteúdo é colado; cursor, normalização e validação devem permanecer previsíveis sem duplicar caracteres.
- Datas de transição de mês/ano, ano bissexto, horário de verão ou fuso local devem manter exibição brasileira e posicionamento temporal coerente.
- Uma mutação real falha, demora ou é reenviada; o sistema deve impedir sucesso duplicado, preservar a entrada recuperável e mostrar o estado real.
- O profissional não possui consentimento de WhatsApp/e-mail; ações de envio devem ser bloqueadas ou orientadas conforme o canal, sem contornar o consentimento.
- O profissional digitou conteúdo clínico transitório e tenta fechar ou sair da tela; o sistema deve avisar que o conteúdo não será salvo e pedir confirmação antes de descartá-lo.

## Prototype & Constitution Alignment *(mandatory)*

### Prototype References

- **Lovable screens**: conjunto integral de `references/images/*.jpeg` (28 capturas) e rotas/fontes correspondentes em `references/clinica-full/src/routes`, `references/clinica-full/src/components` e `references/clinica-full/src/styles.css`, congelados no commit `226e5ab6811c5dce717fa12b404370b4fbb2663e`.
- **Lovable prompt sections**: Authentication; Main app shell; Dashboard; Patients / Gestão de Carteira; New / edit patient; Patient profile; Anamnese; Prontuário / Evolução SOAP; Global agenda; Patient agenda; Notifications; Financeiro global; Patient finance; Receipts; Documents and prescriptions; Signature flow; Security, LGPD and audit; Design direction; UX requirements.
- **Required UI continuity**: shell, navegação, ordem de rotas e abas, rótulos em português, hierarquia, calendário, cards, gráficos, tabelas, filtros, chips de status, dialogs, sheets, formulários, estados vazios, confirmações, onboarding e comportamento responsivo descritos em `docs/prototype-feature-inventory.md`.
- **Allowed UX improvements**: somente ajustes necessários para segurança, LGPD, acessibilidade, arquitetura de produção, responsividade, clareza de erro, prevenção de perda de dados e comunicação honesta de indisponibilidade; devem preservar a capacidade, ser registrados na matriz e receber aprovação do responsável pelo produto antes do aceite da página. O uso de shadcn/ui não autoriza redesign ou alteração implícita de comportamento.

### Security, Privacy & Compliance

- **Sensitive data touched**: identidade e contato do profissional e paciente, consentimentos, agenda, dados clínicos, financeiro, documentos e evidências de assinatura.
- **Auth/authorization requirement**: somente o profissional autenticado pode ler ou alterar seus próprios pacientes e registros; rotas privadas e ações contextuais devem respeitar esse limite, inclusive quando abertas por link ou query params.
- **LGPD requirement**: consentimentos de WhatsApp e e-mail separados, acesso mínimo necessário, estados seguros para exportação/exclusão futura, ausência de conteúdo sensível em feedbacks e preservação das decisões de retenção/auditoria já adotadas.
- **Audit/logging requirement**: registrar ações sensíveis e falhas relevantes sem incluir notas clínicas, corpo de documentos, segredos, credenciais, dados brutos de cartão ou conteúdo integral de mensagens.

### Performance & Accessibility Expectations

- **Next.js rendering/data strategy**: preservar o padrão server-first já aceito para conteúdo e dados, restringir interação no cliente aos limites necessários e manter mutações e integrações autenticadas nas bordas de produção; o detalhamento pertence ao plano.
- **Performance risk**: shell compartilhado, formulários clínicos extensos, tabelas e gráficos financeiros, grade de agenda, overlays, documentos/PDFs, uploads e chamadas externas não podem tornar a navegação principal perceptivelmente bloqueada.
- **Accessibility requirement**: labels e erros associados, foco visível, ordem de tabulação coerente, retorno de foco, overlays fecháveis por teclado, ações por ícone com nome acessível, estados que não dependem apenas de cor, alvos de toque de pelo menos 44 px e equivalência funcional em desktop/mobile.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE reproduzir integralmente as rotas, módulos, abas, estados e interações catalogados em `docs/prototype-feature-inventory.md`, usando a baseline congelada como critério de comparação.
- **FR-002**: O sistema DEVE manter uma matriz de paridade organizada por página/rota e fluxo, com evidência desktop e mobile e classificação de cada item como equivalente, divergência justificada ou indisponível por ausência de capacidade, permitindo aceite independente de cada página.
- **FR-003**: Toda divergência da baseline DEVE registrar o comportamento original, o comportamento entregue e uma justificativa baseada em segurança, LGPD, acessibilidade ou arquitetura de produção, e DEVE receber aprovação do responsável pelo produto antes de a página ser concluída.
- **FR-004**: O shell autenticado DEVE oferecer navegação responsiva, estado ativo, notificações, indicador de mensagens, menu do usuário, Configurações e logout.
- **FR-005**: O onboarding DEVE permitir avançar, voltar, pular e retomar entre rotas, respeitando pré-condições reais e sem depender de dados fictícios.
- **FR-006**: Login e criação de conta por e-mail/senha DEVEM permanecer funcionais e preservar campos, rótulos, estados e navegação da baseline; entrada com Google e recuperação de senha DEVEM permanecer visíveis com indisponibilidade explícita, sem simular envio, acesso ou sucesso.
- **FR-007**: O dashboard DEVE apresentar ações rápidas, próximos atendimentos, lembretes, fila de mensagens, cards e gráficos clicáveis, privacidade de valores e estados vazios acionáveis.
- **FR-008**: Links contextuais do dashboard, notificações, lembretes e gráficos DEVEM abrir a rota, aba, período ou filtro correspondente, com contexto recuperável.
- **FR-009**: A lista de pacientes DEVE permitir busca por nome, CPF, e-mail ou telefone, filtros de status e ações de perfil, contato, financeiro, edição, arquivamento e restauração conforme o estado.
- **FR-010**: O cadastro de paciente DEVE seguir o wizard de duas etapas, a ordem de seções, os accordions, os consentimentos separados e os campos obrigatórios, opcionais e condicionais do inventário.
- **FR-011**: O cadastro DEVE validar nome, CPF com dígitos verificadores e unicidade quando persistido, nascimento válido e não futuro a partir de 1900, e-mail e telefone brasileiro de 10 ou 11 dígitos.
- **FR-012**: A etapa financeira do cadastro DEVE exigir modelo e método, valor positivo para Avulso, plano válido para Plano e parcelamento compatível para Cartão, sem coletar ou persistir número completo ou CVV.
- **FR-013**: O perfil do paciente DEVE apresentar Geral, Anamnese, Agenda, Prontuário, Financeiro e Documentos com cabeçalho, status e ações contextuais reconhecíveis.
- **FR-014**: A Anamnese DEVE cobrir as seções e campos do inventário, manter DSM/CID como entrada manual e excluir contrato terapêutico dessa área.
- **FR-015**: Enquanto a proteção e a persistência clínica não estiverem aprovadas, Anamnese e Prontuário DEVEM reproduzir campos, seções, cronômetro, validações, máscaras, condicionais, feedbacks e demais interações do protótipo somente em estado transitório da interação atual; salvar e autosalvar DEVEM ser bloqueados com aviso explícito, nenhum conteúdo clínico DEVE ser persistido e a saída com conteúdo digitado DEVE exigir confirmação de descarte.
- **FR-016**: A Agenda global DEVE oferecer visualizações Dia, Semana e Mês, navegação temporal, grade adequada ao período, compromissos posicionados e estados vazios dentro do calendário.
- **FR-017**: O sistema DEVE permitir criar, detalhar, editar, remarcar e cancelar consulta e criar bloqueios quando a capacidade correspondente estiver disponível, validando passado, ordem temporal, conflito e pré-condições atuais.
- **FR-018**: A consulta DEVE representar os status e ações aplicáveis da baseline, preservar referência de remarcação e permitir iniciar sessão somente no intervalo autorizado.
- **FR-019**: O sistema DEVE manter confirmação, lembrete e mensagem de WhatsApp como fluxos transacionais, respeitando consentimento e exibindo os estados reais pendente, enviado ou falhou e as respostas aplicáveis quando disponíveis.
- **FR-020**: O Financeiro global DEVE apresentar KPIs, abas Todos, Receitas, Despesas, Recibos e Categorias, filtros combináveis, tabelas responsivas e gráficos de fluxo, saldo e despesas por categoria.
- **FR-021**: Os mesmos recortes financeiros DEVEM ser usados por KPIs, tabelas, gráficos e estado navegável/compartilhável para evitar interpretações divergentes.
- **FR-022**: Registro financeiro DEVE representar receita e despesa, vínculo aplicável a paciente/consulta, categorias, métodos, status, recorrência e parcelamento descritos no inventário.
- **FR-023**: A área de Planos DEVE permanecer dentro de Financeiro e representar modelos reutilizáveis e plano personalizado com sessões, duração, valores e estado, sem migrar contrato/plano para Anamnese.
- **FR-024**: Recibos DEVEM ser apresentados como documentos próprios do sistema, derivados de pagamento interno e contendo profissional, paciente, CPF, serviço, data, método, valor e identificador.
- **FR-025**: Previsibilidade DEVE oferecer calendário anual, totais mensais, detalhamento do mês, filtros, pesquisa e distinção entre itens a confirmar e efetivados.
- **FR-026**: Documentos DEVEM representar modelos clínicos, upload, repositório, editor, pré-visualização, PDF, exclusão e assinatura eletrônica simples com evidências, sem alegar equivalência avançada ou ICP-Brasil.
- **FR-027**: Configurações DEVEM cobrir Conta, Contato/endereço, clínica opcional, Planos, Mensagens e Segurança, sem gerenciador de sessões no MVP.
- **FR-028**: Mensagens DEVEM representar templates, placeholders, prévia, fila, agendamento, revisão, envio, edição e cancelamento, sempre refletindo o estado real da integração.
- **FR-029**: Controles cuja capacidade de produção ainda não existe DEVEM permanecer visíveis e acionáveis quando necessários à paridade; ao serem usados, DEVEM abrir um aviso contextual e acessível de indisponibilidade e NÃO DEVEM gerar sucesso, mutação, envio ou persistência fictícios.
- **FR-030**: O sistema DEVE reutilizar os fluxos reais atuais de autenticação, pacientes, perfil financeiro inicial, agenda e tentativa de WhatsApp sempre que compatíveis, preservando registros existentes.
- **FR-031**: Todos os formulários DEVEM validar no campo e no envio, em português, preservar valores recuperáveis e impedir submissões duplicadas.
- **FR-032**: CPF, CNPJ, telefone, CEP, e-mail, moeda, data e horário DEVEM ter normalização, máscara e validação consistentes entre entrada, exibição e submissão.
- **FR-033**: Datas visíveis/editáveis DEVEM usar `dd/mm/aaaa`, horários DEVEM usar 24 horas e valores DEVEM usar `pt-BR`/BRL; `mm/dd/yyyy` NÃO DEVE aparecer em nenhuma tela.
- **FR-034**: A interface DEVE manter ações críticas acessíveis por teclado, toque e tecnologias assistivas, incluindo foco previsível em dialogs/sheets e nomes acessíveis para ações por ícone.
- **FR-035**: A interface DEVE adaptar calendários, tabelas, formulários, gráficos, menus e overlays a desktop e mobile sem perda de ordem, conteúdo ou ação essencial.
- **FR-036**: Estados de carregamento, vazio, erro, indisponibilidade, sucesso e confirmação DEVEM ser distinguíveis por texto ou semântica, e não somente por cor.
- **FR-037**: O produto DEVE remover controles exclusivamente de desenvolvimento e NÃO DEVE incorporar mocks ou dados fictícios à experiência de produção.
- **FR-038**: A solução DEVE preservar páginas focadas em composição, responsabilidades de domínio separadas, configuração fixa centralizada, validações e transformações reutilizáveis e efeitos isolados, conforme a constituição vigente.
- **FR-039**: A validação da entrega DEVE cobrir fluxos principais de cada rota, formulários e regras brasileiras, desktop/mobile, acessibilidade das interações críticas e comparação visual com a baseline.
- **FR-040**: Testes dependentes da data DEVEM produzir o mesmo resultado independentemente do dia em que forem executados.
- **FR-041**: A reconstrução DEVE ser entregue e validada uma página/rota por vez; uma página somente pode ser marcada como concluída quando todos os seus itens de paridade estiverem decididos, e a feature somente pode ser concluída quando 100% da matriz estiver coberta.
- **FR-042**: Componentes implementados com shadcn/ui DEVEM reproduzir a composição, aparência, estados e comportamento observados no protótipo; diferenças dos padrões visuais nativos da biblioteca não constituem justificativa para alterar a baseline.

### Key Entities

- **Parity Matrix Entry**: unidade de comparação entre baseline e produção; identifica rota, fluxo, viewport, estado, evidência, resultado e eventual justificativa de divergência ou indisponibilidade.
- **Professional Account**: profissional autônomo autenticado, seus dados de conta, contato, clínica, preferências, consentimentos e configurações.
- **Patient**: pessoa atendida pelo profissional, com identidade, contato, endereço, emergência, consentimentos, status e relacionamentos operacionais e clínicos.
- **Patient Financial Profile**: modelo e dados não sensíveis necessários para cobrança, incluindo método, plano aplicável e situação de completude.
- **Appointment**: consulta ou sessão com paciente, período, tipo, status, vínculos de remarcação, vídeo e estado de confirmação.
- **Schedule Block**: intervalo indisponível por motivo, data ou recorrência, usado na detecção de conflitos.
- **Clinical Record**: anamnese, evolução livre/SOAP, humor, referência manual DSM/CID e vínculo opcional com sessão; conteúdo sensível sujeito a desenho de proteção antes de persistência.
- **Financial Entry**: receita ou despesa com categoria, paciente/consulta opcionais, método, vencimento, status, recorrência e parcelas.
- **Billing Plan**: modelo reutilizável ou personalizado com duração, sessões, valores e estado, pertencente ao domínio Financeiro.
- **Receipt**: documento numerado derivado de pagamento interno, com dados profissionais, paciente, serviço, data, método e valor.
- **Document**: arquivo enviado ou gerado, modelo, versão, prévia, vínculo com paciente e estado de assinatura.
- **Signature Evidence**: assinatura eletrônica simples e metadados mínimos de evidência, sem equivalência jurídica avançada presumida.
- **Message Template / Queue Item**: conteúdo parametrizado e tentativa programada ou realizada por canal, consentimento, horário e estado real.
- **Notification**: alerta interno contextual que direciona o profissional para uma ação ou recorte do sistema.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das rotas, abas, dialogs, sheets e estados enumerados no inventário possuem uma entrada na matriz de paridade para desktop e mobile.
- **SC-002**: 100% das entradas da matriz estão classificadas como equivalentes, divergência aprovada com justificativa ou indisponíveis por ausência documentada da capacidade; nenhuma fica sem decisão.
- **SC-003**: Em uma avaliação guiada, pelo menos 90% dos fluxos principais podem ser concluídos por um profissional na primeira tentativa sem orientação externa.
- **SC-004**: Cadastro de paciente, abertura do perfil, criação de consulta em horário livre e aplicação de filtro financeiro podem ser concluídos em até 3 minutos cada por um usuário familiarizado com o domínio.
- **SC-005**: 100% dos casos de aceite para CPF, CNPJ quando usado, telefone, CEP, nascimento, moeda, datas, horários e parcelas apresentam resultado correto e mensagem em português quando inválidos.
- **SC-006**: Zero ocorrências de `mm/dd/yyyy`, sucesso falso, persistência mock ou controle exclusivo de desenvolvimento são encontradas nas rotas avaliadas.
- **SC-007**: 100% das ações críticas podem ser identificadas e acionadas por teclado, e todos os overlays críticos mantêm entrada, contenção, fechamento e retorno de foco previsíveis.
- **SC-008**: Nenhuma tela principal apresenta sobreposição, corte de conteúdo ou ação essencial inacessível nas larguras móveis e desktop definidas para a matriz de paridade.
- **SC-009**: Pelo menos 95% das interações de navegação dentro do aplicativo apresentam resposta visual em até 1 segundo em condições normais de validação; operações externas mais lentas exibem estado de progresso imediato.
- **SC-010**: 100% dos controles de ações ainda indisponíveis abrem um aviso contextual ao serem acionados e não produzem confirmação de conclusão nem alteração de dados.
- **SC-011**: Todos os fluxos reais já entregues no slice `002` continuam preservando os registros existentes e passam pelos critérios funcionais equivalentes após a reconstrução.
- **SC-012**: A suíte de validação definida para a feature conclui sem falhas dependentes da data e com todos os gates obrigatórios do projeto aprovados antes da implementação ser considerada pronta.

## Assumptions

- O MVP continua destinado a um único profissional autônomo por conta; multi-profissional, secretaria e portal do paciente não são introduzidos.
- O commit `226e5ab6811c5dce717fa12b404370b4fbb2663e` permanece congelado durante especificação, planejamento, implementação e comparação.
- O inventário funcional é a lista canônica de cobertura; o código e as imagens do protótipo esclarecem detalhes visuais e de interação.
- Os fluxos de produção atuais de autenticação, pacientes, perfil financeiro, agenda e tentativa de WhatsApp são a base real a preservar.
- Funcionalidades visuais sem capacidade de produção podem precedê-la, desde que o estado indisponível seja explícito e não simule persistência.
- O estado de navegação pode representar aba, período, filtro e abertura contextual quando isso permite recuperar ou compartilhar o contexto.
- Até uma página/rota ser reconstruída e validada, sua experiência de produção existente permanece disponível; a entrega incremental não pode substituí-la por placeholder ou estado menos funcional.
- A landing page e promessas comerciais só serão atualizadas em trabalho posterior e deverão distinguir disponível, em desenvolvimento e planejado.
- A criptografia e persistência definitiva de prontuário exigem decisão documentada antes de habilitar mutações clínicas reais; esta feature não presume essa decisão.

## Dependencies

- `docs/prototype-feature-inventory.md` e `docs/lovable-prototype-prompt.md`.
- Baseline visual e funcional em `references/clinica-full` no commit congelado e capturas em `references/images`.
- Estado atual documentado em `docs/project-overview.md`, `docs/roadmap.md` e `docs/handoff.md`.
- Fluxos reais e decisões do slice `specs/002-paciente-agenda-whatsapp/`.
- Constituição do projeto e ADR de stack vigentes.

## Out of Scope

- Copiar a arquitetura, store, mocks, `localStorage` ou dados de demonstração do protótipo para produção.
- Implementar nesta feature todas as integrações e persistências ausentes de prontuário, documentos, assinatura, recibos, cobranças, automações e webhooks.
- Portal ou autenticação do paciente, multi-profissional, clínica com secretaria/admin ou novos papéis.
- IA, áudio, transcrição, agentes autônomos ou automação conversacional completa.
- 2FA funcional, gerenciamento de sessões, assinatura avançada externa ou equivalência ICP-Brasil.
- Autenticação real pelo Google e envio real de recuperação de senha nesta feature.
- Catálogo, critérios ou busca estruturada de DSM/CID.
- Redesign autoral que descaracterize a baseline congelada.
- Mudança do modelo de negócio, definição jurídica final de recibos/assinaturas ou novas promessas de marketing.
