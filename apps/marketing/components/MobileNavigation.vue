<script setup lang="ts">
import { mainNav, productMegaMenu } from '~/data/navigation'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const config = useRuntimeConfig()
const expanded = ref<string | null>('Product')

function toggle(label: string) {
  expanded.value = expanded.value === label ? null : label
}

const loginHref = computed(() => config.public.appUrl as string)
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="lf-mobile" role="dialog" aria-modal="true" aria-label="Mobile navigation">
      <div class="lf-mobile__backdrop" @click="emit('close')" />
      <aside class="lf-mobile__panel">
        <div class="lf-mobile__top">
          <Logo />
          <button type="button" class="lf-mobile__close" aria-label="Close menu" @click="emit('close')">
            <v-icon icon="mdi-close" />
          </button>
        </div>

        <nav class="lf-mobile__nav" aria-label="Mobile">
          <div class="lf-mobile__group">
            <button type="button" class="lf-mobile__toggle" :aria-expanded="expanded === 'Product'" @click="toggle('Product')">
              Product
              <v-icon :icon="expanded === 'Product' ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
            </button>
            <div v-show="expanded === 'Product'" class="lf-mobile__children">
              <template v-for="column in productMegaMenu" :key="column.title">
                <p class="lf-mobile__section">{{ column.title }}</p>
                <NuxtLink
                  v-for="item in column.items"
                  :key="item.label"
                  :to="item.to || '/'"
                  class="lf-mobile__link"
                  @click="emit('close')"
                >
                  {{ item.label }}
                </NuxtLink>
              </template>
            </div>
          </div>

          <template v-for="item in mainNav.slice(1)" :key="item.label">
            <NuxtLink
              v-if="item.to && !item.children"
              :to="item.to"
              class="lf-mobile__top-link"
              @click="emit('close')"
            >
              {{ item.label }}
            </NuxtLink>
            <div v-else class="lf-mobile__group">
              <button
                type="button"
                class="lf-mobile__toggle"
                :aria-expanded="expanded === item.label"
                @click="toggle(item.label)"
              >
                {{ item.label }}
                <v-icon :icon="expanded === item.label ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
              </button>
              <div v-show="expanded === item.label" class="lf-mobile__children">
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.label"
                  :to="child.to || '/'"
                  class="lf-mobile__link"
                  @click="emit('close')"
                >
                  {{ child.label }}
                </NuxtLink>
              </div>
            </div>
          </template>
        </nav>

        <div class="lf-mobile__cta">
          <a :href="loginHref" class="lf-mobile__login" @click="emit('close')">Login</a>
          <CTAButton to="/demo" variant="gold" block @click="emit('close')">Book a Demo</CTAButton>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.lf-mobile__backdrop {
  position: fixed;
  inset: 0;
  background: rgb(16 36 58 / 0.45);
  z-index: 200;
}

.lf-mobile__panel {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 210;
  width: min(100%, 22rem);
  height: 100%;
  background: var(--lf-white);
  display: flex;
  flex-direction: column;
  box-shadow: var(--lf-shadow-lg);
}

.lf-mobile__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1rem 0.75rem;
  border-bottom: 1px solid rgb(16 36 58 / 0.08);
}

.lf-mobile__close {
  width: 2.5rem;
  height: 2.5rem;
  border: 0;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
}

.lf-mobile__nav {
  overflow: auto;
  padding: 0.75rem 1rem 1rem;
  flex: 1;
}

.lf-mobile__top-link,
.lf-mobile__toggle {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 0.35rem;
  border: 0;
  background: transparent;
  font: inherit;
  font-weight: 600;
  color: var(--lf-navy);
  cursor: pointer;
  text-align: left;
}

.lf-mobile__children {
  display: grid;
  gap: 0.15rem;
  padding: 0 0 0.75rem 0.5rem;
}

.lf-mobile__section {
  margin: 0.65rem 0 0.25rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--lf-primary-forest);
}

.lf-mobile__link {
  padding: 0.55rem 0.35rem;
  border-radius: 8px;
  color: var(--lf-charcoal);
}

.lf-mobile__link:hover {
  background: rgb(31 90 50 / 0.06);
}

.lf-mobile__cta {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid rgb(16 36 58 / 0.08);
}

.lf-mobile__login {
  text-align: center;
  font-weight: 600;
  color: var(--lf-navy);
  padding: 0.65rem;
}
</style>
