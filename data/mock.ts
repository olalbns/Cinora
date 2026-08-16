import type { ContentItem, HomePayload, PlatformCollection, Season } from '~/types/content'

const episodes: Season[] = [
  {
    number: 1,
    title: 'Saison 1',
    episodes: [
      { id: 'e1', number: 1, title: 'Le premier écho', synopsis: 'Une transmission impossible traverse le silence et bouleverse la mission.', duration: 48, thumbnail: '/images/hero-eclipse.jpg' },
      { id: 'e2', number: 2, title: 'Point aveugle', synopsis: 'L’équipage découvre une anomalie cachée dans ses propres archives.', duration: 52, thumbnail: '/images/poster-circuit.jpg' },
      { id: 'e3', number: 3, title: 'La chambre rouge', synopsis: 'Mara doit choisir entre le protocole et son instinct.', duration: 50, thumbnail: '/images/poster-room.jpg' }
    ]
  },
  {
    number: 2,
    title: 'Saison 2',
    episodes: [
      { id: 'e4', number: 1, title: 'Après la lumière', synopsis: 'Six mois plus tard, un nouveau signal apparaît au-dessus de la ville.', duration: 54, thumbnail: '/images/poster-city.jpg' },
      { id: 'e5', number: 2, title: 'La ligne froide', synopsis: 'Une expédition s’aventure au-delà de la zone cartographiée.', duration: 49, thumbnail: '/images/poster-wild.jpg' }
    ]
  }
]

export const content: ContentItem[] = [
  {
    id: 'c01', slug: 'eclipse-protocol', title: 'Eclipse Protocol', eyebrow: 'UNE CRÉATION CINORA',
    synopsis: 'À la lisière du système solaire, une astronaute capte un signal qui semble connaître chacun de ses souvenirs. Plus elle s’en approche, plus la frontière entre mission et mémoire disparaît.',
    year: 2026, rating: 8.7, match: 98, duration: 132, ageRating: '13+', genres: ['Science-fiction', 'Thriller'], type: 'movie',
    image: '/images/poster-signal.jpg', backdrop: '/images/hero-eclipse.jpg', quality: '4K HDR', isNew: true, trendingRank: 1, platform: 'Cinora Originals',
    cast: ['Mila Arden', 'Jonas Reed', 'Inès Mori'], director: 'Léa Verne', audio: ['Français', 'English', 'Español']
  },
  {
    id: 'c02', slug: 'black-harbor', title: 'Black Harbor',
    synopsis: 'Une inspectrice revient dans le port de son enfance pour élucider une disparition que toute la ville veut oublier.',
    year: 2025, rating: 8.2, match: 95, duration: 118, ageRating: '16+', genres: ['Policier', 'Drame'], type: 'movie',
    image: '/images/poster-harbor.jpg', backdrop: '/images/poster-harbor.jpg', quality: '4K', trendingRank: 3, platform: 'Studio North',
    cast: ['Nora Bell', 'Sami Holt', 'Victor Lane'], director: 'Dorian West', audio: ['Français', 'English']
  },
  {
    id: 'c03', slug: 'astra', title: 'Astra',
    synopsis: 'Perdue au-dessus d’un océan extraterrestre, une pilote doit décider si le retour sur Terre est encore ce qu’elle désire.',
    year: 2026, rating: 9.1, match: 99, duration: 126, ageRating: '10+', genres: ['Science-fiction', 'Drame'], type: 'movie',
    image: '/images/poster-astra.jpg', backdrop: '/images/poster-astra.jpg', quality: '4K HDR', isNew: true, trendingRank: 2, platform: 'Cinora Originals',
    cast: ['Aya Noren', 'Malik Stone'], director: 'Sofia Aster', audio: ['Français', 'English', '日本語']
  },
  {
    id: 'c04', slug: 'kingdom-of-embers', title: 'Kingdom of Embers',
    synopsis: 'Dans un royaume bâti sur les cendres, une cavalière porte le dernier message capable d’empêcher une guerre.',
    year: 2024, rating: 7.9, match: 91, duration: 144, ageRating: '13+', genres: ['Aventure', 'Drame'], type: 'movie',
    image: '/images/poster-ember.jpg', backdrop: '/images/poster-ember.jpg', quality: '4K', trendingRank: 6, platform: 'Red Peak',
    cast: ['Eden Khoury', 'Marc Vale', 'Ona Reid'], director: 'Arun Delmar', audio: ['Français', 'English']
  },
  {
    id: 'c05', slug: 'room-17', title: 'Room 17',
    synopsis: 'Chaque nuit à 3 h 17, une porte apparaît au bout du couloir. Personne ne se souvient de ce qu’il y a derrière.',
    year: 2025, rating: 7.7, match: 89, duration: 104, ageRating: '16+', genres: ['Mystère', 'Thriller'], type: 'movie',
    image: '/images/poster-room.jpg', backdrop: '/images/poster-room.jpg', quality: 'HD', trendingRank: 7, platform: 'After Dark',
    cast: ['Clara Moon', 'Ilan Ross'], director: 'Mira Sorel', audio: ['Français', 'English']
  },
  {
    id: 'c06', slug: 'neon-district', title: 'Neon District',
    synopsis: 'Une messagère clandestine traverse la mégalopole pour livrer une preuve qui peut renverser le système.',
    year: 2026, rating: 8.5, match: 96, duration: 54, ageRating: '16+', genres: ['Science-fiction', 'Policier'], type: 'series',
    image: '/images/poster-city.jpg', backdrop: '/images/poster-city.jpg', quality: '4K HDR', isNew: true, trendingRank: 4, platform: 'Cinora Originals',
    cast: ['Ari Chen', 'Noah Voss', 'Lena Idris'], director: 'Yuna Kessler', audio: ['Français', 'English', '한국어'], seasons: episodes
  },
  {
    id: 'c07', slug: 'northbound', title: 'Northbound',
    synopsis: 'Trois inconnus s’engagent dans une traversée polaire dont aucun itinéraire ne mentionne la véritable destination.',
    year: 2023, rating: 8.0, match: 92, duration: 47, ageRating: '13+', genres: ['Aventure', 'Mystère'], type: 'series',
    image: '/images/poster-wild.jpg', backdrop: '/images/poster-wild.jpg', quality: '4K', trendingRank: 5, platform: 'Atlas',
    cast: ['Leo March', 'Salma Kier', 'June Anders'], director: 'Tomas Vale', audio: ['Français', 'English'], seasons: episodes.slice(0, 1)
  },
  {
    id: 'c08', slug: 'ghost-circuit', title: 'Ghost Circuit',
    synopsis: 'Un ingénieur découvre qu’une intelligence disparue continue de modifier le réseau, une décision à la fois.',
    year: 2025, rating: 8.4, match: 94, duration: 51, ageRating: '13+', genres: ['Thriller', 'Science-fiction'], type: 'series',
    image: '/images/poster-circuit.jpg', backdrop: '/images/poster-circuit.jpg', quality: '4K HDR', trendingRank: 8, platform: 'Vector',
    cast: ['Nils Carter', 'Rhea Sen'], director: 'Ana Varga', audio: ['Français', 'English'], seasons: episodes
  },
  {
    id: 'c09', slug: 'after-the-last-train', title: 'After the Last Train',
    synopsis: 'Deux voyageurs se croisent chaque nuit sur un quai désert sans jamais monter dans le même train.',
    year: 2024, rating: 7.8, match: 88, duration: 109, ageRating: 'Tous', genres: ['Romance', 'Drame'], type: 'movie',
    image: '/images/poster-after.jpg', backdrop: '/images/poster-after.jpg', quality: '4K', trendingRank: 9, platform: 'Maison Lumière',
    cast: ['Élise Hart', 'Matteo Riva'], director: 'Célia Morel', audio: ['Français', 'Italiano']
  },
  {
    id: 'c10', slug: 'red-signal', title: 'Red Signal',
    synopsis: 'Un phénomène radio réveille une petite ville du désert et révèle les secrets enfouis sous ses antennes.',
    year: 2022, rating: 7.6, match: 87, duration: 46, ageRating: '13+', genres: ['Mystère', 'Drame'], type: 'series',
    image: '/images/poster-signal.jpg', backdrop: '/images/poster-signal.jpg', quality: 'HD', trendingRank: 10, platform: 'Vector',
    cast: ['Iris Cole', 'Dane Silva'], director: 'Omar Rey', audio: ['Français', 'English'], seasons: episodes.slice(0, 1)
  },
  {
    id: 'c11', slug: 'silent-waters', title: 'Silent Waters',
    synopsis: 'Un village côtier garde le silence après le retour d’un bateau disparu depuis vingt ans.',
    year: 2021, rating: 7.5, match: 85, duration: 114, ageRating: '13+', genres: ['Mystère', 'Policier'], type: 'movie',
    image: '/images/poster-harbor.jpg', backdrop: '/images/poster-harbor.jpg', quality: 'HD', platform: 'Studio North',
    cast: ['Eva North', 'Paul Aki'], director: 'Mina Grant', audio: ['Français', 'English']
  },
  {
    id: 'c12', slug: 'the-far-side', title: 'The Far Side',
    synopsis: 'Une cartographe découvre une vallée absente de toutes les images satellites et choisit d’y entrer seule.',
    year: 2026, rating: 8.3, match: 93, duration: 121, ageRating: '10+', genres: ['Aventure', 'Science-fiction'], type: 'movie',
    image: '/images/poster-wild.jpg', backdrop: '/images/poster-wild.jpg', quality: '4K', isNew: true, platform: 'Atlas',
    cast: ['Mei Laurent', 'John Haze'], director: 'Rami Sol', audio: ['Français', 'English']
  }
]

export const homePayload: HomePayload = {
  hero: content[0]!,
  sections: [
    { id: 'continue', title: 'Reprendre la lecture', subtitle: 'Retrouvez vos histoires là où vous les avez laissées', items: [content[5]!, content[6]!, content[7]!, content[1]!] },
    { id: 'trending', title: 'Top 10 aujourd’hui', items: content.filter(item => item.trendingRank).sort((a, b) => (a.trendingRank || 0) - (b.trendingRank || 0)), ranked: true },
    { id: 'new', title: 'Nouveautés à ne pas manquer', items: [content[2]!, content[11]!, content[0]!, content[5]!, content[3]!] },
    { id: 'scifi', title: 'Aux frontières du réel', items: content.filter(item => item.genres.includes('Science-fiction')) },
    { id: 'drama', title: 'Histoires qui restent', items: content.filter(item => item.genres.includes('Drame')) }
  ]
}

export const platforms: PlatformCollection[] = [
  { id: 'originals', name: 'Cinora Originals', description: 'Des histoires audacieuses, créées exclusivement pour vous.', color: '#e5092b', itemCount: 42, items: content.filter(i => i.platform === 'Cinora Originals') },
  { id: 'north', name: 'Studio North', description: 'Polars atmosphériques et grands drames contemporains.', color: '#376bff', itemCount: 28, items: content.filter(i => i.platform === 'Studio North') },
  { id: 'atlas', name: 'Atlas', description: 'Voyages, aventures et récits venus du bout du monde.', color: '#e5a833', itemCount: 35, items: content.filter(i => i.platform === 'Atlas') },
  { id: 'vector', name: 'Vector', description: 'Le meilleur de la science-fiction et des nouvelles technologies.', color: '#8d5cff', itemCount: 31, items: content.filter(i => i.platform === 'Vector') }
]

export const genres = ['Tous', 'Science-fiction', 'Drame', 'Thriller', 'Policier', 'Mystère', 'Aventure', 'Romance']
