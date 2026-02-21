<script setup lang="ts">
import { Item, ItemContent, ItemTitle, ItemMedia, ItemActions } from "@components/ui/item";
import { FolderIcon, EllipsisIcon, CircleStarIcon } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Item variant="muted" class="basis-lg">
      <ItemMedia>
        <FolderIcon :size="18" />
      </ItemMedia>
      <ItemContent class="min-w-0">
        <ItemTitle class="text-xs min-w-0 w-full">
          <span class="truncate">Folder</span>
        </ItemTitle>
      </ItemContent>
      <ItemActions>
        <Button size="icon-sm" variant="ghost">
          <EllipsisIcon />
        </Button>
      </ItemActions>
    </Item>
    <Item variant="muted" class="basis-lg">
      <ItemMedia>
        <CircleStarIcon :size="18" />
      </ItemMedia>
      <ItemContent class="min-w-0">
        <ItemTitle class="text-xs min-w-0 w-full">
          <span class="truncate">Item1Item1Item1Item1Item1</span>
        </ItemTitle>
      </ItemContent>
      <ItemActions>
        <Button size="icon-sm" variant="ghost">
          <EllipsisIcon />
        </Button>
      </ItemActions>
    </Item>
    <Item variant="muted" class="basis-lg">
      <ItemMedia>
        <CircleStarIcon :size="18" />
      </ItemMedia>
      <ItemContent class="min-w-0">
        <ItemTitle class="text-xs min-w-0 w-full">
          <span class="truncate">Item2Item2Item2Item2Item2</span>
        </ItemTitle>
      </ItemContent>
      <ItemActions>
        <Button size="icon-sm" variant="ghost">
          <EllipsisIcon />
        </Button>
      </ItemActions>
    </Item>
  </div>
</template>
