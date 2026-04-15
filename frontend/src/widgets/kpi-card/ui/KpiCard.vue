<script setup lang="ts">
import Icon from '@/shared/ui/Icon.vue'
import ProgressBar from '@/shared/ui/ProgressBar.vue'
import Badge from '@/shared/ui/Badge.vue'

withDefaults(defineProps<{
  icon: string
  iconFilled?: boolean
  iconColor?: string
  iconBg?: string
  title: string
  value?: string | number
  subtitle?: string
  /** If set, shows a Badge in the top-right */
  badge?: { text: string; variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'orange' }
  /** If set (0–100), shows a ProgressBar at the bottom */
  progress?: number
  progressColor?: string
}>(), {
  iconFilled: true,
  iconColor: 'text-orange-500',
  iconBg: 'bg-orange-500/10',
})
</script>

<template>
  <div class="card-cream rounded-[1.5rem] p-6 border border-black/5 shadow-sm flex flex-col gap-3">
    <!-- Header row -->
    <div class="flex items-start justify-between gap-2">
      <div class="flex items-center gap-3">
        <div
          class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          :class="iconBg"
        >
          <Icon :name="icon" :filled="iconFilled" :class="iconColor" :size="22" />
        </div>
        <p class="text-sm font-semibold text-[#525155] leading-tight">{{ title }}</p>
      </div>
      <Badge v-if="badge" :variant="badge.variant ?? 'neutral'">{{ badge.text }}</Badge>
    </div>

    <!-- Value -->
    <div v-if="value !== undefined" class="text-3xl font-black text-[#0e0e10] brand leading-none">
      {{ value }}
    </div>

    <!-- Subtitle -->
    <p v-if="subtitle" class="text-xs text-[#adaaad]">{{ subtitle }}</p>

    <!-- Progress bar -->
    <ProgressBar
      v-if="progress !== undefined"
      :value="progress"
      :color="progressColor"
    />

    <!-- Optional slot for custom content -->
    <slot />
  </div>
</template>
