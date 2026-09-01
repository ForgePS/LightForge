<script setup lang="ts">
const floating = [
  { label: 'Seasonal Revenue', value: '$187,450' },
  { label: 'Upcoming Installs', value: '34' },
  { label: 'Open Leads', value: '18' },
  { label: 'Close Rate', value: '71%' }
]

const modules = [
  { title: 'Revenue Overview', detail: 'Month-to-date vs plan' },
  { title: 'Sales Pipeline', detail: '18 open opportunities' },
  { title: 'Upcoming Installations', detail: '34 jobs this week' },
  { title: 'Crew Status', detail: '6 crews scheduled' },
  { title: 'Inventory Alerts', detail: '3 reorder items' },
  { title: 'Service Requests', detail: '5 open tickets' }
]
</script>

<template>
  <div class="lf-dash" aria-hidden="true">
    <MetricCard
      v-for="(item, index) in floating"
      :key="item.label"
      class="lf-dash__float"
      :class="`lf-dash__float--${index + 1}`"
      :label="item.label"
      :value="item.value"
      hint="Demo data"
    />

    <div class="lf-dash__panel lf-card">
      <div class="lf-dash__top">
        <div>
          <p class="lf-eyebrow">LightForge</p>
          <strong>Season Command Center</strong>
        </div>
        <Badge label="Demo preview" tone="gold" />
      </div>

      <div class="lf-dash__modules">
        <article v-for="mod in modules" :key="mod.title" class="lf-dash__module">
          <h3>{{ mod.title }}</h3>
          <p>{{ mod.detail }}</p>
          <div class="lf-dash__bar"><span /></div>
        </article>
      </div>

      <p class="lf-dash__note">Demonstration UI with synthetic sample data — not live customer metrics.</p>
    </div>
  </div>
</template>

<style scoped>
.lf-dash {
  position: relative;
  padding: 1rem 0.25rem 0.5rem;
}

.lf-dash__panel {
  position: relative;
  z-index: 1;
  padding: 1.15rem;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.98), rgb(250 250 247 / 0.96)),
    var(--lf-white);
  border: 1px solid rgb(16 36 58 / 0.08);
  box-shadow: var(--lf-shadow-lg);
}

.lf-dash__top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: start;
  margin-bottom: 1rem;
}

.lf-dash__top strong {
  display: block;
  margin-top: 0.25rem;
  color: var(--lf-navy);
  font-size: 1.05rem;
}

.lf-dash__modules {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
}

.lf-dash__module {
  padding: 0.85rem;
  border-radius: 12px;
  background: rgb(31 90 50 / 0.04);
  border: 1px solid rgb(16 36 58 / 0.06);
}

.lf-dash__module h3 {
  margin: 0;
  font-size: 0.86rem;
  color: var(--lf-navy);
}

.lf-dash__module p {
  margin: 0.25rem 0 0.55rem;
  font-size: 0.78rem;
  color: rgb(36 40 45 / 0.65);
}

.lf-dash__bar {
  height: 5px;
  border-radius: 999px;
  background: rgb(16 36 58 / 0.08);
  overflow: hidden;
}

.lf-dash__bar span {
  display: block;
  width: 68%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--lf-primary-forest), var(--lf-green));
}

.lf-dash__note {
  margin: 0.9rem 0 0;
  font-size: 0.72rem;
  color: rgb(36 40 45 / 0.55);
}

.lf-dash__float {
  display: none;
}

@media (min-width: 960px) {
  .lf-dash {
    padding: 1.5rem 1rem 1rem;
  }

  .lf-dash__float {
    display: block;
    position: absolute;
    z-index: 2;
    width: 10.5rem;
    animation: lf-float 5s ease-in-out infinite;
  }

  .lf-dash__float--1 {
    top: 0;
    left: -0.5rem;
    animation-delay: 0s;
  }

  .lf-dash__float--2 {
    top: 0.25rem;
    right: -0.75rem;
    animation-delay: 0.4s;
  }

  .lf-dash__float--3 {
    bottom: 2.5rem;
    left: -1rem;
    animation-delay: 0.8s;
  }

  .lf-dash__float--4 {
    bottom: 1.5rem;
    right: -0.5rem;
    animation-delay: 1.1s;
  }
}

@keyframes lf-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .lf-dash__float {
    animation: none;
  }
}
</style>
