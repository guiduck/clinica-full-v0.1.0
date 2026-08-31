# Inventario Funcional do Prototipo Lovable

## Finalidade

Este documento registra as funcionalidades observadas no prototipo de referencia para:

- orientar a reconstrucao do frontend de producao;
- preservar fluxos, ordem de elementos, estados e regras de formulario;
- apoiar especificacoes, testes de aceitacao e revisoes de paridade;
- servir de base para landing page, posicionamento comercial e materiais de marketing.

Baseline auditada: submodulo `references/clinica-full` no commit
`226e5ab6811c5dce717fa12b404370b4fbb2663e` (2026-08-25).

O prototipo e fonte de verdade de produto e UX. Ele nao e fonte de verdade para
arquitetura, persistencia, seguranca ou integracoes: mocks, estado global em arquivo,
`localStorage` e a organizacao interna do codigo de referencia nao devem ser copiados.

## Mapa de navegacao

- `/login`: acesso por e-mail/senha e entrada com Google.
- `/criar-conta`: cadastro do profissional com aceite de termos.
- `/recuperar-senha`: solicitacao de link de recuperacao.
- `/dashboard`: resumo operacional, atalhos, lembretes, graficos e mensagens.
- `/pacientes`: lista, busca, filtros, cadastro e cobranca.
- `/pacientes/:patientId`: perfil completo do paciente em seis abas.
- `/agenda`: calendario operacional em dia, semana e mes.
- `/financeiro`: fluxo de caixa, recibos, categorias, filtros e graficos.
- `/financeiro/previsibilidade`: previsao anual e detalhamento mensal.
- `/configuracoes`: conta, contato, planos, mensagens e seguranca.

## Estrutura global e onboarding

- Shell autenticado responsivo com barra lateral compacta no desktop e painel no mobile.
- Navegacao para Dashboard, Pacientes, Agenda, Fluxo de caixa e Previsibilidade.
- Cabecalho com notificacoes, avatar, menu do usuario, Configuracoes e Sair.
- Notificacoes de pagamentos, documentos, aniversarios e consultas com links contextuais.
- Indicador de mensagens aguardando envio.
- Tour guiado com proximo/voltar/pular, persistencia, retomada entre rotas e bloqueio
  de avancos que dependem de dados obrigatorios, como CPF valido.
- Banner de novidades dispensavel e secoes reordenaveis no dashboard.
- Layout adaptado a desktop e mobile, incluindo tabelas, dialogs, sheets e menus.

## Autenticacao e conta

- Login por e-mail e senha, exibir/ocultar senha e manter acesso conectado.
- Entrada com Google, recuperacao de senha e logout.
- Criacao de conta com nome, e-mail profissional, CPF, senha e aceite de Termos de
  Uso e Politica de Privacidade.
- Validacao de e-mail, CPF, senha minima e aceite obrigatorio.
- Protecao das areas privadas.

## Dashboard operacional

- Saudacao personalizada, banner e acoes rapidas para paciente, agendamento e receita.
- Proximos atendimentos agrupados em Hoje, Amanha e Proximos dias.
- Lembretes de pagamento, aniversario, confirmacoes e documentos.
- Acao contextual de aniversario com envio de mensagem.
- Grafico Receitas x Despesas nos periodos Semana, Mes, 3 meses, 6 meses e Ano.
- Clique no grafico abre o financeiro no mesmo recorte e grafico de saldo acumulado.
- Controle para ocultar/exibir valores financeiros sensiveis.
- Fila de mensagens programadas com revisar/enviar e cancelar.
- Cards clicaveis de Sessoes hoje, Saldo atual, Receita prevista e Inadimplencia.
- Confirmacao para agendar logo apos cadastrar paciente e estados vazios acionaveis.

## Pacientes

### Lista e gestao

- Busca por nome, CPF, e-mail ou telefone.
- Filtros Todos, Ativos, Inativos e Arquivados.
- Acoes para abrir perfil, WhatsApp, financeiro, editar, arquivar e restaurar.
- Arquivamento com confirmacao sem excluir historico.
- Geracao de cobranca e estados vazios por filtro/busca.

### Cadastro em duas etapas

Ordem do passo 1:

1. Dados pessoais.
2. Contato.
3. Dados clinicos iniciais.
4. Endereco opcional em accordion.
5. Contato de emergencia opcional em accordion.
6. Consentimentos de comunicacao.

Campos obrigatorios observados no fluxo atualizado:

- Nome completo.
- CPF valido e unico quando aplicado ao banco de producao.
- Data de nascimento valida, nao futura e a partir de 1900.
- E-mail valido.
- Telefone/WhatsApp com 10 ou 11 digitos.

Campos opcionais:

- Status, com padrao Ativo e opcao Inativo.
- Queixa principal, com limite de 500 caracteres.
- CEP, endereco/numero, complemento, cidade e UF.
- Nome, telefone e parentesco do contato de emergencia.
- Consentimentos de WhatsApp e e-mail, armazenados separadamente.

O endereco inteiro e opcional; CEP informado exige 8 digitos e mascara brasileira.
UF usa duas letras maiusculas. O endereco alimenta contratos e documentos.

Ordem do passo 2:

1. Modelo de cobranca: Avulso ou Plano.
2. Valor por sessao ou selecao de plano cadastrado.
3. Metodo de pagamento.
4. Forma e quantidade de parcelas quando for cartao.
5. Opcoes de boas-vindas, contrato e confirmacao automatica aplicavel.
6. Resumo e conclusao.

Regras alvo: modelo e metodo obrigatorios; Avulso exige valor positivo; Plano exige
modelo valido; Cartao permite a vista ou 2 a 12 parcelas nesse fluxo; numero completo
e CVV nunca sao coletados/persistidos. O cadastro pode gerar receita, parcelas,
boas-vindas e contrato conforme as escolhas.

### Perfil do paciente

Cabecalho com nome, status, WhatsApp e arquivamento. Abas: Geral, Anamnese, Agenda,
Prontuario, Financeiro e Documentos.

#### Geral

- Contato, identificacao, endereco, emergencia e edicao cadastral.
- Consentimentos de WhatsApp/e-mail, queixa principal e notas internas.

#### Anamnese

- HDA: descricao, fatores precipitantes e tentativas previas de tratamento.
- Historico pessoal, familiar e social: relato livre e rede de apoio.
- Habitos: sono, alimentacao, atividade fisica, alcool, tabaco, drogas e lazer.
- Exame do Estado Mental: aparencia, atitude, consciencia, afeto e pensamento.
- Hipotese/Plano: referencia manual CID-11/DSM-5 e objetivos do tratamento.
- Contrato nao pertence a anamnese; fica em Documentos/Financeiro conforme o dado.

#### Agenda do paciente

- Proximas sessoes, historico, criacao, edicao e entrada para recorrencia.

#### Prontuario

- Criar, visualizar, editar e excluir evolucoes em ordem cronologica.
- Registro livre ou SOAP: Subjetivo, Objetivo, Avaliacao e Plano.
- Humor de 1 a 10 e vinculo opcional com agendamento.
- Sessao com cronometro, pausar/retomar/finalizar, resumo da anamnese e historico.
- Finalizar salva evolucao e marca agendamento como realizado.

#### Financeiro do paciente

- Resumo, criacao, edicao e exclusao de lancamentos.
- Recibo para receitas pagas/efetivadas.
- Modelo/dados de pagamento e cobranca avulsa, plano salvo ou customizado.
- Salvar plano customizado, criar/copiar link e enviar por WhatsApp com consentimento.
- Orientar cadastro financeiro quando estiver incompleto.

#### Documentos

- Modelos: atestado, laudo, encaminhamento, receituario, pedido de exame e contrato.
- Upload, repositorio, criar, editar, pre-visualizar, salvar e excluir.
- PDF e assinatura eletronica simples em canvas.
- Evidencias: nome, timestamp, IP, sessao e versao.

## Agenda

- Calendario em Dia, Semana e Mes com anterior, Hoje e seguinte.
- Cabecalho contextual, grade de 24 horas e compromissos posicionados visualmente.
- Criacao por botao/faixa com paciente, tipo, data, inicio, fim e video opcional.
- Validacao de passado, ordem dos horarios e conflitos com consultas/bloqueios.
- Edicao de tipo, data, horarios, status e video.
- Status previstos: agendado, confirmado, realizado, falta, cancelado, remarcado,
  pendente e recusado, conforme aplicabilidade.
- Detalhes em painel responsivo, perfil, videochamada, iniciar sessao, editar e excluir.
- Remarcacao preserva referencia ao original e pode ser cancelada/restaurada.
- Inicio de sessao permitido ate o fim do horario.
- Confirmacao/lembrete WhatsApp e agendamento/edicao de mensagem.
- Bloqueio por motivo, intervalo de datas, dia inteiro ou faixa horaria, com conflitos.
- Estados vazios dentro da grade; nao substituir o calendario por formulario fixo.

## Financeiro

### Fluxo de caixa

- KPIs de Saldo, Receita efetivada, Despesa efetivada e Inadimplencia.
- Abas Todos, Receitas, Despesas, Recibos e Categorias.
- Filtros por periodo, De/Ate, status e categoria, refletidos na navegacao.
- Limpar filtros, tabela responsiva, criar/editar/excluir e efetivar/desfazer.
- Graficos de fluxo, saldo acumulado e despesas por categoria.
- Categorias fixas protegidas e categorias personalizadas.

### Registro financeiro

- Receita/Despesa; receita exige paciente e pode ser avulsa ou plano cadastrado.
- Categoria, descricao, dinheiro, PIX, cartao, boleto ou convenio.
- Despesa unica, fixa mensal ou parcelada.
- Cartao a vista ou parcelado; lancamentos gerais aceitam ate 24 parcelas.
- Recorrencia, vencimento, ocorrencias futuras e status financeiros.
- Aviso quando automacao depende de integracao/webhook.

### Recibos

- Emissao, numeracao anual, edicao, PDF e envio por WhatsApp/e-mail.
- Profissional, especialidade, paciente, CPF, servico, data, metodo e valor.

### Previsibilidade

- Calendario anual, totais por mes e detalhamento mensal.
- Receitas/Despesas, resumo, saldo, periodo, datas, categoria e pesquisa.
- Blocos a confirmar/efetivados com confirmar, cancelar e editar.

## Mensagens e automacoes

- Templates de cobranca, vencimento D-1, boas-vindas, confirmacao e aniversario.
- WhatsApp/e-mail, assunto, editor, previa e placeholders de dados do fluxo.
- Fila aguardando/enviado, revisar, editar, enviar, cancelar e agendar por data/hora.
- Integracoes indisponiveis mantem o controle visual e exibem aviso honesto.

## Configuracoes

- Conta: nome, e-mail, CPF, especialidade, conselho opcional, plano e LGPD.
- Contato/endereco: telefone, e-mail, logradouro, cidade, UF e CEP.
- Clinica opcional: nome, CNPJ, telefone e marca d'agua PNG/JPG ate 2 MB.
- Planos: listar, cadastrar e remover; nome, descricao, sessoes/mes, meses (ate 12)
  e valor mensal; reutilizacao no cadastro e cobranca.
- Mensagens: templates, placeholders e fila.
- Seguranca: entrada futura de 2FA e toggles de WhatsApp/e-mail; sem gerenciador de
  sessoes no MVP.

## Validacoes, mascaras e formato brasileiro

- Zod como fonte unica no cliente e servidor.
- CPF `000.000.000-00`, rejeicao de repetidos e dois digitos verificadores.
- CNPJ `00.000.000/0000-00` com validacao real quando utilizado.
- Telefone dinamico de 10/11 digitos e CEP `00000-000` com 8 digitos.
- BRL/`pt-BR`, datas `dd/mm/aaaa` (nunca `mm/dd/yyyy`) e horario de 24 horas.
- Persistencia canonica com conversao explicita e testada para exibicao brasileira.
- E-mail normalizado; trim; validacao condicional por cobranca, pagamento e parcela.
- Erro junto ao campo, em portugues, sem perder valores; envio sem duplicidade.

## Padrao de arquitetura para a reconstrucao

- Paginas compoem/orquestram; nao concentram toda logica e estado.
- Componentes por dominio e hooks para interacao complexa reutilizavel.
- Opcoes, labels e metadados em `constants.ts` proximos ao dominio.
- Pastas separadas para formatters, validators e masks.
- Schemas exportam tipos/resolvers; helpers sao puros, deterministicos e imutaveis.
- Efeitos isolados nas bordas e estados derivados sem duplicacao.
- Nao copiar mock store, `localStorage`, constantes locais ou utils espalhadas.
- Server Components/services server-side continuam o padrao do app real.
- Acao sem service exibe aviso; nunca sucesso ou persistencia falsos.

## Catalogo de valor para marketing

- Perfil completo do paciente em um unico lugar.
- Agenda visual com bloqueios e remarcacoes.
- Prontuario com anamnese, evolucao livre/SOAP e sessao cronometrada.
- Financeiro com receitas, despesas, inadimplencia e previsibilidade.
- Planos, cobrancas e parcelamentos.
- Recibos em PDF e compartilhamento rapido.
- Documentos clinicos e assinatura eletronica simples.
- Confirmacoes, lembretes, aniversarios e cobrancas por WhatsApp/e-mail.
- Dashboard com rotina, alertas e indicadores.
- Onboarding guiado e experiencia responsiva.
- Dados do profissional/clinica consistentes em documentos.
- Consentimentos e evidencias integrados aos fluxos.

Marketing deve separar claramente `disponivel`, `em desenvolvimento` e `planejado`;
recursos apenas visuais/simulados nao podem ser anunciados como prontos.

