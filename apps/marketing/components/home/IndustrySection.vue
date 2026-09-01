<script setup lang="ts">
const industries = [
  {
    title: 'Holiday Lighting',
    description: 'Seasonal demand, dense schedules, and renewal cycles — managed in one system.',
    to: '/solutions/holiday-lighting',
    icon: 'mdi-pine-tree'
  },
  {
    title: 'Christmas Lighting',
    description: 'Residential displays, commercial projects, and multi-crew install seasons.',
    to: '/solutions/holiday-lighting',
    icon: 'mdi-home-lightning-bolt-outline'
  },
  {
    title: 'Event Lighting',
    description: 'Venue installs, equipment, crews, and rapid turnaround from inquiry to takedown.',
    to: '/solutions/event-lighting',
    icon: 'mdi-spotlight-beam'
  },
  {
    title: 'Permanent Lighting',
    description: 'Architectural projects with estimating, scheduling, service, and warranty history.',
    to: '/solutions/permanent-lighting',
    icon: 'mdi-wall'
  },
  {
    title: 'Residential Lighting',
    description: 'Property records, proposals, installs, and customer communication at scale.',
    to: '/solutions',
    icon: 'mdi-home-city-outline'
  },
  {
    title: 'Commercial Lighting',
    description: 'Multi-site accounts, crew coordination, and financial visibility across jobs.',
    to: '/solutions',
    icon: 'mdi-office-building-outline'
  }
]
</script>

<template>
  <SectionContainer surface>
    <SectionHeading
      eyebrow="Industries"
      title="Built for Lighting Professionals"
      description="LightForge is designed for the companies that design, sell, install, service, and renew professional lighting — not generic CRM workflows."
    />
    <div class="lf-industries">
      <IndustryCard
        v-for="item in industries"
        :key="item.title"
        :title="item.title"
        :description="item.description"
        :to="item.to"
        :icon="item.icon"
      />
    </div>
  </SectionContainer>
</template>

<style scoped>
.lf-industries {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 700px) {
  .lf-industries {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1100px) {
  .lf-industries {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
