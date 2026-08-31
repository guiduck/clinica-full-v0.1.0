# Brief para Proxima Spec: Reconstrucao Integral do Front do Prototipo

Este brief foi preparado com a skill `specify-prompt-engineer` a partir do pedido
de reconstruir o frontend de producao com fidelidade ao prototipo Lovable atualizado,
do inventario em `docs/prototype-feature-inventory.md` e do estado atual do app em
`apps/web`.

Baseline visual e funcional: `references/clinica-full` no commit
`226e5ab6811c5dce717fa12b404370b4fbb2663e`.

## Feature Intent

- Goal: substituir o frontend parcial atual por uma reproducao integral e responsiva
  da experiencia do prototipo, preservando navegacao, hierarquia, textos, campos,
  ordem, estados e interacoes, com os padroes de arquitetura de producao.
- Primary actor: terapeuta ou psicologo autonomo individual.
- Business value: disponibilizar cedo a experiencia ja validada no prototipo,
  reduzir retrabalho visual e conectar services/banco progressivamente.

## In Scope

- Reconstruir shell, navegacao responsiva, notificacoes, menus, onboarding e estados
  globais observados no prototipo.
- Reconstruir login, criacao de conta, recuperacao de senha, dashboard, pacientes,
  perfil do paciente, agenda, financeiro, previsibilidade e configuracoes.
- Cobrir abas e dialogs de `docs/prototype-feature-inventory.md`.
- Reproduzir ordem, labels, controles, estados vazios, feedbacks, confirmacoes,
  filtros, query params, modais, sheets, tabelas e comportamento mobile.
- Manter fluxos reais atuais de auth, pacientes, financeiro inicial, agenda e
  tentativa de WhatsApp quando compativeis com a nova UI.
- Integrar services existentes. Onde nao houver service, manter o controle visual e
  informar que a acao ainda nao foi implementada, sem sucesso ou persistencia falsos.
- Criar matriz de paridade por rota/fluxo em desktop e mobile.
- Entregar validacao funcional desde o primeiro corte da nova interface.

## Requisitos de Paridade

- A baseline e fonte de verdade para aparencia, copy, navegacao, ordem e comportamento.
- Agenda reproduz Dia/Semana/Mes, navegacao, grade, criacao, detalhe, edicao,
  remarcacao, bloqueios e estados vazios.
- Cadastro reproduz wizard de duas etapas, secoes, campos condicionais, accordions,
  consentimentos e etapa financeira.
- Dashboard reproduz acoes rapidas, atendimentos, lembretes, graficos, privacidade de
  valores, mensagens programadas e resumo clicavel.
- Perfil possui Geral, Anamnese, Agenda, Prontuario, Financeiro e Documentos.
- Financeiro/Previsibilidade reproduzem filtros, KPIs, tabelas, graficos, recibos,
  categorias, lancamentos, planos e estados.
- Configuracoes reproduz Conta, Contato/endereco, Planos, Mensagens e Seguranca.
- Divergencia exige justificativa por seguranca, LGPD, acessibilidade, arquitetura
  production-ready ou decisao explicita de produto.

## Formularios e Validacoes

- Zod como fonte unica dos schemas no cliente e servidor.
- Validacao no campo e no envio, em portugues, sem apagar valores.
- Mascaras durante digitacao com cursor/edicao previsiveis.
- CPF com mascara e digitos verificadores; rejeitar invalidos e repetidos.
- CNPJ, telefone, CEP, e-mail, moeda, datas e horarios reutilizaveis por dominio.
- Datas sempre em `dd/mm/aaaa`, nunca `mm/dd/yyyy`.
- Horarios em 24 horas e valores em `pt-BR`/BRL.
- Armazenamento canonico com conversao explicita, testada e sem ambiguidade.
- Obrigatorios/opcionais/condicionais seguem o inventario.
- Paciente exige nome, CPF, nascimento, e-mail e telefone; endereco e emergencia sao
  opcionais e validados quando preenchidos.
- Financeiro exige modelo/metodo; Avulso exige valor, Plano exige modelo e Cartao
  exige parcelamento valido quando selecionado.

## Padrao de Arquitetura Obrigatorio

- Paginas pequenas, focadas em composicao e orquestracao.
- Componentes por dominio/responsabilidade; evitar paginas monoliticas.
- Hooks para estado e comportamento interativo complexo/reutilizavel.
- Listas, labels, configuracoes e metadados em `constants.ts` proximos do dominio.
- Pastas separadas e reutilizaveis para `formatters`, `validators` e `masks`.
- Validadores exportam schema Zod, resolver aplicavel e tipos derivados.
- Formatadores, mascaras, normalizadores e calculos sao funcoes puras,
  deterministicas, imutaveis e testaveis.
- Efeitos ficam em actions, services, adapters e hooks de integracao.
- Estados derivados nao sao duplicados em varios `useState`.
- Preservar Server Components, server actions, services, Prisma e cache/revalidacao.
- Nao copiar store monolitica, mocks, `localStorage`, constantes de pagina ou utils
  espalhadas do prototipo.

## Integracoes Ainda Nao Implementadas

- Reutilizar auth, sessao, pacientes, perfil financeiro, agenda e notificacao atuais.
- Para prontuario, documentos, assinatura, recibos, cobranca, automacoes e webhooks
  ausentes, renderizar a experiencia apenas com fontes reais permitidas.
- Acao sem backend exibe aviso contextual de funcionalidade ainda nao implementada.
- Nao usar toast de sucesso, mutacao local enganosa ou persistencia mock.
- Inventariar cada placeholder para substituicao em slices posteriores.

## Qualidade e Testes de Aceitacao

- Unitarios para formatters, masks, schemas, normalizadores e calculos.
- Formularios cobrem obrigatorios, opcionais, condicionais e erros.
- Casos de CPF, datas brasileiras, nascimento futuro, telefone, CEP, moeda e parcelas.
- Navegacao/interacao para fluxos principais de cada rota.
- Comparacao visual desktop/mobile para telas e estados principais.
- Nenhuma tela apresenta `mm/dd/yyyy`.
- Sem sobreposicao, corte ou mudanca acidental de ordem/hierarquia.
- Lint, typecheck, testes e build verdes.
- Testes dependentes da data usam relogio controlado ou datas relativas.

## Acceptance Shape

- Usuario reconhece a mesma experiencia do prototipo em desktop e mobile.
- Rotas, abas, dialogs e estados do inventario estao presentes ou tem divergencia
  documentada/aprovada.
- Cadastro rejeita CPF invalido e usa datas brasileiras.
- Agenda provisoria vira o calendario completo do prototipo.
- Paginas nao concentram constantes, schemas, masks, formatters e todo estado.
- Acoes com backend pronto usam os services reais.
- Acoes sem backend informam indisponibilidade honestamente.
- Matriz de paridade visual/funcional completa e aprovada.

## Dependencies

- `docs/prototype-feature-inventory.md`.
- `docs/lovable-prototype-prompt.md`.
- `docs/project-overview.md`, `docs/roadmap.md` e `docs/handoff.md`.
- `specs/002-paciente-agenda-whatsapp/`.
- Prototipo no commit de baseline e material em `references/images`.

## Out of Scope

- Copiar a arquitetura interna do prototipo.
- Substituir todos os placeholders por novas integracoes reais nesta spec.
- Portal do paciente, multi-profissional, secretaria ou IA.
- 2FA, assinatura avancada externa ou catalogo DSM/CID.
- Alterar modelo de negocio ou anunciar recursos simulados como prontos.
- Redesign autoral que descaracterize a baseline.

## Assumptions

- MVP continua para um profissional autonomo por conta.
- Front completo pode preceder services se os estados nao mentirem sobre persistencia.
- Baseline fica congelada durante a spec; mudancas novas exigem comparacao/decisao.
- Query params representam aba, periodo, filtro e abertura contextual quando aplicavel.
- Landing page sera tratada depois conforme inventario e status real dos recursos.

## Prompt Pronto para `/speckit.specify`

```text
Reconstruir integralmente o frontend autenticado e os fluxos publicos da Clinica
Agil com paridade visual e funcional ao prototipo Lovable em
references/clinica-full, congelado no commit
226e5ab6811c5dce717fa12b404370b4fbb2663e. Cobrir shell responsivo, onboarding,
auth, dashboard, pacientes e seu wizard/perfil completo, agenda dia/semana/mes,
prontuario, financeiro/previsibilidade, documentos, mensagens e configuracoes,
seguindo campos, ordem, labels, estados, dialogs, filtros e interacoes inventariados
em docs/prototype-feature-inventory.md.

A fidelidade ao prototipo e criterio de aceite em desktop e mobile. Divergencias so
podem ocorrer por seguranca, LGPD, acessibilidade, arquitetura production-ready ou
decisao explicita documentada. A agenda atual deve ser substituida pelo calendario
completo do prototipo, incluindo navegacao temporal, modos dia/semana/mes, criacao,
detalhe, edicao, remarcacao, bloqueios e estados vazios.

Todos os formularios devem nascer funcionais: schemas Zod compartilhados entre
cliente e servidor, validacao de CPF pelos digitos verificadores, mascaras de CPF,
CNPJ, telefone e CEP, moeda pt-BR, horarios de 24 horas e datas sempre visiveis e
editaveis em dd/mm/aaaa, nunca mm/dd/yyyy. Respeitar campos obrigatorios, opcionais
e condicionais descritos no inventario.

Estabelecer como padrao paginas pequenas e focadas em composicao, componentes por
dominio, hooks para estado/interacao complexa, constants.ts para listas fixas, e
pastas separadas para formatters, validators e masks. Helpers deterministicos seguem
programacao funcional, com funcoes puras, imutabilidade, tipos derivados dos schemas
e efeitos isolados em actions, services, adapters e hooks. Nao copiar store
monolitica, mocks, localStorage, constantes em paginas ou utils espalhadas.

Integrar services reais ja existentes para auth, pacientes, financeiro inicial,
agenda e tentativa de WhatsApp. Para controles cujo backend ainda nao exista,
manter a experiencia visual, mas exibir aviso explicito de funcionalidade ainda nao
implementada, sem sucesso falso ou persistencia mock. Criar matriz de paridade por
rota/fluxo, testes unitarios de schemas/masks/formatters, testes de formularios e
verificacao visual responsiva. Corrigir testes dependentes da passagem do tempo para
que lint, typecheck, testes e build permaneçam verdes.

Manter fora do escopo portal do paciente, multi-profissional, secretaria, IA, 2FA,
assinatura avancada externa, catalogo DSM/CID e integracoes completas novas que nao
sejam necessarias para conectar services ja implementados.
```

