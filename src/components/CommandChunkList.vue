<script setup lang="ts">
import {
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandInput,
  useCommand,
} from "@/components/ui/command";
import { BookmarkItem } from "@/components";
import { Bookmark } from "@/bookmarks";
import { AcceptableValue, type ListboxItemSelectEvent } from "reka-ui";
import { computed, ref, watch } from "vue";
import { useIntersectionObserver } from "@vueuse/core";

export interface ChunkListProps {
  items?: Bookmark[];
}

export type ChunkListEmits = {
  select: [event: ListboxItemSelectEvent<AcceptableValue>];
};

const props = defineProps<ChunkListProps>();
const emits = defineEmits<ChunkListEmits>();

const { filterState } = useCommand();

// 청크 설정
const CHUNK_SIZE = 10;
const currentLimit = ref(CHUNK_SIZE);
const loadMoreTrigger = ref<HTMLElement | null>(null);

// 1. 필터링된 전체 리스트
const filteredItems = computed(() => {
  if (!filterState.search) return props.items ?? [];
  return (
    props.items?.filter((item) =>
      item.name.toLowerCase().includes(filterState.search.toLowerCase()),
    ) ?? []
  );
});

// 2. 화면에 그릴 청크 리스트 (limit 까지만 자름)
const visibleItems = computed(() => {
  return filteredItems.value.slice(0, currentLimit.value);
});

// 3. 검색어가 변경되면 limit 초기화
watch(
  () => filterState.search,
  () => {
    currentLimit.value = CHUNK_SIZE;
  },
);

// 4. 스크롤이 트리거 지점에 닿으면 limit 증가
useIntersectionObserver(loadMoreTrigger, ([{ isIntersecting }]) => {
  if (isIntersecting && currentLimit.value < filteredItems.value.length) {
    currentLimit.value += CHUNK_SIZE;
  }
});

function handleSelect(event: ListboxItemSelectEvent<AcceptableValue>) {
  emits("select", event);
}
</script>
<template>
  <CommandInput placeholder="Search ..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Bookmarks">
      <CommandItem
        v-for="item in visibleItems"
        :value="item.name"
        class="cursor-pointer pt-0 pb-0 *:w-full"
        @select="handleSelect"
      >
        <BookmarkItem item-type="command" :item="item" />
      </CommandItem>
      <div
        v-if="currentLimit < filteredItems.length"
        ref="loadMoreTrigger"
        class="h-4 w-full"
      />
    </CommandGroup>
  </CommandList>
</template>
