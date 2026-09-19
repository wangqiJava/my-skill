<script setup>
import DefaultTheme from 'vitepress/theme'
import { inject, onMounted, onUnmounted } from 'vue'
import { useData } from 'vitepress'

const { Layout } = DefaultTheme
const { isDark, page } = useData()

const pagePetals = [
  { left: '5%', size: '5px', duration: '24s', delay: '-9s', sway: '7s' },
  { left: '13%', size: '4px', duration: '21s', delay: '-17s', sway: '9s' },
  { left: '23%', size: '6px', duration: '28s', delay: '-3s', sway: '8s' },
  { left: '32%', size: '4px', duration: '23s', delay: '-13s', sway: '10s' },
  { left: '41%', size: '5px', duration: '26s', delay: '-21s', sway: '7s' },
  { left: '49%', size: '4px', duration: '19s', delay: '-6s', sway: '9s' },
  { left: '58%', size: '6px', duration: '25s', delay: '-16s', sway: '8s' },
  { left: '66%', size: '4px', duration: '22s', delay: '-2s', sway: '10s' },
  { left: '75%', size: '5px', duration: '27s', delay: '-11s', sway: '7s' },
  { left: '83%', size: '4px', duration: '18s', delay: '-14s', sway: '9s' },
  { left: '91%', size: '6px', duration: '24s', delay: '-4s', sway: '8s' },
  { left: '97%', size: '4px', duration: '28s', delay: '-23s', sway: '10s' }
]

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

onMounted(() => {
  applyShift()
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})

</script>

<template>
  <Layout class="station-shell">
    <template #layout-bottom>
      <div v-if="page.isNotFound || page.relativePath !== 'index.md'" class="page-plum-fall" aria-hidden="true">
        <span
          v-for="(petal, index) in pagePetals"
          :key="index"
          class="page-plum-track"
          :style="{
            left: petal.left,
            '--petal-size': petal.size,
            '--fall-duration': petal.duration,
            '--fall-delay': petal.delay,
            '--sway-duration': petal.sway
          }"
        ><span class="page-plum-petal" /></span>
      </div>
    </template>
    <template #nav-bar-title-after>
      <span class="station-led" aria-hidden="true">记</span>
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
        <span class="yin-yang-mark">{{ isDark ? '阴' : '阳' }}</span>
      </button>
    </template>
  </Layout>
</template>
