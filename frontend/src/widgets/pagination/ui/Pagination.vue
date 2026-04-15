<script setup lang="ts">
import Icon from '@/shared/ui/Icon.vue'

const props = withDefaults(defineProps<{
  currentPage: number
  totalPages: number
  /** 'simple' = prev/next only; 'numeric' = prev + page bullets + next */
  variant?: 'simple' | 'numeric'
  /** 'dark' or 'light' surface */
  theme?: 'dark' | 'light'
  loading?: boolean
}>(), {
  variant: 'simple',
  theme: 'dark',
  loading: false,
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

const pages = () => {
  const range: number[] = []
  for (let i = 1; i <= props.totalPages; i++) range.push(i)
  return range
}

const btnBase = (active = false) => {
  if (props.theme === 'light') {
    return active
      ? 'bg-orange-500 text-white border border-orange-500'
      : 'bg-surface-container border border-outline-variant/20 text-on-surface hover:bg-surface-container-high disabled:opacity-40'
  }
  return active
    ? 'bg-orange-500 text-white border border-orange-500'
    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30'
}
</script>

<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-3">

    <!-- Prev -->
    <button
      :disabled="currentPage === 1 || loading"
      @click="emit('update:currentPage', currentPage - 1)"
      class="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
      :class="btnBase()"
    >
      <Icon name="arrow_back_ios" :size="14" />
      <span v-if="variant === 'simple'">Anterior</span>
    </button>

    <!-- Page bullets (numeric only) -->
    <template v-if="variant === 'numeric'">
      <button
        v-for="page in pages()"
        :key="page"
        @click="emit('update:currentPage', page)"
        class="w-9 h-9 rounded-lg text-sm font-bold transition-colors"
        :class="btnBase(page === currentPage)"
      >
        {{ page }}
      </button>
    </template>

    <!-- Page counter (simple) -->
    <span v-else class="text-sm font-medium" :class="theme === 'dark' ? 'text-white/60' : 'text-on-surface-variant font-headline font-bold'">
      {{ currentPage }} / {{ totalPages }}
    </span>

    <!-- Next -->
    <button
      :disabled="currentPage === totalPages || loading"
      @click="emit('update:currentPage', currentPage + 1)"
      class="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
      :class="btnBase()"
    >
      <span v-if="variant === 'simple'">Siguiente</span>
      <Icon name="arrow_forward_ios" :size="14" />
    </button>

  </div>
</template>
