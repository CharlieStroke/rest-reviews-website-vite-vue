<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: string
  tabs: Array<{ key: string; label: string; icon?: string }>
  variant?: 'underline' | 'pill'
  /** Theme for pill variant: 'dark' uses white-toned colors, 'light' uses dark-toned */
  theme?: 'dark' | 'light'
}>(), {
  variant: 'underline',
  theme: 'dark',
})

const emit = defineEmits<{
  'update:modelValue': [key: string]
}>()
</script>

<template>
  <!-- UNDERLINE variant (EstablishmentDetailsPage, AppLayout nav) -->
  <div
    v-if="variant === 'underline'"
    class="flex gap-8 overflow-x-auto no-scrollbar"
  >
    <button
      v-for="tab in tabs"
      :key="tab.key"
      @click="emit('update:modelValue', tab.key)"
      class="pb-4 pt-4 font-headline font-bold text-sm uppercase tracking-widest whitespace-nowrap transition-colors border-b-2"
      :class="modelValue === tab.key
        ? 'text-primary border-primary'
        : 'text-on-surface-variant hover:text-on-surface border-transparent'"
    >
      {{ tab.label }}
    </button>
  </div>

  <!-- PILL variant (LoginPage / RegisterPage) -->
  <div
    v-else
    class="flex rounded-2xl p-1"
    :class="theme === 'dark' ? 'bg-white/5' : 'bg-black/5'"
  >
    <button
      v-for="tab in tabs"
      :key="tab.key"
      @click="emit('update:modelValue', tab.key)"
      class="flex-1 py-2 px-4 rounded-xl text-sm font-bold transition-all"
      :class="modelValue === tab.key
        ? theme === 'dark'
          ? 'bg-white/10 text-white shadow-sm'
          : 'bg-white text-[#0e0e10] shadow-sm'
        : theme === 'dark'
          ? 'text-white/40 hover:text-white/70'
          : 'text-[#adaaad] hover:text-[#0e0e10]'"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
