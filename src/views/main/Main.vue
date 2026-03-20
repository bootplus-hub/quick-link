<script setup lang="ts">
import { Breadcrumb } from "@/components";
</script>

<template>
  <div class="flex flex-col p-4 mt-10 gap-4 overflow-auto">
    <Breadcrumb />
    <router-view />
  </div>
</template>
