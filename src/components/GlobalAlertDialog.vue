<script setup lang="ts">
import { useAlertDialog } from '@/stores/useAlertDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@components/ui/alert-dialog';

const store = useAlertDialog();
</script>

<template>
  <AlertDialog :open="store.isOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ store.title }}</AlertDialogTitle>
        <AlertDialogDescription>{{ store.description }}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel v-if="store.type === 'confirm'" @click="store.cancel">{{ store.cancelText }}</AlertDialogCancel>
        <AlertDialogAction @click="store.confirm">{{ store.actionText }}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
