<script setup lang="ts">
const props = withDefaults(defineProps<{
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'white' | 'orange' | 'dark'
}>(), {
  size: 'sm',
  variant: 'white',
})

const sizeMap: Record<string, string> = {
  xs: 'w-3 h-3 border',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-2',
}

const variantMap: Record<string, string> = {
  white:  'border-white/20 border-t-white',
  orange: 'border-orange-500/20 border-t-orange-500',
  dark:   'border-black/20 border-t-black',
}
</script>

<template>
  <span
    class="block rounded-full animate-spin flex-shrink-0"
    :class="[sizeMap[props.size], variantMap[props.variant]]"
    aria-hidden="true"
  />
</template>
