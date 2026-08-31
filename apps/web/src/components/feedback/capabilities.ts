import type { CapabilityDescriptor, UnavailableCapabilityResult } from "@/types/capabilities";

export const CAPABILITIES = Object.freeze({
  googleLogin: Object.freeze({
    key: "auth.google-login",
    mode: "unavailable",
    title: "Entrar com Google ainda não está disponível",
    message: "Use seu e-mail e senha. A entrada com Google será liberada quando a integração estiver pronta.",
    affectedAction: "navigate"
  }),
  passwordRecovery: Object.freeze({
    key: "auth.password-recovery",
    mode: "unavailable",
    title: "Recuperação de senha ainda não está disponível",
    message: "Nenhum link foi enviado. Entre com sua senha atual enquanto preparamos este serviço.",
    affectedAction: "send"
  }),
  unsupportedSave: Object.freeze({
    key: "shared.unsupported-save",
    mode: "unavailable",
    title: "Salvamento ainda não disponível",
    message: "Você pode explorar e validar este fluxo, mas os dados não serão persistidos.",
    affectedAction: "save"
  })
} satisfies Record<string, CapabilityDescriptor>);

export function unavailableCapabilityResult(descriptor: CapabilityDescriptor): UnavailableCapabilityResult {
  return Object.freeze({
    title: descriptor.title,
    description: descriptor.message,
    capabilityKey: descriptor.key,
    availableNow: false,
    mutationPerformed: false
  });
}
