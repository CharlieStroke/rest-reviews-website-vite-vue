<script setup lang="ts">
defineProps<{
  name: string
  filled?: boolean
  size?: string | number
}>()
</script>

<template>
  <span
    class="material-symbols-outlined"
    :style="{
      fontSize: typeof size === 'number' ? `${size}px` : size,
      fontVariationSettings: filled ? `'FILL' 1` : `'FILL' 0`,
    }"
    aria-hidden="true"
  >{{ name }}</span>
</template>
