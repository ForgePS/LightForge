<script setup lang="ts">
const { showBanner, acceptEssentialOnly, acceptAllOptional } = useCookieConsent()
</script>

<template>
  <Teleport to="body">
    <div v-if="showBanner" class="lf-cookie" role="dialog" aria-labelledby="lf-cookie-title" aria-live="polite">
      <div class="lf-cookie__panel lf-card">
        <h2 id="lf-cookie-title" class="lf-h3">Cookie preferences</h2>
        <p>
          LightForge uses essential cookies for basic site operation. Optional analytics or advertising
          cookies are disabled unless you choose to allow them.
        </p>
        <div class="lf-cookie__actions">
          <button type="button" class="lf-cookie__btn lf-cookie__btn--primary" @click="acceptEssentialOnly">
            Essential only
          </button>
          <button type="button" class="lf-cookie__btn lf-cookie__btn--gold" @click="acceptAllOptional">
            Accept optional cookies
          </button>
          <NuxtLink to="/privacy#cookies-policy" class="lf-cookie__link">Learn more</NuxtLink>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.lf-cookie {
  position: fixed;
  inset: auto 1rem 1rem 1rem;
  z-index: 300;
  display: flex;
  justify-content: center;
}

.lf-cookie__panel {
  width: min(100%, 42rem);
  padding: 1.1rem 1.2rem;
  background: var(--lf-white);
  border: 1px solid rgb(16 36 58 / 0.1);
  box-shadow: var(--lf-shadow-lg);
}

.lf-cookie__panel p {
  margin: 0.5rem 0 0;
  color: rgb(36 40 45 / 0.74);
  line-height: 1.55;
  font-size: 0.92rem;
}

.lf-cookie__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  align-items: center;
  margin-top: 1rem;
}

.lf-cookie__btn {
  border: 0;
  border-radius: 10px;
  padding: 0.65rem 0.95rem;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.lf-cookie__btn--primary {
  background: var(--lf-primary-forest);
  color: var(--lf-white);
}

.lf-cookie__btn--gold {
  background: var(--lf-gold);
  color: var(--lf-navy);
}

.lf-cookie__link {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--lf-primary-forest);
}
</style>
