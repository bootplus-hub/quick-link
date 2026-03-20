<script setup lang="ts">
import { useRoute } from "vue-router";
import _ from "lodash";
import { Breadcrumb } from "@/components";
const route = useRoute();
</script>

<template>
  <Breadcrumb :path="route.path" type="router" />
</template>
