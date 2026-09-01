<script setup lang="ts">
const form = reactive({
  firstName: '',
  lastName: '',
  company: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  websiteTrap: ''
})

const errors = reactive<Record<string, string>>({})
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const statusMessage = ref('')

function validate() {
  Object.keys(errors).forEach(key => delete errors[key])
  if (!form.firstName.trim()) errors.firstName = 'First name is required'
  if (!form.lastName.trim()) errors.lastName = 'Last name is required'
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email'
  }
  if (!form.subject.trim()) errors.subject = 'Subject is required'
  if (!form.message.trim()) errors.message = 'Message is required'
  return Object.keys(errors).length === 0
}

async function onSubmit() {
  if (!validate()) return
  status.value = 'loading'
  statusMessage.value = ''

  try {
    const result = await $fetch<{ ok: boolean; message?: string }>('/api/contact', {
      method: 'POST',
      body: { ...form }
    })
    status.value = 'success'
    statusMessage.value = result.message || 'Thanks — your message was received.'
    form.message = ''
  } catch (error: unknown) {
    status.value = 'error'
    const err = error as { data?: { statusMessage?: string }; statusMessage?: string }
    statusMessage.value =
      err?.data?.statusMessage || err?.statusMessage || 'Something went wrong. Please try again.'
  }
}

useMarketingSeo({
  title: 'Contact LightForge',
  description: 'Contact the LightForge team about demos, pricing, and implementation for professional lighting companies.',
  path: '/contact'
})
</script>

<template>
  <section class="lf-contact">
    <div class="lf-container lf-contact__grid">
      <div>
        <p class="lf-eyebrow">Company</p>
        <h1 class="lf-display">Contact LightForge</h1>
        <p class="lf-lede">
          Talk with the LightForge team about demos, pricing, and implementation for your lighting
          business.
        </p>
        <ul class="lf-contact__points">
          <li>Demo walkthroughs tailored to holiday, event, or permanent lighting</li>
          <li>Pricing conversations based on crews and operational scope</li>
          <li>Questions about implementation and seasonal workflows</li>
        </ul>
      </div>

      <form class="lf-form lf-card" novalidate @submit.prevent="onSubmit">
        <div class="lf-form__row">
          <FormField v-model="form.firstName" label="First Name" required :error="errors.firstName" autocomplete="given-name" />
          <FormField v-model="form.lastName" label="Last Name" required :error="errors.lastName" autocomplete="family-name" />
        </div>
        <FormField v-model="form.company" label="Company" autocomplete="organization" />
        <div class="lf-form__row">
          <FormField v-model="form.email" label="Email" type="email" required :error="errors.email" autocomplete="email" />
          <FormField v-model="form.phone" label="Phone" type="tel" autocomplete="tel" />
        </div>
        <FormField v-model="form.subject" label="Subject" required :error="errors.subject" />
        <FormField v-model="form.message" label="Message" type="textarea" required :error="errors.message" />

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
          {{ status === 'loading' ? 'Sending…' : 'Send Message' }}
        </button>
      </form>
    </div>
  </section>
</template>

<style scoped>
.lf-contact {
  padding-block: clamp(3rem, 6vw, 5rem) var(--lf-space-section);
  background: linear-gradient(180deg, #fafaf7, #f3f6f1);
}

.lf-contact__grid {
  display: grid;
  gap: 2rem;
  align-items: start;
}

.lf-contact__points {
  margin: 1.5rem 0 0;
  padding-left: 1.1rem;
  color: rgb(36 40 45 / 0.78);
  line-height: 1.6;
  display: grid;
  gap: 0.55rem;
}

.lf-form {
  padding: 1.35rem;
  display: grid;
  gap: 0.9rem;
  background: var(--lf-white);
  border: 1px solid rgb(16 36 58 / 0.08);
  box-shadow: var(--lf-shadow-md);
}

.lf-form__row {
  display: grid;
  gap: 0.9rem;
}

.lf-hp {
  position: absolute;
  left: -10000px;
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

@media (min-width: 900px) {
  .lf-contact__grid {
    grid-template-columns: 0.95fr 1.05fr;
  }

  .lf-form__row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
