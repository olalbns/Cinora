export default defineAppConfig({
  brand: {
    name: 'CINORA',
    shortName: 'C',
    tagline: 'Le cinéma vous appartient.',
    accent: '#e5092b',
    supportEmail: 'bonjour@cinora.example'
  },
  navigation: [
    { label: 'Accueil', to: '/' },
    { label: 'Films', to: '/browse?type=movie' },
    { label: 'Séries', to: '/browse?type=series' },
    { label: 'Tendances', to: '/trending' },
    { label: 'Collections', to: '/platforms' }
  ]
})
