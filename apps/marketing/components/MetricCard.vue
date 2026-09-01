<script setup lang="ts">
defineProps<{
  label: string
  value: string
  hint?: string
}>()
</script>

<template>
  <article class="lf-metric lf-card">
    <p class="lf-metric__label">{{ label }}</p>
    <p class="lf-metric__value">{{ value }}</p>
    <p v-if="hint" class="lf-metric__hint">{{ hint }}</p>
  </article>
</template>

<style scoped>
.lf-metric {
  padding: 1rem 1.1rem;
  background: var(--lf-white);
}

.lf-metric__label {
  margin: 0 0 0.35rem;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: rgb(36 40 45 / 0.68);
}

.lf-metric__value {
  margin: 0;
  font-size: clamp(1.35rem, 2vw, 1.7rem);
  font-weight: 700;
  color: var(--lf-navy);
  letter-spacing: -0.02em;
}

.lf-metric__hint {
  margin: 0.35rem 0 0;
  font-size: 0.72rem;
  color: rgb(36 40 45 / 0.55);
}
</style>
