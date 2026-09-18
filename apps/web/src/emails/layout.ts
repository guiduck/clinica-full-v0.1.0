function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character] ?? character);
}

export function emailLayout(input: { preview: string; title: string; greeting: string; body: string; actionLabel: string; actionUrl: string; footer: string; highlight?: string }) {
  const title = escapeHtml(input.title);
  const greeting = escapeHtml(input.greeting);
  const body = escapeHtml(input.body);
  const label = escapeHtml(input.actionLabel);
  const url = escapeHtml(input.actionUrl);
  let highlight = "";
  if (input.highlight) {
    highlight = `<p style="margin:24px 0;padding:16px;border-radius:10px;background:#eef8f7;color:#0f766e;font-size:30px;font-weight:700;letter-spacing:8px;text-align:center">${escapeHtml(input.highlight)}</p>`;
  }
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f4f7f8;font-family:Arial,sans-serif;color:#142438"><div style="display:none;max-height:0;overflow:hidden">${escapeHtml(input.preview)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" style="max-width:560px;background:#fff;border:1px solid #dce5e8;border-radius:14px"><tr><td style="padding:32px"><p style="margin:0 0 20px;color:#0f766e;font-size:18px;font-weight:700">clinica-full</p><h1 style="margin:0 0 18px;font-size:24px">${title}</h1><p style="line-height:1.6">${greeting}</p><p style="line-height:1.6;color:#51606f">${body}</p>${highlight}<p style="margin:28px 0"><a href="${url}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:13px 20px;border-radius:9px;font-weight:700">${label}</a></p><p style="font-size:12px;line-height:1.5;color:#6b7785">${escapeHtml(input.footer)}</p></td></tr></table></td></tr></table></body></html>`;
}
