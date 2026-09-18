<script setup>
import DefaultTheme from 'vitepress/theme'
import { inject, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'

const { Layout } = DefaultTheme
const route = useRoute()
const { isDark } = useData()
const gateOpen = ref(false)
const gateGone = ref(false)

const toggleAppearance = inject('toggle-appearance', () => {
  isDark.value = !isDark.value
})

function applyShift() {
  const hour = new Date().getHours()
  const shift = hour >= 6 && hour < 18 ? 'day' : 'night'
  document.documentElement.dataset.shift = shift
}

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
}

function onKeydown(event) {
  if (event.metaKey || event.ctrlKey || event.altKey) return
  if (isTypingTarget(event.target)) return

  if (event.key === '/') {
    event.preventDefault()
    const search = document.querySelector('.VPNavBarSearchButton, .DocSearch-Button')
    if (search instanceof HTMLElement) search.click()
  }
}

function replayUnroll() {
  const root = document.documentElement
  root.classList.remove('is-unrolling')
  void root.offsetWidth
  root.classList.add('is-unrolling')
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

onMounted(() => {
  applyShift()
  window.addEventListener('keydown', onKeydown)

  if (prefersReducedMotion()) {
    gateGone.value = true
    replayUnroll()
    return
  }

  const root = document.documentElement
  root.classList.add('is-page-unrolling')
  nextTick(() => {
    replayUnroll()
    window.setTimeout(() => {
      gateOpen.value = true
    }, 220)
  })
  window.setTimeout(() => {
    gateGone.value = true
    root.classList.remove('is-page-unrolling')
  }, 2250)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})

watch(() => route.path, () => {
  nextTick(() => replayUnroll())
})
</script>

<template>
  <Layout class="station-shell">
    <template #nav-bar-title-after>
      <span class="station-led" aria-hidden="true"></span>
    </template>
    <template #nav-bar-content-after>
      <button
        type="button"
        class="yin-yang"
        :aria-pressed="isDark"
        :aria-label="isDark ? '切到阳面（浅色）' : '切到阴面（深色）'"
        :title="isDark ? '切到阳面（浅色）' : '切到阴面（深色）'"
        @click="toggleAppearance"
      >
        {{ isDark ? '阴' : '阳' }}
      </button>
    </template>
  </Layout>
  <div
    class="page-gate"
    :class="{ 'is-open': gateOpen, 'is-gone': gateGone }"
    aria-hidden="true"
  >
    <div class="page-gate-scroll">
      <span class="page-gate-rod page-gate-rod-l"></span>
      <span class="page-gate-rod page-gate-rod-r"></span>
    </div>
  </div>
</template>
