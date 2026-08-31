# Brief para Proxima Spec: Dashboard, Financeiro e Planos de Cobranca

> Status: supersedido em 2026-08-27 por
> `docs/next-spec-prototype-front-reconstruction.md`. Este escopo foi incorporado
> ao inventario integral do prototipo e nao deve ser a proxima spec isolada.

Este brief foi preparado com a skill `specify-prompt-engineer` a partir das correcoes do prototipo Lovable, da revisao da spec `002-paciente-agenda-whatsapp` e da implementacao do slice paciente/financeiro inicial/agenda/WhatsApp em `apps/web`.

## Feature Intent
- Goal: transformar dashboard e financeiro em uma experiencia operacional navegavel, com lembretes clicaveis, filtros por periodo, cobrancas avulsas e planos de atendimento configuraveis.
- Primary actor: terapeuta/psicologo autonomo individual.
- Business value: reduzir cliques mortos no dashboard, conectar lembretes e metricas com a area correta do app, e preparar cobranca recorrente/pacotes sem espalhar regras financeiras pela anamnese.

## Market Research Notes
- Softwares de gestao para terapeutas geralmente agrupam agenda, financeiro, pagamentos e relatorios no mesmo produto; ferramentas como Theraflow destacam `recurring client billing plans`, enquanto plataformas brasileiras como GestaoPsico e Basal apresentam agenda, financeiro/cobrancas e relatorios integrados.
- Recomendacao de produto: manter `Planos` dentro de `Financeiro`, como aba ou subsecao de configuracao financeira, porque planos sao instrumentos de cobranca. Evitar criar uma area global separada cedo demais; ela pode virar item de navegacao depois se crescer.
- Fontes consultadas: Theraflow, GestaoPsico, Basal, PsiFlow e paginas de pricing/practice management de softwares de terapia/clinica.

## In Scope
- Dashboard com cards de resumo clicaveis:
  - Pacientes ativos -> lista de pacientes filtrada.
  - Sessoes hoje -> agenda em visao diaria.
  - Receita prevista -> financeiro mensal.
  - A receber/inadimplentes -> financeiro filtrado por pendentes/inadimplentes.
- Lembretes clicaveis no dashboard:
  - aniversario -> pagina do paciente em area/aba de contato.
  - financeiro -> financeiro com filtro adequado.
  - agenda/documentos/outros -> secao de destino correspondente.
- Grafico de linhas da home com seletor de periodo: semana, mes a mes, 3 meses, 6 meses e anual.
- Clique em ponto/bolinha do grafico redireciona para financeiro com filtros equivalentes via query params.
- Financeiro com filtro por periodo controlado por dropdown e refletido em query params.
- Area `Planos` dentro de `Financeiro` para cadastrar modelos de plano do terapeuta.
- Modal de gerar cobranca no paciente com 3 abas:
  - consulta avulsa
  - plano personalizado
  - planos cadastrados
- Plano personalizado com quantidade de meses, sessoes por mes, valor do plano e resumo mes a mes.
- Botao para salvar plano personalizado como modelo reutilizavel.
- Ao gerar cobranca, se o paciente nao tiver metodo/dados de pagamento cadastrados, redirecionar para a aba financeira do paciente para esse registro, controlando abertura/foco via query params.
- Remover da anamnese o campo `contrato terapeutico` dentro de "hipotese diagnostica e plano de saude/tratamento"; contrato pertence ao financeiro/pacote do paciente.
- Remover/evitar `gerenciar sessoes` nas configuracoes de seguranca do usuario neste momento; permitir login em qualquer dispositivo sem tela de gerenciamento de sessoes.
- Preservar backwards compatibility com dados financeiros e navegacao existentes.

## Constraints
- Usar decisoes atuais em `docs/`, `docs/handoff.md`, `docs/roadmap.md` e `specs/002-paciente-agenda-whatsapp/spec.md`.
- Considerar que o app ja tem rotas reais de paciente, financeiro inicial do paciente e agenda; preservar backwards compatibility com `PatientFinancialProfile`, `Appointment` e `NotificationAttempt`.
- Manter UI em portugues, continuidade visual do prototipo Lovable e design clinical calmo.
- Implementar comportamento real server-first quando for para producao; query params devem ser contratos de navegacao, filtros e abertura/foco de modal/aba.
- Revisar impactos em dashboard, paciente, financeiro, agenda, anamnese e configuracoes antes de implementar.
- Nao adicionar portal do paciente, multi-profissional, secretaria, IA ou automacao conversacional.
- Nao adicionar gerenciamento avancado de sessoes do usuario neste corte.

## Acceptance Shape
- Cards e lembretes do dashboard deixam de ser elementos passivos e levam o usuario para secoes filtradas corretas.
- Grafico da home e filtros do financeiro compartilham periodos via query params.
- Financeiro suporta modelos de plano cadastrados e plano personalizado com resumo mes a mes.
- Gerar cobranca exige dados de pagamento do paciente; se ausentes, o usuario e redirecionado para cadastro financeiro do paciente.
- Campo `contrato terapeutico` sai da anamnese e a responsabilidade de contrato/plano fica no financeiro.
- Fluxos existentes continuam funcionando com dados antigos ou incompletos sempre que possivel, exibindo orientacoes de completude em vez de quebrar telas.

## Out of Scope
- Integracao real com gateway de pagamento alem do contrato de fluxo/estado necessario.
- Recibo PDF completo.
- Assinatura de contrato/documento.
- Portal do paciente.
- Webhook de pagamento.
- Webhook de resposta WhatsApp `sim/nao`.
- Planos multi-profissional, secretaria ou repasse por profissional.

## Open Questions for Clarify
- O plano cadastrado deve pertencer apenas ao terapeuta ou tambem permitir variacao por paciente desde o inicio?
- Cobranca recorrente deve gerar parcelas/recebiveis futuros imediatamente ou apenas registrar o contrato/plano e deixar a geracao para depois?
- Quais metodos de pagamento entram primeiro: PIX, cartao, dinheiro, convenio, transferencia?
