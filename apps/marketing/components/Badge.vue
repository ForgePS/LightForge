<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'green' | 'gold' | 'navy' | 'neutral'
    label: string
  }>(),
  {
    tone: 'green'
  }
)
</script>

<template>
  <span class="lf-badge" :class="`lf-badge--${tone}`">{{ label }}</span>
</template>
