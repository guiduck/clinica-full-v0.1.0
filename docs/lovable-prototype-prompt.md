# Lovable Prototype Prompt - clinica-full

```markdown
Title: Prototipo MVP Completo - clinica-full

Build a Lovable prototype for a complete therapist-facing SaaS called clinica-full.

Use the attached reference images from `/references/images` as the functional baseline. They already cover the required product flows: login, create account, dashboard, patient management, patient profile tabs, anamnese, SOAP clinical notes, agenda, finance, documents, document preview and scheduling/payment modals.

The UI/UX may be redesigned and improved, but all functional capabilities represented in the images and described below must be preserved or replaced by a better equivalent experience.

Product context:
- clinica-full is a web SaaS for autonomous therapists, psychologists and psychiatrists.
- The product centralizes clinical and administrative work: patients, agenda, clinical records, anamnese, finance, receipts, documents, prescriptions and notifications.
- The main user is an individual healthcare professional managing their own patients.
- Patient portal, multi-professional accounts, secretary/admin roles and AI automations are future scope.
- The product must feel calm, trustworthy, clinical, organized and modern, without looking like cold hospital enterprise software.

Primary users:
- Therapist / psychologist / psychiatrist working independently.
- The patient does not need a portal in the MVP, but appears as an entity managed by the professional.

Core product modules:
- Access and security
- Dashboard
- Patients / clinical CRM
- Patient profile
- Anamnese
- Clinical record / SOAP evolution
- Agenda
- Notifications
- Finance
- Receipts
- Documents, reports, referrals and prescriptions
- Signature flow
- Basic LGPD and audit awareness

Required screens:

1. Authentication
- Login screen with e-mail, password, show/hide password, remember me, forgot password and primary login button.
- Create account screen with full name, e-mail, password, mandatory Terms of Use and Privacy Policy acceptance.
- Include a possible Google login option as secondary auth path.
- Include password recovery flow.
- Include visual placeholder for 2FA verification as an account security feature.
- Private app layout after login.

2. Main app shell
- Persistent left sidebar on desktop with:
  - Dashboard
  - Pacientes
  - Agenda
  - Financeiro
  - Sair
- Top bar with notifications, current user avatar/name and account menu.
- Mobile layout must collapse into a bottom navigation or compact drawer with large touch targets.
- Use clear active navigation states.

3. Dashboard
- Summary cards:
  - Pacientes Ativos
  - Sessoes Hoje
  - Receita Prevista do Mes
  - Saldo Pendente / Inadimplencia
- Summary cards must be clickable:
  - Pacientes Ativos links to Patients filtered to active patients
  - Sessoes Hoje links to Agenda filtered to today's daily view
  - Receita Prevista do Mes links to Financeiro filtered to the current month
  - Saldo Pendente / Inadimplencia links to Financeiro filtered to pending/overdue receivables
- Section for Proximos Atendimentos with time, patient, status and quick action.
- Section for Lembretes:
  - pagamentos pendentes
  - aniversarios
  - documentos pendentes de assinatura
  - lembretes de consulta
- Lembretes must be clickable and route to the relevant workflow:
  - birthday reminders open the patient's page in a contact/action area where the professional can send a message
  - financial reminders open Financeiro with the matching filter
  - agenda/document/document reminders open their corresponding section
- Empty states must guide the next action.
- Provide quick CTAs:
  - Novo Paciente
  - Novo Agendamento
  - Ver Agenda Completa
  - Registrar Pagamento
- The dashboard line chart must support period views: semana, mes a mes, 3 meses, 6 meses and anual.
- Clicking a chart point/tooltip must navigate to Financeiro with equivalent period filters encoded in query params.

4. Patients / Gestao de Carteira
- Search by name, CPF, e-mail or phone.
- Filters:
  - Todos
  - Ativos
  - Lista de Espera
  - Em Alta
  - Inativos
- Patient table/card list with:
  - initials/avatar
  - name
  - e-mail/phone
  - status and tags
  - last appointment
  - quick actions
- Quick actions:
  - open/start session
  - send WhatsApp
  - open finance
  - edit
  - archive/delete with confirmation
- Add "Novo Paciente" button.
- Improve the reference prototype by replacing icon-only ambiguity with accessible labels/tooltips and clearer spacing.

5. New / edit patient
- Form sections:
  - Dados pessoais
  - Contato
  - Endereco
  - Convenio / indicacao
  - Queixa principal / motivo da busca
  - Tags and status
  - Consentimento para comunicacao via WhatsApp/e-mail
- Add an extra save action: "Salvar e ir para o financeiro". After creating the patient, it redirects to that patient's Financeiro tab and opens/focuses the payment data setup via query params.
- Use progressive disclosure and validation messages.
- Prevent accidental data loss when leaving with unsaved changes.

6. Patient profile
Use tab navigation exactly covering:
- Geral
- Anamnese
- Prontuario
- Financeiro
- Documentos
- Agenda

Geral tab:
- Patient name, status, back button and archive/delete action.
- Contact and identification card.
- Address card.
- Main complaint / reason for seeking care.
- Important notes and consent indicators.

7. Anamnese tab
Create a structured, editable anamnese with accordion sections:
- Historico da Queixa (HDA)
- Historico Pessoal e Desenvolvimento
- Dinamica Familiar e Social
- Habitos e Estilo de Vida
- Exame do Estado Mental (EEM)
- Hipotese Diagnostica e Plano Terapeutico

Fields must include:
- descricao detalhada
- fatores precipitantes
- tentativas previas
- infancia e adolescencia
- historico medico
- historico medicamentoso
- configuracao familiar
- rede de apoio
- lazer e espiritualidade
- sono
- alimentacao
- atividade fisica
- substancias: alcool, tabaco e drogas
- aparencia
- atitude
- consciencia
- afeto
- pensamento
- impressao diagnostica inicial CID-11 / DSM-5
- objetivos do tratamento

Do not include a "contrato terapeutico" field in Anamnese. Contract/payment-plan information belongs in the patient's Financeiro area.

UX improvements:
- Add completion progress per section.
- Add autosave status: "Salvo agora", "Salvando...", "Erro ao salvar".
- Long forms must be calm, grouped and easy to scan.
- Use sticky "Salvar Anamnese" on large forms.

8. Prontuario / Evolucao SOAP
- Show chronological session history.
- Empty state: "Nenhuma evolucao registrada" with CTA "Criar primeira evolucao".
- New evolution screen/form:
  - date and time
  - mood from 1 to 10
  - S - Subjetivo
  - O - Objetivo
  - A - Avaliacao
  - P - Plano
- Use distinct but subtle color bands for SOAP sections.
- Add link between agenda appointment and evolution when applicable.
- Include manual CID/DSM field only; do not create full DSM criteria or copyrighted diagnostic content.
- Clinical notes should visually communicate privacy and strong protection.

9. Global agenda
- Views:
  - Dia
  - Semana
  - Mes
- Weekly grid like the reference prototype, improved for readability.
- Navigation by period and "Hoje" button.
- New appointment CTA.
- Appointment blocks with patient, time, status and color-coded state.
- Support:
  - create appointment
  - edit appointment
  - cancel/delete appointment
  - reschedule
  - recurring weekly session
  - fixed patient time
  - paid session checkbox
  - unavailable time blocks: lunch, holidays, vacation, blocked time
  - prevent scheduling conflicts

Appointment modal:
- type
- patient
- date
- start time
- end time
- status
- recurrence checkbox
- paid checkbox
- video call link
- cancel/save actions

Appointment detail modal:
- patient name
- date/time
- status
- iniciar sessao / prontuario
- link da videochamada
- enviar lembrete por WhatsApp
- editar
- excluir/cancelar

Statuses:
- agendado
- confirmado
- realizado
- falta
- cancelado
- remarcado
- pendente
- recusado

10. Patient agenda tab
- Fixed schedule card.
- Configure recurring schedule.
- Upcoming sessions list.
- Past sessions list.
- Session status chips.
- CTA: Agendar Sessao.

11. Notifications
Represent notification behavior in the UI:
- automatic WhatsApp reminder when appointment is created
- reminder one day before appointment
- manual WhatsApp send from patient/session
- status of send: sent, failed, pending
- patient response: sim, nao, sem resposta
- opt-in indicator for communication
- internal alerts in dashboard

Do not create full WhatsApp conversation automation. MVP uses simple transactional WhatsApp confirmations.

12. Financeiro global
- Summary cards:
  - Receitas do mes
  - Despesas do mes
  - Saldo do mes
  - Inadimplencia
- Buttons:
  - Emitir Recibo
  - Nova Despesa
  - Nova Receita
- Tabs/sections:
  - Lancamentos
  - Configuracoes
- Table with:
  - date
  - description
  - type
  - status
  - value
  - edit action
- Support receita and despesa.
- Payment methods:
  - dinheiro
  - PIX
  - cartao
  - convenio
- Status:
  - pago
  - pendente
  - em aberto
  - inadimplente
- Include basic cash-flow view and simple financial report placeholder.
- Add a period filter dropdown controlled by query params. It must support at least semana, mes a mes, 3 meses, 6 meses and anual, matching the dashboard chart options.
- Add a `Planos` tab/subsection inside Financeiro for reusable billing/treatment plan templates. This is preferred over a separate main navigation item while the product is still focused on an individual professional.
- Plan templates should support number of sessions per month, number of months, total/monthly value and an active/inactive state.

13. Patient finance tab
- Historico financeiro.
- Total pago.
- Em aberto.
- Novo lancamento.
- Gerar recibo.
- List date, description, status, value and edit action.

New revenue/expense modal:
- description
- value
- date
- category
- status
- payment method
- optional patient link
- optional appointment link
- cancel/save
- validation states

Generate charge modal from the patient context:
- If the patient does not have payment data registered, redirect to the patient's Financeiro tab to complete that data instead of embedding payment-data fields in the charge modal.
- Use three tabs:
  - Consulta avulsa
  - Plano personalizado
  - Planos cadastrados
- In Plano personalizado, allow choosing duration in months, sessions per month and plan value, with a clear month-by-month summary.
- Include a button to save the custom plan as a reusable plan template.
- In Planos cadastrados, allow selecting from templates configured in Financeiro > Planos.
- Keep backwards compatibility with existing simple charge/session flows.

14. Receipts
- Generate receipt PDF from a paid financial entry.
- Receipt must include:
  - professional data
  - patient data
  - service
  - value
  - date
  - payment method
  - identifier/receipt number
- Receipt can be downloaded/shared.
- Keep receipt history.
- Make clear that Stripe/payment provider receipt is not enough; the app generates its own healthcare receipt PDF.

15. Documents and prescriptions
Documents tab must include:
- quick models:
  - Atestado
  - Laudo
  - Encaminhamento
  - Receituario
  - Pedido de exame
- Upload area:
  - PDF, JPG, PNG
  - file size limit indication
  - recent files list
- Generated document editor:
  - patient data auto-filled
  - date auto-filled
  - editable text before saving/exporting
  - preview mode similar to a PDF page
  - save to patient repository
  - print/export PDF
- Dashboard alert for documents pending signature.

16. Signature flow
- Add simple in-app signature modal.
- User can draw signature on canvas.
- Capture and display evidence metadata:
  - timestamp
  - IP placeholder
  - session id placeholder
  - signed by
  - document version
- Apply signature to PDF preview.
- Label this as "assinatura eletronica simples com evidencias".
- Do not claim advanced, qualified or ICP-Brasil equivalence by default.
- Mention ICP-Brasil/provider integration only as future/advanced option.

17. Security, LGPD and audit screens/placeholders
Add lightweight settings/security area or account menu with:
- terms acceptance record
- privacy policy
- communication consent
- 2FA setup placeholder
- export data placeholder
- delete/archive policy placeholder
- audit log placeholder for sensitive actions

Do not include session management in the MVP security settings. The user may log in from any device for now.

Design direction:
- Calm clinical admin software.
- Trustworthy, organized, high-legibility.
- Subtle warmth, not cold enterprise.
- Avoid flashy startup gradients, excessive glassmorphism and decorative complexity.
- Use generous whitespace, consistent cards, clear status chips and readable tables.
- Make dense clinical forms feel less heavy through grouping, accordions, sticky actions and contextual helper text.
- Use Portuguese labels throughout the interface.

Design tokens:
- bg.canvas: #F7F9FB
- bg.surface: #FFFFFF
- bg.subtle: #EEF4F7
- text.primary: #102033
- text.secondary: #5B6B7A
- text.muted: #8A97A3
- border.default: #DCE5EA
- brand.primary: #0F766E
- brand.primaryHover: #0B5F59
- brand.secondary: #2563EB
- brand.soft: #DFF5F1
- accent.warm: #F6E7D8
- status.success: #16A34A
- status.warning: #D97706
- status.danger: #DC2626
- status.info: #2563EB
- status.neutral: #64748B

Typography:
- Use Inter or Plus Jakarta Sans.
- H1: clamp(2rem, 4vw, 3rem), 700
- H2: clamp(1.5rem, 3vw, 2.25rem), 700
- H3/card titles: 1rem to 1.25rem, 600
- Body: 0.95rem to 1rem, high legibility
- Tables and form labels must remain readable.

Spacing:
- Page padding desktop: 32px to 40px
- Page padding mobile: 16px
- Card padding: 20px to 28px
- Form gap: 16px
- Section gap: 24px to 32px
- Radius:
  - cards: 16px
  - buttons: 10px or pill for primary CTAs
  - inputs: 10px
- Elevation:
  - subtle card shadow only
  - avoid heavy shadows

UX requirements:
- Mobile-first and responsive.
- Touch targets at least 44px.
- Clear focus states.
- Accessible labels for all fields.
- Tooltips or text labels for icon actions.
- Visible feedback for save, error, upload, PDF generation and WhatsApp send.
- Empty states should explain what happened and offer one next action.
- Destructive actions require confirmation.
- Long clinical forms should have progress, sections and save state.
- Tables should adapt to mobile as stacked cards.
- Avoid hidden critical actions.

Prototype data:
Use realistic mock data:
- Patients: Ana Silva, Beatriz Costa, Carlos Santos.
- Include statuses: Ativo, Lista de Espera, Em Alta, Inativo.
- Include appointments, paid and pending financial entries, documents and receipts.
- Remove any "Gerar dados ficticios" development-only button from the final user-facing prototype. Mock data can exist directly in the prototype.

Constraints:
- Build as a polished interactive prototype, not just static screens.
- Use React + TypeScript + Tailwind-style components if Lovable generates code.
- Prefer shadcn/ui-like components: cards, buttons, tabs, dialogs, dropdowns, accordions, tables, forms, badges.
- No real backend integration required.
- No real payment integration required.
- No real WhatsApp integration required; represent states and flows visually.
- No real PDF generation required; provide realistic PDF preview screens and actions.
- No copyrighted DSM criteria or full DSM content.
- Use CID/DSM only as manual/reference fields in the prototype.
- Keep the MVP focused on one professional account.

Out of scope:
- Patient portal login.
- Multi-professional clinic management.
- Secretary/admin roles.
- Full AI automation.
- Audio transcription.
- Autonomous WhatsApp agent.
- Full E2EE implementation.
- Advanced legal signature provider integration.
- Complete DSM database.

Expected outcome:
Create a complete, navigable, polished web app prototype for clinica-full that improves the reference UI while preserving all required modules and flows. The result should feel like a serious MVP ready for user validation with therapists and psychologists.
```
