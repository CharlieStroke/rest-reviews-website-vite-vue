<script setup lang="ts">
import Icon from './Icon.vue'

withDefaults(defineProps<{
  message?: string | null
  theme?: 'dark' | 'light'
}>(), {
  theme: 'dark',
})
</script>

<template>
  <div
    v-if="message"
    class="flex items-center gap-2 p-3 rounded-xl text-sm border"
    :class="theme === 'dark'
      ? 'bg-red-500/10 border-red-500/20 text-red-400'
      : 'bg-red-50 border-red-100 text-red-600'"
  >
    <Icon name="error" :size="16" />
    {{ message }}
  </div>
</template>
