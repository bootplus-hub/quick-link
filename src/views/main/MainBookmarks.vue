<script setup lang="ts">
import _ from "lodash";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { Item, ItemContent, ItemTitle, ItemMedia, ItemActions } from "@components/ui/item";
import { FolderIcon, CircleStarIcon, ChevronRightIcon } from "lucide-vue-next";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Bookmark } from "@/bookmarks";
import { BookmarkType } from "@/bookmarks/enums";
import provider from "@/bookmarks/provider";

const route = useRoute();
const pathCurrent = computed(() => route.path);
const items = computed(() => {
  if (provider.lastUpdateAt.value === '') return [];
  return provider.getBookmarks(pathCurrent.value);
});

function getRoutePath (item: Bookmark): string {
  if (item.type === BookmarkType.FOLDER) return `#/${item.guid}`;
  return `microsoft-edge:${item.url ?? ''}`;
}

</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Item v-for="item in items" variant="outline" size="sm" class="basis-lg max-w-lg" as-child>
      <a :href="getRoutePath(item)">
        <ItemMedia>
          <FolderIcon v-if="item.type === BookmarkType.FOLDER" class="size-5" />
          <Avatar v-else class="size-5">
            <AvatarImage :src="`favicon://${item.url}`" />
            <AvatarFallback>
              <CircleStarIcon />
            </AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent class="min-w-0">
          <ItemTitle class="text-xs min-w-0 w-full">
            <span class="truncate">{{ item.name }}</span>
          </ItemTitle>
        </ItemContent>
        <ItemActions>
          <ChevronRightIcon class="size-4" />
        </ItemActions>
      </a>
    </Item>
  </div>
</template>
