# Requisitos do Projeto - clinica-full

## Status do documento
Este documento consolida os requisitos do projeto com base em:

- documentacao existente em `docs/`;
- prototipo visual em `references/images`;
- texto descritivo de requisitos fornecido pelo cliente.

As telas do prototipo sao referencia funcional obrigatoria: a UI e a UX podem ser redesenhadas e melhoradas, mas as capacidades representadas nas telas devem ser preservadas ou explicitamente substituidas por uma experiencia melhor equivalente.

## Visao geral
`clinica-full` e um SaaS web para profissionais de saude mental, com foco inicial em terapeutas, psicologos e psiquiatras autonomos. O sistema deve centralizar a rotina clinica e administrativa: acesso seguro, dashboard, gestao de pacientes, agenda, prontuario, anamnese, financeiro, documentos, receituario, recibos e notificacoes.

O produto deve transmitir confianca, organizacao e seguranca, sem parecer complexo ou hospitalar demais. A experiencia pode melhorar o prototipo, mas deve manter os fluxos e modulos demonstrados.

## Objetivos do produto
- Centralizar dados de pacientes, agenda, prontuario, documentos e financeiro.
- Reduzir faltas com lembretes por WhatsApp e/ou e-mail.
- Facilitar registro clinico por anamnese estruturada e evolucao SOAP.
- Dar visibilidade financeira sobre receitas, despesas, inadimplencia e recibos.
- Permitir emissao de documentos clinicos, laudos, atestados, encaminhamentos e receituario.
- Proteger dados sensiveis com autenticacao segura, LGPD, auditoria e criptografia.
- Manter uma interface mais clara, moderna e eficiente que a do prototipo atual.

## Usuarios
### Profissional
Usuario principal do sistema. Pode ser psicologo, terapeuta ou psiquiatra.

Deve conseguir:
- criar conta e acessar com seguranca;
- gerenciar pacientes;
- consultar dashboard;
- organizar agenda;
- registrar anamnese e evolucao;
- emitir documentos e receitas;
- acompanhar financeiro;
- enviar lembretes e mensagens;
- gerar recibos e relatorios.

### Paciente
No recorte atual, o paciente nao precisa ter portal proprio para usar o sistema. Ele aparece como entidade gerenciada pelo profissional, recebe comunicacoes e pode ter documentos, agenda, financeiro e prontuario vinculados.

## Navegacao principal
O prototipo mostra uma estrutura com menu lateral persistente:

- Dashboard;
- Pacientes;
- Agenda;
- Financeiro;
- Sair.

Dentro do perfil do paciente, a navegacao deve usar abas:

- Geral;
- Anamnese;
- Prontuario;
- Financeiro;
- Documentos;
- Agenda.

## Modulo 1 - Acesso e seguranca
### Requisitos funcionais
- O sistema deve permitir login por e-mail e senha.
- O sistema deve permitir criar conta com nome completo, e-mail e senha.
- O sistema deve exibir opcao de mostrar/ocultar senha.
- O sistema deve oferecer "lembrar-me".
- O sistema deve oferecer fluxo de "esqueci minha senha" por e-mail.
- O sistema deve suportar autenticacao de dois fatores (2FA).
- O sistema deve registrar aceite de Termos de Uso e Politica de Privacidade no cadastro ou primeiro acesso.
- O sistema deve impedir continuidade sem aceite obrigatorio.
- O sistema deve permitir logout.
- O sistema deve proteger rotas privadas.

### Requisitos de seguranca e LGPD
- Senhas devem ser armazenadas com hash seguro.
- Sessoes devem usar cookies `HttpOnly`, `Secure` em producao e protecao contra CSRF quando aplicavel.
- O sistema deve registrar timestamp do aceite de termos.
- O sistema deve registrar consentimento para comunicacao por WhatsApp/e-mail quando aplicavel.
- O sistema deve prever correcao, exportacao e exclusao de dados.
- O sistema deve manter logs de eventos sensiveis.

## Modulo 2 - Dashboard
### Referencia do prototipo
As telas mostram:

- cards de `Pacientes Ativos`;
- cards de `Sessoes Hoje`;
- card de `Receita Prevista (Mes)`;
- lista de `Proximos Atendimentos`;
- bloco de `Lembretes`;
- alerta de `Pagamentos Pendentes`;
- link para `Ver Agenda Completa`;
- estado vazio quando nao ha atendimentos;
- botao de desenvolvimento para gerar dados ficticios, que nao deve existir em producao.

### Requisitos funcionais
- O dashboard deve mostrar resumo do dia.
- O dashboard deve mostrar proximos atendimentos com horario, paciente e duracao.
- O dashboard deve mostrar total de pacientes ativos.
- O dashboard deve mostrar sessoes realizadas ou previstas no periodo.
- O dashboard deve mostrar receita prevista do mes.
- O dashboard deve mostrar saldo financeiro pendente ou inadimplencia.
- O dashboard deve mostrar lembretes importantes.
- O dashboard deve alertar sobre aniversarios de pacientes.
- O dashboard deve alertar sobre documentos pendentes de assinatura.
- O dashboard deve alertar sobre pagamentos pendentes.
- O dashboard deve oferecer atalho para a agenda completa.

## Modulo 3 - Gestao de pacientes / CRM clinico
### Referencia do prototipo
A tela de pacientes aparece como `Gestao de Carteira` e contem:

- busca por nome, CPF ou e-mail;
- botao `Novo Paciente`;
- filtros: `Todos`, `Ativos`, `Lista de Espera`, `Em Alta`, `Inativos`;
- tabela com paciente, status/tags, ultima consulta e acoes rapidas;
- avatar com iniciais;
- acoes rapidas por paciente: abrir/iniciar, enviar WhatsApp, ver financeiro, editar e excluir.

### Requisitos funcionais
- O sistema deve cadastrar pacientes.
- O sistema deve editar pacientes.
- O sistema deve excluir ou arquivar pacientes conforme regra definida.
- O sistema deve listar pacientes em tabela.
- O sistema deve buscar pacientes por nome, CPF, e-mail e contato.
- O sistema deve filtrar pacientes por status.
- O sistema deve mostrar tags/status do paciente.
- O sistema deve mostrar ultima consulta.
- O sistema deve oferecer acoes rapidas na lista.
- O sistema deve permitir enviar WhatsApp a partir da lista.
- O sistema deve permitir abrir financeiro do paciente a partir da lista.

### Campos do cadastro
- nome completo;
- CPF;
- data de nascimento;
- telefone/WhatsApp;
- e-mail;
- endereco;
- foto;
- status;
- tags;
- observacoes;
- convenio;
- indicacao;
- motivo da busca/queixa principal;
- consentimento de comunicacao.

## Modulo 4 - Perfil do paciente
### Aba Geral
O prototipo mostra:

- nome do paciente;
- status `Ativo`;
- botao voltar;
- botao `Excluir Paciente`;
- cartao de contato e identificacao;
- cartao de endereco;
- bloco de motivo da busca/queixa principal.

Requisitos:
- O perfil deve consolidar os dados do paciente.
- O sistema deve mostrar contato, CPF, telefone/WhatsApp e e-mail.
- O sistema deve mostrar endereco.
- O sistema deve mostrar motivo da busca ou queixa principal.
- O sistema deve indicar claramente o status do paciente.
- O sistema deve permitir exclusao ou arquivamento com confirmacao.

## Modulo 5 - Anamnese
### Referencia do prototipo
A aba `Anamnese` mostra uma investigacao estruturada da historia de vida do paciente, com secoes expansiveis:

1. Historico da Queixa (HDA);
2. Historico Pessoal e Desenvolvimento;
3. Dinamica Familiar e Social;
4. Habitos e Estilo de Vida;
5. Exame do Estado Mental (EEM);
6. Hipotese Diagnostica e Plano Terapeutico.

Campos demonstrados:

- descricao detalhada;
- fatores precipitantes;
- tentativas previas;
- infancia e adolescencia;
- historico medico;
- historico medicamentoso;
- configuracao familiar;
- rede de apoio;
- lazer e espiritualidade;
- sono;
- alimentacao;
- atividade fisica;
- substancias: alcool, tabaco e drogas;
- aparencia;
- atitude;
- consciencia;
- afeto;
- pensamento;
- impressao diagnostica inicial CID-11 / DSM-5;
- objetivos do tratamento;
- contrato terapeutico.

### Requisitos funcionais
- O sistema deve oferecer anamnese estruturada e editavel.
- O sistema deve permitir salvar anamnese.
- O sistema deve organizar secoes em acordeoes expansiveis.
- O sistema deve permitir campos longos de texto livre.
- O sistema deve permitir campos de selecao para habitos e exame do estado mental.
- O sistema deve permitir registrar hipotese diagnostica e plano terapeutico.
- O sistema deve permitir registrar CID-11 e DSM-5 no contexto diagnostico.

## Modulo 6 - Prontuario e evolucao
### Referencia do prototipo
A aba `Prontuario` mostra:

- historico de sessoes;
- botao `Nova`;
- estado vazio `Nenhuma evolucao registrada`;
- chamada para criar primeira evolucao;
- descricao de acompanhamento pelo metodo SOAP.

A tela de `Nova Evolucao` mostra:

- data e hora;
- humor de 1 a 10;
- bloco `S - Subjetivo`;
- bloco `O - Objetivo`;
- bloco `A - Avaliacao`;
- bloco `P - Plano`.

### Requisitos funcionais
- O sistema deve permitir criar evolucao.
- O sistema deve permitir editar evolucao, conforme regra de auditoria definida.
- O sistema deve listar historico de sessoes/evolucoes.
- O sistema deve permitir selecionar ou criar evolucao a partir do prontuario.
- O sistema deve registrar data e hora da evolucao.
- O sistema deve registrar humor de 1 a 10.
- O sistema deve estruturar evolucao pelo metodo SOAP.
- O sistema deve permitir campos ricos ou textareas extensos para anotacoes clinicas.
- O sistema deve vincular evolucao a paciente e, quando aplicavel, a consulta.
- O sistema deve preservar sigilo absoluto das notas clinicas.

### Sigilo e criptografia
- Notas clinicas devem ser criptografadas.
- O requisito desejado e criptografia de ponta a ponta nas notas clinicas.
- Se houver restricao tecnica para busca, IA ou server-side rendering, isso deve ser explicitamente decidido em arquitetura, sem remover a exigencia de protecao forte das notas.

## Modulo 7 - CID/DSM e diagnosticos
### Requisito do texto descritivo
O produto deve ter integracao CID/DSM com busca rapida de codigos da CID-11 ou DSM-5 para diagnosticos, especialmente relevante para psiquiatras.

### Requisitos funcionais
- O sistema deve permitir busca rapida de codigos CID-11.
- O sistema deve permitir registrar referencia DSM-5.
- O sistema deve associar codigos diagnosticos ao paciente, anamnese ou evolucao.
- O sistema deve diferenciar codigo, descricao curta e observacao clinica.
- O sistema deve respeitar licencas e limites legais de uso de conteudo DSM.

## Modulo 8 - Agenda inteligente
### Referencia do prototipo
A agenda mostra:

- visualizacao semanal em grade;
- alternancia entre `Dia`, `Semana` e `Mes`;
- navegacao por periodo;
- botao `Hoje`;
- botao `Novo Agendamento`;
- blocos de sessoes com nome do paciente e horario;
- tela/modal de `Novo Compromisso`;
- tipo de compromisso;
- paciente;
- data;
- hora de inicio;
- hora de fim;
- status;
- checkboxes de sessao recorrente semanal e sessao paga.

No perfil do paciente, a aba `Agenda` mostra:

- horario fixo;
- opcao de configurar recorrencia;
- proximas sessoes;
- status como `Agendado` e `Realizado`;
- botao `Agendar Sessao`.

O detalhe de sessao mostra:

- paciente;
- data e horario;
- status;
- acao para iniciar sessao/prontuario;
- link da videochamada;
- envio de lembrete por WhatsApp;
- editar;
- excluir.

### Requisitos funcionais
- O sistema deve mostrar agenda por dia, semana e mes.
- O sistema deve permitir criar novo agendamento.
- O sistema deve permitir editar agendamento.
- O sistema deve permitir excluir/cancelar agendamento.
- O sistema deve permitir remarcar por interacao rapida, idealmente arrastar e soltar.
- O sistema deve permitir configurar sessoes recorrentes semanais.
- O sistema deve permitir configurar horario fixo por paciente.
- O sistema deve permitir marcar sessao como paga no agendamento.
- O sistema deve mostrar status do compromisso.
- O sistema deve impedir conflitos de horario.
- O sistema deve permitir bloqueio de ferias, feriados, almoco e horarios indisponiveis.
- O sistema deve permitir abrir prontuario a partir da sessao.
- O sistema deve permitir anexar ou abrir link de videochamada.
- O sistema deve permitir enviar lembrete manual por WhatsApp.
- O sistema deve enviar lembretes automaticos por WhatsApp ou e-mail.

### Status de compromisso
- agendado;
- confirmado;
- realizado;
- falta;
- cancelado;
- remarcado;
- pendente;
- recusado.

## Modulo 9 - Notificacoes
### Requisitos funcionais
- O sistema deve enviar lembretes automaticos de consulta via WhatsApp.
- O sistema deve enviar lembretes automaticos de consulta via e-mail.
- O sistema deve permitir envio manual de WhatsApp por paciente ou sessao.
- O sistema deve registrar status de envio.
- O sistema deve registrar resposta do paciente quando houver integracao.
- O sistema deve usar opt-in de comunicacao.
- O sistema deve permitir templates de mensagens.
- O sistema deve permitir lembrete no dia anterior e lembrete em horario configuravel.
- O sistema deve suportar alertas internos no dashboard.

## Modulo 10 - Financeiro
### Referencia do prototipo
A tela financeira global mostra:

- receitas do mes;
- despesas do mes;
- saldo do mes;
- inadimplencia;
- botao `Emitir Recibo`;
- botao `Nova Despesa`;
- botao `Nova Receita`;
- tabela de lancamentos;
- abas ou secoes de `Lancamentos` e `Configuracoes`;
- data, descricao, tipo, status e valor;
- edicao de lancamento.

A aba financeira do paciente mostra:

- historico financeiro;
- total pago;
- em aberto;
- botao `Novo Lancamento`;
- botao `Gerar Recibo`;
- lista com data, descricao, status, valor e editar.

O modal `Nova Receita` mostra:

- descricao;
- valor;
- data;
- categoria;
- status;
- forma de pagamento;
- vinculo opcional com paciente;
- cancelar/salvar.

### Requisitos funcionais
- O sistema deve registrar receitas.
- O sistema deve registrar despesas.
- O sistema deve registrar pagamentos em dinheiro, PIX, cartao e convenio.
- O sistema deve registrar status pago, pendente e em aberto.
- O sistema deve mostrar identificacao visual de sessoes pagas e pendentes.
- O sistema deve permitir vincular lancamento a paciente.
- O sistema deve permitir vincular lancamento a consulta.
- O sistema deve permitir editar lancamento.
- O sistema deve calcular receitas do mes.
- O sistema deve calcular despesas do mes.
- O sistema deve calcular saldo do mes.
- O sistema deve calcular inadimplencia.
- O sistema deve mostrar historico financeiro por paciente.
- O sistema deve permitir fluxo de caixa basico de receitas vs. despesas.
- O sistema deve permitir relatorio financeiro basico.

## Modulo 11 - Recibos
### Requisitos funcionais
- O sistema deve gerar PDF de recibo.
- O recibo deve servir para reembolso de convenio.
- O recibo deve poder ser emitido a partir do financeiro global.
- O recibo deve poder ser emitido a partir do historico financeiro do paciente.
- O recibo deve usar dados do profissional, paciente, servico, valor, data e pagamento.
- O recibo deve poder ser baixado e compartilhado.
- O sistema deve manter historico de recibos emitidos.

## Modulo 12 - Documentos, laudos e receituario
### Referencia do prototipo
A aba `Documentos` mostra:

- titulo `Documentos e Receituario`;
- geracao de laudos, atestados e upload de anexos;
- modelos rapidos: `Atestado`, `Laudo`, `Encaminhamento`, `Receituario`;
- area de upload de anexos do paciente;
- formatos aceitos: PDF, JPG, PNG;
- limite de tamanho indicado;
- arquivos recentes;
- observacao sobre assinatura digital padrao ICP-Brasil via extensoes ou softwares de PDF apos geracao.

A tela de laudo mostra:

- titulo `Laudo Psicologico`;
- data;
- texto com `[Nome do Paciente]`;
- aviso de modelo gerado automaticamente e editavel;
- linha de assinatura do profissional.

### Requisitos funcionais
- O sistema deve permitir upload de anexos do paciente.
- O sistema deve aceitar PDF, JPG e PNG.
- O sistema deve listar arquivos recentes.
- O sistema deve gerar atestados.
- O sistema deve gerar laudos psicologicos/psiquiatricos.
- O sistema deve gerar encaminhamentos.
- O sistema deve gerar receituario.
- O sistema deve permitir editar documento gerado antes de salvar/imprimir.
- O sistema deve inserir dados do paciente automaticamente nos modelos.
- O sistema deve inserir data automaticamente.
- O sistema deve prever assinatura do profissional.
- O sistema deve permitir salvar documento final no repositorio do paciente.

## Modulo 13 - Receituario e documentos medicos
### Requisitos especificos
- O sistema deve permitir emissao de receitas.
- O sistema deve permitir emissao de atestados.
- O sistema deve permitir emissao de pedidos de exame.
- O sistema deve permitir assinatura digital quando aplicavel.
- Para psiquiatria, o sistema deve considerar regras de prescricao, tipos de receita e exigencias legais como requisito de discovery antes da implementacao final.

## Modulo 14 - Assinatura digital e documentos assinados
### Requisitos funcionais
- O sistema deve permitir assinatura de documentos gerados.
- O sistema deve indicar documentos que precisam de assinatura.
- O sistema deve alertar no dashboard sobre documentos pendentes de assinatura.
- O sistema deve suportar assinatura do profissional nos PDFs.
- O sistema deve manter evidencias de assinatura quando a assinatura ocorrer dentro do app.
- O sistema deve registrar timestamp, IP, sessao e usuario relacionado quando aplicavel.
- O sistema deve avaliar suporte a assinatura ICP-Brasil ou integracao equivalente quando exigido.

## Requisitos nao funcionais
### Usabilidade
- A interface deve ser simples, clara e profissional.
- A UI pode ser diferente do prototipo, mas os fluxos devem ser preservados.
- A navegacao deve minimizar cliques em tarefas frequentes.
- Formularios longos devem ser divididos em secoes claras.
- Estados vazios devem orientar a proxima acao.
- Acoes destrutivas devem exigir confirmacao.
- Feedbacks de salvamento, erro, envio e geracao de PDF devem ser visiveis.

### Acessibilidade
- Campos devem ter labels claros.
- Foco de teclado deve ser visivel.
- Contraste deve ser adequado.
- Icones devem ter texto ou tooltip acessivel.
- Modais devem ser navegaveis por teclado.

### Seguranca
- Dados sensiveis devem ser protegidos em transito e em repouso.
- Notas clinicas exigem protecao reforcada.
- Acesso deve ser restrito ao profissional autenticado.
- Webhooks devem validar origem.
- Logs devem evitar expor conteudo clinico sensivel.

### Performance e operacao
- O sistema deve carregar rapidamente dashboards, listas e agenda.
- Listagens devem suportar busca e filtragem eficiente.
- Uploads devem ter limite e validacao de tipo.
- Jobs de notificacao devem ser rastreaveis.
- Falhas de envio devem poder ser auditadas.

## Entidades principais
- Usuario/Profissional;
- Paciente;
- Endereco;
- Consentimento;
- Consulta/Compromisso;
- Recorrencia/Horario fixo;
- Evolucao SOAP;
- Anamnese;
- Diagnostico CID/DSM;
- Documento;
- Anexo;
- Receita;
- Atestado;
- Laudo;
- Encaminhamento;
- Lancamento financeiro;
- Recibo;
- Notificacao;
- Log de auditoria.

## Fluxos principais
### Criar conta
1. Usuario informa nome, e-mail e senha.
2. Usuario aceita Termos de Uso e Politica de Privacidade.
3. Sistema cria conta.
4. Sistema direciona para login ou dashboard.

### Login e recuperacao
1. Usuario informa e-mail e senha.
2. Sistema valida credenciais.
3. Se 2FA estiver ativo, sistema solicita segundo fator.
4. Usuario acessa o dashboard.
5. Se esquecer a senha, usuario inicia recuperacao por e-mail.

### Criar paciente
1. Profissional abre `Pacientes`.
2. Clica em `Novo Paciente`.
3. Preenche dados pessoais, contato, endereco, foto, convenio/indicacao e motivo da busca.
4. Salva.
5. Paciente aparece na carteira e pode ser usado em agenda, prontuario, financeiro e documentos.

### Registrar anamnese
1. Profissional abre perfil do paciente.
2. Acessa aba `Anamnese`.
3. Preenche secoes estruturadas.
4. Salva anamnese.

### Criar evolucao SOAP
1. Profissional abre `Prontuario`.
2. Clica em nova evolucao.
3. Informa data/hora e humor.
4. Preenche subjetivo, objetivo, avaliacao e plano.
5. Salva evolucao no historico.

### Agendar sessao
1. Profissional abre agenda global ou agenda do paciente.
2. Clica em novo agendamento ou agenda sessao.
3. Escolhe tipo, paciente, data, horario, status, recorrencia e se a sessao esta paga.
4. Salva.
5. Agenda exibe o compromisso na grade.

### Gerenciar sessao
1. Profissional abre detalhe do compromisso.
2. Pode iniciar sessao no prontuario.
3. Pode abrir link de videochamada.
4. Pode enviar lembrete por WhatsApp.
5. Pode editar ou excluir.

### Registrar financeiro
1. Profissional abre financeiro global ou financeiro do paciente.
2. Cria nova receita ou despesa.
3. Informa descricao, valor, data, categoria, status, forma de pagamento e paciente opcional.
4. Sistema atualiza receitas, despesas, saldo e inadimplencia.

### Emitir recibo
1. Profissional seleciona lancamento pago.
2. Clica em gerar ou emitir recibo.
3. Sistema gera PDF com dados necessarios.
4. Recibo fica disponivel para download e historico.

### Gerar documento
1. Profissional abre aba `Documentos`.
2. Escolhe modelo rapido: atestado, laudo, encaminhamento ou receituario.
3. Sistema preenche dados iniciais do paciente e data.
4. Profissional edita o texto.
5. Sistema salva/imprime/exporta PDF.
6. Documento pode ser assinado conforme fluxo definido.

## Requisitos funcionais consolidados
### Acesso
- RF-001: Criar conta com nome, e-mail, senha e aceite LGPD.
- RF-002: Login com e-mail e senha.
- RF-003: Recuperacao de senha por e-mail.
- RF-004: Suporte a 2FA.
- RF-005: Logout e protecao de rotas.

### Dashboard
- RF-010: Mostrar resumo do dia.
- RF-011: Mostrar proximos atendimentos.
- RF-012: Mostrar pacientes ativos.
- RF-013: Mostrar sessoes do mes/dia.
- RF-014: Mostrar receita prevista, saldo pendente e inadimplencia.
- RF-015: Mostrar lembretes, aniversarios e documentos pendentes.

### Pacientes
- RF-020: Criar, editar, buscar, filtrar, arquivar/excluir pacientes.
- RF-021: Gerenciar status e tags.
- RF-022: Abrir acoes rapidas: WhatsApp, financeiro, editar, excluir e iniciar fluxo.
- RF-023: Visualizar perfil completo com abas.

### Anamnese e prontuario
- RF-030: Preencher anamnese estruturada.
- RF-031: Registrar evolucao SOAP.
- RF-032: Registrar humor de 1 a 10.
- RF-033: Consultar historico cronologico.
- RF-034: Proteger notas clinicas com criptografia forte.

### Diagnostico e psiquiatria
- RF-040: Buscar e registrar CID-11.
- RF-041: Registrar referencia DSM-5.
- RF-042: Emitir receitas, atestados e pedidos de exame.
- RF-043: Suportar assinatura digital quando exigida.

### Agenda
- RF-050: Visualizar agenda por dia, semana e mes.
- RF-051: Criar, editar, remarcar e excluir compromissos.
- RF-052: Configurar recorrencia semanal e horario fixo.
- RF-053: Bloquear horarios, ferias, feriados e almoco.
- RF-054: Abrir detalhe da sessao com acoes.
- RF-055: Enviar lembretes automaticos e manuais.

### Financeiro
- RF-060: Registrar receitas e despesas.
- RF-061: Registrar pagamento por dinheiro, PIX, cartao e convenio.
- RF-062: Controlar pago, pendente e inadimplente.
- RF-063: Calcular receitas, despesas, saldo e inadimplencia.
- RF-064: Gerar relatorio basico de fluxo de caixa.
- RF-065: Gerar recibos PDF.

### Documentos
- RF-070: Upload de anexos PDF, JPG e PNG.
- RF-071: Gerar atestado, laudo, encaminhamento e receituario.
- RF-072: Editar documento antes de salvar/imprimir.
- RF-073: Salvar documentos no repositorio do paciente.
- RF-074: Controlar documentos pendentes de assinatura.

## Pendencias de decisao
1. Definir se o login com Google continua como opcional alem de e-mail/senha.
2. Definir provider e experiencia de 2FA.
3. Definir nivel real de criptografia ponta a ponta para notas clinicas.
4. Definir fonte/licenciamento para CID-11 e limites de uso de DSM-5.
5. Definir regras legais para receituario psiquiatrico e assinatura digital.
6. Definir se assinatura sera interna, ICP-Brasil, extensao externa ou provider dedicado.
7. Definir modelo fiscal/contabil exato dos recibos.
8. Definir se pacientes serao excluidos fisicamente ou arquivados por padrao.

## Fora do escopo imediato, salvo decisao contraria
- portal do paciente;
- multi-profissional;
- secretaria/admin;
- automacoes livres por IA;
- atendimento completo via WhatsApp;
- agentes autonomos.

