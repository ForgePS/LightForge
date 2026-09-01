<script setup lang="ts">
import type { ProductPageContent } from '~/data/product-pages'
import { buildBreadcrumbSchema } from '~/composables/useMarketingSeo'

const props = defineProps<{
  content: ProductPageContent
  darkPreview?: boolean
}>()

const config = useRuntimeConfig()
const siteUrl = (config.public.siteUrl as string).replace(/\/+$/, '')

useMarketingSeo({
  title: props.content.seoTitle,
  description: props.content.description,
  path: props.content.path,
  jsonLd: buildBreadcrumbSchema(siteUrl, [
    { name: 'Home', path: '/' },
    { name: props.content.eyebrow, path: props.content.path }
  ])
})
</script>

<template>
  <section class="lf-product-hero" :class="{ 'lf-product-hero--dark': darkPreview }">
    <div class="lf-container lf-product-hero__grid">
      <div>
        <p class="lf-eyebrow">{{ content.eyebrow }}</p>
        <h1 class="lf-display">{{ content.title }}</h1>
        <p class="lf-lede">{{ content.description }}</p>
        <div class="lf-product-hero__actions">
          <CTAButton to="/demo" variant="gold" size="lg">Book a Demo</CTAButton>
          <CTAButton
            v-if="content.secondaryCta"
            :to="content.secondaryCta.to"
            variant="outline"
            size="lg"
          >
            {{ content.secondaryCta.label }}
          </CTAButton>
          <CTAButton v-else to="/features" variant="outline" size="lg">Explore Features</CTAButton>
        </div>
      </div>

      <aside class="lf-product-preview lf-card" aria-hidden="true">
        <div class="lf-product-preview__top">
          <strong>{{ content.previewTitle }}</strong>
          <Badge label="Demo UI" tone="gold" />
        </div>
        <ul>
          <li v-for="item in content.previewItems" :key="item">{{ item }}</li>
        </ul>
        <p>Synthetic product preview — sample labels only.</p>
      </aside>
    </div>
  </section>

  <SectionContainer surface>
    <SectionHeading
      eyebrow="Capabilities"
      title="What teams get with this module"
      description="Practical capabilities designed for professional lighting operations — not generic CRM filler."
    />
    <div class="lf-product-grid">
      <FeatureCard
        v-for="feature in content.features"
        :key="feature.title"
        :title="feature.title"
        :description="feature.description"
        :icon="feature.icon"
      />
    </div>
  </SectionContainer>

  <CTASection
    title="See this workflow in LightForge"
    description="Book a demo and walk through CRM, estimating, scheduling, field, inventory, and renewals with your season in mind."
  />
</template>

<style scoped>
.lf-product-hero {
  padding-block: clamp(3rem, 6vw, 5rem);
  background:
    radial-gradient(circle at 90% 10%, rgb(111 175 45 / 0.14), transparent 35%),
    linear-gradient(180deg, #fafaf7, #f3f6f1);
}

.lf-product-hero--dark {
  background:
    radial-gradient(circle at 85% 15%, rgb(111 175 45 / 0.22), transparent 40%),
    linear-gradient(160deg, #10243a, #16324f 55%, #1a3a3a);
  color: var(--lf-off-white);
}

.lf-product-hero--dark .lf-display {
  color: var(--lf-white);
}

.lf-product-hero--dark .lf-lede {
  color: rgb(250 250 247 / 0.78);
}

.lf-product-hero--dark .lf-eyebrow {
  color: var(--lf-green);
}

.lf-product-hero--dark :deep(.lf-cta--outline) {
  border-color: rgb(250 250 247 / 0.3);
  color: var(--lf-white);
}

.lf-product-hero__grid {
  display: grid;
  gap: 2rem;
  align-items: center;
}

.lf-product-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.75rem;
}

.lf-product-preview {
  padding: 1.2rem;
  background: var(--lf-white);
  border: 1px solid rgb(16 36 58 / 0.08);
  box-shadow: var(--lf-shadow-md);
}

.lf-product-hero--dark .lf-product-preview {
  background: rgb(250 250 247 / 0.96);
  color: var(--lf-charcoal);
}

.lf-product-preview__top {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.85rem;
  color: var(--lf-navy);
}

.lf-product-preview ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.45rem;
}

.lf-product-preview li {
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  background: rgb(31 90 50 / 0.05);
  border: 1px solid rgb(16 36 58 / 0.06);
  font-size: 0.9rem;
  color: var(--lf-navy);
}

.lf-product-preview p {
  margin: 0.85rem 0 0;
  font-size: 0.72rem;
  color: rgb(36 40 45 / 0.55);
}

.lf-product-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 700px) {
  .lf-product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 960px) {
  .lf-product-hero__grid {
    grid-template-columns: 1.15fr 0.85fr;
  }

  .lf-product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
