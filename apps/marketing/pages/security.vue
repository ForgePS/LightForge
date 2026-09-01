<script setup lang="ts">
useMarketingSeo({
  title: 'Security at LightForge',
  description:
    'How LightForge approaches account access and data protection for professional lighting companies. No unverified certification claims.',
  path: '/security'
})
</script>

<template>
  <section class="lf-security-hero">
    <div class="lf-container">
      <p class="lf-eyebrow">Trust</p>
      <h1 class="lf-display">Security built into how LightForge operates.</h1>
      <p class="lf-lede">
        LightForge protects account access and customer-related business data with practical controls.
        This page describes controls that are actually in use or architected for the platform — not
        certifications we have not verified.
      </p>
    </div>
  </section>

  <SectionContainer surface>
    <SectionHeading
      eyebrow="Controls"
      title="What we focus on today"
      description="Security practices tied to the current LightForge SaaS architecture."
    />
    <div class="lf-security-grid">
      <FeatureCard
        title="Authenticated application access"
        description="The LightForge app requires signed-in access for tenant workspaces and platform administration."
        icon="mdi-shield-account-outline"
      />
      <FeatureCard
        title="Session-based access control"
        description="Application sessions are used to gate protected routes and APIs in the SaaS platform."
        icon="mdi-key-chain-variant"
      />
      <FeatureCard
        title="Tenant separation"
        description="Multi-tenant architecture keeps company workspaces separated at the application data model level."
        icon="mdi-office-building-outline"
      />
      <FeatureCard
        title="Environment separation"
        description="Marketing and SaaS environments are separated so public website forms do not receive platform secrets."
        icon="mdi-server-security"
      />
      <FeatureCard
        title="Least-privilege marketing surface"
        description="The public website does not embed database credentials, admin keys, or tenant secrets."
        icon="mdi-lock-outline"
      />
      <FeatureCard
        title="Form abuse controls"
        description="Demo and contact endpoints include validation, honeypot fields, and rate limiting."
        icon="mdi-shield-alert-outline"
      />
    </div>
  </SectionContainer>

  <SectionContainer>
    <SectionHeading
      eyebrow="What we do not claim"
      title="No unverified certifications"
      description="LightForge does not claim SOC 2, ISO 27001, FedRAMP, HIPAA, PCI certification, or other formal attestations on this site unless they are documented and verified."
    />
    <div class="lf-security-note lf-card">
      <p>
        If your organization requires a specific security questionnaire, vendor review, or
        compliance discussion, contact us and we will respond with accurate, current information.
      </p>
      <div class="lf-security-note__actions">
        <CTAButton to="/contact" variant="primary">Contact Security / Sales</CTAButton>
        <CTAButton to="/privacy" variant="outline">Privacy Policy</CTAButton>
      </div>
    </div>
  </SectionContainer>

  <CTASection
    title="Questions about security or onboarding?"
    description="Book a demo or contact the team with your security review requirements."
  />
</template>

<style scoped>
.lf-security-hero {
  padding-block: clamp(3rem, 6vw, 5rem);
  background:
    radial-gradient(circle at 90% 10%, rgb(16 36 58 / 0.08), transparent 34%),
    linear-gradient(180deg, #fafaf7, #f3f6f1);
}

.lf-security-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

.lf-security-note {
  padding: 1.35rem 1.4rem;
  display: grid;
  gap: 1rem;
  background: var(--lf-white);
  border: 1px solid rgb(16 36 58 / 0.08);
}

.lf-security-note p {
  margin: 0;
  color: rgb(36 40 45 / 0.78);
  line-height: 1.65;
  max-width: 48rem;
}

.lf-security-note__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

@media (min-width: 800px) {
  .lf-security-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
