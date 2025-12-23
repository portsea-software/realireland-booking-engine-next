// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/fonts', '@nuxt/icon'],
  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    './app/assets/main.scss',
  ],
  app: {
    head: {
      script: [
        {
          src: 'bootstrap/dist/js/bootstrap.bundle.min.js',
          tagPosition: 'bodyClose'
        }
      ]
    }
  },
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
  },
})