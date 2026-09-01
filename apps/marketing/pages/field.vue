<script setup lang="ts">
import { productPages } from '~/data/product-pages'
</script>

<template>
  <ProductPageLayout :content="productPages.field" dark-preview />
</template>
