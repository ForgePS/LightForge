<script setup lang="ts">
useMarketingSeo({
  title: 'Page not found',
  description: 'The page you requested could not be found.',
  noindex: true
})
</script>

<template>
  <section class="lf-error lf-container">
    <p class="lf-error__code">404</p>
    <h1 class="lf-display">Page not found</h1>
    <p class="lf-lede">That page is not available. Try one of these destinations.</p>
    <div class="lf-error__links">
      <CTAButton to="/" variant="primary">Home</CTAButton>
      <CTAButton to="/features" variant="outline">Features</CTAButton>
      <CTAButton to="/pricing" variant="outline">Pricing</CTAButton>
      <CTAButton to="/contact" variant="outline">Contact</CTAButton>
      <CTAButton to="/demo" variant="gold">Book a Demo</CTAButton>
    </div>
  </section>
</template>

<style scoped>
.lf-error {
  padding-block: 5rem;
}

.lf-error__code {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--lf-gold);
}

.lf-error__links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.75rem;
}
</style>
