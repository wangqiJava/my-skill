<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'

const cursorElement = ref(null)
let media
let dotX
let dotY
let ringX
let ringY
let trails = []
let cursorTargets = []
let lastTrailAt = 0
let previousPoint = null

function onMove(event) {
  if (!cursorElement.value || event.pointerType !== 'mouse') return
  const x = event.clientX
  const y = event.clientY
  dotX?.(x)
  dotY?.(y)
  ringX?.(x)
  ringY?.(y)

  const now = performance.now()
  if (previousPoint && now - lastTrailAt > 34) {
    const distance = Math.hypot(x - previousPoint.x, y - previousPoint.y)
    if (distance > 15) {
      const trail = trails.shift()
      trails.push(trail)
      gsap.killTweensOf(trail)
      gsap.set(trail, { x, y, scale: Math.min(0.8, 0.26 + distance / 90), opacity: 0.26 })
      gsap.to(trail, { scale: 0.08, opacity: 0, duration: 0.42, ease: 'power1.out', overwrite: true })
      lastTrailAt = now
    }
  }
  previousPoint = { x, y }
  cursorElement.value.classList.add('is-visible')
}

function onPointerOver(event) {
  if (event.target instanceof Element && event.target.closest('a, button, [role="button"]')) {
    cursorElement.value?.classList.add('is-link')
  }
}

function onPointerOut(event) {
  if (event.relatedTarget instanceof Element && event.relatedTarget.closest('a, button, [role="button"]')) return
  cursorElement.value?.classList.remove('is-link')
}

function onClick() {
  const bloom = cursorElement.value?.querySelector('.ink-cursor-bloom')
  if (!bloom) return
  gsap.killTweensOf(bloom)
  gsap.fromTo(bloom,
    { scale: 0.25, opacity: 0.58 },
    { scale: 2.8, opacity: 0, duration: 0.52, ease: 'power1.out', overwrite: true })
}

onMounted(() => {
  media = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
  if (!media.matches || !cursorElement.value) return
  const dot = cursorElement.value.querySelector('.ink-cursor-dot')
  const ring = cursorElement.value.querySelector('.ink-cursor-ring')
  const bloom = cursorElement.value.querySelector('.ink-cursor-bloom')
  trails = Array.from(cursorElement.value.querySelectorAll('.ink-cursor-trail'))
  cursorTargets = [dot, ring, bloom, ...trails]
  dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power2.out' })
  dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power2.out' })
  ringX = gsap.quickTo(ring, 'x', { duration: 0.3, ease: 'power2.out' })
  ringY = gsap.quickTo(ring, 'y', { duration: 0.3, ease: 'power2.out' })
  document.body.classList.add('has-ink-cursor')
  window.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('pointerover', onPointerOver, { passive: true })
  document.addEventListener('pointerout', onPointerOut, { passive: true })
  document.addEventListener('click', onClick, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('pointermove', onMove)
  document.removeEventListener('pointerover', onPointerOver)
  document.removeEventListener('pointerout', onPointerOut)
  document.removeEventListener('click', onClick)
  document.body.classList.remove('has-ink-cursor')
  gsap.killTweensOf(cursorTargets.filter(Boolean))
  dotX = dotY = ringX = ringY = undefined
  trails = []
  cursorTargets = []
})
</script>

<template>
  <div ref="cursorElement" class="ink-cursor" aria-hidden="true">
    <i v-for="index in 4" :key="index" class="ink-cursor-trail" />
    <i class="ink-cursor-ring" />
    <i class="ink-cursor-dot"><i class="ink-cursor-bloom" /></i>
  </div>
</template>
