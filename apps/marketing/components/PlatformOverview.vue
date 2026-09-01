<script setup lang="ts">
const categories = [
  {
    title: 'Sales',
    items: ['Leads', 'CRM', 'Customers', 'Pipeline', 'Opportunities', 'Follow-Ups', 'Automations', 'Marketing']
  },
  {
    title: 'Estimating',
    items: ['Estimates', 'Proposals', 'Packages', 'Options', 'Add-Ons', 'Approvals', 'Deposits']
  },
  {
    title: 'Operations',
    items: ['Jobs', 'Scheduling', 'Crew Management', 'Routes', 'Installations', 'Service Calls', 'Takedowns']
  },
  {
    title: 'Field',
    items: ['Daily Jobs', 'Navigation', 'Customer Information', 'Install Instructions', 'Photos', 'Materials', 'Checklists', 'Completion']
  },
  {
    title: 'Materials',
    items: ['Inventory', 'Warehouses', 'Storage', 'Material Allocation', 'Returns', 'Damage Tracking']
  },
  {
    title: 'Financial',
    items: ['Estimates', 'Contracts', 'Deposits', 'Invoices', 'Payments']
  },
  {
    title: 'Customer Experience',
    items: ['Customer Portal', 'Approvals', 'Messages', 'Service Requests', 'Photos', 'Payments', 'Renewals']
  },
  {
    title: 'Management',
    items: ['Dashboards', 'Analytics', 'Sales Reports', 'Crew Performance', 'Job Profitability', 'Seasonal Reporting']
  }
]
</script>

<template>
  <div class="lf-platform">
    <article v-for="category in categories" :key="category.title" class="lf-platform__card lf-card">
      <h3 class="lf-h3">{{ category.title }}</h3>
      <ul>
        <li v-for="item in category.items" :key="item">{{ item }}</li>
      </ul>
    </article>
  </div>
</template>

<style scoped>
.lf-platform {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

.lf-platform__card {
  padding: 1.2rem 1.25rem;
  background: var(--lf-white);
  border: 1px solid rgb(16 36 58 / 0.08);
}

.lf-platform__card ul {
  list-style: none;
  margin: 0.85rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.4rem;
}

.lf-platform__card li {
  position: relative;
  padding-left: 0.95rem;
  font-size: 0.9rem;
  color: rgb(36 40 45 / 0.75);
}

.lf-platform__card li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55rem;
  width: 0.35rem;
  height: 0.35rem;
  border-radius: 999px;
  background: var(--lf-green);
}

@media (min-width: 700px) {
  .lf-platform {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1100px) {
  .lf-platform {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
