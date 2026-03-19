<script setup lang="ts">
import MainBreadcrumb from "./MainBreadcrumb.vue";
</script>

<template>
  <div class="flex flex-col p-4 mt-10 gap-4 overflow-auto">
    <MainBreadcrumb />
    <router-view />
  </div>
</template>
