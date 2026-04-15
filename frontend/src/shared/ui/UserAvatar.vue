<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  src?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'rounded'
}>(), {
  src: null,
  size: 'md',
  shape: 'circle',
})

const initials = computed(() => {
  const parts = props.name.split(' ').filter(Boolean)
  if (parts.length >= 2) return ((parts[0]![0] ?? '') + (parts[1]![0] ?? '')).toUpperCase()
  return (parts[0] ?? '?').substring(0, 2).toUpperCase()
})

const sizeMap: Record<string, string> = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-11 h-11 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-32 h-32 text-4xl',
}

const shapeMap: Record<string, string> = {
  circle:  'rounded-full',
  rounded: 'rounded-2xl',
}

const fontWeightMap: Record<string, string> = {
  xs: 'font-bold',
  sm: 'font-bold',
  md: 'font-bold',
  lg: 'font-black',
  xl: 'font-black',
}
</script>

<template>
  <div
    class="flex items-center justify-center flex-shrink-0 overflow-hidden"
    :class="[sizeMap[props.size], shapeMap[props.shape]]"
  >
    <img
      v-if="src"
      :src="src"
      :alt="name"
      class="w-full h-full object-cover"
    />
    <div
      v-else
      class="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-[0_4px_14px_rgba(249,115,22,0.35)]"
      :class="[fontWeightMap[props.size]]"
    >
      {{ initials }}
    </div>
  </div>
</template>
