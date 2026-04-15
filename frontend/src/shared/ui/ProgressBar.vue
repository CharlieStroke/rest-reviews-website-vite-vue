<script setup lang="ts">
withDefaults(defineProps<{
  value: number
  max?: number
  color?: string
  height?: string
  rounded?: string
}>(), {
  max: 100,
  color: 'bg-gradient-to-r from-orange-500 to-amber-500',
  height: 'h-1.5',
  rounded: 'rounded-full',
})
</script>

<template>
  <div class="w-full bg-white/5 overflow-hidden" :class="[height, rounded]">
    <div
      class="h-full transition-all duration-500"
      :class="[color, rounded]"
      :style="{ width: `${Math.min(100, Math.max(0, (value / max) * 100))}%` }"
    />
  </div>
</template>
