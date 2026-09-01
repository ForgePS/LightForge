<script setup lang="ts">
import type { LegalDocument } from '~/content/legal'

const props = defineProps<{
  document: LegalDocument
}>()

useMarketingSeo({
  title: props.document.title,
  description: props.document.description,
  path: `/${props.document.slug}`,
  noindex: false
})
</script>

<template>
  <section class="lf-legal-hero">
    <div class="lf-container">
      <p class="lf-eyebrow">Legal</p>
      <h1 class="lf-display">{{ document.title }}</h1>
      <p class="lf-lede">{{ document.description }}</p>
      <p class="lf-legal-updated">Last updated: {{ document.lastUpdated }}</p>
      <p class="lf-legal-note">
        Legal text is maintained in <code>apps/marketing/content/legal/</code> and rendered here for
        review. Replace with counsel-approved language before production launch.
      </p>
    </div>
  </section>

  <SectionContainer surface>
    <article class="lf-legal-body">
      <section
        v-for="section in document.sections"
        :id="section.id"
        :key="section.id"
        class="lf-legal-section"
      >
        <h2 class="lf-h3">{{ section.title }}</h2>
        <p v-for="(paragraph, index) in section.paragraphs" :key="index">{{ paragraph }}</p>
      </section>
    </article>
  </SectionContainer>
</template>

<style scoped>
.lf-legal-hero {
  padding-block: clamp(3rem, 6vw, 4.5rem);
  background: linear-gradient(180deg, #fafaf7, #f3f6f1);
}

.lf-legal-updated {
  margin: 1rem 0 0;
  font-size: 0.875rem;
  color: rgb(36 40 45 / 0.65);
}

.lf-legal-note {
  margin: 0.75rem 0 0;
  max-width: 42rem;
  font-size: 0.85rem;
  color: rgb(36 40 45 / 0.62);
  line-height: 1.55;
}

.lf-legal-note code {
  font-size: 0.8rem;
}

.lf-legal-body {
  max-width: 48rem;
}

.lf-legal-section {
  padding-block: 1.25rem;
  border-bottom: 1px solid rgb(16 36 58 / 0.08);
}

.lf-legal-section:last-child {
  border-bottom: 0;
}

.lf-legal-section p {
  margin: 0.65rem 0 0;
  color: rgb(36 40 45 / 0.78);
  line-height: 1.7;
}
</style>
