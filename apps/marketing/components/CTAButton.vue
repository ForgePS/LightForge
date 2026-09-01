<script setup lang="ts">
withDefaults(
  defineProps<{
    to?: string
    href?: string
    variant?: 'primary' | 'gold' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    block?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    block: false
  }
)
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    class="lf-cta"
    :class="[`lf-cta--${variant}`, `lf-cta--${size}`, { 'lf-cta--block': block }]"
  >
    <slot />
  </NuxtLink>
  <a
    v-else
    :href="href"
    class="lf-cta"
    :class="[`lf-cta--${variant}`, `lf-cta--${size}`, { 'lf-cta--block': block }]"
  >
    <slot />
  </a>
</template>

<style scoped>
.lf-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
  border: 1px solid transparent;
  transition: background-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
  white-space: nowrap;
}

.lf-cta:focus-visible {
  outline: 2px solid var(--lf-green);
  outline-offset: 2px;
}

.lf-cta--sm {
  padding: 0.55rem 0.95rem;
  font-size: 0.875rem;
}

.lf-cta--md {
  padding: 0.8rem 1.2rem;
  font-size: 0.9375rem;
}

.lf-cta--lg {
  padding: 0.95rem 1.45rem;
  font-size: 1rem;
}

.lf-cta--block {
  width: 100%;
}

.lf-cta--primary {
  background: var(--lf-primary-forest);
  color: var(--lf-white);
  box-shadow: var(--lf-shadow-sm);
}

.lf-cta--primary:hover {
  background: #174826;
}

.lf-cta--gold {
  background: var(--lf-gold);
  color: var(--lf-navy);
  box-shadow: var(--lf-shadow-sm);
}

.lf-cta--gold:hover {
  background: #c48a12;
}

.lf-cta--outline {
  background: transparent;
  border-color: rgb(16 36 58 / 0.16);
  color: var(--lf-navy);
}

.lf-cta--outline:hover {
  border-color: var(--lf-primary-forest);
  color: var(--lf-primary-forest);
}

.lf-cta--ghost {
  background: transparent;
  color: var(--lf-navy);
}

.lf-cta--ghost:hover {
  background: rgb(16 36 58 / 0.04);
}
</style>
