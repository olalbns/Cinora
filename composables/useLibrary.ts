import type { ContentItem } from '~/types/content'
interface HistoryEntry { item: ContentItem; progress: number; watchedAt: string; season?: number; episode?: number }

export function useLibrary() {
  const favorites=useState<ContentItem[]>('favorites',()=>[]),history=useState<HistoryEntry[]>('history',()=>[]),hydrated=useState('library-hydrated',()=>false),remoteSynced=useState('library-remote-synced',()=>false)
  const auth=useAuth()
  function hydrate(){if(!import.meta.client||hydrated.value)return;try{favorites.value=JSON.parse(localStorage.getItem('cinora:favorites')||'[]');history.value=JSON.parse(localStorage.getItem('cinora:history')||'[]')}catch{favorites.value=[];history.value=[]}hydrated.value=true}
  function persist(){if(!import.meta.client)return;localStorage.setItem('cinora:favorites',JSON.stringify(favorites.value));localStorage.setItem('cinora:history',JSON.stringify(history.value))}
  async function syncRemote(){if(!auth.user.value||remoteSynced.value)return;try{const [fav,hist]=await Promise.all([$fetch<{items:ContentItem[]}>('/api/user/favorites'),$fetch<{items:HistoryEntry[]}>('/api/user/history')]);favorites.value=fav.items;history.value=hist.items;persist();remoteSynced.value=true}catch{/* conserver les données locales */}}
  function isFavorite(itemOrId:ContentItem|string){const id=typeof itemOrId==='string'?itemOrId:itemOrId.id;return favorites.value.some(item=>item.id===id)}
  async function toggleFavorite(item:ContentItem){hydrate();const removing=isFavorite(item);favorites.value=removing?favorites.value.filter(saved=>saved.id!==item.id):[item,...favorites.value];persist();if(auth.user.value){try{if(removing)await $fetch(`/api/user/favorites/${encodeURIComponent(item.id)}`,{method:'DELETE'});else await $fetch('/api/user/favorites',{method:'POST',body:{subjectId:item.id}})}catch{favorites.value=removing?[item,...favorites.value]:favorites.value.filter(saved=>saved.id!==item.id);persist()}}}
  function addToHistory(item:ContentItem,progress=7,season?:number,episode?:number){hydrate();const entry={item,progress,season,episode,watchedAt:new Date().toISOString()};history.value=[entry,...history.value.filter(value=>value.item.id!==item.id)].slice(0,30);persist();if(auth.user.value)$fetch('/api/user/history',{method:'POST',body:{subjectId:item.id,progress,season,episode}}).catch(()=>{})}
  async function clearFavorites(){const previous=[...favorites.value];favorites.value=[];persist();if(auth.user.value){try{await Promise.all(previous.map(item=>$fetch(`/api/user/favorites/${encodeURIComponent(item.id)}`,{method:'DELETE'})))}catch{favorites.value=previous;persist()}}}
  async function clearHistory(){const previous=[...history.value];history.value=[];persist();if(auth.user.value){try{await $fetch('/api/user/history',{method:'DELETE'})}catch{history.value=previous;persist()}}}
  if(import.meta.client)onMounted(async()=>{hydrate();await auth.load();await syncRemote()})
  return{favorites,history,hydrate,syncRemote,isFavorite,toggleFavorite,addToHistory,clearFavorites,clearHistory}
}
