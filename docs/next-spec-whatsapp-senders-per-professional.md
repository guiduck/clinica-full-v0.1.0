# Próxima Spec — WhatsApp Sender próprio por profissional

Create a feature specification for onboarding e roteamento de um WhatsApp Sender próprio por profissional na clinica-full.

Primary user: profissional autônomo individual.
Goal: permitir que mensagens e respostas apareçam no número/marca do próprio consultório, eliminando a ambiguidade do sender global sem introduzir conta multi-profissional.

In scope:
- conectar ou registrar um número Twilio ou não-Twilio como WhatsApp Sender do profissional;
- guardar somente referências e credenciais cifradas necessárias, isoladas pelo proprietário;
- mostrar estado de onboarding, verificação Meta, templates e capacidade de envio;
- escolher o sender correto no worker e rotear webhooks inbound/status ao profissional correto;
- migrar gradualmente profissionais do sender global, preservando histórico e mensagens pendentes;
- permitir desconexão/revogação segura e auditoria mínima;
- suportar templates aprovados para confirmação e lembrete fora da janela de 24 horas.

Constraints:
- manter o MVP com um único profissional por conta;
- manter PostgreSQL como fonte durável, BullMQ/Redis como transporte e o worker existente;
- respeitar consentimento, LGPD, isolamento de tenant e assinatura de webhook Twilio;
- não armazenar Auth Token em texto aberto;
- não prometer envio livre fora da janela de atendimento do WhatsApp;
- sender global continua como fallback controlado durante rollout, nunca silenciosamente.

Integrations:
- Twilio WhatsApp Self Sign-up/Senders API;
- programa Meta/Twilio Tech Provider ou Embedded Signup quando necessário para SaaS;
- subcontas Twilio somente se o plano definir isolamento operacional e cobrança por cliente.

Acceptance expectations:
- dois profissionais com pacientes de mesmo telefone recebem respostas na inbox correta;
- cada envio registra sender, conta/subconta e provider message ID usados;
- falha de onboarding ou template aparece de forma acionável sem perder mensagem;
- rotação/revogação de credenciais não expõe segredos nem quebra histórico;
- testes cobrem autorização, assinatura do webhook, isolamento e migração do sender global.

Out of scope:
- conta multi-profissional, secretaria e portal do paciente;
- chatbot/IA e automações clínicas;
- migração automática de um número já ativo em outro BSP sem fluxo suportado pela Twilio/Meta.

Open questions:
- clinica-full pagará centralmente a Twilio ou cada profissional conectará sua própria conta?
- o primeiro rollout usará subconta gerenciada por profissional ou credenciais próprias conectadas?
- quais templates transacionais serão submetidos primeiro à aprovação Meta?
