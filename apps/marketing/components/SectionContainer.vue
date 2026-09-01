<script setup lang="ts">
withDefaults(
  defineProps<{
    wide?: boolean
    dark?: boolean
    surface?: boolean
    tight?: boolean
    id?: string
  }>(),
  {
    wide: false,
    dark: false,
    surface: false,
    tight: false
  }
)
</script>

<template>
  <section
    :id="id"
    class="lf-section"
    :class="{
      'lf-section--dark': dark,
      'lf-section--surface': surface,
      'lf-section--tight': tight
    }"
  >
    <div :class="wide ? 'lf-container--wide' : 'lf-container'">
      <slot />
    </div>
  </section>
</template>
