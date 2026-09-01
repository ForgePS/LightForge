<script setup lang="ts">
const props = defineProps<{
  title: string
  description: string
  eyebrow?: string
}>()

useSeoMeta({
  title: props.title,
  description: props.description,
  ogTitle: `${props.title} | LightForge`,
  ogDescription: props.description
})
</script>

<template>
  <section class="lf-page">
    <div class="lf-container">
      <p v-if="eyebrow" class="lf-page__eyebrow">{{ eyebrow }}</p>
      <h1 class="lf-display">{{ title }}</h1>
      <p class="lf-lede">{{ description }}</p>
      <div v-if="$slots.default" class="lf-page__body">
        <slot />
      </div>
      <div class="lf-page__actions">
        <CTAButton to="/demo" variant="gold">Book a Demo</CTAButton>
        <CTAButton to="/features" variant="outline">Explore Features</CTAButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.lf-page {
  padding-block: clamp(3rem, 6vw, 5rem) var(--lf-space-section);
}

.lf-page__eyebrow {
  margin: 0 0 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--lf-primary-forest);
}

.lf-page__body {
  margin-top: 2rem;
}

.lf-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2rem;
}
</style>
