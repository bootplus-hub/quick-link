<script setup lang="ts">
import _ from "lodash";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { Item, ItemContent, ItemTitle, ItemMedia, ItemActions } from "@components/ui/item";
import { FolderIcon, ArrowBigUpIcon, CircleStarIcon, ChevronRightIcon } from "lucide-vue-next";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Bookmark } from "@/bookmarks";
import { BookmarkType } from "@/bookmarks/enums";

interface Props {
  bookmarks: Bookmark[],
};

function drillPath (node: Bookmark): string {
  if (_.isNil(node.parent)) return `/${node.name}`;
  return drillPath(node.parent) + `/${node.name}`;
}

const props = defineProps<Props>();
const route = useRoute();
const pathCurrent = computed(() => route.path);
const pathUpper = computed(() => pathCurrent.value.replace(/\/[\w\-]+$/, ''));
const isRoot = computed(() => pathCurrent.value === '/');
const pathUpperName = computed(() => {
  if (isRoot.value) return '';
  const guid = _.last(pathUpper.value.split('/'));
  if (_.isEmpty(guid)) return '';
  const parent = props.bookmarks.find(node => guid === node.guid)!;
  return drillPath(parent);
});
const items = computed(() => {
  if (isRoot.value) {
    if (_.isEmpty(props.bookmarks)) return [];
    return props.bookmarks.filter(bm => _.isEmpty(bm.parent));
  }
  const rtn = props.bookmarks.filter(bm => pathCurrent.value.endsWith('/' + _.defaultTo(_.get(bm, 'parent.guid'), '')));
  return rtn;
});

function getPath (item: Bookmark): string {
  if (item.type === BookmarkType.FOLDER) return `#${pathCurrent.value}${isRoot.value ? '' : '/'}${item.guid}`;
  return `microsoft-edge:${item.url ?? ''}`;
}

</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Item v-if="!isRoot" variant="outline" size="sm" class="basis-lg max-w-lg" as-child>
      <router-link :to="_.isEmpty(pathUpper) ? '/' : pathUpper">
        <ItemMedia>
          <ArrowBigUpIcon class="size-5" />
        </ItemMedia>
        <ItemContent class="min-w-0">
          <ItemTitle class="text-xs min-w-0 w-full">
            <span class="truncate">.. {{ pathUpperName }}</span>
          </ItemTitle>
        </ItemContent>
        <ItemActions>
          <ChevronRightIcon class="size-4" />
        </ItemActions>
      </router-link>
    </Item>
    <Item v-for="item in items" variant="outline" size="sm" class="basis-lg max-w-lg" as-child>
      <a :href="getPath(item)">
        <ItemMedia>
          <FolderIcon v-if="item.type === BookmarkType.FOLDER" class="size-5" />
          <Avatar v-else class="size-5">
            <AvatarImage src="https://github.com/shadcn.png" />
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
