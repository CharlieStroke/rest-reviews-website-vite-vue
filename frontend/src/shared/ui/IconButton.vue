<script setup lang="ts">
import Icon from './Icon.vue'

const props = withDefaults(defineProps<{
  icon: string
  filled?: boolean
  shape?: 'circle' | 'square'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'ghost' | 'ghost-light' | 'danger'
  title?: string
  disabled?: boolean
}>(), {
  filled: false,
  shape: 'square',
  size: 'md',
  variant: 'ghost',
  disabled: false,
})

const sizeMap: Record<string, string> = {
  sm: 'w-8 h-8',
  md: 'w-9 h-9',
  lg: 'w-10 h-10',
}

const iconSizeMap: Record<string, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

const shapeMap: Record<string, string> = {
  circle: 'rounded-full',
  square: 'rounded-xl',
}

const variantMap: Record<string, string> = {
  ghost:       'bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white',
  'ghost-light': 'hover:bg-black/5 text-[#adaaad] hover:text-[#0e0e10]',
  danger:      'bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white/50 hover:text-red-400',
}
</script>

<template>
  <button
    :title="title"
    :disabled="disabled"
    class="flex items-center justify-center transition-colors disabled:opacity-40"
    :class="[sizeMap[props.size], shapeMap[props.shape], variantMap[props.variant]]"
  >
    <Icon :name="icon" :filled="filled" :class="iconSizeMap[props.size]" />
  </button>
</template>
