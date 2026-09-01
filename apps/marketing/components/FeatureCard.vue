<script setup lang="ts">
defineProps<{
  title: string
  description: string
  icon?: string
  to?: string
}>()
</script>

<template>
  <NuxtLink v-if="to" :to="to" class="lf-feature lf-card">
    <div v-if="icon" class="lf-feature__icon" aria-hidden="true">
      <v-icon :icon="icon" size="22" />
    </div>
    <h3 class="lf-h3">{{ title }}</h3>
    <p>{{ description }}</p>
  </NuxtLink>
  <article v-else class="lf-feature lf-card">
    <div v-if="icon" class="lf-feature__icon" aria-hidden="true">
      <v-icon :icon="icon" size="22" />
    </div>
    <h3 class="lf-h3">{{ title }}</h3>
    <p>{{ description }}</p>
  </article>
</template>

<style scoped>
.lf-feature {
  display: grid;
  gap: 0.65rem;
  padding: 1.25rem;
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  border: 1px solid rgb(16 36 58 / 0.08);
  background: var(--lf-white);
}

a.lf-feature:hover {
  transform: translateY(-2px);
  box-shadow: var(--lf-shadow-md);
  border-color: rgb(31 90 50 / 0.22);
}

.lf-feature__icon {
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgb(31 90 50 / 0.08);
  color: var(--lf-primary-forest);
}

.lf-feature p {
  margin: 0;
  color: rgb(36 40 45 / 0.72);
  line-height: 1.55;
  font-size: 0.95rem;
}
</style>
