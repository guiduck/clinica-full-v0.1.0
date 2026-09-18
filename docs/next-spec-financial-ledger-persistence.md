# Entrega Financeira: Ledger, Receita Prevista e Efetivação

> Brief preparado com `specify-prompt-engineer` em 2026-09-01 após o encerramento da feature 003. É o slice financeiro recomendado depois da persistência clínica, salvo repriorização explícita.

> Repriorizado e implementado em 2026-09-14 antes do aceite manual da feature
> 003. A implementação adotou receita prevista no agendamento, uma origem
> canônica por consulta, sem pagamentos parciais e com evento de auditoria para
> correções. Recibo PDF, Stripe e recorrência continuam fora deste corte.

## Feature Intent

- Goal: transformar valores hoje derivados de consultas em lançamentos persistentes e rastreáveis.
- Primary actor: profissional autônomo autenticado, dono dos pacientes, consultas e lançamentos.
- Business value: uma consulta com preço gera receita prevista; o profissional confirma o recebimento para compor o saldo realizado.

## In Scope

- criar uma receita `prevista` ao criar uma consulta elegível, vinculada à consulta, paciente, valor e meio de pagamento;
- garantir idempotência: uma consulta não pode gerar dois lançamentos canônicos;
- listar receitas/despesas previstas, efetivadas e canceladas em Financeiro e Previsibilidade;
- permitir efetivar, cancelar e corrigir data, descrição, categoria, valor e meio de pagamento com auditoria;
- criar receitas e despesas manuais sem consulta, mantendo a origem explícita;
- recalcular KPIs, tabelas, fluxo, saldo e categorias pela mesma fonte canônica;
- preservar histórico mínimo de status/correções;
- preparar receita efetivada como fonte para o futuro recibo PDF interno.

## Constraints

- Next.js server-first, Server Actions, services, Prisma e PostgreSQL em `apps/web`;
- autorização por proprietário em toda leitura e mutação;
- valores em centavos, datas visíveis `dd/mm/aaaa` e moeda BRL;
- consultas canceladas/remarcadas precisam de regra explícita para o lançamento;
- não simular Stripe, recibo PDF ou conciliação bancária;
- o protótipo guia UX, mas sua store em memória não é arquitetura de produção.

## Acceptance Shape

- criar consulta com perfil financeiro completo produz exatamente uma receita prevista;
- ela aparece em `A confirmar`, nos KPIs previstos e no mês correto;
- efetivar move o valor para realizado e atualiza todos os recortes;
- cancelar remove o valor dos totais ativos sem apagar histórico;
- repetir a requisição não duplica lançamento;
- outro usuário não consegue ler ou alterar o registro;
- testes provam idempotência, autorização e consistência dos cálculos.

## Out of Scope

- Stripe/checkout, webhooks bancários e conciliação automática;
- emissão final de recibo PDF e regras fiscais específicas;
- documentos clínicos, mensagens de cobrança e portal do paciente;
- parcelamento complexo e contabilidade multiempresa.

## Open Questions

- a receita nasce no agendamento ou após confirmação do paciente?
- cancelar/remarcar consulta cancela a receita automaticamente ou pede confirmação?
- haverá pagamentos parciais/múltiplos meios no primeiro corte?
- corrigir valor cria versão ou apenas evento de auditoria?
