export const publicRoutes = {
  landing: "/",
  login: "/login",
  terms: "/termos",
  privacy: "/privacidade",
  createAccount: "/criar-conta",
  recoverPassword: "/recuperar-senha",
  dashboard: "/dashboard"
} as const;

export const indexableRoutes = [publicRoutes.landing, publicRoutes.login] as const;

export const nonIndexableRoutes = [
  publicRoutes.terms,
  publicRoutes.privacy,
  publicRoutes.createAccount,
  publicRoutes.recoverPassword
] as const;
