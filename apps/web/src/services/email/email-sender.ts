import { DomainError } from "@/lib/errors/domain-errors";
import { getEmailConfig } from "./email-config";

export type TransactionalEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendTransactionalEmail(message: TransactionalEmail) {
  const config = getEmailConfig();
  if (!config) {
    throw new DomainError("EMAIL_NOT_CONFIGURED", "O provedor de e-mail ainda não foi configurado.");
  }

  const response = config.provider === "resend"
    ? await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: config.from, to: [message.to], subject: message.subject, html: message.html, text: message.text }),
      })
    : await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: message.to }] }],
          from: parseFrom(config.from),
          subject: message.subject,
          content: [{ type: "text/plain", value: message.text }, { type: "text/html", value: message.html }],
        }),
      });

  if (!response.ok) {
    throw new DomainError("PROVIDER_FAILURE", "O provedor de e-mail recusou o envio. Confira a chave e o domínio remetente.");
  }

  if (config.provider === "resend") {
    const responseBody = await response.text();
    const data = responseBody ? (JSON.parse(responseBody) as { id?: string }) : {};
    return data.id ?? `resend-${Date.now()}`;
  }

  return response.headers.get("x-message-id") ?? `sendgrid-${Date.now()}`;
}

function parseFrom(value: string) {
  const match = value.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (!match) return { email: value };
  return { name: match[1], email: match[2] };
}
