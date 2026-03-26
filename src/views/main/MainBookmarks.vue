<script setup lang="ts">
import _ from "lodash";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Bookmark } from "@/bookmarks";
import { BookmarkItem } from "@/components";
import provider from "@/bookmarks/provider";

const route = useRoute();
const items = ref<Bookmark[]>(provider.getBookmarks(route.path));

watch(() => route.path, (path) => {
  items.value = provider.getBookmarks(path);
});

function refresh (path?: string) {
  if (route.path !== (path ?? route.path)) return;
  items.value = provider.getBookmarks(path ?? route.path);
}

onMounted(() => provider.bus.on('update', refresh));
onUnmounted(() => provider.bus.off('update', refresh));
</script>

<template>
  <div class="flex flex-wrap gap-2 gap-x-10">
    <BookmarkItem v-for="item in items" item-type="main" :item="item" />
  </div>
</template>
