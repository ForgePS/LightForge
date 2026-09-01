<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    type?: string
    modelValue?: string
    required?: boolean
    error?: string
    autocomplete?: string
    rows?: number
  }>(),
  {
    type: 'text',
    required: false,
    rows: 4
  }
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const id = useId()
</script>

<template>
  <div class="lf-field">
    <label class="lf-field__label" :for="id">
      {{ label }}
      <span v-if="required" aria-hidden="true">*</span>
    </label>
    <textarea
      v-if="type === 'textarea'"
      :id="id"
      class="lf-textarea"
      :rows="rows"
      :required="required"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? `${id}-error` : undefined"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <input
      v-else
      :id="id"
      class="lf-input"
      :type="type"
      :required="required"
      :autocomplete="autocomplete"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? `${id}-error` : undefined"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" :id="`${id}-error`" class="lf-field__error">{{ error }}</p>
  </div>
</template>
