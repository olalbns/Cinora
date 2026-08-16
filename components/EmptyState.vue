<script setup lang="ts">
withDefaults(defineProps<{ icon?: string; title: string; text: string; action?: string; to?: string }>(), { icon: 'compass', action: 'Explorer le catalogue', to: '/browse' })
</script>

<template>
  <div class="empty-state">
    <div class="empty-state__icon"><AppIcon :name="icon" :size="30" /></div>
    <h2>{{ title }}</h2>
    <p>{{ text }}</p>
    <NuxtLink :to="to" class="btn btn--primary">{{ action }} <AppIcon name="arrow-right" :size="17" /></NuxtLink>
  </div>
</template>
