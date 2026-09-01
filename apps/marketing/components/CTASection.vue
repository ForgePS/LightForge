<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
    primaryLabel?: string
    primaryTo?: string
    secondaryLabel?: string
    secondaryTo?: string
    dark?: boolean
  }>(),
  {
    title: 'Ready to Run Your Best Season Yet?',
    description: 'See how LightForge takes your lighting business from lead to lights.',
    primaryLabel: 'Book Your LightForge Demo',
    primaryTo: '/demo',
    secondaryLabel: 'Explore Features',
    secondaryTo: '/features',
    dark: true
  }
)
</script>

<template>
  <SectionContainer :dark="dark">
    <div class="lf-cta-block">
      <SectionHeading :title="title" :description="description" align="center" />
      <div class="lf-cta-block__actions">
        <CTAButton :to="primaryTo" variant="gold" size="lg">{{ primaryLabel }}</CTAButton>
        <CTAButton :to="secondaryTo" :variant="dark ? 'outline' : 'outline'" size="lg" class="lf-cta-block__secondary">
          {{ secondaryLabel }}
        </CTAButton>
      </div>
    </div>
  </SectionContainer>
</template>

<style scoped>
.lf-cta-block {
  display: grid;
  gap: 0.5rem;
  justify-items: center;
  text-align: center;
  padding-block: 0.5rem;
}

.lf-cta-block__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 0.5rem;
}

.lf-cta-block :deep(.lf-cta--outline) {
  border-color: rgb(250 250 247 / 0.28);
  color: var(--lf-white);
}

.lf-cta-block :deep(.lf-cta--outline:hover) {
  border-color: var(--lf-gold);
  color: var(--lf-gold);
}
</style>
