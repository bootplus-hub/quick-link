<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@components/ui/accordion";
import { Item, ItemContent, ItemTitle, ItemMedia, ItemActions } from "@components/ui/item";
import { FolderIcon, FolderOpenIcon, EllipsisIcon, CircleStarIcon } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
</script>

<template>
  <div class="flex-1 p-4 mt-10 overflow-auto">
    <Tabs default-value="user">
      <TabsList>
        <TabsTrigger value="user" class="text-xs w-80">사용자 정의</TabsTrigger>
        <TabsTrigger value="biz" class="text-xs">사내 업무</TabsTrigger>
        <TabsTrigger value="helper" class="text-xs">업무 도우미</TabsTrigger>
        <TabsTrigger value="edu" class="text-xs">교육</TabsTrigger>
      </TabsList>
      <TabsContent value="user" class="text-xs flex flex-wrap gap-2">
        <Accordion type="single" collapsible class="basis-full">
          <AccordionItem value="path1">
            <AccordionTrigger>
              <div class="flex flex-row gap-2 content-center">
                <FolderIcon :size="18" class="[button[data-state=open]_&]:hidden" />
                <FolderOpenIcon :size="18" class="[button[data-state=closed]_&]:hidden" />
                Path1
              </div>
              </AccordionTrigger>
            <AccordionContent class="flex flex-wrap gap-2 px-4">
              <Accordion type="single" collapsible class="basis-full">
                <AccordionItem value="path1.1">
                  <AccordionTrigger>path1.1</AccordionTrigger>
                  <AccordionContent>
                    <p>path1.1</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="path1.2">
                  <AccordionTrigger>path1.2</AccordionTrigger>
                  <AccordionContent>
                    <p>path1.2</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Item variant="muted" class="basis-lg">
                <ItemMedia>
                  <CircleStarIcon :size="18" />
                </ItemMedia>
                <ItemContent class="min-w-0">
                  <ItemTitle class="text-xs min-w-0 w-full"><span class="truncate">Item1Item1Item1Item1Item1</span></ItemTitle>
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
                <ItemContent>
                  <ItemTitle class="text-xs">Item1</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <Button size="icon-sm" variant="ghost">
                    <EllipsisIcon />
                  </Button>
                </ItemActions>
              </Item>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>
      <TabsContent value="biz" class="text-xs">
      </TabsContent>
      <TabsContent value="helper" class="text-xs">
      </TabsContent>
      <TabsContent value="edu" class="text-xs">
      </TabsContent>
    </Tabs>
  </div>
</template>
