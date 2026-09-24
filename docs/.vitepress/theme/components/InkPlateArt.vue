<script setup>
defineProps({ scene: { type: String, required: true } })
</script>

<template>
  <img
    class="ink-plate-art"
    :src="`/images/slip-${scene}.png`"
    alt=""
    aria-hidden="true"
    loading="lazy"
    decoding="async"
    fetchpriority="low"
  />
</template>
