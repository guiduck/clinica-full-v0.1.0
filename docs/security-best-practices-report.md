# Revisão de Segurança, Privacidade e LGPD — 2026-08-31

## Resultado

O gate desta feature foi aprovado sem vulnerabilidades conhecidas nas
dependências de produção (`npm audit --omit=dev`: 0). A revisão cobriu
autorização, minimização de dados, respostas de erro, logging, cookies,
rascunhos clínicos/documentais e dependências.

## Correções aplicadas

- **SEC-001 — alto — dependências vulneráveis:** Next foi atualizado para
  `15.5.21`; PostCSS `8.5.23` e Sharp `0.35.0` foram fixados por overrides
  explícitos e o lockfile foi regenerado. Não foi usado `audit fix --force`.
- **SEC-002 — médio — diagnóstico serializado:** campos internos de `debug`
  foram removidos dos contratos e respostas de API/ações.
- **SEC-003 — médio — criação parcial de paciente:** paciente e perfil
  financeiro Avulso agora são validados antes da escrita e persistidos na
  mesma transação Prisma.
- **SEC-004 — baixo — cabeçalhos defensivos:** respostas passam a incluir
  `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` e
  `Permissions-Policy`.
- **PRIV-001 — médio — descarte silencioso:** rascunhos de Anamnese, evolução,
  sessão e documentos exigem confirmação antes de perder conteúdo preenchido.

## Controles verificados

- ações e services reais exigem usuário autenticado e filtram registros por
  proprietário;
- cookie de sessão permanece `HttpOnly` e `SameSite=Lax`;
- CPF, telefone, datas e dados financeiros são normalizados/validados no
  servidor; PAN/CVV não são aceitos nem persistidos;
- conteúdo clínico/documental transitório não é salvo em URL, cookie,
  `localStorage`, analytics, logs ou respostas de erro;
- auditoria registra somente metadados, nunca corpos clínicos;
- URLs de videochamada exigem HTTPS e links externos usam `noreferrer`;
- controles sem service mostram indisponibilidade explícita e não simulam
  sucesso, envio, download ou persistência.

## Pendências para produção

- definir e testar uma CSP compatível com Next.js antes da abertura pública;
- resolver o aviso de múltiplos lockfiles com uma decisão formal de workspace
  e `outputFileTracingRoot`, sem remover lockfiles por inferência;
- validar Twilio no sandbox real e revisar retenção/exportação/exclusão antes
  de persistir prontuário ou documentos;
- executar threat model e decisão de chaves/KMS na próxima spec clínica.

Nenhuma pendência acima autoriza persistência clínica ou documental antes da
spec de proteção de dados sensíveis.
