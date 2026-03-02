<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbEllipsis,
  BreadcrumbSeparator,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { BookmarkType } from "@/bookmarks/enums";
import { RouteUtil } from "@/bookmarks";
import _ from "lodash";
import provider from "@/bookmarks/provider";
import { ChevronDownIcon, MapPinnedIcon } from "lucide-vue-next";

declare interface Item {
  name?: string,
  path?: string,
  sibling?: Item[],
};

function getItem (guid: string, ellipsis: boolean = false): Item {
  const current = provider.getBookmark(guid);
  if (_.isNil(current)) return {};

  const path = RouteUtil.toTreePath(current);
  const sibling = provider.getBookmarks(current?.parent?.guid ?? '/')
      .filter(bm => bm.type === BookmarkType.FOLDER)
      .map(bm => {
        return {
          name: bm.name,
          path: `/${bm.guid}`,
        };
      });

  return {
    name: ellipsis ? undefined : current.name,
    path: path,
    sibling: sibling,
  };
}

const ITEM_MAX_LEN = 10;
const route = useRoute();
const items = computed<Item[]>(() => {
  const guids = route.path === '/' ? []
    : RouteUtil.toTreePath(provider.getBookmark(route.path.substring(1))).split('/').slice(1);
  if (guids.length <= ITEM_MAX_LEN) return guids.map(guid => getItem(guid));
  return guids.slice(-ITEM_MAX_LEN).map((guid, index) => getItem(guid, index === 0));
});
</script>

<template>
  <div data-slot="main-breadcrumb" class="flex flex-row p-2 gap-4 align-middle">
    <MapPinnedIcon class="size-5" />
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage v-if="route.path === '/'">Home</BreadcrumbPage>
          <BreadcrumbLink v-else as-child>
            <router-link to="/">Home</router-link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <template v-for="item in items">
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <DropdownMenu v-if="!_.isEmpty(item.sibling)">
              <DropdownMenuTrigger v-if="_.isNil(item.name)" class="flex items-center gap-1">
                <BreadcrumbEllipsis class="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuTrigger v-else class="flex items-center gap-1 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-3.5">
                {{ item.name }}
                <ChevronDownIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem v-for="sb in item.sibling" as-child>
                  <router-link :to="sb.path ?? '/'">{{ sb.name }}</router-link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <BreadcrumbPage v-else>{{ item.name }}</BreadcrumbPage>
          </BreadcrumbItem>
        </template>
      </BreadcrumbList>
    </Breadcrumb>
  </div>
</template>
