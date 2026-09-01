<script setup lang="ts">
import { helpCategories } from '~/data/help'

const query = ref('')
const openCategory = ref<string | null>('getting-started')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return helpCategories

  return helpCategories
    .map(category => ({
      ...category,
      articles: category.articles.filter(
        article =>
          article.title.toLowerCase().includes(q) || article.description.toLowerCase().includes(q)
      )
    }))
    .filter(category => category.title.toLowerCase().includes(q) || category.articles.length)
})

function toggleCategory(id: string) {
  openCategory.value = openCategory.value === id ? null : id
}

useMarketingSeo({
  title: 'Help Center',
  description:
    'LightForge help center for getting started, CRM, estimating, scheduling, field operations, inventory, billing, customer portal, service, and renewals.',
  path: '/help'
})
</script>

<template>
  <section class="lf-help-hero">
    <div class="lf-container">
      <p class="lf-eyebrow">Help</p>
      <h1 class="lf-display">Help Center</h1>
      <p class="lf-lede">
        Browse help topics for CRM, estimating, scheduling, field, inventory, billing, customer
        portal, service, and renewals. Detailed articles will be added as documentation is published.
      </p>
      <label class="lf-help-search">
        <span class="lf-sr-only">Search help topics</span>
        <input v-model="query" type="search" class="lf-input" placeholder="Search help topics…" />
      </label>
    </div>
  </section>

  <SectionContainer surface>
    <div class="lf-help-layout">
      <aside class="lf-help-nav lf-card" aria-label="Help categories">
        <button
          v-for="category in filtered"
          :key="category.id"
          type="button"
          class="lf-help-nav__btn"
          :class="{ 'lf-help-nav__btn--active': openCategory === category.id }"
          @click="toggleCategory(category.id)"
        >
          {{ category.title }}
        </button>
      </aside>

      <div class="lf-help-content">
        <section
          v-for="category in filtered"
          :key="category.id"
          class="lf-help-category lf-card"
          :hidden="openCategory !== null && openCategory !== category.id"
        >
          <h2 class="lf-h3">{{ category.title }}</h2>
          <p>{{ category.description }}</p>
          <ul>
            <li v-for="article in category.articles" :key="article.title">
              <NuxtLink v-if="article.href && article.status === 'available'" :to="article.href" class="lf-help-article">
                <strong>{{ article.title }}</strong>
                <span>{{ article.description }}</span>
              </NuxtLink>
              <div v-else class="lf-help-article lf-help-article--soon">
                <strong>{{ article.title }}</strong>
                <span>{{ article.description }}</span>
                <Badge label="Coming soon" tone="navy" />
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </SectionContainer>

  <SectionContainer>
    <SectionHeading
      eyebrow="Need more help?"
      title="Talk with the LightForge team"
      description="Book a demo or contact us for implementation and product questions."
    />
    <div class="lf-help-actions">
      <CTAButton to="/demo" variant="gold">Book a Demo</CTAButton>
      <CTAButton to="/contact" variant="outline">Contact</CTAButton>
    </div>
  </SectionContainer>
</template>

<style scoped>
.lf-help-hero {
  padding-block: clamp(3rem, 6vw, 5rem);
  background: linear-gradient(180deg, #fafaf7, #f3f6f1);
}

.lf-help-search {
  display: block;
  max-width: 28rem;
  margin-top: 1.25rem;
}

.lf-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.lf-help-layout {
  display: grid;
  gap: 1rem;
}

.lf-help-nav,
.lf-help-category {
  padding: 1.1rem 1.15rem;
  background: var(--lf-white);
  border: 1px solid rgb(16 36 58 / 0.08);
}

.lf-help-nav {
  display: grid;
  gap: 0.35rem;
  align-content: start;
}

.lf-help-nav__btn {
  text-align: left;
  border: 0;
  background: transparent;
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  font: inherit;
  font-weight: 600;
  color: var(--lf-navy);
  cursor: pointer;
}

.lf-help-nav__btn:hover,
.lf-help-nav__btn--active {
  background: rgb(31 90 50 / 0.08);
  color: var(--lf-primary-forest);
}

.lf-help-category p {
  margin: 0.35rem 0 0.85rem;
  color: rgb(36 40 45 / 0.72);
}

.lf-help-category ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.65rem;
}

.lf-help-article {
  display: grid;
  gap: 0.2rem;
  padding: 0.75rem 0.85rem;
  border-radius: 12px;
  border: 1px solid rgb(16 36 58 / 0.06);
  background: rgb(31 90 50 / 0.03);
}

a.lf-help-article:hover {
  border-color: rgb(31 90 50 / 0.25);
}

.lf-help-article strong {
  color: var(--lf-navy);
}

.lf-help-article span {
  color: rgb(36 40 45 / 0.7);
  font-size: 0.92rem;
  line-height: 1.5;
}

.lf-help-article--soon {
  opacity: 0.92;
}

.lf-help-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

@media (min-width: 960px) {
  .lf-help-layout {
    grid-template-columns: 16rem 1fr;
    align-items: start;
  }
}
</style>
