<script setup lang="ts">
import { ref, watch } from 'vue';
import { httpClient } from '@/shared/api/httpClient';
import { extractErrorMessage } from '@/shared/lib/extractError';
import BaseModal from '@/shared/ui/BaseModal.vue';
import BaseButton from '@/shared/ui/BaseButton.vue';
import TextArea from '@/shared/ui/TextArea.vue';
import FormError from '@/shared/ui/FormError.vue';
import StarRating from '@/shared/ui/StarRating.vue';
import Icon from '@/shared/ui/Icon.vue';

const props = defineProps<{
  isOpen: boolean;
  review?: { id: string; author?: string | null; comment?: string | null; foodScore?: number } | null;
}>();

const emit = defineEmits<{
  close: [];
  sent: [payload: { reviewId: string; reply: string }];
}>();

const replyText = ref('');
const isSubmitting = ref(false);
const error = ref<string | null>(null);

watch(() => props.isOpen, (open) => {
  if (!open) {
    replyText.value = '';
    error.value = null;
  }
});

const handleClose = () => emit('close');

const handleReply = async () => {
  if (!replyText.value.trim() || !props.review || isSubmitting.value) return;
  isSubmitting.value = true;
  error.value = null;
  try {
    await httpClient.patch(`/api/reviews/${props.review.id}/reply`, { reply: replyText.value.trim() });
    emit('sent', { reviewId: props.review.id, reply: replyText.value.trim() });
  } catch (e: unknown) {
    error.value = extractErrorMessage(e, 'Error al publicar la respuesta.');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <BaseModal
    :model-value="isOpen"
    title="Respuesta Oficial"
    size="lg"
    theme="light"
    @update:model-value="!$event && handleClose()"
    @close="handleClose"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
          <Icon name="admin_panel_settings" :size="22" />
        </div>
        <div>
          <h3 class="text-xl font-bold text-[#0e0e10] leading-tight brand">Respuesta Oficial</h3>
          <p class="text-xs text-[#525155] font-medium">
            Contestando a: <span class="font-bold text-orange-500">{{ review?.author || 'Estudiante' }}</span>
          </p>
        </div>
      </div>
    </template>

    <div class="flex flex-col gap-6">
      <!-- Original Review -->
      <div class="p-5 rounded-2xl bg-[#FAF9F6] relative border border-black/5">
        <div class="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-l-2xl"></div>
        <StarRating :value="review?.foodScore ?? 5" :size="16" class="mb-2" />
        <p class="text-[#3f3f42] text-sm italic">"{{ review?.comment || 'Sin contenido.' }}"</p>
      </div>

      <!-- Reply Input -->
      <div class="flex flex-col gap-2">
        <label class="text-xs font-bold text-orange-500 uppercase tracking-widest pl-1">Tu Respuesta</label>
        <TextArea
          v-model="replyText"
          :rows="5"
          placeholder="Escribe una respuesta profesional y cortés representando tu establecimiento..."
          theme="light"
        />
      </div>

      <FormError :message="error" theme="light" />
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <BaseButton variant="ghost" theme="light" @click="handleClose">
          Cancelar
        </BaseButton>
        <BaseButton
          variant="primary"
          shape="pill"
          :loading="isSubmitting"
          loading-text="Publicando..."
          :disabled="!replyText.trim()"
          @click="handleReply"
        >
          Publicar Respuesta
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
