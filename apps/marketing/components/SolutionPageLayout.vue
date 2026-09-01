<script setup lang="ts">
import type { SolutionPageContent } from '~/data/solutions'
import { buildBreadcrumbSchema } from '~/composables/useMarketingSeo'

const props = defineProps<{
  content: SolutionPageContent
}>()

const config = useRuntimeConfig()
const siteUrl = (config.public.siteUrl as string).replace(/\/+$/, '')

useMarketingSeo({
  title: props.content.seoTitle,
  description: props.content.description,
  path: props.content.path,
  jsonLd: buildBreadcrumbSchema(siteUrl, [
    { name: 'Home', path: '/' },
    { name: 'Solutions', path: '/solutions' },
    { name: props.content.eyebrow, path: props.content.path }
  ])
})
</script>

<template>
  <section class="lf-solution-hero">
    <div class="lf-container lf-solution-hero__grid">
      <div>
        <p class="lf-eyebrow">{{ content.eyebrow }}</p>
        <h1 class="lf-display">{{ content.title }}</h1>
        <p class="lf-lede">{{ content.description }}</p>
        <p class="lf-solution-hero__audience">{{ content.audience }}</p>
        <div class="lf-solution-hero__actions">
          <CTAButton to="/demo" variant="gold" size="lg">Book a Demo</CTAButton>
          <CTAButton to="/pricing" variant="outline" size="lg">View Pricing</CTAButton>
        </div>
      </div>

      <aside class="lf-solution-outcomes lf-card" aria-label="Outcomes">
        <Badge label="Outcomes" tone="green" />
        <h2 class="lf-h3">What improves</h2>
        <ul>
          <li v-for="item in content.outcomes" :key="item">{{ item }}</li>
        </ul>
      </aside>
    </div>
  </section>

  <SectionContainer surface>
    <SectionHeading
      eyebrow="Workflow coverage"
      title="How LightForge supports this business"
      description="Capabilities mapped to the operating realities of this lighting specialty."
    />
    <div class="lf-solution-grid">
      <FeatureCard
        v-for="item in content.highlights"
        :key="item.title"
        :title="item.title"
        :description="item.description"
        :icon="item.icon"
      />
    </div>
  </SectionContainer>

  <SectionContainer>
    <SectionHeading
      eyebrow="Related modules"
      title="Explore the product areas behind this solution"
    />
    <div class="lf-solution-related">
      <CTAButton
        v-for="link in content.relatedModules"
        :key="link.to"
        :to="link.to"
        variant="outline"
      >
        {{ link.label }}
      </CTAButton>
    </div>
  </SectionContainer>

  <CTASection
    :title="`See LightForge for ${content.eyebrow}`"
    description="Book a demo focused on your lighting specialty and seasonal operating model."
  />
</template>

<style scoped>
.lf-solution-hero {
  padding-block: clamp(3rem, 6vw, 5rem);
  background:
    radial-gradient(circle at 12% 20%, rgb(217 154 22 / 0.12), transparent 30%),
    radial-gradient(circle at 90% 10%, rgb(111 175 45 / 0.14), transparent 34%),
    linear-gradient(180deg, #fafaf7, #f2f5f0);
}

.lf-solution-hero__grid {
  display: grid;
  gap: 2rem;
  align-items: start;
}

.lf-solution-hero__audience {
  margin: 1.1rem 0 0;
  max-width: 40rem;
  color: rgb(36 40 45 / 0.72);
  line-height: 1.6;
}

.lf-solution-hero__actions,
.lf-solution-related {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.lf-solution-outcomes {
  padding: 1.25rem;
  background: var(--lf-white);
  border: 1px solid rgb(16 36 58 / 0.08);
  box-shadow: var(--lf-shadow-md);
  display: grid;
  gap: 0.75rem;
}

.lf-solution-outcomes ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.65rem;
}

.lf-solution-outcomes li {
  position: relative;
  padding-left: 1rem;
  color: rgb(36 40 45 / 0.78);
  line-height: 1.5;
}

.lf-solution-outcomes li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55rem;
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 999px;
  background: var(--lf-gold);
}

.lf-solution-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 700px) {
  .lf-solution-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 960px) {
  .lf-solution-hero__grid {
    grid-template-columns: 1.2fr 0.8fr;
  }

  .lf-solution-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
