<script setup lang="ts">
import Icon from './Icon.vue'

withDefaults(defineProps<{
  icon: string
  title: string
  description?: string
  iconFilled?: boolean
  /** 'dark' uses bg-surface-container-low; 'light' uses transparent */
  theme?: 'dark' | 'light'
}>(), {
  iconFilled: true,
  theme: 'dark',
})
</script>

<template>
  <div
    class="text-center py-20 rounded-3xl"
    :class="theme === 'dark' ? 'bg-surface-container-low' : ''"
  >
    <Icon
      :name="icon"
      :filled="iconFilled"
      :size="48"
      class="mb-3 block"
      :class="theme === 'dark' ? 'text-on-surface-variant/30' : 'text-white/20'"
    />
    <p
      class="font-bold font-headline"
      :class="theme === 'dark' ? 'text-on-surface-variant' : 'text-white/50'"
    >
      {{ title }}
    </p>
    <p
      v-if="description"
      class="text-sm mt-1"
      :class="theme === 'dark' ? 'text-on-surface-variant/60 font-body' : 'text-white/30'"
    >
      {{ description }}
    </p>
    <div v-if="$slots.actions" class="mt-6">
      <slot name="actions" />
    </div>
  </div>
</template>
