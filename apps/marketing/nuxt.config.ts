import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'

const appUrl = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3001'
const platformUrl = process.env.NUXT_PUBLIC_APP_URL || 'https://app.lightforgecrm.com'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  css: [
    '@mdi/font/css/materialdesignicons.min.css',
    '../../packages/branding/src/tokens.css',
    '../../packages/ui/src/styles.css',
    '~/assets/css/main.css'
  ],
  modules: ['vuetify-nuxt-module'],
  vuetify: {
    moduleOptions: {
      styles: true
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: 'lightforge',
        themes: {
          lightforge: {
            dark: false,
            colors: {
              primary: '#1F5A32',
              secondary: '#6FAF2D',
              accent: '#D99A16',
              surface: '#FFFFFF',
              background: '#FAFAF7',
              'on-primary': '#FFFFFF',
              'on-secondary': '#10243A',
              'on-accent': '#10243A',
              'on-surface': '#24282D',
              'on-background': '#24282D',
              info: '#10243A',
              success: '#6FAF2D',
              warning: '#D99A16',
              error: '#B42318'
            }
          }
        }
      },
      defaults: {
        VBtn: {
          rounded: 'lg',
          elevation: 0
        },
        VCard: {
          rounded: 'lg',
          elevation: 0
        }
      }
    }
  },
  runtimeConfig: {
    formRateLimitPerHour: 20,
    public: {
      siteUrl: appUrl,
      appUrl: platformUrl,
      brandName: 'LightForge',
      tagline: 'From Lead to Lights'
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'LightForge | Software for Professional Lighting Companies',
      titleTemplate: '%s | LightForge',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'LightForge is the operating platform for professional lighting companies — from lead to lights.'
        },
        { name: 'theme-color', content: '#1F5A32' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&display=swap'
        }
      ]
    }
  },
  alias: {
    '@lightforge/branding': fileURLToPath(new URL('../../packages/branding/src/index.ts', import.meta.url)),
    '@lightforge/ui': fileURLToPath(new URL('../../packages/ui/src/index.ts', import.meta.url))
  },
  typescript: {
    strict: true,
    typeCheck: false
  },
  nitro: {
    prerender: {
      crawlLinks: false,
      routes: ['/']
    }
  }
})
