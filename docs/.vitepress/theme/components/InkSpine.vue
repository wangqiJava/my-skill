<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { createInkSpine } from '../motion/inkScroll.js'

const svgElement = ref(null)
let stopSpine

onMounted(() => {
  const scope = svgElement.value?.closest('.stage')
  if (scope) stopSpine = createInkSpine(svgElement.value, scope)
})

onUnmounted(() => {
  stopSpine?.()
  stopSpine = null
})
</script>

<template>
  <svg ref="svgElement" class="ink-spine" aria-hidden="true" focusable="false" preserveAspectRatio="none">
    <path class="ink-spine-main ink-spine-bleed" pathLength="1" />
    <path class="ink-spine-main ink-spine-core" pathLength="1" />
    <path v-for="index in 3" :key="index" class="ink-spine-branch ink-spine-bleed" pathLength="1" />
    <path v-for="index in 3" :key="`core-${index}`" class="ink-spine-branch ink-spine-core" pathLength="1" />
    <g class="ink-spine-node"><circle r="4" /><circle class="ink-spine-node-core" r="1.5" /></g>
    <g class="ink-spine-node"><circle r="4" /><circle class="ink-spine-node-core" r="1.5" /></g>
    <g class="ink-spine-node"><circle r="4" /><circle class="ink-spine-node-core" r="1.5" /></g>
    <g class="ink-spine-stamp">
      <path d="M-13-17L12-16L14 15L-12 17Z" />
      <text y="5">收</text>
    </g>
  </svg>
</template>
