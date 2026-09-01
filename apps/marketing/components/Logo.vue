<script setup lang="ts">
defineProps<{
  variant?: 'light' | 'dark'
  withTagline?: boolean
  stacked?: boolean
}>()
</script>

<template>
  <NuxtLink to="/" class="lf-logo" aria-label="LightForge home">
    <svg
      v-if="stacked"
      class="lf-logo__mark"
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M32 8 L48 32 L40 32 L52 52 L12 52 L24 32 L16 32 Z" fill="currentColor" class="tree-dark" />
      <path d="M32 14 L42 30 L36 30 L44 46 L20 46 L28 30 L22 30 Z" fill="#6FAF2D" />
      <path
        d="M32 4 L33.8 9.2 L39.2 9.2 L34.8 12.4 L36.4 17.6 L32 14.2 L27.6 17.6 L29.2 12.4 L24.8 9.2 L30.2 9.2 Z"
        fill="#D99A16"
      />
    </svg>
    <svg v-else class="lf-logo__mark" viewBox="0 0 56 56" aria-hidden="true" focusable="false">
      <path d="M28 6 L44 30 L36 30 L48 50 L8 50 L20 30 L12 30 Z" class="tree-dark" fill="currentColor" />
      <path d="M28 12 L38 28 L32 28 L40 44 L16 44 L24 28 L18 28 Z" fill="#6FAF2D" />
      <path
        d="M28 2 L29.8 7.2 L35.2 7.2 L30.8 10.4 L32.4 15.6 L28 12.2 L23.6 15.6 L25.2 10.4 L20.8 7.2 L26.2 7.2 Z"
        fill="#D99A16"
      />
    </svg>
    <span class="lf-logo__text" :class="{ 'lf-logo__text--dark': variant === 'dark' }">
      <span class="lf-logo__word">
        <span class="lf-logo__light">LIGHT</span><span class="lf-logo__forge">FORGE</span>
      </span>
      <span v-if="withTagline" class="lf-logo__tagline">FROM LEAD TO LIGHTS</span>
    </span>
  </NuxtLink>
</template>

<style scoped>
.lf-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.lf-logo__mark {
  width: 2.25rem;
  height: 2.25rem;
  flex: none;
  color: var(--lf-primary-forest);
}

.lf-logo__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.lf-logo__word {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1;
}

.lf-logo__light {
  color: var(--lf-navy);
}

.lf-logo__forge {
  color: var(--lf-gold);
}

.lf-logo__text--dark .lf-logo__light {
  color: var(--lf-white);
}

.lf-logo__text--dark .lf-logo__mark,
.lf-logo__text--dark {
  color: var(--lf-green);
}

.lf-logo__tagline {
  margin-top: 0.35rem;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: var(--lf-primary-forest);
}

.lf-logo__text--dark .lf-logo__tagline {
  color: var(--lf-green);
}
</style>
