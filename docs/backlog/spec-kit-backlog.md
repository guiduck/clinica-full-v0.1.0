# Backlog Inicial para Spec Kit

## Como usar este backlog
Cada epic abaixo pode virar:
- uma spec principal
- varias sub-specs por vertical slice
- entregas pequenas e verificaveis

A ordem sugerida prioriza `valor real + risco reduzido`.

## Ordem recomendada
1. `auth-e-lgpd`
2. `pacientes`
3. `agenda`
4. `notificacoes`
5. `prontuario`
6. `financeiro`
7. `documentos-e-assinatura`
8. `dashboard`
9. `infra-e-auditoria`

## Epic 1: auth-e-lgpd
### Objetivo
Permitir acesso seguro do profissional e registrar aceite inicial.

### Slices
#### Slice 1.1
`login, logout e sessao`

Critero de pronto:
- usuario faz login com `Google Provider`
- usuario encerra sessao
- rotas privadas exigem autenticacao
- sessao usa `database sessions`
- cookie de sessao e `HttpOnly`

#### Slice 1.2
`modelo de acesso inicial`

Critero de pronto:
- time decide se o primeiro corte tera apenas login Google ou tambem e-mail e senha
- fluxo inicial de auth fica documentado e validado

#### Slice 1.3
`aceite de termos no primeiro acesso`

Critero de pronto:
- primeiro acesso exibe termos
- aceite fica salvo com timestamp
- usuario sem aceite nao segue no app

## Epic 2: pacientes
### Objetivo
Cadastrar e gerenciar pacientes do profissional.

### Slices
#### Slice 2.1
`criar paciente`

Critero de pronto:
- cadastro com dados basicos
- validacoes essenciais
- paciente salvo no banco

#### Slice 2.2
`editar e arquivar paciente`

Critero de pronto:
- profissional atualiza dados
- arquivamento nao apaga historico

#### Slice 2.3
`listar e buscar pacientes`

Critero de pronto:
- listagem funcional
- busca por nome/contato

## Epic 3: agenda
### Objetivo
Organizar consultas do profissional.

### Slices
#### Slice 3.1
`visualizar agenda`

Critero de pronto:
- agenda mostra consultas
- recorte minimo por dia/semana

#### Slice 3.2
`agendar consulta`

Critero de pronto:
- profissional escolhe paciente e horario
- consulta fica registrada

#### Slice 3.3
`editar, remarcar e cancelar`

Critero de pronto:
- consulta pode ser alterada
- status reflete cancelamento/remarcacao

#### Slice 3.4
`bloquear horarios`

Critero de pronto:
- profissional cria bloqueios simples
- agenda impede conflito

## Epic 4: notificacoes
### Objetivo
Automatizar mensagens operacionais via WhatsApp.

### Slices
#### Slice 4.1
`mensagem ao criar consulta`

Critero de pronto:
- sistema envia mensagem ao marcar via `Twilio`
- status de envio fica registrado

#### Slice 4.2
`lembrete no dia anterior`

Critero de pronto:
- job localiza consultas de amanha
- mensagem e enviada corretamente via `Twilio`

#### Slice 4.3
`resposta sim ou nao`

Critero de pronto:
- webhook do `Twilio` recebe resposta
- status da consulta e atualizado

#### Slice 4.4
`reengajamento apos 60 dias`

Critero de pronto:
- job identifica inativos
- mensagem e disparada uma unica vez por ciclo

## Epic 5: prontuario
### Objetivo
Registrar informacoes clinicas basicas.

### Slices
#### Slice 5.1
`evolucao por sessao`

Critero de pronto:
- profissional registra texto de evolucao
- historico cronologico fica visivel

#### Slice 5.2
`anamnese simples`

Critero de pronto:
- formulario editavel
- respostas ficam salvas por paciente

#### Slice 5.3
`campo manual de DSM/CID`

Critero de pronto:
- prontuario permite preencher `DSM/CID` manualmente
- nao existe busca estruturada nem catalogo oficial

## Epic 6: financeiro
### Objetivo
Registrar recebimentos, pendencias e cobranca online.

### Slices
#### Slice 6.1
`criar lancamento financeiro`

Critero de pronto:
- profissional registra valor, categoria e forma de pagamento
- status inicial definido

#### Slice 6.2
`marcar pago ou pendente`

Critero de pronto:
- status pode ser atualizado
- historico reflete alteracao

#### Slice 6.3
`cobranca online inicial`

Critero de pronto:
- sistema gera fluxo de cobranca online
- retorno do pagamento atualiza status

#### Slice 6.4
`gerar recibo PDF`

Critero de pronto:
- PDF contem dados essenciais
- PDF usa dados do pagamento registrado no proprio app
- pode ser baixado e compartilhado

## Epic 7: documentos-e-assinatura
### Objetivo
Armazenar documentos e coletar assinatura simples.

### Slices
#### Slice 7.1
`upload de documento`

Critero de pronto:
- upload concluido
- arquivo vinculado ao paciente

#### Slice 7.2
`gerar documento PDF`

Critero de pronto:
- sistema gera PDF padrao
- documento pode ser versionado minimamente
- `react-pdf` compoe o arquivo final

#### Slice 7.3
`assinatura simples`

Critero de pronto:
- fluxo registra nome, timestamp e evidencia
- assinatura desenhada em modal com `react-konva` pode ser embutida
- documento final fica salvo

## Epic 8: dashboard
### Objetivo
Mostrar rapidamente o estado do negocio.

### Slices
#### Slice 8.1
`resumo do dia`

Critero de pronto:
- proximos atendimentos visiveis

#### Slice 8.2
`indicadores principais`

Critero de pronto:
- pacientes ativos
- sessoes do mes
- saldo pendente

## Epic 9: infra-e-auditoria
### Objetivo
Garantir deploy estavel, rastreabilidade minima e operacao segura.

### Slices
#### Slice 9.1
`estrutura inicial do projeto`

Critero de pronto:
- app sobe localmente e em preview
- ambientes e secrets definidos
- `PostgreSQL` local sobe com `docker compose`

#### Slice 9.2
`jobs e webhooks`

Critero de pronto:
- jobs executam com seguranca
- webhooks validam origem

#### Slice 9.3
`auditoria basica`

Critero de pronto:
- eventos sensiveis essenciais ficam registrados

## Epic futuro: portal-do-paciente
### Objetivo
Adicionar autenticacao e experiencia propria para pacientes em fase posterior ao MVP.

### Slices futuras
#### Slice P.1
`login do paciente`

Critero de pronto:
- paciente acessa area propria
- autenticacao fica separada do terapeuta

## Epic futuro: ai-service
### Objetivo
Extrair fluxos de IA para um servico proprio apenas quando houver necessidade real.

### Slices futuras
#### Slice AI.1
`servico FastAPI inicial`

Critero de pronto:
- servico separado exposto por API
- responsabilidades de IA ficam isoladas do app principal

#### Slice AI.2
`processamento assincrono`

Critero de pronto:
- fluxo de IA pesado pode rodar fora do request principal
- `Redis/queue` entra quando a carga justificar

#### Slice P.2
`visualizacao da agenda e historico permitido`

Critero de pronto:
- paciente visualiza informacoes liberadas
- regras de acesso respeitam permissao do terapeuta

#### Slice P.3
`solicitacao de agendamento`

Critero de pronto:
- paciente solicita horario dentre slots liberados
- solicitacao nao confirma automaticamente
- terapeuta precisa aprovar

## Primeiros fluxos fim-a-fim recomendados
1. `criar paciente -> agendar consulta -> enviar WhatsApp`
2. `paciente responde sim/nao -> atualizar consulta`
3. `registrar evolucao -> criar lancamento -> gerar recibo`
4. `gerar documento -> coletar assinatura simples`

## Itens que devem ficar bloqueados para depois
- multi-profissional
- secretaria
- portal do paciente
- IA por audio
- DSM completo
- assinatura avancada externa
- agentes
