<script setup lang="ts">
import Icon from './Icon.vue'

withDefaults(defineProps<{
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'orange'
  size?: 'sm' | 'md'
  shape?: 'pill' | 'square'
  dot?: boolean
  icon?: string
  iconFilled?: boolean
}>(), {
  variant: 'neutral',
  size: 'sm',
  shape: 'pill',
  dot: false,
  iconFilled: false,
})

const variantMap: Record<string, string> = {
  success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  danger:  'bg-red-500/10 text-red-400 border border-red-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  info:    'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  neutral: 'bg-white/5 text-white/40 border border-white/10',
  orange:  'bg-orange-500/10 text-orange-400 border border-orange-500/20',
}

const dotMap: Record<string, string> = {
  success: 'bg-emerald-400',
  danger:  'bg-red-400',
  warning: 'bg-amber-400',
  info:    'bg-blue-400',
  neutral: 'bg-white/40',
  orange:  'bg-orange-400',
}

const sizeMap: Record<string, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-xs',
}

const shapeMap: Record<string, string> = {
  pill:   'rounded-full',
  square: 'rounded',
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1 font-bold uppercase tracking-wide"
    :class="[variantMap[variant], sizeMap[size], shapeMap[shape]]"
  >
    <span
      v-if="dot"
      class="w-1.5 h-1.5 rounded-full animate-pulse"
      :class="dotMap[variant]"
    />
    <Icon v-if="icon" :name="icon" :filled="iconFilled" :size="11" />
    <slot />
  </span>
</template>
