<template>
  <v-app class="lf-app">
    <LightForgeNavbar />
    <v-main>
      <slot />
    </v-main>
    <LightForgeFooter />
  </v-app>
</template>

<style scoped>
.lf-app {
  font-family: var(--lf-font-sans);
  background: var(--lf-off-white);
  color: var(--lf-charcoal);
}
</style>
