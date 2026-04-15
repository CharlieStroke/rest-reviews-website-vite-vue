<script setup lang="ts">
withDefaults(defineProps<{
  height?: string
  rounded?: string
  count?: number
  gap?: string
}>(), {
  height: 'h-40',
  rounded: 'rounded-3xl',
  count: 1,
  gap: 'gap-6',
})
</script>

<template>
  <div v-if="count > 1" :class="['space-y-' + gap.split('-')[1]]">
    <div
      v-for="i in count"
      :key="i"
      class="animate-pulse bg-white/5"
      :class="[height, rounded]"
    />
  </div>
  <div
    v-else
    class="animate-pulse bg-white/5"
    :class="[height, rounded]"
  />
</template>
