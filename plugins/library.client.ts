export default defineNuxtPlugin(() => {
  const { hydrate } = useLibrary()
  hydrate()
})
