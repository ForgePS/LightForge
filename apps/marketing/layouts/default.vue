<template>
  <v-app class="lf-app">
    <a href="#main-content" class="lf-skip-link">Skip to main content</a>
    <LightForgeNavbar />
    <v-main id="main-content" tabindex="-1">
      <slot />
    </v-main>
    <LightForgeFooter />
    <CookieConsent />
  </v-app>
</template>

<style scoped>
.lf-app {
  font-family: var(--lf-font-sans);
  background: var(--lf-off-white);
  color: var(--lf-charcoal);
}
</style>
