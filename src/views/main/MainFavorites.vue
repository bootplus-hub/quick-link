<script setup lang="ts">
import _ from "lodash";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { Item, ItemContent, ItemTitle, ItemMedia, ItemActions } from "@components/ui/item";
import { FolderIcon, ArrowBigUpIcon, CircleStarIcon, ChevronRightIcon } from "lucide-vue-next";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";

const route = useRoute();
const pathCurrent = computed(() => route.path);
const pathUpper = computed(() => pathCurrent.value.replace(/\/\w+$/, ''));
const isRoot = computed(() => pathCurrent.value === '/');
const pathLower = computed(() => pathCurrent.value + (isRoot.value ? 'folder' : '/folder'));

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
            <span class="truncate">.. {{ pathUpper }}</span>
          </ItemTitle>
        </ItemContent>
        <ItemActions>
          <ChevronRightIcon class="size-4" />
        </ItemActions>
      </router-link>
    </Item>
    <Item variant="outline" size="sm" class="basis-lg max-w-lg" as-child>
      <router-link :to="pathLower">
        <ItemMedia>
          <FolderIcon class="size-5" />
        </ItemMedia>
        <ItemContent class="min-w-0">
          <ItemTitle class="text-xs min-w-0 w-full">
            <span class="truncate">{{ pathLower }}</span>
          </ItemTitle>
        </ItemContent>
        <ItemActions>
          <ChevronRightIcon class="size-4" />
        </ItemActions>
      </router-link>
    </Item>
    <Item variant="outline" size="sm" class="basis-lg max-w-lg" as-child>
      <a href="microsoft-edge:https://www.naver.com">
        <ItemMedia>
          <Avatar class="size-5">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>
              <CircleStarIcon />
            </AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent class="min-w-0">
          <ItemTitle class="text-xs min-w-0 w-full">
            <span class="truncate">네이버</span>
          </ItemTitle>
        </ItemContent>
        <ItemActions>
          <ChevronRightIcon class="size-4" />
        </ItemActions>
      </a>
    </Item>
  </div>
</template>
