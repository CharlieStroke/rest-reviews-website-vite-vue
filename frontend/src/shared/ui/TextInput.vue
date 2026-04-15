<script setup lang="ts">
/**
 * TextInput — Unified text input for all themes.
 *
 * theme:
 *  'dark'  → bg-white/5 border-white/10 text-white  (modals oscuros)
 *  'light' → bg-[#FAF9F6] border-black/10 text-[#0e0e10]  (modals claros)
 *  'glass' → glass-input class (LoginPage / RegisterPage)
 */
const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  type?: string
  maxlength?: number
  disabled?: boolean
  theme?: 'dark' | 'light' | 'glass'
  autocomplete?: string
}>(), {
  modelValue: '',
  type: 'text',
  disabled: false,
  theme: 'dark',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
}>()

const themeMap: Record<string, string> = {
  dark:  'bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10',
  light: 'bg-[#FAF9F6] border border-black/10 text-[#0e0e10] placeholder-black/30 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10',
  glass: 'glass-input',
}
</script>

<template>
  <input
    :value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :maxlength="maxlength"
    :disabled="disabled"
    :autocomplete="autocomplete"
    class="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all disabled:opacity-50"
    :class="themeMap[props.theme]"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    @blur="emit('blur', $event)"
  />
</template>
