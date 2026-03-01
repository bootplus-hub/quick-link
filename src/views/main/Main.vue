<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
</script>

<template>
  <div class="flex-1 p-4 mt-10 overflow-auto">
    <Tabs default-value="user">
      <TabsList>
        <TabsTrigger value="user" class="text-xs w-78">사용자 정의</TabsTrigger>
        <TabsTrigger value="biz" class="text-xs">사내 업무</TabsTrigger>
        <TabsTrigger value="helper" class="text-xs">업무 도우미</TabsTrigger>
        <TabsTrigger value="edu" class="text-xs">교육</TabsTrigger>
      </TabsList>
      <TabsContent value="user" class="text-xs">
        <router-view />
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
