<script setup lang="ts">
const serviceOptions = [
  'Holiday Lighting',
  'Event Lighting',
  'Permanent Lighting',
  'Commercial Lighting',
  'Residential Lighting',
  'Other'
]

const form = reactive({
  firstName: '',
  lastName: '',
  companyName: '',
  email: '',
  phone: '',
  website: '',
  primaryServices: [] as string[],
  approximateAnnualLightingRevenue: '',
  numberOfCrews: '',
  currentSoftware: '',
  message: '',
  websiteTrap: ''
})

const errors = reactive<Record<string, string>>({})
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const statusMessage = ref('')

const demoIncludes = [
  'CRM',
  'Leads',
  'Estimating',
  'Proposals',
  'Scheduling',
  'Field Operations',
  'Inventory',
  'Customer Portal',
  'Service',
  'Takedowns',
  'Renewals',
  'Payments',
  'Analytics'
]

function validate() {
  Object.keys(errors).forEach(key => delete errors[key])
  if (!form.firstName.trim()) errors.firstName = 'First name is required'
  if (!form.lastName.trim()) errors.lastName = 'Last name is required'
  if (!form.companyName.trim()) errors.companyName = 'Company name is required'
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email'
  }
  if (!form.phone.trim()) errors.phone = 'Phone is required'
  if (!form.primaryServices.length) errors.primaryServices = 'Select at least one primary service'
  return Object.keys(errors).length === 0
}

async function onSubmit() {
  if (!validate()) return

  status.value = 'loading'
  statusMessage.value = ''

  try {
    const result = await $fetch<{ ok: boolean; message?: string }>('/api/demo', {
      method: 'POST',
      body: { ...form }
    })
    status.value = 'success'
    statusMessage.value = result.message || 'Thanks — your demo request was received.'
    form.message = ''
  } catch (error: unknown) {
    status.value = 'error'
    const err = error as { data?: { statusMessage?: string }; statusMessage?: string }
    statusMessage.value =
      err?.data?.statusMessage || err?.statusMessage || 'Something went wrong. Please try again.'
  }
}

useMarketingSeo({
  title: 'See LightForge in Action',
  description:
    'Book a LightForge demo covering CRM, estimating, proposals, scheduling, field, inventory, portal, service, takedowns, renewals, payments, and analytics.',
  path: '/demo'
})
</script>

<template>
  <section class="lf-demo-hero">
    <div class="lf-container lf-demo-hero__grid">
      <div>
        <p class="lf-eyebrow">Demo</p>
        <h1 class="lf-display">See LightForge in Action.</h1>
        <p class="lf-lede">
          Walk through the operating platform built for professional lighting companies — from lead to
          lights.
        </p>
        <ul class="lf-demo-includes">
          <li v-for="item in demoIncludes" :key="item">{{ item }}</li>
        </ul>
      </div>

      <form class="lf-form lf-card" novalidate @submit.prevent="onSubmit">
        <h2 class="lf-h3">Book your demo</h2>
        <p class="lf-form__intro">Tell us about your lighting business and we will follow up.</p>

        <div class="lf-form__row">
          <FormField v-model="form.firstName" label="First Name" required :error="errors.firstName" autocomplete="given-name" />
          <FormField v-model="form.lastName" label="Last Name" required :error="errors.lastName" autocomplete="family-name" />
        </div>

        <FormField v-model="form.companyName" label="Company Name" required :error="errors.companyName" autocomplete="organization" />
        <div class="lf-form__row">
          <FormField v-model="form.email" label="Email" type="email" required :error="errors.email" autocomplete="email" />
          <FormField v-model="form.phone" label="Phone" type="tel" required :error="errors.phone" autocomplete="tel" />
        </div>
        <FormField v-model="form.website" label="Website" type="url" autocomplete="url" />

        <fieldset class="lf-fieldset">
          <legend>Primary Services</legend>
          <div class="lf-check-grid">
            <label v-for="option in serviceOptions" :key="option" class="lf-check">
              <input v-model="form.primaryServices" type="checkbox" :value="option" />
              <span>{{ option }}</span>
            </label>
          </div>
          <p v-if="errors.primaryServices" class="lf-field__error">{{ errors.primaryServices }}</p>
        </fieldset>

        <div class="lf-form__row">
          <FormField
            v-model="form.approximateAnnualLightingRevenue"
            label="Approximate Annual Lighting Revenue"
          />
          <FormField v-model="form.numberOfCrews" label="Number of Crews" />
        </div>

        <FormField v-model="form.currentSoftware" label="Current Software" />
        <FormField v-model="form.message" label="Message" type="textarea" />

        <!-- Honeypot -->
        <div class="lf-hp" aria-hidden="true">
          <label>
            Website
            <input v-model="form.websiteTrap" tabindex="-1" autocomplete="off" />
          </label>
        </div>

        <p v-if="statusMessage" class="lf-form__status" :data-state="status" role="status">
          {{ statusMessage }}
        </p>

        <button class="lf-submit" type="submit" :disabled="status === 'loading'">
          {{ status === 'loading' ? 'Submitting…' : 'Request Demo' }}
        </button>
      </form>
    </div>
  </section>
</template>

<style scoped>
.lf-demo-hero {
  padding-block: clamp(3rem, 6vw, 5rem) var(--lf-space-section);
  background:
    radial-gradient(circle at 12% 20%, rgb(111 175 45 / 0.12), transparent 30%),
    linear-gradient(180deg, #fafaf7, #f3f6f1);
}

.lf-demo-hero__grid {
  display: grid;
  gap: 2rem;
  align-items: start;
}

.lf-demo-includes {
  list-style: none;
  margin: 1.5rem 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.lf-demo-includes li {
  padding: 0.4rem 0.7rem;
  border-radius: 999px;
  background: rgb(31 90 50 / 0.08);
  color: var(--lf-primary-forest);
  font-size: 0.8rem;
  font-weight: 600;
}

.lf-form {
  padding: 1.35rem;
  display: grid;
  gap: 0.9rem;
  background: var(--lf-white);
  border: 1px solid rgb(16 36 58 / 0.08);
  box-shadow: var(--lf-shadow-md);
}

.lf-form__intro {
  margin: -0.25rem 0 0;
  color: rgb(36 40 45 / 0.7);
}

.lf-form__row {
  display: grid;
  gap: 0.9rem;
}

.lf-fieldset {
  border: 1px solid rgb(16 36 58 / 0.1);
  border-radius: 12px;
  padding: 0.85rem;
}

.lf-fieldset legend {
  padding: 0 0.35rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--lf-navy);
}

.lf-check-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
}

.lf-check {
  display: flex;
  gap: 0.45rem;
  align-items: center;
  font-size: 0.9rem;
}

.lf-hp {
  position: absolute;
  left: -10000px;
  opacity: 0;
  height: 0;
  overflow: hidden;
}

.lf-form__status[data-state='success'] {
  color: var(--lf-primary-forest);
}

.lf-form__status[data-state='error'] {
  color: #b42318;
}

.lf-submit {
  justify-self: start;
  border: 0;
  border-radius: 12px;
  padding: 0.85rem 1.25rem;
  background: var(--lf-gold);
  color: var(--lf-navy);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.lf-submit:disabled {
  opacity: 0.7;
  cursor: wait;
}

@media (min-width: 960px) {
  .lf-demo-hero__grid {
    grid-template-columns: 0.9fr 1.1fr;
  }

  .lf-form__row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
