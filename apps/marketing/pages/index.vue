<script setup lang="ts">
useSeoMeta({
  title: 'Software for Professional Lighting Companies',
  description:
    'LightForge gives professional holiday and event lighting companies one platform to manage leads, estimates, customers, scheduling, crews, inventory, installations, service, removals, payments, and renewals.',
  ogTitle: 'LightForge | From Lead to Lights',
  ogDescription:
    'The operating platform for professional lighting companies — from lead to lights.'
})
</script>

<template>
  <section class="lf-hero">
    <div class="lf-container lf-hero__grid">
      <div class="lf-hero__copy lf-reveal">
        <p class="lf-eyebrow">LightForge</p>
        <h1 class="lf-display">
          Run Your Lighting Business
          <span class="lf-hero__accent">From Lead to Lights.</span>
        </h1>
        <p class="lf-lede">
          LightForge gives professional holiday and event lighting companies one platform to manage
          leads, estimates, customers, scheduling, crews, inventory, installations, service,
          removals, payments, and renewals.
        </p>
        <div class="lf-hero__actions">
          <CTAButton to="/demo" variant="gold" size="lg">Book a Demo</CTAButton>
          <CTAButton to="/features" variant="outline" size="lg">Explore LightForge</CTAButton>
        </div>
      </div>

      <div class="lf-hero__preview lf-reveal" style="animation-delay: 0.12s">
        <DashboardPreview />
      </div>
    </div>
  </section>

  <HomeIndustrySection />

  <SectionContainer>
    <SectionHeading
      eyebrow="Operating cycle"
      title="From Lead to Lights"
      description="LightForge manages the complete customer and operational lifecycle — the signature workflow professional lighting companies run every season."
    />
    <WorkflowTimeline />
  </SectionContainer>

  <SectionContainer surface>
    <SectionHeading
      eyebrow="Platform"
      title="One Platform. Your Entire Lighting Business."
      description="Sales, estimating, operations, field, materials, financials, customer experience, and management — connected in one operating system."
    />
    <PlatformOverview />
  </SectionContainer>

  <SectionContainer>
    <SectionHeading
      eyebrow="Why LightForge"
      title="Not another CRM. An operating platform."
      description="Generic CRMs stop at the pipeline. LightForge continues through install, service, takedown, storage, and renewal — where lighting businesses actually win or lose the season."
    />
    <div class="lf-why">
      <FeatureCard
        title="Built for seasonal operations"
        description="Pre-season, install season, post-season, and renewal — modeled as one continuous business cycle."
        icon="mdi-calendar-sync"
        to="/features"
      />
      <FeatureCard
        title="Crews and field ready"
        description="Give installers the jobs, instructions, materials, and completion tools they need on site."
        icon="mdi-cellphone-check"
        to="/field"
      />
      <FeatureCard
        title="Takedowns and renewals"
        description="Turn removals and storage into next-season revenue instead of end-of-year chaos."
        icon="mdi-recycle-variant"
        to="/takedowns"
      />
    </div>
  </SectionContainer>

  <CTASection />
</template>

<style scoped>
.lf-hero {
  padding-block: clamp(3rem, 7vw, 5.5rem);
  background:
    radial-gradient(circle at 88% 12%, rgb(111 175 45 / 0.16), transparent 34%),
    radial-gradient(circle at 8% 90%, rgb(217 154 22 / 0.1), transparent 28%),
    linear-gradient(180deg, #fafaf7 0%, #f2f5f0 100%);
  overflow: clip;
}

.lf-hero__grid {
  display: grid;
  gap: 2.5rem;
  align-items: center;
}

.lf-hero__accent {
  display: block;
  color: var(--lf-primary-forest);
}

.lf-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.75rem;
}

.lf-why {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 800px) {
  .lf-why {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 960px) {
  .lf-hero__grid {
    grid-template-columns: 1.05fr 0.95fr;
    gap: 2rem;
  }
}
</style>
