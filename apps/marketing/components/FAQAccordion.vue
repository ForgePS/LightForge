<script setup lang="ts">
const props = defineProps<{
  items: Array<{ question: string; answer: string }>
}>()

const openIndex = ref<number | null>(0)

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<template>
  <div class="lf-faq">
    <div v-for="(item, index) in items" :key="item.question" class="lf-faq__item lf-card">
      <button
        :id="`faq-button-${index}`"
        type="button"
        class="lf-faq__trigger"
        :aria-expanded="openIndex === index"
        :aria-controls="`faq-panel-${index}`"
        @click="toggle(index)"
      >
        <span>{{ item.question }}</span>
        <v-icon :icon="openIndex === index ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="20" />
      </button>
      <div
        :id="`faq-panel-${index}`"
        role="region"
        :aria-labelledby="`faq-button-${index}`"
        class="lf-faq__panel"
        :hidden="openIndex !== index"
      >
        <p>{{ item.answer }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lf-faq {
  display: grid;
  gap: 0.75rem;
}

.lf-faq__item {
  padding: 0;
  overflow: hidden;
  background: var(--lf-white);
  border: 1px solid rgb(16 36 58 / 0.08);
}

.lf-faq__trigger {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding: 1rem 1.1rem;
  border: 0;
  background: transparent;
  font: inherit;
  font-weight: 600;
  text-align: left;
  color: var(--lf-navy);
  cursor: pointer;
}

.lf-faq__trigger:focus-visible {
  outline: 2px solid var(--lf-green);
  outline-offset: -2px;
}

.lf-faq__panel {
  padding: 0 1.1rem 1rem;
}

.lf-faq__panel p {
  margin: 0;
  color: rgb(36 40 45 / 0.78);
  line-height: 1.65;
}
</style>
