/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PAYMENT_LINK: string
  readonly VITE_STRIPE_DONATE_URL: string
  readonly VITE_GOCARDLESS_DONATE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
