<script setup lang="ts">
import _ from "lodash";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { Item, ItemContent, ItemTitle, ItemMedia, ItemActions } from "@components/ui/item";
import { FolderIcon, CircleStarIcon, ExternalLinkIcon, ChevronRightIcon } from "lucide-vue-next";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { BookmarkType } from "@/bookmarks/enums";
import provider from "@/bookmarks/provider";

const route = useRoute();
const pathCurrent = computed(() => route.path);
const items = computed(() => {
  if (provider.lastUpdateAt.value === '') return [];
  return provider.getBookmarks(pathCurrent.value);
});

</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Item v-for="item in items" variant="outline" size="sm" class="basis-lg max-w-lg" as-child>
      <a :href="`${item.getPath()}`">
        <ItemMedia>
          <FolderIcon v-if="item.type === BookmarkType.FOLDER" class="size-5" />
          <Avatar v-else class="size-5">
            <AvatarImage :src="item.getIconUrl()" />
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
          <ChevronRightIcon v-if="item.type === BookmarkType.FOLDER" class="size-4" />
          <ExternalLinkIcon v-else class="size-4" />
        </ItemActions>
      </a>
    </Item>
  </div>
</template>
