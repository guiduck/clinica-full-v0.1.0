import { test, expect } from "./fixtures/clinica-fixture";
import fs from "node:fs/promises";
import path from "node:path";

const evidenceDir = path.resolve(process.cwd(), "../../output/playwright/evidence");

test("core product pages expose the complete reconstructed interaction surface", async ({ authenticatedPage: page }, testInfo) => {
  test.setTimeout(120_000);
  await fs.mkdir(evidenceDir, { recursive: true });
  const skip = page.getByRole("button", { name: "Pular" });
  if (await skip.isVisible()) await skip.click();

  await page.goto("/pacientes");
  await expect(page.getByRole("heading", { name: "Pacientes" })).toBeVisible();
  const patientName = `Paciente Paridade ${testInfo.project.name}`;
  const patientCpf = testInfo.project.name === "desktop" ? "52998224725" : "11144477735";
  const patientPhone = testInfo.project.name === "desktop" ? "11987654321" : "21987654321";
  const patientAlreadyExists = await page.getByRole("link", { name: patientName }).isVisible();
  await page.getByRole("button", { name: "Novo paciente" }).first().click();
  await expect(page.getByRole("dialog").getByText("Dados pessoais")).toBeVisible();
  await expect(page.getByLabel("CPF *")).toBeVisible();
  await page.screenshot({ path: path.join(evidenceDir, `${testInfo.project.name}-patient-wizard.png`), fullPage: true });
  if (patientAlreadyExists) {
    await page.getByRole("button", { name: "Cancelar" }).click();
  } else {
    await page.getByLabel("Nome completo *").fill(patientName);
    await page.getByLabel("CPF *").fill(patientCpf);
    await page.getByLabel("Data de nascimento *").fill("02081997");
    await page.getByLabel("E-mail *").fill(`paridade-${testInfo.project.name}@example.test`);
    await page.getByLabel("Telefone / WhatsApp *").fill(patientPhone);
    await page.getByRole("button", { name: "Próximo" }).click();
    await page.getByLabel("Valor por sessão (R$)").fill("25000");
    await page.getByLabel("Chave PIX").fill(patientCpf);
    await page.getByRole("button", { name: "Salvar paciente" }).click();
    await expect(page.getByRole("alertdialog").getByText("Paciente cadastrado com sucesso")).toBeVisible();
    await page.getByRole("button", { name: "Agora não" }).click();
  }
  await page.goto("/pacientes");
  const patientLink = page.getByRole("link", { name: patientName });
  const patientHref = await patientLink.getAttribute("href");
  expect(patientHref).toMatch(/^\/pacientes\//);
  await page.goto(patientHref!);
  await expect(page.getByRole("heading", { name: patientName })).toBeVisible();
  await page.getByRole("tab", { name: "Anamnese" }).click();
  await expect(page.getByText("Progresso da anamnese")).toBeVisible();
  await page.getByLabel("Descrição detalhada").fill("Rascunho clínico para validação de interface.");
  await expect(page.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow", "0");
  await page.getByRole("tab", { name: "Prontuário" }).click();
  await expect(page.getByText("Descartar conteúdo não salvo?")).toBeVisible();
  await page.getByRole("button", { name: "Descartar e sair" }).click();
  await page.getByRole("button", { name: "Criar primeira evolução" }).click();
  await expect(page.getByRole("dialog").getByText("Registro livre")).toBeVisible();
  await page.getByRole("button", { name: "Cancelar" }).click();
  await page.getByRole("tab", { name: "Documentos" }).click();
  await page.getByRole("button", { name: /Atestado/ }).click();
  await expect(page.getByRole("dialog").getByLabel("Conteúdo do documento")).toBeVisible();
  await page.getByRole("button", { name: "Pré-visualizar" }).click();
  await expect(page.getByRole("dialog").getByText("Documento clínico")).toBeVisible();
  await page.screenshot({ path: path.join(evidenceDir, `${testInfo.project.name}-patient-documents.png`), fullPage: true });
  await page.getByRole("button", { name: "Assinar" }).click();
  await expect(page.getByRole("dialog").getByText("Assinatura eletrônica simples")).toBeVisible();
  await page.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.getByText("Assinatura eletrônica simples")).not.toBeVisible();
  await page.getByRole("dialog").filter({ hasText: "Documento clínico" }).getByRole("button", { name: "Fechar" }).click();
  await expect(page.getByText("Descartar conteúdo não salvo?")).toBeVisible();
  await page.getByRole("button", { name: "Descartar e sair" }).click();

  await page.goto("/agenda");
  await expect(page.getByRole("heading", { name: "Agenda" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Dia" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Semana" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Mês" })).toBeVisible();
  await page.getByRole("button", { name: "Novo agendamento" }).click();
  const appointmentDialog = page.getByRole("dialog");
  await expect(appointmentDialog.getByText("Link da videochamada (opcional)")).toBeVisible();
  const patientSelect = appointmentDialog.getByRole("combobox", { name: "Paciente" });
  const triggerBox = await patientSelect.boundingBox();
  await patientSelect.click();
  const patientDropdown = page.getByRole("listbox");
  const dropdownBox = await patientDropdown.boundingBox();
  expect(triggerBox).not.toBeNull();
  expect(dropdownBox).not.toBeNull();
  expect(Math.abs((triggerBox?.width ?? 0) - (dropdownBox?.width ?? 0))).toBeLessThan(2);
  await page.keyboard.press("Escape");
  const startSelect = appointmentDialog.getByRole("combobox", { name: "Início" });
  await expect(startSelect).toContainText("09:00");
  await startSelect.click();
  await expect(page.getByRole("option", { name: "13:00", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.screenshot({ path: path.join(evidenceDir, `${testInfo.project.name}-agenda-dialog.png`), fullPage: true });
  await page.getByRole("button", { name: "Cancelar" }).click();

  await page.goto("/financeiro");
  await expect(page.getByRole("heading", { name: "Financeiro", exact: true })).toBeVisible();
  for (const name of ["Todos", "Receitas", "Despesas", "Recibos", "Categorias"]) await expect(page.getByRole("tab", { name })).toBeVisible();
  await page.getByRole("button", { name: "Nova receita" }).click();
  await expect(page.getByRole("dialog").getByText("Registro financeiro")).toBeVisible();
  await page.screenshot({ path: path.join(evidenceDir, `${testInfo.project.name}-finance-dialog.png`), fullPage: true });
  await page.getByRole("button", { name: "Cancelar" }).click();

  await page.goto("/financeiro/previsibilidade");
  await expect(page.getByRole("heading", { name: "Previsibilidade financeira" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Calendário anual" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Janeiro" })).toBeVisible();

  await page.goto("/configuracoes");
  await expect(page.getByRole("heading", { name: "Configurações" })).toBeVisible();
  await page.getByRole("tab", { name: "Planos" }).click();
  await expect(page.getByText("Planos pré-definidos")).toBeVisible();
  await page.getByRole("tab", { name: "Mensagens automáticas" }).click();
  await expect(page.getByText("Templates de mensagem")).toBeVisible();
  await page.getByRole("tab", { name: "Segurança" }).click();
  await expect(page.getByText("Autenticação em dois fatores (2FA)")).toBeVisible();
  await page.screenshot({ path: path.join(evidenceDir, `${testInfo.project.name}-settings-security.png`), fullPage: true });
});
