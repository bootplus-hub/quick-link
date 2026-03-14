<script setup lang="ts">
import { Breadcrumb, BreadcrumbList, BreadcrumbEllipsis, BreadcrumbSeparator, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from "@components/ui/breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, MapIcon, MapPinCheckIcon, MapPinnedIcon } from "lucide-vue-next";
import { computed } from "vue";
import { useRoute } from "vue-router";
import provider from "@/bookmarks/provider";
import _ from "lodash";

declare interface Item {
  name?: string,
  path?: string,
  sibling?: Item[],
};

function getItem (guid: string): Item {
  const current = provider.getBookmark(guid);
  if (_.isNil(current)) return {};

  const sibling = provider.getBookmarks(current?.parent ?? '/')
      .filter(bm => bm.type === 'folder')
      .map(bm => {
        return {
          name: bm.name,
          path: `/${bm.guid}`,
        };
      });

  return {
    name: current.name,
    path: `/${current.guid}`,
    sibling: sibling,
  };
}

const ITEM_MAX_LEN = 5;
const route = useRoute();
const items = computed<Item[]>(() => {
  const guids = route.path === '/' ? []
    : provider.getRouterTreePath(provider.getBookmark(route.path.substring(1))).split('/').slice(1);
  const ellipsis = guids.length > ITEM_MAX_LEN;
  const rtn = ellipsis
    ? guids.slice(-ITEM_MAX_LEN).map(guid => getItem(guid))
    : guids.map(guid => getItem(guid));
  if (ellipsis) return [{}, ...rtn];
  return rtn;
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
            <BreadcrumbEllipsis v-if="_.isEmpty(item)" class="h-4 w-4" />
            <BreadcrumbPage v-else-if="_.isEmpty(item.sibling)">{{ item.name }}</BreadcrumbPage>
            <DropdownMenu v-else>
              <DropdownMenuTrigger class="flex items-center gap-1 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-3.5">
                {{ item.name }}
                <ChevronDownIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem v-for="sb in item.sibling" as-child>
                  <router-link :to="sb.path ?? '/'">
                    <MapPinCheckIcon v-if="sb.path === item.path" class="size-4" />
                    <MapIcon v-else class="size-4" />
                    {{ sb.name }}
                  </router-link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
        </template>
      </BreadcrumbList>
    </Breadcrumb>
  </div>
</template>
