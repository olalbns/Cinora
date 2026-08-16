<script setup lang="ts">
const route=useRoute();const{data}=await useFetch<any>(`/api/catalog/custom/${route.params.pageKey}`);if(!data.value)throw createError({statusCode:404});useSeoMeta({title:()=>data.value?.page.title})
</script><template><article v-if="data" class="legal-page page-top container"><header><p class="eyebrow">CINORA</p><h1>{{ data.page.content.headline||data.page.title }}</h1></header><div class="legal-copy"><section><p>{{ data.page.content.body }}</p></section></div></article></template>
