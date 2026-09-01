<script setup lang="ts">
export type WorkflowStep = {
  name: string
  summary: string
  icon: string
}

const steps: WorkflowStep[] = [
  { name: 'Lead', summary: 'Capture inquiries from every channel.', icon: 'mdi-account-plus-outline' },
  { name: 'Estimate', summary: 'Build packages and pricing fast.', icon: 'mdi-calculator-variant-outline' },
  { name: 'Design', summary: 'Attach photos, plans, and scope.', icon: 'mdi-palette-outline' },
  { name: 'Approve', summary: 'Send proposals and collect signatures.', icon: 'mdi-check-decagram-outline' },
  { name: 'Schedule', summary: 'Assign crews and own the calendar.', icon: 'mdi-calendar-month-outline' },
  { name: 'Install', summary: 'Execute jobs with field-ready details.', icon: 'mdi-ladder' },
  { name: 'Service', summary: 'Resolve issues without chaos.', icon: 'mdi-wrench-outline' },
  { name: 'Remove', summary: 'Plan takedowns before season ends.', icon: 'mdi-trailer' },
  { name: 'Store', summary: 'Track returns and customer storage.', icon: 'mdi-warehouse' },
  { name: 'Renew', summary: 'Convert this season into next.', icon: 'mdi-refresh' }
]

const active = ref(0)

function select(index: number) {
  active.value = index
}
</script>

<template>
  <div class="lf-flow">
    <div class="lf-flow__track" role="list">
      <button
        v-for="(step, index) in steps"
        :key="step.name"
        type="button"
        class="lf-flow__step"
        :class="{ 'lf-flow__step--active': active === index }"
        role="listitem"
        :aria-pressed="active === index"
        @click="select(index)"
      >
        <span class="lf-flow__icon" aria-hidden="true">
          <v-icon :icon="step.icon" size="18" />
        </span>
        <span class="lf-flow__name">{{ step.name }}</span>
      </button>
    </div>

    <div class="lf-flow__detail lf-card" aria-live="polite">
      <Badge :label="`Stage ${active + 1} of ${steps.length}`" tone="green" />
      <h3 class="lf-h3">{{ steps[active].name }}</h3>
      <p>{{ steps[active].summary }}</p>
      <p class="lf-flow__note">
        From Lead to Lights is the core LightForge operating cycle for professional lighting companies.
      </p>
    </div>
  </div>
</template>

<style scoped>
.lf-flow {
  display: grid;
  gap: 1.25rem;
}

.lf-flow__track {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(7.5rem, 1fr);
  gap: 0.55rem;
  overflow-x: auto;
  padding-bottom: 0.35rem;
  scroll-snap-type: x mandatory;
}

.lf-flow__step {
  scroll-snap-align: start;
  display: grid;
  justify-items: center;
  gap: 0.45rem;
  padding: 0.85rem 0.55rem;
  border-radius: 14px;
  border: 1px solid rgb(16 36 58 / 0.1);
  background: var(--lf-white);
  cursor: pointer;
  font: inherit;
  color: var(--lf-navy);
  transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.15s ease;
}

.lf-flow__step:hover,
.lf-flow__step--active {
  border-color: rgb(31 90 50 / 0.35);
  background: rgb(31 90 50 / 0.06);
}

.lf-flow__step--active {
  transform: translateY(-2px);
  box-shadow: var(--lf-shadow-sm);
}

.lf-flow__icon {
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgb(31 90 50 / 0.1);
  color: var(--lf-primary-forest);
}

.lf-flow__name {
  font-size: 0.82rem;
  font-weight: 600;
}

.lf-flow__detail {
  padding: 1.35rem 1.4rem;
  display: grid;
  gap: 0.65rem;
  background: var(--lf-white);
  border: 1px solid rgb(16 36 58 / 0.08);
}

.lf-flow__detail p {
  margin: 0;
  color: rgb(36 40 45 / 0.74);
  line-height: 1.6;
}

.lf-flow__note {
  font-size: 0.85rem;
  color: rgb(36 40 45 / 0.6) !important;
}

@media (min-width: 1100px) {
  .lf-flow__track {
    overflow: visible;
    grid-auto-flow: unset;
    grid-template-columns: repeat(10, minmax(0, 1fr));
  }
}
</style>
