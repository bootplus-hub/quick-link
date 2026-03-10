<script setup lang="ts">
import { Item, ItemContent, ItemTitle, ItemMedia, ItemActions } from "@components/ui/item";
import { FolderIcon, CircleStarIcon, ExternalLinkIcon, ChevronRightIcon, ArrowBigUpIcon, MapPinIcon, SettingsIcon } from "lucide-vue-next";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@components/ui/context-menu";
import { BookmarkType, BrowserType } from "@/bookmarks/enums";
import { Bookmark } from "..";
import { computed } from "vue";
import provider from "@/bookmarks/provider";

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
const childFolders = computed<Bookmark[]>(() => {
  return provider.getBookmarks(props.item.getParentPath())
    .filter(item => item.type === BookmarkType.FOLDER && item.guid !== props.item.guid);
});

function incrementVisitCount () {
  props.item.visit++;
  provider.bus.emit('update', props.item.getParentPath());
};

function moveUp() {
  const befo = props.item.getParentPath();
  if (props.item.parent) props.item.parent = provider.getBookmark(props.item.parent )?.parent;
  else props.item.parent = undefined;
  provider.bus.emit('update', befo);
};

function moveDown(guid: string) {
  const befo = props.item.getParentPath();
  props.item.parent = guid;
  provider.bus.emit('update', befo);
};

</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger as-child>
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
    </ContextMenuTrigger>
    <ContextMenuContent class="w-50">
      <template v-if="item.type === BookmarkType.URL">
        <ContextMenuSub>
          <ContextMenuSubTrigger inset>열기</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem as-child><a :href="item.getPath(BrowserType.EDGE)"><ExternalLinkIcon />Edge</a></ContextMenuItem>
            <ContextMenuItem as-child><a :href="item.getPath(BrowserType.CHROME)"><ExternalLinkIcon />Chrome</a></ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
      </template>
      <ContextMenuLabel inset class="select-none text-gray-400">옮기기</ContextMenuLabel>
      <ContextMenuItem v-if="item.parent" @select="moveUp()"><ArrowBigUpIcon />위로</ContextMenuItem>
      <ContextMenuSub>
        <ContextMenuSubTrigger inset v-if="childFolders.length > 0">아래로</ContextMenuSubTrigger>
        <ContextMenuSubContent v-if="childFolders.length > 0">
          <ContextMenuItem v-for="folder in childFolders" @select="moveDown(folder.guid)">{{ folder.name }}</ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuItem><MapPinIcon />지정 위치로</ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem><SettingsIcon />편집</ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
