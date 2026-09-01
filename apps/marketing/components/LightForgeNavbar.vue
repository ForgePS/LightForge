<script setup lang="ts">
import { productMegaMenu, mainNav } from '~/data/navigation'

const config = useRuntimeConfig()
const route = useRoute()
const megaOpen = ref(false)
const mobileOpen = ref(false)
const scrolled = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 8
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})

watch(
  () => route.fullPath,
  () => {
    megaOpen.value = false
    mobileOpen.value = false
  }
)

const loginHref = computed(() => config.public.appUrl as string)
</script>

<template>
  <header class="lf-nav" :class="{ 'lf-nav--scrolled': scrolled }">
    <div class="lf-container lf-nav__inner">
      <Logo with-tagline class="lf-nav__brand" />

      <nav class="lf-nav__desktop" aria-label="Primary">
        <div
          class="lf-nav__item"
          @mouseenter="megaOpen = true"
          @mouseleave="megaOpen = false"
          @focusin="megaOpen = true"
          @focusout="megaOpen = false"
        >
          <button
            class="lf-nav__link lf-nav__link--btn"
            type="button"
            :aria-expanded="megaOpen"
            aria-haspopup="true"
          >
            Product
            <v-icon size="18" icon="mdi-chevron-down" />
          </button>
          <MegaMenu v-show="megaOpen" :columns="productMegaMenu" />
        </div>

        <template v-for="item in mainNav.slice(1)" :key="item.label">
          <NuxtLink v-if="item.to && !item.children" :to="item.to" class="lf-nav__link">
            {{ item.label }}
          </NuxtLink>
          <div v-else class="lf-nav__item lf-nav__item--simple">
            <button class="lf-nav__link lf-nav__link--btn" type="button">
              {{ item.label }}
              <v-icon size="18" icon="mdi-chevron-down" />
            </button>
            <div class="lf-nav__dropdown" role="menu">
              <NuxtLink
                v-for="child in item.children"
                :key="child.label"
                :to="child.to || '/'"
                class="lf-nav__dropdown-link"
                role="menuitem"
              >
                {{ child.label }}
              </NuxtLink>
            </div>
          </div>
        </template>
      </nav>

      <div class="lf-nav__actions">
        <a :href="loginHref" class="lf-nav__login">Login</a>
        <CTAButton to="/demo" variant="gold" size="sm">Book a Demo</CTAButton>
        <button
          class="lf-nav__burger"
          type="button"
          aria-label="Open menu"
          :aria-expanded="mobileOpen"
          @click="mobileOpen = true"
        >
          <v-icon icon="mdi-menu" />
        </button>
      </div>
    </div>

    <MobileNavigation :open="mobileOpen" @close="mobileOpen = false" />
  </header>
</template>

<style scoped>
.lf-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgb(250 250 247 / 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.lf-nav--scrolled {
  border-bottom-color: rgb(16 36 58 / 0.08);
  box-shadow: var(--lf-shadow-sm);
}

.lf-nav__inner {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  min-height: 4.5rem;
}

.lf-nav__brand {
  flex: none;
}

.lf-nav__desktop {
  display: none;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  justify-content: center;
}

.lf-nav__item {
  position: relative;
}

.lf-nav__link {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  padding: 0.65rem 0.8rem;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--lf-navy);
}

.lf-nav__link:hover,
.lf-nav__link.router-link-active {
  background: rgb(31 90 50 / 0.06);
  color: var(--lf-primary-forest);
}

.lf-nav__link--btn {
  background: transparent;
  border: 0;
  cursor: pointer;
  font: inherit;
}

.lf-nav__dropdown {
  display: none;
  position: absolute;
  top: calc(100% - 0.25rem);
  left: 0;
  min-width: 14rem;
  padding: 0.5rem;
  background: var(--lf-white);
  border: 1px solid rgb(16 36 58 / 0.08);
  border-radius: 14px;
  box-shadow: var(--lf-shadow-md);
}

.lf-nav__item--simple:hover .lf-nav__dropdown,
.lf-nav__item--simple:focus-within .lf-nav__dropdown {
  display: grid;
}

.lf-nav__dropdown-link {
  padding: 0.7rem 0.85rem;
  border-radius: 10px;
  font-size: 0.9rem;
  color: var(--lf-charcoal);
}

.lf-nav__dropdown-link:hover {
  background: rgb(31 90 50 / 0.06);
  color: var(--lf-primary-forest);
}

.lf-nav__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}

.lf-nav__login {
  display: none;
  font-weight: 600;
  color: var(--lf-navy);
  padding: 0.55rem 0.7rem;
}

.lf-nav__login:hover {
  color: var(--lf-primary-forest);
}

.lf-nav__burger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--lf-navy);
  cursor: pointer;
}

@media (min-width: 1100px) {
  .lf-nav__desktop {
    display: flex;
  }

  .lf-nav__login {
    display: inline-flex;
  }

  .lf-nav__burger {
    display: none;
  }
}
</style>
