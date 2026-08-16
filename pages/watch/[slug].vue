<script setup lang="ts">
definePageMeta({ layout: false })
const route = useRoute()
const service = useContentService()
const mediaService = useMediaService()
const { addToHistory } = useLibrary()

const { data: item } = await useAsyncData(`watch-${route.params.slug}`, () => service.getBySlug(String(route.params.slug)))
if (!item.value) throw createError({ statusCode: 404, statusMessage: 'Titre introuvable' })

const seasonNumber = computed(() => Number(route.query.season || 1))
const episodeNumber = computed(() => Number(route.query.episode || 1))
const { data: playbackPayload, refresh: refreshPlayback } = await useAsyncData(`playback-${item.value.id}-${seasonNumber.value}-${episodeNumber.value}`, async () => ({
  session: await mediaService.createSession({ contentId: item.value!.id, season: seasonNumber.value, episode: episodeNumber.value })
}))
const playback = computed(() => playbackPayload.value?.session || null)

const video = ref<HTMLVideoElement>()
const playing = ref(false)
const current = ref(0)
const mediaDuration = ref(0)
const duration = computed(() => mediaDuration.value || (item.value?.duration || 120) * 60)
const controlsVisible = ref(true)
const episodePanel = ref(false)
const settingsPanel = ref(false)
const muted = ref(false)
const subtitlesEnabled = ref(false)
const playbackRate = ref(1)
let hideTimer: ReturnType<typeof setTimeout> | undefined
let refreshTimer: ReturnType<typeof setTimeout> | undefined
let hlsInstance: { destroy: () => void } | null = null

async function setupVideoSource() {
  await nextTick()
  if (!video.value || !playback.value?.streamUrl) return
  hlsInstance?.destroy(); hlsInstance = null
  if (playback.value.format !== 'hls' || video.value.canPlayType('application/vnd.apple.mpegurl')) { video.value.src = playback.value.streamUrl; return }
  const { default: Hls } = await import('hls.js')
  if (Hls.isSupported()) { const hls = new Hls({ enableWorker: true }); hls.loadSource(playback.value.streamUrl); hls.attachMedia(video.value); hlsInstance = hls }
}
function schedulePlaybackRefresh() {
  clearTimeout(refreshTimer)
  if (!playback.value?.expiresAt) return
  const delay = Math.max(5000, new Date(playback.value.expiresAt).getTime() - Date.now() - 60000)
  refreshTimer = setTimeout(async () => { const position = video.value?.currentTime || 0; await refreshPlayback(); await setupVideoSource(); if (video.value) video.value.currentTime = position; schedulePlaybackRefresh() }, delay)
}

const formatted = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
const currentEpisodeTitle = computed(() => item.value?.seasons?.find(season => season.number === seasonNumber.value)?.episodes.find(episode => episode.number === episodeNumber.value)?.title)
const hasSubtitles = computed(() => Boolean(playback.value?.subtitles?.length))

async function togglePlay() {
  if (!video.value) return
  if (video.value.paused) await video.value.play()
  else video.value.pause()
  showControls()
}
function seek(seconds: number) {
  if (!video.value) return
  current.value = Math.max(0, Math.min(duration.value, current.value + seconds))
  video.value.currentTime = current.value
  saveProgress()
}
function seekTo(event: MouseEvent) {
  if (!video.value) return
  const target = event.currentTarget as HTMLElement
  current.value = (event.offsetX / target.clientWidth) * duration.value
  video.value.currentTime = current.value
  saveProgress()
}
function toggleMute() {
  if (!video.value) return
  video.value.muted = !video.value.muted
  muted.value = video.value.muted
}
function toggleSubtitles() {
  if (!video.value?.textTracks.length) return
  subtitlesEnabled.value = !subtitlesEnabled.value
  for (let index = 0; index < video.value.textTracks.length; index++) {
    video.value.textTracks[index]!.mode = subtitlesEnabled.value && index === 0 ? 'showing' : 'disabled'
  }
}
function setSpeed(speed: number) {
  playbackRate.value = speed
  if (video.value) video.value.playbackRate = speed
  settingsPanel.value = false
}
async function toggleFullscreen() {
  if (!document.fullscreenElement) await document.querySelector('.player')?.requestFullscreen()
  else await document.exitFullscreen()
}
function showControls() {
  controlsVisible.value = true
  clearTimeout(hideTimer)
  if (playing.value) hideTimer = setTimeout(() => controlsVisible.value = false, 2600)
}
function saveProgress() {
  if (playback.value && item.value) addToHistory(item.value, Math.max(1, Math.round(current.value / duration.value * 100)), seasonNumber.value, episodeNumber.value)
}
function onKey(event: KeyboardEvent) {
  if (!playback.value && event.key !== 'Escape') return
  if (event.code === 'Space') { event.preventDefault(); togglePlay() }
  if (event.key === 'ArrowLeft') seek(-10)
  if (event.key === 'ArrowRight') seek(10)
  if (event.key.toLowerCase() === 'm') toggleMute()
  if (event.key.toLowerCase() === 'f') toggleFullscreen()
  if (event.key === 'Escape' && !document.fullscreenElement) navigateTo(`/movies/${item.value?.slug}`)
}

onMounted(() => { window.addEventListener('keydown', onKey); setupVideoSource(); schedulePlaybackRefresh() })
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  hlsInstance?.destroy()
  clearTimeout(hideTimer)
  clearTimeout(refreshTimer)
  saveProgress()
})
useSeoMeta({ title: `Lecture · ${item.value.title}` })
</script>

<template>
  <main v-if="item" class="player" :class="{ 'player--idle': playback && !controlsVisible }" @mousemove="showControls" @click.self="togglePlay">
    <video
      v-if="playback?.streamUrl"
      ref="video"
      class="player__video"
      :src="playback.format === 'mp4' ? playback.streamUrl : undefined"
      playsinline
      @loadedmetadata="mediaDuration = video?.duration || 0"
      @timeupdate="current = video?.currentTime || 0"
      @play="playing = true"
      @pause="playing = false"
      @ended="playing = false; saveProgress()"
    >
      <track v-for="track in playback.subtitles" :key="track.language" kind="subtitles" :label="track.label" :srclang="track.language" :src="track.url" :default="track.default">
    </video>
    <div v-else class="player__visual" :style="{ backgroundImage: `url(${item.backdrop})` }" />
    <div class="player__cinema" />

    <div v-if="!playback" class="player__unavailable">
      <span><AppIcon name="info" :size="26" /></span>
      <p>SOURCE INDISPONIBLE</p>
      <h1>Aucun média n’a été fourni.</h1>
      <p>Le backend n’a retourné aucune session de lecture autorisée pour ce contenu.</p>
      <NuxtLink :to="`/movies/${item.slug}`" class="btn btn--primary"><AppIcon name="arrow-left" />Retour à la fiche</NuxtLink>
    </div>

    <button v-if="playback && !playing" class="player__center" aria-label="Lecture" @click="togglePlay"><AppIcon name="play" :size="42" /></button>

    <Transition name="player-controls">
      <div v-show="playback && controlsVisible" class="player__chrome">
        <div class="player__top">
          <NuxtLink :to="`/movies/${item.slug}`" class="icon-btn"><AppIcon name="arrow-left" :size="24" /></NuxtLink>
          <div><strong>{{ item.title }}</strong><span v-if="item.type === 'series'">S{{ seasonNumber }} : E{{ episodeNumber }} · {{ currentEpisodeTitle }}</span><span v-else>{{ item.year }} · {{ item.genres[0] }}</span></div>
          <button v-if="item.type === 'series'" class="player__episodes-btn" @click="episodePanel = !episodePanel"><AppIcon name="layers" /> Épisodes</button>
        </div>
        <div class="player__bottom">
          <div class="player__timeline" @click="seekTo"><span :style="{ width: `${current / duration * 100}%` }"><i /></span></div>
          <div class="player__controls">
            <div><button aria-label="Lecture ou pause" @click="togglePlay"><AppIcon :name="playing ? 'pause' : 'play'" :size="25" /></button><button aria-label="Reculer de dix secondes" @click="seek(-10)"><AppIcon name="rewind" :size="23" /></button><button aria-label="Avancer de dix secondes" @click="seek(10)"><AppIcon name="forward" :size="23" /></button><button :aria-label="muted ? 'Activer le son' : 'Couper le son'" @click="toggleMute"><AppIcon :name="muted ? 'volume-off' : 'volume'" :size="23" /></button><span>{{ formatted(current) }} / {{ formatted(duration) }}</span></div>
            <div class="player__right-controls"><button :disabled="!hasSubtitles" :class="{ active: subtitlesEnabled }" aria-label="Sous-titres" @click="toggleSubtitles"><span class="control-text">CC</span></button><button aria-label="Vitesse de lecture" @click="settingsPanel = !settingsPanel"><AppIcon name="settings" :size="22" /></button><button aria-label="Plein écran" @click="toggleFullscreen"><AppIcon name="expand" :size="22" /></button><div v-if="settingsPanel" class="player__settings-menu"><p>Vitesse de lecture</p><button v-for="speed in [0.75, 1, 1.25, 1.5, 2]" :key="speed" :class="{ active: playbackRate === speed }" @click="setSpeed(speed)">{{ speed === 1 ? 'Normale' : `${speed}×` }}<AppIcon v-if="playbackRate === speed" name="check" :size="14" /></button></div></div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="episode-drawer">
      <aside v-if="episodePanel" class="player-drawer"><div><p>ÉPISODES</p><button @click="episodePanel = false"><AppIcon name="close" /></button></div><h2>{{ item.title }}</h2><NuxtLink v-for="episode in item.seasons?.find(value => value.number === seasonNumber)?.episodes" :key="episode.id" :to="`/watch/${item.slug}?season=${seasonNumber}&episode=${episode.number}`" class="drawer-episode"><img :src="episode.thumbnail" :alt="episode.title"><span><strong>E{{ episode.number }} · {{ episode.title }}</strong><small>{{ episode.duration }} min</small></span></NuxtLink></aside>
    </Transition>
  </main>
</template>
