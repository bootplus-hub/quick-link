<script setup lang="ts">
import { Item, ItemContent, ItemTitle, ItemMedia, ItemActions } from "@components/ui/item";
import { FolderIcon, CircleStarIcon, ExternalLinkIcon, ChevronRightIcon } from "lucide-vue-next";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { BookmarkType } from "@/bookmarks/enums";
import provider from "@/bookmarks/provider";
import { Bookmark } from "..";
import { computed } from "vue";

export type BookmarkItemType = 'command' | 'main';
declare interface BookmarkItemProps {
  itemType?: BookmarkItemType,
  item: Bookmark,
};

const props = defineProps<BookmarkItemProps>();
const clazz = computed<string[] | undefined>(() => {
  if (props.itemType === 'main') return ['basis-lg', 'max-w-lg'];
});
const variant = computed<'outline' | undefined>(() => {
  if (props.itemType === 'main') return 'outline';
});

function incrementVisitCount () {
  props.item.visit++;
  provider.bus.emit('update', props.item.getParentPath());
}

</script>

<template>
  <Item :variant="variant" size="sm" :class="clazz" as-child>
    <a :href="`${item.getPath()}`" @click="incrementVisitCount()">
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
</template>
