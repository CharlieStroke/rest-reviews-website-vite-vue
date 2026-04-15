<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  error?: string | null
  hint?: string
  required?: boolean
  theme?: 'dark' | 'light'
}>(), {
  theme: 'dark',
})
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label
      v-if="label"
      class="text-[10px] uppercase font-semibold tracking-widest block"
      :class="theme === 'dark' ? 'text-white/50' : 'text-[#525155]'"
    >
      {{ label }}<span v-if="required" class="text-orange-500 ml-0.5">*</span>
    </label>

    <slot />

    <p v-if="hint && !error" class="text-xs" :class="theme === 'dark' ? 'text-white/30' : 'text-[#adaaad]'">
      {{ hint }}
    </p>
    <p v-if="error" class="text-xs text-red-400 font-medium">{{ error }}</p>
  </div>
</template>
