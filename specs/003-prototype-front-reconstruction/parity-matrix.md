# Matriz de Paridade — Reconstrução Integral do Frontend

**Baseline verificada**: `references/clinica-full` em `226e5ab6811c5dce717fa12b404370b4fbb2663e`  
**Data da verificação**: 2026-08-31  
**Viewports fixos**: desktop `1440x900`; mobile `390x844`  
**Contrato**: [page-parity.md](./contracts/page-parity.md)

Uma página ou aba só substitui a implementação atual quando todas as suas linhas deixam `pending`. Evidências apontam para screenshot e teste. Divergências exigem justificativa, responsável e data.

## Checkpoint de evidência funcional — 2026-08-31

`apps/web/tests/e2e/product-pages.spec.ts` cobre em ambos os viewports a criação
real de paciente, wizard, perfil, Anamnese, Prontuário, documentos/preview/
assinatura, Agenda, Financeiro, Previsibilidade e Configurações. Screenshots ficam
em `output/playwright/evidence`. A suíte integral de 2026-08-31 encerrou com 17
cenários aprovados e 2 mutações reais puladas intencionalmente no projeto mobile.
Essa jornada comprova disponibilidade e
responsividade das superfícies, mas não decide automaticamente linhas granulares:
resultados abaixo permanecem `pending` até a evidência específica e a revisão
exigida pelo contrato.

| Página | Fluxo/estado | Viewport | Referência | Evidência | Capacidade | Resultado | Justificativa | Aprovação |
|---|---|---|---|---|---|---|---|---|
| shared-foundation | tokens | desktop | `references/clinica-full/src/styles.css` | pending | real | pending | — | — |
| shared-foundation | tokens | mobile | `references/clinica-full/src/styles.css` | pending | real | pending | — | — |
| shared-foundation | responsive-container | desktop | `references/clinica-full/src/styles.css` | pending | real | pending | — | — |
| shared-foundation | responsive-container | mobile | `references/clinica-full/src/styles.css` | pending | real | pending | — | — |
| shared-foundation | focus-touch | desktop | `references/clinica-full/src/styles.css` | pending | real | pending | — | — |
| shared-foundation | focus-touch | mobile | `references/clinica-full/src/styles.css` | pending | real | pending | — | — |
| shared-foundation | states | desktop | `references/clinica-full/src/styles.css` | pending | real | pending | — | — |
| shared-foundation | states | mobile | `references/clinica-full/src/styles.css` | pending | real | pending | — | — |
| login | composition | desktop | `references/clinica-full/src/routes/login.tsx` | `login.spec.ts` | real | equivalent | — | — |
| login | composition | mobile | `references/clinica-full/src/routes/login.tsx` | `login.spec.ts` | real | equivalent | — | — |
| login | credentials | desktop | `references/clinica-full/src/routes/login.tsx` | `login.spec.ts` real DB boundary | real | equivalent | — | — |
| login | credentials | mobile | `references/clinica-full/src/routes/login.tsx` | `login.spec.ts` responsive form + desktop real boundary | real | equivalent | — | — |
| login | password-visibility | desktop | `references/clinica-full/src/routes/login.tsx` | `login.spec.ts` | real | equivalent | — | — |
| login | password-visibility | mobile | `references/clinica-full/src/routes/login.tsx` | `login.spec.ts` | real | equivalent | — | — |
| login | keep-connected | desktop | `references/clinica-full/src/routes/login.tsx` | `login.spec.ts` | real | equivalent | — | — |
| login | keep-connected | mobile | `references/clinica-full/src/routes/login.tsx` | `login.spec.ts` | real | equivalent | — | — |
| login | validation | desktop | `references/clinica-full/src/routes/login.tsx` | `login.spec.ts` + `login-form.test.tsx` | real | equivalent | — | — |
| login | validation | mobile | `references/clinica-full/src/routes/login.tsx` | `login.spec.ts` + `login-form.test.tsx` | real | equivalent | — | — |
| login | pending-submit | desktop | `references/clinica-full/src/routes/login.tsx` | `login-form.test.tsx` | real | equivalent | — | — |
| login | pending-submit | mobile | `references/clinica-full/src/routes/login.tsx` | `login-form.test.tsx` | real | equivalent | — | — |
| login | google-unavailable | desktop | `references/clinica-full/src/routes/login.tsx` | `login.spec.ts` + `capability-notice.test.tsx` | unavailable | unavailable-capability | Integração Google ausente; controle permanece visível e não autentica. | — |
| login | google-unavailable | mobile | `references/clinica-full/src/routes/login.tsx` | `login.spec.ts` + `capability-notice.test.tsx` | unavailable | unavailable-capability | Integração Google ausente; controle permanece visível e não autentica. | — |
| login | navigation | desktop | `references/clinica-full/src/routes/login.tsx` | `login.spec.ts` | real | equivalent | — | — |
| login | navigation | mobile | `references/clinica-full/src/routes/login.tsx` | `login.spec.ts` | real | equivalent | — | — |
| register | composition | desktop | `references/clinica-full/src/routes/criar-conta.tsx` | `register.spec.ts` | real | equivalent | — | — |
| register | composition | mobile | `references/clinica-full/src/routes/criar-conta.tsx` | `register.spec.ts` | real | equivalent | — | — |
| register | identity-fields | desktop | `references/clinica-full/src/routes/criar-conta.tsx` | `register.spec.ts` real DB boundary | real | equivalent | — | — |
| register | identity-fields | mobile | `references/clinica-full/src/routes/criar-conta.tsx` | `register.spec.ts` responsive form + desktop real boundary | real | equivalent | — | — |
| register | cpf-validation | desktop | `references/clinica-full/src/routes/criar-conta.tsx` | `register.spec.ts` + `register-form.test.tsx` | real | equivalent | — | — |
| register | cpf-validation | mobile | `references/clinica-full/src/routes/criar-conta.tsx` | `register.spec.ts` + `register-form.test.tsx` | real | equivalent | — | — |
| register | password | desktop | `references/clinica-full/src/routes/criar-conta.tsx` | `register.spec.ts` | real | equivalent | — | — |
| register | password | mobile | `references/clinica-full/src/routes/criar-conta.tsx` | `register.spec.ts` | real | equivalent | — | — |
| register | terms | desktop | `references/clinica-full/src/routes/criar-conta.tsx` | `register.spec.ts` | real | equivalent | — | — |
| register | terms | mobile | `references/clinica-full/src/routes/criar-conta.tsx` | `register.spec.ts` | real | equivalent | — | — |
| register | validation | desktop | `references/clinica-full/src/routes/criar-conta.tsx` | `register.spec.ts` + `register-form.test.tsx` | real | equivalent | — | — |
| register | validation | mobile | `references/clinica-full/src/routes/criar-conta.tsx` | `register.spec.ts` + `register-form.test.tsx` | real | equivalent | — | — |
| register | pending-submit | desktop | `references/clinica-full/src/routes/criar-conta.tsx` | `register-form.test.tsx` | real | equivalent | — | — |
| register | pending-submit | mobile | `references/clinica-full/src/routes/criar-conta.tsx` | `register-form.test.tsx` | real | equivalent | — | — |
| register | navigation | desktop | `references/clinica-full/src/routes/criar-conta.tsx` | `register.spec.ts` | real | equivalent | — | — |
| register | navigation | mobile | `references/clinica-full/src/routes/criar-conta.tsx` | `register.spec.ts` | real | equivalent | — | — |
| password-recovery | composition | desktop | `references/clinica-full/src/routes/recuperar-senha.tsx` | `password-recovery.spec.ts` | unavailable | equivalent | — | — |
| password-recovery | composition | mobile | `references/clinica-full/src/routes/recuperar-senha.tsx` | `password-recovery.spec.ts` | unavailable | equivalent | — | — |
| password-recovery | email | desktop | `references/clinica-full/src/routes/recuperar-senha.tsx` | `password-recovery.spec.ts` | unavailable | equivalent | — | — |
| password-recovery | email | mobile | `references/clinica-full/src/routes/recuperar-senha.tsx` | `password-recovery.spec.ts` | unavailable | equivalent | — | — |
| password-recovery | validation | desktop | `references/clinica-full/src/routes/recuperar-senha.tsx` | `password-recovery.spec.ts` + `password-recovery-form.test.tsx` | unavailable | equivalent | — | — |
| password-recovery | validation | mobile | `references/clinica-full/src/routes/recuperar-senha.tsx` | `password-recovery.spec.ts` + `password-recovery-form.test.tsx` | unavailable | equivalent | — | — |
| password-recovery | unavailable-notice | desktop | `references/clinica-full/src/routes/recuperar-senha.tsx` | `password-recovery.spec.ts` | unavailable | unavailable-capability | Serviço de recuperação ausente; nenhum link ou sucesso é simulado. | — |
| password-recovery | unavailable-notice | mobile | `references/clinica-full/src/routes/recuperar-senha.tsx` | `password-recovery.spec.ts` | unavailable | unavailable-capability | Serviço de recuperação ausente; nenhum link ou sucesso é simulado. | — |
| password-recovery | focus-return | desktop | `references/clinica-full/src/routes/recuperar-senha.tsx` | `password-recovery.spec.ts` | unavailable | equivalent | — | — |
| password-recovery | focus-return | mobile | `references/clinica-full/src/routes/recuperar-senha.tsx` | `password-recovery.spec.ts` | unavailable | equivalent | — | — |
| password-recovery | navigation | desktop | `references/clinica-full/src/routes/recuperar-senha.tsx` | `password-recovery.spec.ts` | unavailable | equivalent | — | — |
| password-recovery | navigation | mobile | `references/clinica-full/src/routes/recuperar-senha.tsx` | `password-recovery.spec.ts` | unavailable | equivalent | — | — |
| app-shell | desktop-sidebar | desktop | `references/clinica-full/src/components/AppShell.tsx` | `app-shell.spec.ts` + `app-shell-onboarding.test.tsx` | real | equivalent | Rail compacto e Sheet sobreposto reproduzidos com shadcn/Radix. | product-owner direction 2026-08-27 |
| app-shell | desktop-sidebar | mobile | `references/clinica-full/src/components/AppShell.tsx` | `app-shell.spec.ts` responsive visibility | real | equivalent | — | — |
| app-shell | mobile-sheet | desktop | `references/clinica-full/src/components/AppShell.tsx` | `app-shell-onboarding.test.tsx` | real | equivalent | — | — |
| app-shell | mobile-sheet | mobile | `references/clinica-full/src/components/AppShell.tsx` | `app-shell.spec.ts` | real | equivalent | — | — |
| app-shell | active-route | desktop | `references/clinica-full/src/components/AppShell.tsx` | `app-shell-onboarding.test.tsx` | real | equivalent | — | — |
| app-shell | active-route | mobile | `references/clinica-full/src/components/AppShell.tsx` | `app-shell-onboarding.test.tsx` + `app-shell.spec.ts` | real | equivalent | — | — |
| app-shell | notifications | desktop | `references/clinica-full/src/components/AppShell.tsx` | `app-shell.spec.ts` + real `NotificationAttempt` projection | real | approved-divergence | Exibe tentativas reais e estado vazio; fontes futuras de aniversário/documento dependem dos respectivos serviços. | product-owner direction 2026-08-27 |
| app-shell | notifications | mobile | `references/clinica-full/src/components/AppShell.tsx` | `app-shell.spec.ts` + real `NotificationAttempt` projection | real | approved-divergence | Exibe tentativas reais e estado vazio; fontes futuras de aniversário/documento dependem dos respectivos serviços. | product-owner direction 2026-08-27 |
| app-shell | message-indicator | desktop | `references/clinica-full/src/components/AppShell.tsx` | `app-shell.spec.ts` absence assertion | unavailable | approved-divergence | Atalho/indicador de WhatsApp removido por direção explícita do produto; notificações operacionais continuam no sino. | product-owner direction 2026-08-27 |
| app-shell | message-indicator | mobile | `references/clinica-full/src/components/AppShell.tsx` | `app-shell.spec.ts` absence assertion | unavailable | approved-divergence | Atalho/indicador de WhatsApp removido por direção explícita do produto; notificações operacionais continuam no sino. | product-owner direction 2026-08-27 |
| app-shell | user-menu | desktop | `references/clinica-full/src/components/AppShell.tsx` | `app-shell.spec.ts` | real | equivalent | — | — |
| app-shell | user-menu | mobile | `references/clinica-full/src/components/AppShell.tsx` | `app-shell.spec.ts` | real | equivalent | — | — |
| app-shell | settings | desktop | `references/clinica-full/src/components/AppShell.tsx` | `app-shell.spec.ts` | real | equivalent | — | — |
| app-shell | settings | mobile | `references/clinica-full/src/components/AppShell.tsx` | `app-shell.spec.ts` | real | equivalent | — | — |
| app-shell | logout | desktop | `references/clinica-full/src/components/AppShell.tsx` | `app-shell.spec.ts` control + mobile real boundary | real | equivalent | — | — |
| app-shell | logout | mobile | `references/clinica-full/src/components/AppShell.tsx` | `app-shell.spec.ts` real session deletion | real | equivalent | — | — |
| app-shell | context-links | desktop | `references/clinica-full/src/components/AppShell.tsx` | typed notification href + `app-shell.spec.ts` | real | equivalent | — | — |
| app-shell | context-links | mobile | `references/clinica-full/src/components/AppShell.tsx` | typed notification href + `app-shell.spec.ts` | real | equivalent | — | — |
| onboarding | resume | desktop | `references/clinica-full/src/components/OnboardingTour.tsx` | `app-shell.spec.ts` + `app-shell-onboarding.test.tsx` | real | equivalent | Query canônica `?onboarding=<passo>` retoma o passo persistido. | product-owner direction 2026-08-27 |
| onboarding | resume | mobile | `references/clinica-full/src/components/OnboardingTour.tsx` | `ui-preference-actions.test.ts` + `app-shell.spec.ts` | real | equivalent | — | — |
| onboarding | next-back | desktop | `references/clinica-full/src/components/OnboardingTour.tsx` | `app-shell.spec.ts` 16 canonical steps | real | equivalent | — | — |
| onboarding | next-back | mobile | `references/clinica-full/src/components/OnboardingTour.tsx` | `app-shell.spec.ts` 16 canonical steps | real | equivalent | — | — |
| onboarding | skip | desktop | `references/clinica-full/src/components/OnboardingTour.tsx` | `app-shell.spec.ts` reload persistence | real | equivalent | — | — |
| onboarding | skip | mobile | `references/clinica-full/src/components/OnboardingTour.tsx` | `app-shell.spec.ts` reload persistence | real | equivalent | — | — |
| onboarding | complete | desktop | `references/clinica-full/src/components/OnboardingTour.tsx` | `ui-preference-actions.test.ts` + component flow | real | equivalent | — | — |
| onboarding | complete | mobile | `references/clinica-full/src/components/OnboardingTour.tsx` | `ui-preference-actions.test.ts` + component flow | real | equivalent | — | — |
| onboarding | restart | desktop | `references/clinica-full/src/components/OnboardingTour.tsx` | `app-shell.spec.ts` | real | equivalent | — | — |
| onboarding | restart | mobile | `references/clinica-full/src/components/OnboardingTour.tsx` | `app-shell.spec.ts` | real | equivalent | — | — |
| onboarding | required-block | desktop | `references/clinica-full/src/components/OnboardingTour.tsx` | `app-shell-onboarding.test.tsx` capability prerequisite | real | equivalent | — | — |
| onboarding | required-block | mobile | `references/clinica-full/src/components/OnboardingTour.tsx` | `app-shell-onboarding.test.tsx` capability prerequisite | real | equivalent | — | — |
| onboarding | route-retention | desktop | `references/clinica-full/src/components/OnboardingTour.tsx` | `app-shell.spec.ts` 16-step route traversal | real | equivalent | Perfil abre Configurações em `?onboarding=10` e o tour continua no alvo correto. | product-owner direction 2026-08-27 |
| onboarding | route-retention | mobile | `references/clinica-full/src/components/OnboardingTour.tsx` | `app-shell.spec.ts` 16-step route traversal | real | equivalent | Perfil abre Configurações em `?onboarding=10` e o tour continua no alvo correto. | product-owner direction 2026-08-27 |
| onboarding | overlay-focus | desktop | `references/clinica-full/src/components/OnboardingTour.tsx` | `app-shell.spec.ts` + component clip-path/click-target assertions | real | equivalent | Spotlight por clip-path deixa o alvo clicável; balão mede espaço e fica à esquerda do perfil. | product-owner direction 2026-08-27 |
| onboarding | overlay-focus | mobile | `references/clinica-full/src/components/OnboardingTour.tsx` | `app-shell.spec.ts` + component clip-path/click-target assertions | real | equivalent | Spotlight por clip-path deixa o alvo clicável; fallback inferior evita cobrir o alvo quando não há largura lateral. | product-owner direction 2026-08-27 |
| dashboard | greeting-banner | desktop | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| dashboard | greeting-banner | mobile | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| dashboard | quick-actions | desktop | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| dashboard | quick-actions | mobile | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| dashboard | upcoming-groups | desktop | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| dashboard | upcoming-groups | mobile | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| dashboard | reminders | desktop | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| dashboard | reminders | mobile | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| dashboard | birthday-message-unavailable | desktop | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| dashboard | birthday-message-unavailable | mobile | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| dashboard | value-privacy | desktop | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| dashboard | value-privacy | mobile | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| dashboard | chart-periods | desktop | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| dashboard | chart-periods | mobile | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| dashboard | chart-context-link | desktop | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| dashboard | chart-context-link | mobile | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| dashboard | message-queue-unavailable | desktop | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| dashboard | message-queue-unavailable | mobile | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| dashboard | clickable-kpis | desktop | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| dashboard | clickable-kpis | mobile | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| dashboard | section-order | desktop | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| dashboard | section-order | mobile | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| dashboard | empty-states | desktop | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| dashboard | empty-states | mobile | `references/clinica-full/src/routes/dashboard.tsx` | pending | real | pending | — | — |
| patients-list | search | desktop | `references/clinica-full/src/routes/pacientes/index.tsx` | pending | real | pending | — | — |
| patients-list | search | mobile | `references/clinica-full/src/routes/pacientes/index.tsx` | pending | real | pending | — | — |
| patients-list | status-filters | desktop | `references/clinica-full/src/routes/pacientes/index.tsx` | pending | real | pending | — | — |
| patients-list | status-filters | mobile | `references/clinica-full/src/routes/pacientes/index.tsx` | pending | real | pending | — | — |
| patients-list | responsive-list | desktop | `references/clinica-full/src/routes/pacientes/index.tsx` | pending | real | pending | — | — |
| patients-list | responsive-list | mobile | `references/clinica-full/src/routes/pacientes/index.tsx` | pending | real | pending | — | — |
| patients-list | open-profile | desktop | `references/clinica-full/src/routes/pacientes/index.tsx` | pending | real | pending | — | — |
| patients-list | open-profile | mobile | `references/clinica-full/src/routes/pacientes/index.tsx` | pending | real | pending | — | — |
| patients-list | whatsapp-unavailable | desktop | `references/clinica-full/src/routes/pacientes/index.tsx` | pending | real | pending | — | — |
| patients-list | whatsapp-unavailable | mobile | `references/clinica-full/src/routes/pacientes/index.tsx` | pending | real | pending | — | — |
| patients-list | finance-link | desktop | `references/clinica-full/src/routes/pacientes/index.tsx` | pending | real | pending | — | — |
| patients-list | finance-link | mobile | `references/clinica-full/src/routes/pacientes/index.tsx` | pending | real | pending | — | — |
| patients-list | edit-unavailable | desktop | `references/clinica-full/src/routes/pacientes/index.tsx` | pending | real | pending | — | — |
| patients-list | edit-unavailable | mobile | `references/clinica-full/src/routes/pacientes/index.tsx` | pending | real | pending | — | — |
| patients-list | archive-restore-unavailable | desktop | `references/clinica-full/src/routes/pacientes/index.tsx` | pending | real | pending | — | — |
| patients-list | archive-restore-unavailable | mobile | `references/clinica-full/src/routes/pacientes/index.tsx` | pending | real | pending | — | — |
| patients-list | charge-unavailable | desktop | `references/clinica-full/src/routes/pacientes/index.tsx` | pending | real | pending | — | — |
| patients-list | charge-unavailable | mobile | `references/clinica-full/src/routes/pacientes/index.tsx` | pending | real | pending | — | — |
| patients-list | empty-state | desktop | `references/clinica-full/src/routes/pacientes/index.tsx` | pending | real | pending | — | — |
| patients-list | empty-state | mobile | `references/clinica-full/src/routes/pacientes/index.tsx` | pending | real | pending | — | — |
| patient-create | wizard-navigation | desktop | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | wizard-navigation | mobile | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | personal | desktop | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | personal | mobile | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | contact | desktop | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | contact | mobile | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | chief-complaint | desktop | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | chief-complaint | mobile | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | address | desktop | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | address | mobile | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | emergency | desktop | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | emergency | mobile | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | consents | desktop | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | consents | mobile | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | brazilian-validation | desktop | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | brazilian-validation | mobile | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | billing-model | desktop | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | billing-model | mobile | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | avulso-value | desktop | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | avulso-value | mobile | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | plan-unavailable | desktop | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | plan-unavailable | mobile | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | payment-conditions | desktop | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | payment-conditions | mobile | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | card-installments | desktop | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | card-installments | mobile | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | automations-unavailable | desktop | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | automations-unavailable | mobile | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | summary | desktop | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | summary | mobile | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | submit | desktop | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-create | submit | mobile | `docs/prototype-feature-inventory.md#cadastro-em-duas-etapas` | pending | real | pending | — | — |
| patient-general | header-status | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-general | header-status | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-general | tab-order | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-general | tab-order | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-general | contact-identity | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-general | contact-identity | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-general | address | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-general | address | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-general | emergency | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-general | emergency | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-general | consents | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-general | consents | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-general | chief-complaint | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-general | chief-complaint | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-general | edit-archive-unavailable | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-general | edit-archive-unavailable | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-general | legacy-incomplete | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-general | legacy-incomplete | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-finance | summary | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-finance | summary | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-finance | avulso-profile | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-finance | avulso-profile | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-finance | readiness | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-finance | readiness | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-finance | entry-empty | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-finance | entry-empty | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-finance | entry-crud-unavailable | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-finance | entry-crud-unavailable | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-finance | receipt-unavailable | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-finance | receipt-unavailable | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-finance | plan-unavailable | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-finance | plan-unavailable | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-finance | charge-unavailable | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-finance | charge-unavailable | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-finance | send-unavailable | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-finance | send-unavailable | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-agenda | upcoming | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-agenda | upcoming | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-agenda | history | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-agenda | history | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-agenda | create-link | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-agenda | create-link | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-agenda | edit-unavailable | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-agenda | edit-unavailable | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-agenda | recurrence-unavailable | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-agenda | recurrence-unavailable | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-agenda | empty-state | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| patient-agenda | empty-state | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | real | pending | — | — |
| agenda | day | desktop | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | day | mobile | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | week | desktop | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | week | mobile | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | month | desktop | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | month | mobile | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | temporal-nav | desktop | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | temporal-nav | mobile | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | header | desktop | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | header | mobile | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | grid | desktop | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | grid | mobile | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | positioning | desktop | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | positioning | mobile | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | empty-grid | desktop | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | empty-grid | mobile | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | real-create | desktop | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | real-create | mobile | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | validation | desktop | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | validation | mobile | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | detail-sheet | desktop | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | detail-sheet | mobile | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | edit-actions-unavailable | desktop | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | edit-actions-unavailable | mobile | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | status-unavailable | desktop | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | status-unavailable | mobile | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | session-unavailable | desktop | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | session-unavailable | mobile | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | whatsapp-status | desktop | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | whatsapp-status | mobile | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | block-transient | desktop | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| agenda | block-transient | mobile | `references/clinica-full/src/routes/agenda.tsx` | pending | real | pending | — | — |
| patient-anamnese | hda | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-anamnese | hda | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-anamnese | histories | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-anamnese | histories | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-anamnese | habits | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-anamnese | habits | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-anamnese | mental-state | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-anamnese | mental-state | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-anamnese | manual-dsm-cid | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-anamnese | manual-dsm-cid | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-anamnese | goals | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-anamnese | goals | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-anamnese | conditionals | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-anamnese | conditionals | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-anamnese | validation | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-anamnese | validation | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-anamnese | blocked-save | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-anamnese | blocked-save | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-anamnese | discard | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-anamnese | discard | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-record | chronology | desktop | `references/clinica-full/src/components/SessionInProgressDialog.tsx` | pending | transient | pending | — | — |
| patient-record | chronology | mobile | `references/clinica-full/src/components/SessionInProgressDialog.tsx` | pending | transient | pending | — | — |
| patient-record | free-evolution | desktop | `references/clinica-full/src/components/SessionInProgressDialog.tsx` | pending | transient | pending | — | — |
| patient-record | free-evolution | mobile | `references/clinica-full/src/components/SessionInProgressDialog.tsx` | pending | transient | pending | — | — |
| patient-record | soap | desktop | `references/clinica-full/src/components/SessionInProgressDialog.tsx` | pending | transient | pending | — | — |
| patient-record | soap | mobile | `references/clinica-full/src/components/SessionInProgressDialog.tsx` | pending | transient | pending | — | — |
| patient-record | mood | desktop | `references/clinica-full/src/components/SessionInProgressDialog.tsx` | pending | transient | pending | — | — |
| patient-record | mood | mobile | `references/clinica-full/src/components/SessionInProgressDialog.tsx` | pending | transient | pending | — | — |
| patient-record | appointment-link | desktop | `references/clinica-full/src/components/SessionInProgressDialog.tsx` | pending | transient | pending | — | — |
| patient-record | appointment-link | mobile | `references/clinica-full/src/components/SessionInProgressDialog.tsx` | pending | transient | pending | — | — |
| patient-record | timer | desktop | `references/clinica-full/src/components/SessionInProgressDialog.tsx` | pending | transient | pending | — | — |
| patient-record | timer | mobile | `references/clinica-full/src/components/SessionInProgressDialog.tsx` | pending | transient | pending | — | — |
| patient-record | finalize-unavailable | desktop | `references/clinica-full/src/components/SessionInProgressDialog.tsx` | pending | transient | pending | — | — |
| patient-record | finalize-unavailable | mobile | `references/clinica-full/src/components/SessionInProgressDialog.tsx` | pending | transient | pending | — | — |
| patient-record | crud-unavailable | desktop | `references/clinica-full/src/components/SessionInProgressDialog.tsx` | pending | transient | pending | — | — |
| patient-record | crud-unavailable | mobile | `references/clinica-full/src/components/SessionInProgressDialog.tsx` | pending | transient | pending | — | — |
| patient-record | blocked-autosave | desktop | `references/clinica-full/src/components/SessionInProgressDialog.tsx` | pending | transient | pending | — | — |
| patient-record | blocked-autosave | mobile | `references/clinica-full/src/components/SessionInProgressDialog.tsx` | pending | transient | pending | — | — |
| patient-record | discard | desktop | `references/clinica-full/src/components/SessionInProgressDialog.tsx` | pending | transient | pending | — | — |
| patient-record | discard | mobile | `references/clinica-full/src/components/SessionInProgressDialog.tsx` | pending | transient | pending | — | — |
| patient-documents | templates | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-documents | templates | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-documents | repository | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-documents | repository | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-documents | upload-selection | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-documents | upload-selection | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-documents | editor | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-documents | editor | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-documents | preview | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-documents | preview | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-documents | pdf-unavailable | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-documents | pdf-unavailable | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-documents | delete-unavailable | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-documents | delete-unavailable | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-documents | signature-canvas | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-documents | signature-canvas | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-documents | evidence-copy | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-documents | evidence-copy | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-documents | save-sign-unavailable | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-documents | save-sign-unavailable | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-documents | discard | desktop | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| patient-documents | discard | mobile | `references/clinica-full/src/routes/pacientes/$patientId.tsx` | pending | transient | pending | — | — |
| finance | kpis | desktop | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | kpis | mobile | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | tabs | desktop | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | tabs | mobile | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | filters | desktop | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | filters | mobile | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | clear-filters | desktop | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | clear-filters | mobile | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | responsive-table | desktop | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | responsive-table | mobile | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | flow-chart | desktop | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | flow-chart | mobile | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | balance-chart | desktop | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | balance-chart | mobile | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | category-chart | desktop | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | category-chart | mobile | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | entry-draft | desktop | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | entry-draft | mobile | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | recurrence-installments | desktop | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | recurrence-installments | mobile | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | effective-unavailable | desktop | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | effective-unavailable | mobile | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | receipt-draft | desktop | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | receipt-draft | mobile | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | category-unavailable | desktop | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | category-unavailable | mobile | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | plans | desktop | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | plans | mobile | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | charge-unavailable | desktop | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | charge-unavailable | mobile | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | empty-states | desktop | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| finance | empty-states | mobile | `references/clinica-full/src/routes/financeiro.tsx` | pending | transient | pending | — | — |
| forecast | annual-calendar | desktop | `references/clinica-full/src/routes/financeiro_.previsibilidade.tsx` | pending | transient | pending | — | — |
| forecast | annual-calendar | mobile | `references/clinica-full/src/routes/financeiro_.previsibilidade.tsx` | pending | transient | pending | — | — |
| forecast | monthly-totals | desktop | `references/clinica-full/src/routes/financeiro_.previsibilidade.tsx` | pending | transient | pending | — | — |
| forecast | monthly-totals | mobile | `references/clinica-full/src/routes/financeiro_.previsibilidade.tsx` | pending | transient | pending | — | — |
| forecast | monthly-detail | desktop | `references/clinica-full/src/routes/financeiro_.previsibilidade.tsx` | pending | transient | pending | — | — |
| forecast | monthly-detail | mobile | `references/clinica-full/src/routes/financeiro_.previsibilidade.tsx` | pending | transient | pending | — | — |
| forecast | summary | desktop | `references/clinica-full/src/routes/financeiro_.previsibilidade.tsx` | pending | transient | pending | — | — |
| forecast | summary | mobile | `references/clinica-full/src/routes/financeiro_.previsibilidade.tsx` | pending | transient | pending | — | — |
| forecast | filters-search | desktop | `references/clinica-full/src/routes/financeiro_.previsibilidade.tsx` | pending | transient | pending | — | — |
| forecast | filters-search | mobile | `references/clinica-full/src/routes/financeiro_.previsibilidade.tsx` | pending | transient | pending | — | — |
| forecast | to-confirm | desktop | `references/clinica-full/src/routes/financeiro_.previsibilidade.tsx` | pending | transient | pending | — | — |
| forecast | to-confirm | mobile | `references/clinica-full/src/routes/financeiro_.previsibilidade.tsx` | pending | transient | pending | — | — |
| forecast | effective | desktop | `references/clinica-full/src/routes/financeiro_.previsibilidade.tsx` | pending | transient | pending | — | — |
| forecast | effective | mobile | `references/clinica-full/src/routes/financeiro_.previsibilidade.tsx` | pending | transient | pending | — | — |
| forecast | actions-unavailable | desktop | `references/clinica-full/src/routes/financeiro_.previsibilidade.tsx` | pending | transient | pending | — | — |
| forecast | actions-unavailable | mobile | `references/clinica-full/src/routes/financeiro_.previsibilidade.tsx` | pending | transient | pending | — | — |
| settings | navigation | desktop | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | navigation | mobile | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | account | desktop | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | account | mobile | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | contact-address | desktop | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | contact-address | mobile | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | clinic | desktop | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | clinic | mobile | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | cnpj | desktop | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | cnpj | mobile | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | watermark | desktop | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | watermark | mobile | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | plan-list | desktop | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | plan-list | mobile | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | plan-draft | desktop | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | plan-draft | mobile | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | plan-remove-unavailable | desktop | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | plan-remove-unavailable | mobile | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | templates | desktop | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | templates | mobile | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | message-preview | desktop | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | message-preview | mobile | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | queue | desktop | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | queue | mobile | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | send-unavailable | desktop | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | send-unavailable | mobile | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | 2fa-unavailable | desktop | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | 2fa-unavailable | mobile | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | channel-toggles-unavailable | desktop | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | channel-toggles-unavailable | mobile | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | no-session-manager | desktop | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |
| settings | no-session-manager | mobile | `references/clinica-full/src/routes/configuracoes.tsx` | pending | transient | pending | — | — |

## Gate por página

- [ ] Referência e estado enumerados nos dois viewports.
- [ ] Ações reais usam limites autenticados reais.
- [ ] Fluxos transitórios não persistem e avisam antes do descarte.
- [ ] Ações indisponíveis devolvem foco e não geram sucesso.
- [ ] Teclado, foco, nomes acessíveis, toque e responsividade validados.
- [ ] Testes e evidências Playwright anexados.
- [ ] Toda divergência aprovada pelo responsável do produto.
