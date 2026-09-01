<script setup lang="ts">
import type { MegaColumn } from '~/data/navigation'

defineProps<{
  columns: MegaColumn[]
}>()
</script>

<template>
  <div class="lf-mega" role="region" aria-label="Product menu">
    <div class="lf-mega__grid">
      <section v-for="column in columns" :key="column.title" class="lf-mega__col">
        <h3 class="lf-mega__title">{{ column.title }}</h3>
        <ul class="lf-mega__list">
          <li v-for="item in column.items" :key="item.label">
            <NuxtLink :to="item.to || '/'" class="lf-mega__link">
              <span class="lf-mega__label">{{ item.label }}</span>
              <span v-if="item.description" class="lf-mega__desc">{{ item.description }}</span>
            </NuxtLink>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.lf-mega {
  position: absolute;
  top: calc(100% - 0.15rem);
  left: 50%;
  transform: translateX(-50%);
  width: min(92vw, 980px);
  padding: 1.25rem;
  background: var(--lf-white);
  border: 1px solid rgb(16 36 58 / 0.08);
  border-radius: 18px;
  box-shadow: var(--lf-shadow-lg);
}

.lf-mega__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem 1.25rem;
}

.lf-mega__title {
  margin: 0 0 0.55rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--lf-primary-forest);
}

.lf-mega__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.15rem;
}

.lf-mega__link {
  display: grid;
  gap: 0.1rem;
  padding: 0.55rem 0.65rem;
  border-radius: 10px;
}

.lf-mega__link:hover {
  background: rgb(31 90 50 / 0.05);
}

.lf-mega__label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--lf-navy);
}

.lf-mega__desc {
  font-size: 0.78rem;
  color: rgb(36 40 45 / 0.68);
}

@media (max-width: 900px) {
  .lf-mega__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
