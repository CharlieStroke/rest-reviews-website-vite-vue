<script setup lang="ts">
import { ref } from 'vue';
import { ReviewService } from '@/entities/review/api/ReviewService';
import { extractErrorMessage } from '@/shared/lib/extractError';
import BaseButton from '@/shared/ui/BaseButton.vue';
import TextInput from '@/shared/ui/TextInput.vue';
import TextArea from '@/shared/ui/TextArea.vue';
import FormField from '@/shared/ui/FormField.vue';
import FormError from '@/shared/ui/FormError.vue';
import type { ReviewCardData } from '@/shared/ui/ReviewCard.vue';

const props = defineProps<{
  review: ReviewCardData;
}>();

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'success', updatedData: Partial<ReviewCardData>): void;
}>();

const editForm = ref({
  foodScore: props.review.foodScore,
  serviceScore: props.review.serviceScore,
  priceScore: props.review.priceScore,
  title: props.review.title || '',
  comment: props.review.comment || '',
});

const editSaving = ref(false);
const editError = ref<string | null>(null);

const scoreFields: Array<{ id: 'foodScore' | 'serviceScore' | 'priceScore', label: string }> = [
  { id: 'foodScore', label: 'Comida' },
  { id: 'serviceScore', label: 'Servicio' },
  { id: 'priceScore', label: 'Precio' },
];

const saveEdit = async () => {
  if (editSaving.value) return;
  editSaving.value = true;
  editError.value = null;

  try {
    await ReviewService.updateReview(props.review.id, {
      foodScore: editForm.value.foodScore,
      serviceScore: editForm.value.serviceScore,
      priceScore: editForm.value.priceScore,
      title: editForm.value.title || undefined,
      comment: editForm.value.comment || undefined,
    });

    emit('success', {
      foodScore: editForm.value.foodScore,
      serviceScore: editForm.value.serviceScore,
      priceScore: editForm.value.priceScore,
      title: editForm.value.title || undefined,
      comment: editForm.value.comment || undefined,
    });
  } catch (e: unknown) {
    editError.value = extractErrorMessage(e, 'No se pudo guardar los cambios.');
  } finally {
    editSaving.value = false;
  }
};
</script>

<template>
  <div class="bg-white/5 border border-orange-500/20 rounded-2xl p-5 mb-4 flex flex-col gap-4">
    <!-- Scores row -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div v-for="field in scoreFields" :key="field.id" class="flex flex-col gap-1">
        <label class="text-[10px] uppercase text-white/50 font-semibold tracking-wider">{{ field.label }}</label>
        <div class="flex gap-1">
          <button
            v-for="n in 5" :key="n" type="button"
            @click="editForm[field.id] = n"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all"
            :class="n <= editForm[field.id] ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-white/10 text-white/40 hover:bg-white/20'"
          >{{ n }}</button>
        </div>
      </div>
    </div>

    <FormField label="Título" theme="dark">
      <TextInput
        v-model="editForm.title"
        placeholder="Título de tu reseña"
        :maxlength="100"
        theme="dark"
      />
    </FormField>

    <FormField label="Comentario" theme="dark">
      <TextArea
        v-model="editForm.comment"
        placeholder="Cuéntanos más detalles…"
        :rows="3"
        :maxlength="500"
        theme="dark"
      />
    </FormField>

    <FormError :message="editError" theme="dark" />

    <div class="flex gap-3 justify-end mt-2">
      <BaseButton
        variant="ghost"
        theme="dark"
        shape="rounded"
        :disabled="editSaving"
        @click="emit('cancel')"
      >
        Cancelar
      </BaseButton>
      <BaseButton
        variant="primary"
        shape="rounded"
        :loading="editSaving"
        loading-text="Guardando…"
        @click="saveEdit"
      >
        Guardar
      </BaseButton>
    </div>
  </div>
</template>
