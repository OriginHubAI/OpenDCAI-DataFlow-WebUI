# Component Guidelines

> Component patterns, props, composition, and styling.

---

## Component Pattern: Vue 3 Options API

Most components in this project use the **Options API**.

### Basic Structure

```vue
<template>
  <div class="my-component">
    <slot name="header"></slot>
    <div @click="handleClick">{{ title }}</div>
  </div>
</template>

<script>
export default {
  props: {
    title: { type: String, default: 'Default Title' },
    modelValue: { default: false }
  },
  data() {
    return {
      internalValue: this.modelValue
    }
  },
  watch: {
    modelValue(val) { this.internalValue = val },
    internalValue(val) { this.$emit('update:modelValue', val) }
  },
  methods: {
    handleClick() {
      this.$emit('confirm')
    }
  }
}
</script>

<style lang="scss" scoped>
.my-component {
  /* styles */
}
</style>
```

---

## Props and V-Model

- **`modelValue`**: Follow Vue 3 convention for `v-model`. Sync it with a local state property using `watch` if you need to mutate it internally.
- **Validation**: While optional, providing `type` and `default` for props is highly recommended.

---

## Slots and Composition

- **Named Slots**: Use `<slot name="content">` for flexible layout components.
- **Scoped Slots**: Useful for providing component methods to the parent.
  ```vue
  <!-- Child -->
  <slot name="footer" :close="closeMethod"></slot>
  ```

---

## UI Library: Fluent Design (`fv-`)

This project uses `@creatorsn/vfluent3`. Most common UI elements should use their `fv-` prefixed counterparts.

- **Panels**: `fv-panel`
- **Buttons**: `fv-button`
- **Inputs**: `fv-text-box`, `fv-check-box`
- **Lists**: `fv-list-view`

---

## Styling Guidelines

- **Pre-processor**: Use SCSS.
- **Global Styles**: Defined in `src/style/global.scss`.
- **Utility Classes**: Use project-specific utility classes when available:
  - `.bp-row`: Horizontal layout container.
  - `.bp-row.sep`: Space-between horizontal layout.
  - `.bp-control`: Right-aligned footer control area.

---

## Guidelines

- [OK] **Prefer Options API** for consistency with the existing codebase (views and general components).
- [OK] **Namespace your styles**: Use a root class name that matches the component name (e.g., `.base-panel-container`).
- [OK] **Use `this.$barWarning`** for user-facing notifications.
- [X] **Don't hardcode colors**: Use variables if available or follow the light/dark theme patterns seen in `basePanel.vue`.
