<script setup lang="ts">
const plans = [
  {
    id: 'starter',
    name: 'Starter',
    badge: null as string | null,
    summary: 'For smaller lighting companies getting organized on one operating system.',
    bestFor: ['Owner-operated teams', 'Growing holiday lighting businesses', 'Single-crew operations'],
    highlights: [
      'CRM & lead tracking',
      'Estimating & proposals',
      'Scheduling essentials',
      'Customer records',
      'Core reporting'
    ],
    recommended: false
  },
  {
    id: 'professional',
    name: 'Professional',
    badge: 'Recommended',
    summary: 'For established lighting companies managing multiple crews through the full season.',
    bestFor: ['Multi-crew install seasons', 'Holiday + service operations', 'Teams ready for field + inventory'],
    highlights: [
      'Everything in Starter',
      'LightForge Field',
      'Inventory & storage',
      'Service & takedowns',
      'Renewals & analytics'
    ],
    recommended: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    badge: null as string | null,
    summary: 'For larger businesses, multi-location organizations, and advanced operational needs.',
    bestFor: ['Multi-location operators', 'Complex crew networks', 'Advanced process requirements'],
    highlights: [
      'Everything in Professional',
      'Advanced operational controls',
      'Expanded reporting needs',
      'Implementation planning',
      'Priority onboarding conversation'
    ],
    recommended: false
  }
]

useMarketingSeo({
  title: 'Pricing for Professional Lighting Companies',
  description:
    'Starter, Professional, and Enterprise plans for lighting companies. Request pricing or book a demo — final prices are shared during consultation.',
  path: '/pricing'
})
</script>

<template>
  <section class="lf-pricing-hero">
    <div class="lf-container">
      <p class="lf-eyebrow">Pricing</p>
      <h1 class="lf-display">Pricing built for lighting companies.</h1>
      <p class="lf-lede">
        Choose the plan that matches your operation. LightForge does not publish invented list prices —
        request pricing or book a demo and we will tailor the conversation to your crew size and season.
      </p>
      <div class="lf-pricing-hero__actions">
        <CTAButton to="/demo" variant="gold" size="lg">Book a Demo</CTAButton>
        <CTAButton to="/contact" variant="outline" size="lg">Request Pricing</CTAButton>
      </div>
    </div>
  </section>

  <SectionContainer surface>
    <div class="lf-pricing-grid">
      <article
        v-for="plan in plans"
        :key="plan.id"
        class="lf-plan lf-card"
        :class="{ 'lf-plan--recommended': plan.recommended }"
      >
        <div class="lf-plan__top">
          <div>
            <h2 class="lf-h3">{{ plan.name }}</h2>
            <p>{{ plan.summary }}</p>
          </div>
          <Badge v-if="plan.badge" :label="plan.badge" tone="gold" />
        </div>

        <p class="lf-plan__price">Custom pricing</p>
        <p class="lf-plan__price-note">Shared during consultation — not published as a fixed public rate.</p>

        <h3 class="lf-plan__label">Best for</h3>
        <ul>
          <li v-for="item in plan.bestFor" :key="item">{{ item }}</li>
        </ul>

        <h3 class="lf-plan__label">Includes</h3>
        <ul>
          <li v-for="item in plan.highlights" :key="item">{{ item }}</li>
        </ul>

        <div class="lf-plan__actions">
          <CTAButton to="/demo" :variant="plan.recommended ? 'gold' : 'primary'" block>
            Book a Demo
          </CTAButton>
          <CTAButton to="/contact" variant="outline" block>Request Pricing</CTAButton>
        </div>
      </article>
    </div>
  </SectionContainer>

  <SectionContainer>
    <SectionHeading
      eyebrow="What affects pricing"
      title="We price around how you actually operate."
      description="Crew count, seasonal volume, modules needed, and implementation scope all influence the right plan."
    />
    <div class="lf-pricing-factors">
      <FeatureCard
        title="Team size & crews"
        description="Single-crew shops and multi-crew operators have different operational needs."
        icon="mdi-account-hard-hat"
      />
      <FeatureCard
        title="Season intensity"
        description="Holiday peaks, event turnarounds, and permanent project pipelines change usage patterns."
        icon="mdi-calendar-star"
      />
      <FeatureCard
        title="Module depth"
        description="Field, inventory, renewals, and advanced reporting can expand the right package."
        icon="mdi-view-module-outline"
      />
    </div>
  </SectionContainer>

  <CTASection
    title="Ready to talk through the right plan?"
    description="Book a LightForge demo or request pricing for your lighting business."
    primary-label="Book a Demo"
    secondary-label="Request Pricing"
    secondary-to="/contact"
  />
</template>

<style scoped>
.lf-pricing-hero {
  padding-block: clamp(3rem, 6vw, 5rem);
  background:
    radial-gradient(circle at 85% 15%, rgb(217 154 22 / 0.14), transparent 32%),
    linear-gradient(180deg, #fafaf7, #f3f6f1);
}

.lf-pricing-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.75rem;
}

.lf-pricing-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

.lf-plan {
  padding: 1.35rem;
  display: grid;
  gap: 0.85rem;
  background: var(--lf-white);
  border: 1px solid rgb(16 36 58 / 0.08);
}

.lf-plan--recommended {
  border-color: rgb(217 154 22 / 0.55);
  box-shadow: var(--lf-shadow-md);
  position: relative;
}

.lf-plan__top {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: start;
}

.lf-plan__top p,
.lf-plan ul {
  margin: 0;
  color: rgb(36 40 45 / 0.74);
  line-height: 1.55;
}

.lf-plan ul {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.4rem;
}

.lf-plan li {
  position: relative;
  padding-left: 0.95rem;
}

.lf-plan li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55rem;
  width: 0.35rem;
  height: 0.35rem;
  border-radius: 999px;
  background: var(--lf-green);
}

.lf-plan__price {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--lf-navy);
}

.lf-plan__price-note,
.lf-plan__label {
  margin: 0;
  font-size: 0.8rem;
  color: rgb(36 40 45 / 0.62);
}

.lf-plan__label {
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--lf-primary-forest);
}

.lf-plan__actions {
  display: grid;
  gap: 0.65rem;
  margin-top: 0.35rem;
}

.lf-pricing-factors {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 900px) {
  .lf-pricing-grid,
  .lf-pricing-factors {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
