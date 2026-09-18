# Próxima Spec: Documentos, Recibos PDF e Assinatura Simples

> Brief preparado com o fluxo `specify-prompt-engineer` em 2026-09-18. Está pronto
> para alimentar `/speckit.specify` depois do smoke de auth, clínica, agenda e
> financeiro na VPS.

Crie uma feature specification para transformar os fluxos transitórios de
Documentos do paciente, recibos e assinatura simples em capacidades reais,
seguras e auditáveis do MVP da `clinica-full`.

Usuário principal: profissional autônomo autenticado e proprietário dos pacientes,
consultas, lançamentos financeiros e documentos.

Objetivo: permitir criar documentos a partir de templates, gerar recibo PDF apenas
para receita efetivada, armazenar os arquivos com metadados canônicos e aplicar uma
assinatura simples com evidências suficientes, sem prometer assinatura qualificada
ou validade jurídica superior ao mecanismo implementado.

Escopo:
- persistir templates e documentos por paciente com versões e estados rascunho,
  finalizado e cancelado;
- gerar recibo PDF a partir de `FinanceEntry` efetivada, impedindo duplicidade e
  mantendo vínculo explícito ao lançamento, paciente e profissional;
- permitir download autenticado sem URL pública permanente;
- definir storage provider, limites, MIME types permitidos, antivírus/quarentena e
  política de retenção/exclusão;
- registrar assinatura simples com nome, aceite explícito, data/hora, sessão e IP
  minimizado, além do hash do documento assinado;
- manter trilha de auditoria apenas com metadados, nunca corpo clínico ou conteúdo
  integral do documento;
- substituir os avisos de indisponibilidade existentes sem alterar a UX já aceita;
- cobrir reenvio, idempotência, concorrência e falhas parciais de PDF/storage.

Restrições:
- Next.js server-first, Server Actions, services, Prisma/PostgreSQL e autorização
  por proprietário em toda leitura/mutação;
- arquivos nunca ficam em banco, logs, localStorage ou URLs públicas; PostgreSQL
  guarda somente metadados, hashes e referências do storage;
- dados e datas visíveis seguem pt-BR (`dd/mm/aaaa`, BRL);
- recibo só nasce de receita `efetivado`; consulta agendada/receita prevista não
  pode produzir recibo válido;
- não incluir cobrança Stripe, certificado ICP-Brasil, portal do paciente, IA,
  prontuário clínico ou mensageria nesta spec;
- não simular upload, download, assinatura ou PDF bem-sucedidos.

Decisões para `/speckit.clarify`:
- storage inicial (S3 compatível, Cloudflare R2 ou outro) e política de URLs
  assinadas;
- padrão jurídico/contábil e numeração do recibo;
- campos obrigatórios e possibilidade de cancelamento/substituição do recibo;
- alcance jurídico declarado da assinatura simples e quais evidências guardar;
- retenção, exclusão, exportação LGPD e estratégia de backup dos arquivos;
- antivírus síncrono ou quarentena assíncrona no primeiro corte.

Aceite:
- documento e recibo sobrevivem a reload/deploy e só o dono acessa;
- receita prevista não gera recibo; após efetivação, um recibo idempotente pode ser
  criado e baixado;
- adulterar arquivo invalida a conferência do hash;
- falha do storage/PDF não deixa registro falsamente finalizado;
- testes unitários, integração, migration e navegador cobrem autorização,
  idempotência, upload inválido, PDF, assinatura, download e regressão mobile.
