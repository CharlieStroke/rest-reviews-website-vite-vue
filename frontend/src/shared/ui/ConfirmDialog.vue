<script setup lang="ts">
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}>(), {
  title: '¿Confirmar acción?',
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
  variant: 'danger',
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const handleCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    :title="title"
    size="sm"
    theme="dark"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <p v-if="message" class="text-white/60 text-sm leading-relaxed">{{ message }}</p>
    <slot />

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <BaseButton
          variant="ghost"
          theme="dark"
          @click="handleCancel"
          :disabled="loading"
        >
          {{ cancelLabel }}
        </BaseButton>
        <BaseButton
          :variant="variant === 'danger' ? 'danger' : 'primary'"
          shape="rounded"
          :loading="loading"
          @click="handleConfirm"
        >
          {{ confirmLabel }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
