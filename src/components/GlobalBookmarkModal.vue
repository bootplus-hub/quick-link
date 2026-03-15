<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogFooter, DialogTitle } from "./ui/dialog";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useBookmarkModal } from "@/stores";
import * as z from "zod";
import { Input } from "./ui/input";
import { watch } from "vue";
import { SaveIcon } from "lucide-vue-next";

const store = useBookmarkModal();
const modifyFormSchema = z.object({
  name: z.string().min(1, { message: '* 이름은 최소 1글자 이상이어야 합니다.' }),
  url: z.string().url('* URL 형식이 아닙니다.').nullable(),
});
type ModifyFormValues = z.infer<typeof modifyFormSchema>;
const form = useForm<ModifyFormValues>({
  validationSchema: toTypedSchema(modifyFormSchema),
  initialValues: {
    name: '',
    url: '',
  }
});

watch(() => store.isOpen, val => {
  if (val) {
    form.setValues({
      name: store.item?.name,
      url: store.item?.url ?? null,
    });
  }
});

function handleOpenChange (_open: boolean) {
  console.log('handleOpenChange');
  store.cancel();
  form.resetForm();
}

const handleSubmit = form.handleSubmit(values => {
  console.log('제출된 데이터:', values);

  store.cancel();
  form.resetForm();
});
</script>

<template>
  <Dialog :open="store.isOpen" @update:open="handleOpenChange">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>편집</DialogTitle>
        <DialogDescription>편집 후 저장을 눌러주세요</DialogDescription>
      </DialogHeader>
      <form @submit="handleSubmit" class="flex flex-col gap-4">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>이름</FormLabel>
            <FormControl>
              <Input type="text" placeholder="이름을 입력해주세요." v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-if="store.item?.type == 'url'" v-slot="{ componentField }" name="url">
          <FormItem>
            <FormLabel>URL 주소</FormLabel>
            <FormControl>
              <Input type="url" placeholder="https://example.com" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <DialogFooter>
          <Button type="submit" variant="secondary"><SaveIcon /> 저장</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
