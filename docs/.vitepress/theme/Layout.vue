<script setup>
import DefaultTheme from 'vitepress/theme'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useData, useRouter } from 'vitepress'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { INK_EASE } from './motion/ink.js'
import { createDocMotion } from './motion/docMotion.js'
import InkCursor from './components/InkCursor.vue'

const { Layout } = DefaultTheme
const { isDark, page } = useData()
const router = useRouter()
const appearanceButton = ref(null)
let appearanceElement
let appearanceTransition
let switchingAppearance = false
let docMotion = null

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// 以 DOM 判断，路由钩子触发时 page 数据可能还没换过来。
function isDocPage() {
  return page.value.relativePath !== 'index.md' && Boolean(document.querySelector('.vp-doc'))
}

function setupDocMotion() {
  docMotion?.revert()
  docMotion = null
  if (!isDocPage() || prefersReducedMotion()) return
  docMotion = createDocMotion()
}

/**
 * 导航压边：滚动位置折算成两个进度写进 CSS 变量，
 * 样式表再据此算出纸的浓度、底缘毛边与水纹宽度（见 theme/style.css）。
 * 分两拍是刻意的：前段「铺纸」先落，后段「收锋」再慢慢把纸压匀，
 * 于是刚滚动时纸已经够看，继续滚下去还有变化可等。
 */
const NAV_BEATS = [
  { name: '--nav-ink', from: 0, to: 128, duration: 0.34 },
  { name: '--nav-settle', from: 128, to: 380, duration: 0.62 }
]

const navBeats = NAV_BEATS.map((beat) => ({ beat, state: { value: 1 } }))
let navFrame = 0

function applyNavInk(immediate) {
  // 只有首页的导航盖在画上；变量也写在导航栏本身而不是 <html>，
  // 把这一帧的样式重算圈在那一小片区域里。
  const vessel = document.querySelector('.station-home .VPNavBar')
  if (!vessel) return

  const y = window.scrollY || 0
  const instant = immediate || prefersReducedMotion()

  navBeats.forEach(({ beat, state }) => {
    const progress = Math.min(1, Math.max(0, (y - beat.from) / (beat.to - beat.from)))
    if (Math.abs(progress - state.value) < 0.0005) return
    if (instant) {
      gsap.killTweensOf(state)
      state.value = progress
      vessel.style.setProperty(beat.name, progress.toFixed(4))
      return
    }
    gsap.to(state, {
      value: progress,
      duration: beat.duration,
      ease: INK_EASE.stroke,
      overwrite: true,
      onUpdate() {
        // 行笔缓动收笔会略过冲，钳一道，免得颜色算出负透明度。
        vessel.style.setProperty(beat.name, Math.min(1, Math.max(0, state.value)).toFixed(4))
      }
    })
  })
}

function onNavScroll() {
  if (navFrame) return
  navFrame = requestAnimationFrame(() => {
    navFrame = 0
    applyNavInk(false)
  })
}

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

async function toggleAppearance() {
  if (switchingAppearance) return
  switchingAppearance = true

  const root = document.documentElement
  const nextDark = !isDark.value
  const updateAppearance = async () => {
    isDark.value = nextDark
    await nextTick()
  }

  root.classList.add('theme-revealing')

  try {
    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await updateAppearance()
      getComputedStyle(root).color
      return
    }

    const mark = appearanceElement.querySelector('.yin-yang-mark') || appearanceElement
    const rect = mark.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const radius = Math.ceil(Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )) + 1

    root.style.setProperty('--theme-reveal-x', `${x}px`)
    root.style.setProperty('--theme-reveal-y', `${y}px`)
    root.style.setProperty('--theme-reveal-radius', `${radius}px`)
    appearanceTransition = document.startViewTransition(updateAppearance)
    await Promise.all([appearanceTransition.ready, appearanceTransition.finished])
  } catch {
    await updateAppearance()
    getComputedStyle(root).color
  } finally {
    root.classList.remove('theme-revealing')
    root.style.removeProperty('--theme-reveal-x')
    root.style.removeProperty('--theme-reveal-y')
    root.style.removeProperty('--theme-reveal-radius')
    appearanceTransition = null
    switchingAppearance = false
  }
}

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
  appearanceElement = appearanceButton.value
  appearanceElement?.addEventListener('click', toggleAppearance)
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('scroll', onNavScroll, { passive: true })
  applyNavInk(true)
  router.onAfterRouteChange = async () => {
    await nextTick()
    setupDocMotion()
    ScrollTrigger.refresh()
    applyNavInk(true)
  }
  nextTick(setupDocMotion)
})

onUnmounted(() => {
  appearanceElement?.removeEventListener('click', toggleAppearance)
  appearanceTransition?.skipTransition()
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('scroll', onNavScroll)
  if (navFrame) cancelAnimationFrame(navFrame)
  navFrame = 0
  navBeats.forEach(({ state }) => gsap.killTweensOf(state))
  router.onAfterRouteChange = undefined
  docMotion?.revert()
  docMotion = null
})

</script>

<template>
  <Layout class="station-shell" :class="{ 'station-home': !page.isNotFound && page.relativePath === 'index.md' }">
    <template #layout-bottom>
      <InkCursor />
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
        ref="appearanceButton"
        type="button"
        class="yin-yang"
        :aria-pressed="isDark"
        :aria-label="isDark ? '切到阳面（浅色）' : '切到阴面（深色）'"
        :title="isDark ? '切到阳面（浅色）' : '切到阴面（深色）'"
      >
        <span class="yin-yang-mark">{{ isDark ? '阴' : '阳' }}</span>
      </button>
    </template>
  </Layout>
</template>
