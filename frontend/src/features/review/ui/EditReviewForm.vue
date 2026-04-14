<script setup lang="ts">
import { ref } from 'vue';
import { ReviewService } from '@/entities/review/api/ReviewService';
import { extractErrorMessage } from '@/shared/lib/extractError';
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
    
    <!-- Title -->
    <div>
      <label class="text-[10px] uppercase text-white/50 font-semibold tracking-wider block mb-1">Título</label>
      <input
        v-model="editForm.title"
        type="text"
        maxlength="100"
        placeholder="Título de tu reseña"
        class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
      />
    </div>
    
    <!-- Comment -->
    <div>
      <label class="text-[10px] uppercase text-white/50 font-semibold tracking-wider block mb-1">Comentario</label>
      <textarea
        v-model="editForm.comment"
        rows="3"
        maxlength="500"
        placeholder="Cuéntanos más detalles…"
        class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
      ></textarea>
    </div>
    
    <p v-if="editError" class="text-red-400 text-xs font-bold">{{ editError }}</p>
    
    <div class="flex gap-3 justify-end mt-2">
      <button @click="emit('cancel')" :disabled="editSaving" class="px-5 py-2 text-sm font-semibold rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40">
        Cancelar
      </button>
      <button @click="saveEdit" :disabled="editSaving" class="px-6 py-2 text-sm font-bold rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-lg focus:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 border border-orange-400/20">
        <span v-if="editSaving" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
        {{ editSaving ? 'Guardando…' : 'Guardar' }}
      </button>
    </div>
  </div>
</template>
