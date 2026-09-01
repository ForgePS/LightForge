<script setup lang="ts">
useMarketingSeo({
  title: 'About LightForge',
  description:
    'LightForge exists to help professional lighting companies run the full season — from lead to lights — on one operating platform.',
  path: '/about'
})
</script>

<template>
  <section class="lf-about-hero">
    <div class="lf-container">
      <p class="lf-eyebrow">Company</p>
      <h1 class="lf-display">Built for the lighting businesses that keep the season running.</h1>
      <p class="lf-lede">
        LightForge exists because professional lighting companies need more than a CRM. They need an
        operating platform that carries work from the first lead through install, service, takedown,
        storage, and renewal.
      </p>
    </div>
  </section>

  <SectionContainer surface>
    <SectionHeading
      eyebrow="Why LightForge exists"
      title="The problem is operational, not just sales."
      description="Lighting companies juggle seasonal demand, crew capacity, materials, customer expectations, and end-of-season removals. Tools built for generic sales pipelines stop too early."
    />
    <div class="lf-about-grid">
      <FeatureCard
        title="Fragmented tools"
        description="Leads in one place, schedules in another, inventory in a spreadsheet, and renewals reconstructed every year."
        icon="mdi-puzzle-outline"
      />
      <FeatureCard
        title="Season pressure"
        description="Install windows are short. Missed handoffs between sales, office, and field become lost revenue and stressed crews."
        icon="mdi-clock-alert-outline"
      />
      <FeatureCard
        title="End-of-season chaos"
        description="Takedowns, returns, storage, and renewals are where many systems go silent — and where next season is won or lost."
        icon="mdi-weather-night"
      />
    </div>
  </SectionContainer>

  <SectionContainer>
    <SectionHeading
      eyebrow="Philosophy"
      title="From Lead to Lights"
      description="The LightForge product story is the full operating cycle of a professional lighting company."
    />
    <div class="lf-about-philosophy lf-card">
      <p>
        From Lead to Lights means the platform stays with the job after the proposal is signed. It
        supports estimating, approval, scheduling, crew execution, service, removal, storage, and
        renewal as one connected workflow.
      </p>
      <p>
        LightForge is designed specifically for holiday lighting, Christmas lighting, event lighting,
        permanent lighting, and related professional lighting operations — not positioned as a
        generic CRM with lighting labels.
      </p>
    </div>
  </SectionContainer>

  <SectionContainer surface>
    <SectionHeading
      eyebrow="Focus"
      title="Professional lighting companies"
      description="Residential and commercial lighting contractors, seasonal decorating companies, and multi-crew lighting operations."
    />
    <div class="lf-about-focus">
      <IndustryCard
        title="Holiday & Christmas Lighting"
        description="Seasonal demand, dense calendars, storage, and renewals."
        to="/solutions/holiday-lighting"
        icon="mdi-pine-tree"
      />
      <IndustryCard
        title="Event Lighting"
        description="Venue timelines, equipment, install/strike, and billing."
        to="/solutions/event-lighting"
        icon="mdi-spotlight-beam"
      />
      <IndustryCard
        title="Permanent Lighting"
        description="Project continuity, service history, and long-term accounts."
        to="/solutions/permanent-lighting"
        icon="mdi-wall"
      />
    </div>
  </SectionContainer>

  <CTASection
    title="See the operating platform in action"
    description="Book a demo and walk From Lead to Lights against your lighting business."
  />
</template>

<style scoped>
.lf-about-hero {
  padding-block: clamp(3rem, 6vw, 5rem);
  background:
    radial-gradient(circle at 80% 20%, rgb(111 175 45 / 0.14), transparent 34%),
    linear-gradient(180deg, #fafaf7, #f3f6f1);
}

.lf-about-grid,
.lf-about-focus {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

.lf-about-philosophy {
  padding: 1.4rem 1.5rem;
  display: grid;
  gap: 1rem;
  background: var(--lf-white);
  border: 1px solid rgb(16 36 58 / 0.08);
}

.lf-about-philosophy p {
  margin: 0;
  color: rgb(36 40 45 / 0.78);
  line-height: 1.7;
  max-width: 52rem;
}

@media (min-width: 800px) {
  .lf-about-grid,
  .lf-about-focus {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
