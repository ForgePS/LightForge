<script setup lang="ts">
import { footerColumns } from '~/data/navigation'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="lf-footer">
    <div class="lf-container lf-footer__inner">
      <div class="lf-footer__brand">
        <Logo variant="dark" with-tagline />
        <p class="lf-footer__positioning">
          The operating platform for professional lighting companies.
        </p>
      </div>

      <div class="lf-footer__columns">
        <section v-for="column in footerColumns" :key="column.title">
          <h2 class="lf-footer__heading">{{ column.title }}</h2>
          <ul>
            <li v-for="link in column.links" :key="link.label">
              <NuxtLink :to="link.to">{{ link.label }}</NuxtLink>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <div class="lf-container lf-footer__bottom">
      <p>© {{ year }} LightForge</p>
      <p class="lf-footer__tag">FROM LEAD TO LIGHTS</p>
    </div>
  </footer>
</template>

<style scoped>
.lf-footer {
  background: var(--lf-navy);
  color: rgb(250 250 247 / 0.88);
  padding: 3.5rem 0 1.5rem;
  margin-top: auto;
}

.lf-footer__inner {
  display: grid;
  gap: 2.5rem;
}

.lf-footer__brand {
  display: grid;
  gap: 1rem;
  max-width: 22rem;
}

.lf-footer__positioning {
  margin: 0;
  line-height: 1.6;
  color: rgb(250 250 247 / 0.72);
}

.lf-footer__columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}

.lf-footer__heading {
  margin: 0 0 0.85rem;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--lf-gold);
}

.lf-footer ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.55rem;
}

.lf-footer a {
  color: rgb(250 250 247 / 0.82);
}

.lf-footer a:hover {
  color: var(--lf-white);
}

.lf-footer__bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 2.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgb(250 250 247 / 0.12);
  font-size: 0.875rem;
  color: rgb(250 250 247 / 0.65);
}

.lf-footer__tag {
  margin: 0;
  letter-spacing: 0.14em;
  font-weight: 600;
  color: var(--lf-green);
}

@media (min-width: 900px) {
  .lf-footer__inner {
    grid-template-columns: 1.2fr 2fr;
    align-items: start;
  }

  .lf-footer__columns {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
</style>
