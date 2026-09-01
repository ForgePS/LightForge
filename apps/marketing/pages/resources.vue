<script setup lang="ts">
import { resourceCategories } from '~/data/resources'

useMarketingSeo({
  title: 'Resources for Professional Lighting Companies',
  description:
    'Guides, product updates, lighting business resources, and help for professional lighting companies using LightForge.',
  path: '/resources'
})
</script>

<template>
  <section class="lf-resources-hero">
    <div class="lf-container">
      <p class="lf-eyebrow">Resources</p>
      <h1 class="lf-display">Resources for lighting professionals.</h1>
      <p class="lf-lede">
        Guides, product updates, and lighting business resources. This library expands as content is
        published — no fabricated articles or customer stories.
      </p>
    </div>
  </section>

  <SectionContainer surface>
    <div class="lf-resources-grid">
      <section v-for="category in resourceCategories" :key="category.id" class="lf-resources-category lf-card">
        <h2 class="lf-h3">{{ category.title }}</h2>
        <p class="lf-resources-category__desc">{{ category.description }}</p>
        <ul>
          <li v-for="item in category.items" :key="item.title">
            <component
              :is="item.external ? 'a' : 'NuxtLink'"
              :href="item.external ? item.href : undefined"
              :to="item.external ? undefined : item.href"
              class="lf-resources-item"
            >
              <span class="lf-resources-item__title">
                {{ item.title }}
                <Badge v-if="item.tag" :label="item.tag" tone="neutral" />
              </span>
              <span class="lf-resources-item__desc">{{ item.description }}</span>
            </component>
          </li>
        </ul>
      </section>
    </div>
  </SectionContainer>

  <CTASection
    title="Want a guided walkthrough?"
    description="Book a demo to see LightForge against your seasonal operating model."
  />
</template>

<style scoped>
.lf-resources-hero {
  padding-block: clamp(3rem, 6vw, 5rem);
  background:
    radial-gradient(circle at 88% 12%, rgb(111 175 45 / 0.12), transparent 34%),
    linear-gradient(180deg, #fafaf7, #f3f6f1);
}

.lf-resources-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

.lf-resources-category {
  padding: 1.25rem 1.3rem;
  background: var(--lf-white);
  border: 1px solid rgb(16 36 58 / 0.08);
}

.lf-resources-category__desc {
  margin: 0.35rem 0 0.85rem;
  color: rgb(36 40 45 / 0.7);
  line-height: 1.55;
}

.lf-resources-category ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.65rem;
}

.lf-resources-item {
  display: grid;
  gap: 0.2rem;
  padding: 0.75rem 0.85rem;
  border-radius: 12px;
  border: 1px solid rgb(16 36 58 / 0.06);
  background: rgb(31 90 50 / 0.03);
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.lf-resources-item:hover {
  border-color: rgb(31 90 50 / 0.25);
  background: rgb(31 90 50 / 0.06);
}

.lf-resources-item__title {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: center;
  font-weight: 600;
  color: var(--lf-navy);
}

.lf-resources-item__desc {
  color: rgb(36 40 45 / 0.7);
  font-size: 0.92rem;
  line-height: 1.5;
}

@media (min-width: 900px) {
  .lf-resources-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
