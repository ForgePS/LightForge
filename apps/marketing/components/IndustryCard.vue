<script setup lang="ts">
defineProps<{
  title: string
  description: string
  to: string
  icon?: string
}>()
</script>

<template>
  <NuxtLink :to="to" class="lf-industry">
    <div class="lf-industry__visual" aria-hidden="true">
      <v-icon :icon="icon || 'mdi-lightbulb-on-outline'" size="28" />
    </div>
    <div class="lf-industry__copy">
      <h3 class="lf-h3">{{ title }}</h3>
      <p>{{ description }}</p>
      <span class="lf-industry__cta">Explore <v-icon icon="mdi-arrow-right" size="16" /></span>
    </div>
  </NuxtLink>
</template>

<style scoped>
.lf-industry {
  display: grid;
  gap: 1rem;
  border-radius: var(--lf-radius-lg);
  overflow: hidden;
  background: var(--lf-white);
  border: 1px solid rgb(16 36 58 / 0.08);
  box-shadow: var(--lf-shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
}

.lf-industry:hover {
  transform: translateY(-3px);
  box-shadow: var(--lf-shadow-md);
}

.lf-industry__visual {
  min-height: 7.5rem;
  display: grid;
  place-items: center;
  background:
    linear-gradient(145deg, rgb(31 90 50 / 0.92), rgb(16 36 58 / 0.95)),
    radial-gradient(circle at 80% 20%, rgb(217 154 22 / 0.35), transparent 45%);
  color: var(--lf-white);
}

.lf-industry__copy {
  display: grid;
  gap: 0.55rem;
  padding: 1.15rem 1.2rem 1.3rem;
}

.lf-industry__copy p {
  margin: 0;
  color: rgb(36 40 45 / 0.72);
  line-height: 1.55;
  font-size: 0.95rem;
}

.lf-industry__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--lf-primary-forest);
}
</style>
