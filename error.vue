<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number; statusMessage?: string } }>()
const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <main class="error-page">
    <div class="error-page__glow" />
    <p class="eyebrow">ERREUR {{ props.error.statusCode || 404 }}</p>
    <h1>Cette scène n’existe pas.</h1>
    <p>La page demandée a quitté l’affiche ou n’a jamais été programmée.</p>
    <button class="btn btn--primary" @click="handleError">
      <AppIcon name="arrow-left" :size="18" /> Retour à l’accueil
    </button>
  </main>
</template>
