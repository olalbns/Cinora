export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: false },
  vite: {
    // Requis pour l’aperçu Arena/E2B dont le domaine est généré dynamiquement.
    server: { allowedHosts: true }
  },
  css: ['~/assets/css/main.css', '~/assets/css/admin.css'],
  modules: ['@nuxtjs/google-fonts', '@nuxtjs/i18n'],
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'fr',
    lazy: true,
    langDir: 'locales',
    locales: [
      { code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'ar', language: 'ar', name: 'العربية', file: 'ar.json', dir: 'rtl' },
      { code: 'fil', language: 'fil-PH', name: 'Filipino', file: 'fil.json' },
      { code: 'hi', language: 'hi-IN', name: 'हिन्दी', file: 'hi.json' },
      { code: 'id', language: 'id-ID', name: 'Indonesia', file: 'id.json' },
      { code: 'bn', language: 'bn-BD', name: 'বাংলা', file: 'bn.json' },
      { code: 'ur', language: 'ur-PK', name: 'اردو', file: 'ur.json', dir: 'rtl' }
    ],
    detectBrowserLanguage: { useCookie: true, cookieKey: 'cinora_i18n_lang', redirectOn: 'root' },
    bundle: { optimizeTranslationDirective: false }
  },
  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700],
      Manrope: [500, 600, 700, 800]
    },
    download: true,
    inject: true
  },
  runtimeConfig: {
    // Secrets du dashboard : ne jamais les placer dans public.
    adminPassword: process.env.NUXT_ADMIN_PASSWORD || '',
    adminSessionSecret: process.env.NUXT_ADMIN_SESSION_SECRET || '',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://cinora:cinora_dev@localhost:5432/cinora',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    playbackApiBase: process.env.NUXT_PLAYBACK_API_BASE || '',
    smtpHost: process.env.SMTP_HOST || 'localhost',
    smtpPort: Number(process.env.SMTP_PORT || 1025),
    smtpFrom: process.env.SMTP_FROM || 'CINORA <noreply@cinora.local>',
    // Base privée utilisée par les proxys SSR (recommandée pour /detail).
    apiServerBase: process.env.NUXT_API_SERVER_BASE || '',
    public: {
      contentMode: process.env.NUXT_PUBLIC_CONTENT_MODE || 'mock',
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '',
      apiTimeout: Number(process.env.NUXT_PUBLIC_API_TIMEOUT || 10000),
      apiCallerSource: process.env.NUXT_PUBLIC_API_CALLER_SOURCE || 'node-frontend'
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      titleTemplate: '%s · CINORA',
      meta: [
        { name: 'theme-color', content: '#090909' },
        { name: 'description', content: 'Une expérience cinéma, pensée pour vous.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  typescript: { strict: true, typeCheck: false },
  nitro: { compressPublicAssets: true }
})
