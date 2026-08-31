import { ShieldCheck } from "lucide-react";

export function AuthBrandPanel() {
  return (
    <aside className="hidden min-h-screen bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
      <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-white/15 font-bold">C</span><span className="text-lg font-semibold">Clínica Ágil</span></div>
      <div className="max-w-md space-y-4"><h1 className="text-4xl font-bold leading-tight">Cuide dos seus pacientes com mais calma e organização.</h1><p className="leading-7 text-primary-foreground/80">Pacientes, agenda, prontuário, anamnese, financeiro e documentos em um só lugar — pensado para psicólogos, terapeutas e psiquiatras autônomos.</p></div>
      <p className="flex items-center gap-2 text-sm text-primary-foreground/80"><ShieldCheck aria-hidden="true" className="size-4" />Conformidade com LGPD e dados clínicos protegidos.</p>
    </aside>
  );
}
