<script setup lang="ts">
import { solutionsIndexCards, solutionsOverview } from '~/data/solutions'

useMarketingSeo({
  title: solutionsOverview.seoTitle,
  description: solutionsOverview.description,
  path: '/solutions'
})
</script>

<template>
  <section class="lf-solutions-hero">
    <div class="lf-container">
      <p class="lf-eyebrow">Solutions</p>
      <h1 class="lf-display">{{ solutionsOverview.title }}</h1>
      <p class="lf-lede">{{ solutionsOverview.description }}</p>
      <div class="lf-solutions-hero__actions">
        <CTAButton to="/demo" variant="gold" size="lg">Book a Demo</CTAButton>
        <CTAButton to="/features" variant="outline" size="lg">Explore Features</CTAButton>
      </div>
    </div>
  </section>

  <SectionContainer surface>
    <SectionHeading
      eyebrow="Choose your specialty"
      title="One platform. Three lighting operating models."
      description="Each solution highlights the workflows that matter most for that business type — while sharing the same LightForge operating core."
    />
    <div class="lf-solutions-grid">
      <IndustryCard
        v-for="card in solutionsIndexCards"
        :key="card.key"
        :title="card.title"
        :description="card.description"
        :to="card.to"
        :icon="card.icon"
      />
    </div>
  </SectionContainer>

  <SectionContainer>
    <SectionHeading
      eyebrow="Shared foundation"
      title="From Lead to Lights across every specialty"
      description="Whether the work is seasonal, event-driven, or permanent, LightForge connects sales, operations, field, materials, and renewals."
    />
    <div class="lf-solutions-foundation">
      <FeatureCard
        title="Sales to approval"
        description="Leads, estimates, proposals, and deposits that move work into production."
        icon="mdi-file-sign"
        to="/estimating"
      />
      <FeatureCard
        title="Crews and field"
        description="Scheduling, job packets, materials, and completion tools for install teams."
        icon="mdi-cellphone-check"
        to="/field"
      />
      <FeatureCard
        title="Service to renewal"
        description="Service, takedowns, storage, and next-season retention in one cycle."
        icon="mdi-recycle-variant"
        to="/renewals"
      />
    </div>
  </SectionContainer>

  <CTASection
    title="Which lighting business are you running?"
    description="Book a demo and we will walk LightForge against your holiday, event, or permanent lighting workflow."
  />
</template>

<style scoped>
.lf-solutions-hero {
  padding-block: clamp(3rem, 6vw, 5rem);
  background:
    radial-gradient(circle at 80% 15%, rgb(111 175 45 / 0.15), transparent 35%),
    linear-gradient(180deg, #fafaf7, #f3f6f1);
}

.lf-solutions-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.75rem;
}

.lf-solutions-grid,
.lf-solutions-foundation {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 800px) {
  .lf-solutions-grid,
  .lf-solutions-foundation {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
