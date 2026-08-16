<script setup lang="ts">
definePageMeta({ layout: false })
const password = ref('')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

onMounted(async () => {
  const session = await $fetch<{ authenticated: boolean }>('/api/admin/auth/session').catch(() => ({ authenticated: false }))
  if (session.authenticated) await navigateTo('/admin')
})

async function login() {
  if (!password.value) return
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/admin/auth/login', { method: 'POST', body: { password: password.value } })
    await navigateTo('/admin')
  } catch (cause: any) {
    error.value = cause?.data?.statusMessage || cause?.statusMessage || 'Connexion impossible'
  } finally { loading.value = false }
}
useSeoMeta({ title: 'Administration', robots: 'noindex,nofollow' })
</script>

<template>
  <main class="admin-login">
    <div class="admin-login__glow" />
    <NuxtLink to="/" class="admin-login__brand"><span>C</span><strong>CINORA</strong></NuxtLink>
    <section class="admin-login__card">
      <div class="admin-login__lock"><AppIcon name="settings" :size="24" /></div>
      <p class="admin-kicker">ESPACE PRIVÉ</p>
      <h1>Bienvenue dans<br>votre studio.</h1>
      <p class="admin-login__intro">Connectez-vous pour gérer les API, l’identité et les fonctionnalités du site.</p>
      <form @submit.prevent="login">
        <label for="admin-password">Mot de passe administrateur</label>
        <div class="admin-password-field">
          <input id="admin-password" v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" placeholder="Votre mot de passe" autofocus>
          <button type="button" :aria-label="showPassword ? 'Masquer' : 'Afficher'" @click="showPassword = !showPassword"><AppIcon :name="showPassword ? 'close' : 'info'" :size="18" /></button>
        </div>
        <p v-if="error" class="admin-form-error"><AppIcon name="info" :size="16" />{{ error }}</p>
        <button class="admin-primary-btn" type="submit" :disabled="loading || !password"><span v-if="loading" class="spinner" />{{ loading ? 'Connexion…' : 'Ouvrir le dashboard' }}<AppIcon v-if="!loading" name="arrow-right" :size="18" /></button>
      </form>
      <div class="admin-login__secure"><AppIcon name="check" :size="15" /> Session sécurisée par cookie HttpOnly · expiration 8 h</div>
    </section>
  </main>
</template>
