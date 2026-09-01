<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    description?: string
    align?: 'left' | 'center'
  }>(),
  {
    align: 'left'
  }
)
</script>

<template>
  <header class="lf-heading" :class="`lf-heading--${align}`">
    <p v-if="eyebrow" class="lf-eyebrow">{{ eyebrow }}</p>
    <h2 class="lf-h2">{{ title }}</h2>
    <p v-if="description" class="lf-lede">{{ description }}</p>
  </header>
</template>

<style scoped>
.lf-heading {
  display: grid;
  gap: 0.85rem;
  margin-bottom: 2rem;
}

.lf-heading--center {
  text-align: center;
  justify-items: center;
}

.lf-heading--center .lf-lede {
  margin-inline: auto;
}
</style>
