# Product Spec Inicial do MVP

## Nome do produto

Clinica Agil

## Objetivo

Entregar um SaaS web para terapeutas e psicologos autonomos que centralize `pacientes`, `agenda`, `prontuario`, `financeiro`, `documentos` e `notificacoes`, com foco em reduzir operacao manual e faltas.

## Perfil de usuario

Um unico tipo de usuario no MVP:

- `profissional autonomo individual`

Caracteristicas do contexto:

- atende seus proprios pacientes
- nao divide a conta com outros profissionais
- precisa registrar atendimentos, cobrar e acompanhar agenda
- quer enviar confirmacoes por WhatsApp sem operar tudo manualmente

## Problema principal

O profissional hoje dispersa a operacao em WhatsApp, agenda, planilhas, recibos e documentos soltos. Isso gera:

- perda de informacao
- cobrancas manuais
- mais faltas
- retrabalho administrativo

## Proposta de valor do MVP

Um unico sistema para:

- cadastrar pacientes
- agendar sessoes
- registrar evolucao
- cobrar e marcar pagamentos
- gerar recibos e documentos
- enviar confirmacoes automaticas por WhatsApp

## Escopo do MVP

### Dentro do escopo

#### 1. Auth e acesso

- login com `Google Provider` via `Auth.js / NextAuth`
- sessao `database-backed`
- cookie `HttpOnly`
- aceite de termos e politica no primeiro acesso

#### 2. Pacientes

- criar, editar e arquivar paciente
- dados basicos: nome, CPF, nascimento, contato, endereco, observacoes
- historico simples de sessoes e faltas

#### 3. Agenda

- visualizar agenda
- criar, editar, remarcar e cancelar consulta
- marcar status de comparecimento
- bloquear horarios basicos

#### 4. Prontuario

- registrar evolucao por sessao
- anamnese simples/editavel
- historico cronologico
- campo manual de `DSM/CID`

#### 5. Financeiro

- registrar lancamentos
- marcar pago ou pendente
- registrar forma de pagamento
- cobranca online inicial
- recibo em PDF gerado pelo sistema a partir dos dados do pagamento interno

#### 6. Documentos e assinatura

- upload de arquivos
- geracao de PDF
- assinatura simples com evidencias
- assinatura coletada em modal no proprio app
- uso de `react-konva` para capturar assinatura desenhada
- uso de `react-pdf` para compor o documento final assinado

#### 7. Notificacoes

- mensagem ao marcar consulta
- lembrete no dia anterior
- reengajamento apos 60 dias
- confirmacao por resposta `sim` ou `nao`

#### 8. Dashboard

- proximos atendimentos
- pacientes ativos
- sessoes do mes
- saldo pendente

## Fora do escopo do MVP

- multi-profissional
- secretaria/admin
- conta do paciente
- IA por audio e transcricao
- cadastro operacional inteiro via WhatsApp
- agentes
- E2EE real
- integracao DSM completa
- assinatura juridica avancada com provider externo

## Requisitos funcionais

### RF-01 Auth

O profissional deve conseguir acessar a plataforma com login por e-mail e senha.

### RF-02 Termos

No primeiro acesso, o sistema deve registrar aceite de termos e politica com timestamp.

### RF-03 Cadastro de paciente

O profissional deve conseguir cadastrar e editar pacientes.

### RF-04 Agenda

O profissional deve conseguir criar, editar, remarcar e cancelar consultas.

### RF-05 Confirmacao automatica

Ao criar uma consulta, o sistema deve enviar mensagem automatica ao paciente.

### RF-06 Lembrete

O sistema deve enviar lembrete no dia anterior a consulta.

### RF-07 Reengajamento

O sistema deve identificar pacientes sem consulta ha 60 dias e enviar mensagem automatica.

### RF-08 Resposta do paciente

O sistema deve registrar respostas `sim` e `nao` recebidas via WhatsApp e refletir isso no status da consulta.

### RF-09 Evolucao

O profissional deve conseguir registrar evolucao por sessao.

### RF-10 DSM/CID manual

O sistema deve permitir registrar `DSM/CID` apenas como campo manual, sem busca estruturada ou criterios oficiais.

### RF-11 Financeiro

O profissional deve registrar cobrancas, pagamentos e pendencias.

### RF-12 Cobranca online

O sistema deve permitir gerar um fluxo de cobranca online inicial para sessoes.

### RF-13 Recibo

O sistema deve gerar recibo em PDF com dados do profissional, paciente, servico, valor, data e dados do pagamento registrado no proprio app.

### RF-14 Documentos

O profissional deve armazenar anexos e documentos do paciente.

### RF-15 Assinatura simples

O sistema deve capturar aceite/assinatura simples em documentos gerados com evidencias de auditoria.

### RF-16 Modal de assinatura

O sistema deve abrir um modal de assinatura no proprio app para coletar a assinatura desenhada do cliente e aplicar essa assinatura ao PDF final.

## Requisitos nao funcionais

### RNF-01 Simplicidade operacional

O sistema deve ter deploy simples e poucos servicos para administrar.

### RNF-01.1 Stack base

O MVP deve usar:
- `Next.js` para frontend e backend
- `shadcn/ui`
- `react-hook-form` + `zod`
- `zustand`
- `Prisma`
- `PostgreSQL`

### RNF-02 Seguranca minima

O sistema deve usar criptografia em transito, controle de acesso e armazenamento seguro.

### RNF-02.1 Sessao

O sistema deve usar `database sessions` com cookie `HttpOnly`, evitando JWT stateless como sessao principal.

### RNF-03 LGPD

O sistema deve registrar aceite, consentimento para contato e trilha basica de acesso.

### RNF-04 Escopo controlado

O MVP deve priorizar entrega rapida sobre cobertura total de regras avancadas.

### RNF-05 Evolucao futura

A arquitetura deve permitir adicionar IA depois sem reescrever o sistema inteiro.

### RNF-06 Ambientes

O banco local deve poder rodar em `docker compose`, enquanto a producao deve usar `PostgreSQL` gerenciado.

## Fluxos principais

### Fluxo 1: criar paciente

1. Profissional acessa cadastro.
2. Preenche dados do paciente.
3. Salva registro.
4. Paciente passa a aparecer na base e agenda.

### Fluxo 2: agendar consulta

1. Profissional seleciona paciente.
2. Define data e horario.
3. Salva consulta.
4. Sistema envia mensagem de confirmacao.

### Fluxo 3: paciente confirma

1. Paciente responde `sim` ou `nao` no WhatsApp.
2. Webhook recebe resposta.
3. Sistema atualiza status da consulta.

### Fluxo 4: registrar evolucao

1. Profissional abre sessao.
2. Registra evolucao.
3. Preenche `DSM/CID` manualmente quando quiser.
4. Sistema salva no historico do paciente.

### Fluxo 5: cobrar sessao

1. Profissional cria lancamento.
2. Escolhe forma de pagamento ou link online.
3. Sistema registra status.
4. Sistema gera recibo quando aplicavel.

### Fluxo 6: documento com assinatura simples

1. Sistema gera PDF.
2. Sistema abre modal de assinatura.
3. Cliente desenha assinatura no canvas.
4. Sistema incorpora assinatura ao PDF.
5. Sistema salva evidencias e documento final.

## Criterios de sucesso do MVP

- profissional consegue operar 100% da rotina basica em um unico sistema
- consulta pode ser criada e confirmada sem trabalho manual repetitivo
- pagamentos pendentes ficam visiveis
- recibo pode ser gerado rapidamente
- notificacoes automaticas reduzem faltas

## Riscos principais

- escopo crescer por causa de IA cedo demais
- assinatura virar requisito juridico mais complexo do que o previsto
- WhatsApp exigir mais setup operacional do que o time espera
- regras reais de recibo variarem por convenio/contador

## Evolucao futura prevista
### Conta do paciente
Em fase futura, o sistema deve permitir um `portal do paciente` com:
- login proprio
- pagina especifica do paciente
- visualizacao do historico permitido
- solicitacao de agendamento em horarios disponibilizados pelo terapeuta
- confirmacao final obrigatoria pelo terapeuta

### Servico de IA
Em fase futura, o sistema pode extrair fluxos de IA para `FastAPI`, possivelmente com `Docker` e `Redis/queue` para processamento assincrono.

## Perguntas ainda em aberto

- o recibo precisa seguir um layout padrao especifico?
- a cobranca online sera por link avulso ou fluxo recorrente?
- a assinatura simples e suficiente para o cliente inicial?
- quando a `conta do paciente` deve entrar no roadmap?
- o primeiro corte tera apenas login Google ou tambem login por e-mail e senha?