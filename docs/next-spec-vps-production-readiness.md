# Próxima Spec — Ativação e hardening do ambiente de produção na VPS

Create a feature specification for production activation and operational
hardening of clinica-full on the existing VPS.

Primary user: operador técnico responsável pela VPS.

Goal: publicar o app com HTTPS em um subdomínio, sem interromper containers,
portas, processos PM2 ou sites Caddy já existentes, e deixar um procedimento
repetível de deploy, atualização, rollback e verificação.

## In Scope

- inventariar portas, containers Docker, processos PM2, Caddy e capacidade da VPS;
- selecionar uma porta local livre para o app e registrar a decisão;
- criar registro DNS A do subdomínio apontando para a VPS;
- preencher segredos de produção fora do Git;
- executar migrations Prisma e iniciar app/PostgreSQL com Docker Compose;
- integrar o site ao Caddy existente e emitir HTTPS;
- validar healthcheck, autenticação, leitura/escrita no banco e persistência após
  restart;
- definir atualização, backup, rollback, logs e recuperação operacional;
- documentar evidência do primeiro deploy sem expor dados sensíveis.

## Constraints

- não interromper, remover, renomear ou reutilizar portas dos serviços existentes;
- expor o app somente em `127.0.0.1:APP_PORT`; tráfego público passa pelo Caddy;
- não versionar `.env`, tokens, senhas, cookies ou dumps;
- usar Docker Compose como supervisor; PM2 continua somente para projetos que já
  rodam diretamente no host;
- preservar o banco durante rebuild, rollback e restart;
- tratar dados de saúde conforme os gates de segurança/LGPD do projeto;
- qualquer alteração no Caddy deve passar por validação antes do reload.

## Integrations

- GitHub: `guiduck/clinica-full-v0.1.0`;
- Vercel DNS para o domínio principal;
- VPS `216.158.236.156`;
- Caddy como reverse proxy e emissor TLS;
- Docker Compose, Next.js standalone, Prisma e PostgreSQL;
- Twilio opcional até existirem credenciais reais.

## Acceptance Expectations

- subdomínio resolve para a VPS e responde com certificado HTTPS válido;
- nenhum serviço anterior muda de estado ou perde sua porta;
- `/api/health` responde com sucesso pelo container e pelo domínio;
- migration termina sem erro e o app consegue persistir dados;
- reiniciar app/PostgreSQL mantém os dados e recupera os serviços;
- operador consegue identificar logs e executar deploy/rollback documentados;
- smoke final não registra segredos nem dados clínicos reais.

## Out of Scope

- trocar Caddy por outro proxy;
- colocar PM2 dentro ou acima dos containers;
- migrar os outros projetos da VPS;
- multi-instância, Kubernetes ou balanceamento;
- habilitar funcionalidades clínicas/financeiras ainda indisponíveis;
- corrigir automaticamente vulnerabilidades npm com upgrades maiores.

## Open Questions

- qual será o subdomínio final?
- qual porta local está livre após o inventário real da VPS?
- o PostgreSQL ficará no Compose nesta primeira ativação ou será substituído por
  serviço gerenciado antes de receber dados reais?
- qual política e destino de backup serão exigidos antes do uso com pacientes?
