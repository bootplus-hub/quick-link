<script setup lang="ts">
import { Breadcrumb, BreadcrumbList, BreadcrumbEllipsis, BreadcrumbSeparator, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from "@components/ui/breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, MapIcon, MapPinCheckIcon, MapPinnedIcon } from "lucide-vue-next";
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useVModel } from "@vueuse/core";
import _ from "lodash";
import provider, { BookmarkModifyDto } from "@/bookmarks/provider";

export type BreadcrumbType = 'router' | 'selector';

export interface BreadcrumbProps {
  modelValue?: string,
  defaultValue?: string,
  limit?: number,
  type?: BreadcrumbType,
  target?: BookmarkModifyDto,
};

export type BreadcrumbEmits = {
  'update:modelValue': [value: string]
};

declare interface Item {
  name?: string,
  path?: string,
  siblings?: Item[],
};

const props = withDefaults(defineProps<BreadcrumbProps>(), {
  limit: 5,
  type: 'router'
});

const emits = defineEmits<BreadcrumbEmits>();

const route = useRoute();
const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue ?? '/',
});

watch(() => route.path, (val) => {
  if (props.type === 'router') modelValue.value = val;
}, { immediate: true });

const items = computed<Item[]>(() => {
  const location = modelValue.value ?? '/';
  const guids = location === '/' ? []
    : provider.getRouterTreePath(provider.getBookmark(location.substring(1))).split('/').slice(1);
  const ellipsis = guids.length > props.limit;
  const rtn = ellipsis
    ? guids.slice(-props.limit).map(guid => getItem(guid))
    : guids.map(guid => getItem(guid));
  if (ellipsis) return [{}, ...rtn];
  return rtn;
});

const childrens = computed<Item[]>(() => {
  if (props.type === 'router') return [];
  return provider.getBookmarks(modelValue.value ?? '/')
      .filter(bm => bm.type === 'folder' && bm.guid !== props.target?.guid)
      .map(bm => {
        return {
          name: bm.name,
          path: `/${bm.guid}`,
        };
      });
});

function getItem (guid: string): Item {
  const current = provider.getBookmark(guid);
  if (!current) return {};

  const siblings = provider.getBookmarks(current?.parent ?? '/')
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
    siblings,
  };
}
</script>
<template>
  <div data-slot="breadcrumb" class="flex flex-row p-2 gap-4 align-middle select-none">
    <MapPinnedIcon class="size-5" />
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage v-if="(modelValue ?? '/') === '/'">Home</BreadcrumbPage>
          <BreadcrumbLink v-else as-child>
            <router-link v-if="props.type === 'router'" to="/">Home</router-link>
            <a v-else class="cursor-pointer" @click="emits('update:modelValue', '/')">Home</a>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <template v-for="item in items">
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis v-if="_.isEmpty(item)" class="h-4 w-4" />
            <BreadcrumbPage v-else-if="_.isEmpty(item.siblings)">{{ item.name }}</BreadcrumbPage>
            <DropdownMenu v-else>
              <DropdownMenuTrigger class="flex items-center gap-1 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-3.5">
                {{ item.name }}
                <ChevronDownIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem v-for="sb in item.siblings" as-child>
                  <router-link v-if="props.type === 'router'" :to="sb.path ?? '/'">
                    <MapPinCheckIcon v-if="sb.path === item.path" class="size-4" />
                    <MapIcon v-else class="size-4" />
                    {{ sb.name }}
                  </router-link>
                  <a v-else class="cursor-pointer" @click="emits('update:modelValue', sb.path ?? '/')">
                    <MapPinCheckIcon v-if="sb.path === item.path" class="size-4" />
                    <MapIcon v-else class="size-4" />
                    {{ sb.name }}
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
        </template>
        <template v-if="childrens.length > 0">
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger class="flex items-center gap-1 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-3.5">
                <MapIcon />
                <ChevronDownIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem v-for="child in childrens" as-child>
                  <a class="cursor-pointer" @click="emits('update:modelValue', child.path ?? '/')">
                    <MapIcon class="size-4" />
                    {{ child.name }}
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
        </template>
      </BreadcrumbList>
    </Breadcrumb>
  </div>
</template>
