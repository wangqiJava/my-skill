<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useData, useRoute, useRouter, withBase } from 'vitepress'
import { data as catalog } from '../../catalog.data.js'
import { INK_EASE } from '../motion/ink.js'
import { createHomeIntro } from '../motion/homeIntro.js'

const router = useRouter()
const route = useRoute()
const { isDark } = useData()
const plumSource = computed(() => withBase(`/images/plum-blossom${isDark.value ? '-dark' : ''}.svg`))
const entered = ref(false)
const plumLoaded = ref(false)
const plumImage = ref(null)
const atmosphereReady = ref(false)
const gsapReady = ref(false)
const sceneActive = ref(false)
const stageElement = ref(null)
const sceneElement = ref(null)
let enterFrame
let atmosphereFrame
let atmosphereMedia
let pointerPosition = null
let viewportWidth = 1
let viewportHeight = 1
let sceneScale = 1
let mountainShiftX
let mountainShiftY
let plumShiftX
let plumShiftY
let mistShiftX
let mistShiftY
let gsapContext
let gsapMedia
let motionEnabled = false
let slipMotion = new WeakMap()
let plumTimeline
let homeIntro

const NUMERALS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

// A few broad brush masks follow the painted branches; the texture paths stay still.
const plumGrowthStrokes = [
  { id: 'trunk', d: 'M-12 228 Q33 239 64 277 L119 315 L143 338 Q177 339 201 317 L238 279 Q252 271 291 260', width: 68, delay: 0.2, duration: 2.7 },
  { id: 'hanging', d: 'M64 277 Q85 312 96 349 L110 367 L126 397', width: 25, delay: 1.4, duration: 2.1 },
  { id: 'lower', d: 'M173 335 Q213 355 246 341 L282 323', width: 25, delay: 2.2, duration: 1.8 },
  { id: 'upright', d: 'M291 260 Q304 228 312 204 L312 184 Q299 169 293 149', width: 25, delay: 2.8, duration: 2.1 },
  { id: 'center', d: 'M312 184 Q317 170 333 162', width: 18, delay: 4.3, duration: 0.8 },
  { id: 'crown', d: 'M312 204 Q342 185 363 171 L381 143', width: 20, delay: 4.2, duration: 1.7 },
  { id: 'left', d: 'M251 272 Q253 252 245 232 Q244 216 258 203 L274 183', width: 20, delay: 2.8, duration: 1.7 },
  { id: 'left-bud', d: 'M245 232 L237 204 L237 178', width: 14, delay: 3.9, duration: 1.1 },
  { id: 'right', d: 'M291 260 L324 248 Q343 230 355 221 L367 200 L396 203', width: 24, delay: 3.2, duration: 2.1 },
  { id: 'right-buds', d: 'M355 221 Q377 218 397 236 M355 221 Q372 233 381 253', width: 16, delay: 5.1, duration: 1.1 }
]

const plumFlowerClusters = [
  { id: 'hanging', delay: 3.8 },
  { id: 'lower', delay: 4.3 },
  { id: 'left', delay: 4.8 },
  { id: 'top-bud', delay: 5.1 },
  { id: 'left-bud', delay: 5.2 },
  { id: 'center', delay: 5.4 },
  { id: 'right', delay: 5.6 },
  { id: 'crown', delay: 6.1 },
  { id: 'right-buds', delay: 6.5 }
]

function onPlumLoad() {
  plumLoaded.value = true
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) atmosphereReady.value = true
}

watch(plumSource, () => {
  plumTimeline?.kill()
  plumTimeline = null
  plumLoaded.value = false
  atmosphereReady.value = false
})

function playPlumReveal() {
  if (!gsapReady.value || !plumLoaded.value) return
  const scope = stageElement.value
  const strokes = Array.from(scope?.querySelectorAll('.plum-brush-reveal') || [])
  const flowers = Array.from(scope?.querySelectorAll('.plum-flower-cluster') || [])
  if (!strokes.length || !flowers.length) return

  plumTimeline?.kill()
  gsap.set(strokes, { visibility: 'visible', strokeDashoffset: 1 })
  gsap.set(flowers, { opacity: 0 })
  plumTimeline = gsap.timeline({
    delay: 0.9,
    onComplete: () => { atmosphereReady.value = true }
  })

  plumGrowthStrokes.forEach((stroke, index) => {
    plumTimeline.to(strokes[index], {
      strokeDashoffset: 0,
      duration: Math.max(0.22, stroke.duration * 0.34),
      ease: INK_EASE.stroke
    }, stroke.delay * 0.2)
  })

  // 点厾：花是笔尖点上去的，带一点纸张回弹，不是淡入。
  plumFlowerClusters.forEach((cluster, index) => {
    plumTimeline.fromTo(flowers[index],
      { opacity: 0, scale: 0.42, rotate: -5, transformOrigin: '50% 50%' },
      { opacity: 1, scale: 1, rotate: 0, duration: 0.34, ease: INK_EASE.dot },
      cluster.delay * 0.2 + 0.35)
  })
}

watch([plumLoaded, gsapReady], ([loaded, ready]) => {
  if (loaded && ready) nextTick(playPlumReveal)
})

// 落款完成后才让山水平息下来呼吸，避免入场和常态两套节奏叠在一起。
watch(atmosphereReady, (ready) => {
  if (ready) homeIntro?.startAmbient()
})

function cn(n) {
  if (n <= 10) return NUMERALS[n]
  if (n < 20) return `十${NUMERALS[n - 10]}`
  if (n < 100) return `${NUMERALS[Math.floor(n / 10)]}十${n % 10 ? NUMERALS[n % 10] : ''}`
  return String(n)
}

function summarize(key) {
  const pages = catalog[key] || []
  return {
    count: pages.length,
    latest: pages[0]?.title || ''
  }
}

const slips = computed(() => [
  {
    key: 'projects',
    kbd: '1',
    href: '/projects/index.html',
    name: '工作项目',
    duty: '这个项目里怎么用 Skill',
    ...summarize('projects')
  },
  {
    key: 'skills',
    kbd: '2',
    href: '/skills/index.html',
    name: 'Skill 记录',
    duty: '换项目还能用的 Skill',
    ...summarize('skills')
  },
  {
    key: 'tools',
    kbd: '3',
    href: '/tools/index.html',
    name: '工具',
    duty: '编辑器、模型、MCP',
    ...summarize('tools')
  }
])

const totalNotes = computed(() => slips.value.reduce((total, slip) => total + slip.count, 0))

const recentNotes = computed(() => Object.entries(catalog)
  .flatMap(([key, pages]) => (pages || []).map((page) => ({
    ...page,
    category: key === 'projects' ? '工作项目' : key === 'skills' ? 'Skill 记录' : '工具',
    context: key === 'projects' ? '从项目现场留下的一页方法' : key === 'skills' ? '可带到下个项目的用法' : '随手收录的工具札记'
  })))
  .sort((a, b) => String(b.date).localeCompare(String(a.date)))
  .slice(0, 3))

function sealText(slip) {
  return slip.count === 0 ? '待' : `${cn(slip.count)}篇`
}

function open(event, slip) {
  event.preventDefault()
  router.go(slip.href)
}

function openNote(event, note) {
  event.preventDefault()
  router.go(note.url)
}

function isHome() {
  return route.path === '/' || route.path === '/index.html'
}

function onKeydown(event) {
  if (!isHome() || event.metaKey || event.ctrlKey || event.altKey) return
  if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select')) return
  const slip = slips.value.find((item) => item.kbd === event.key)
  if (!slip) return
  event.preventDefault()
  open(event, slip)
}

function enter() {
  entered.value = true
}

function renderAtmosphere() {
  atmosphereFrame = null
  const stage = stageElement.value
  if (!stage) return
  const x = pointerPosition?.x ?? viewportWidth / 2
  const y = pointerPosition?.y ?? viewportHeight / 2
  const dx = Math.max(-1, Math.min(1, x / viewportWidth * 2 - 1))
  const dy = Math.max(-1, Math.min(1, y / viewportHeight * 2 - 1))
  const length = Math.max(1, Math.hypot(dx, dy))

  const shiftX = `${-dx / length * 3.2 * sceneScale}px`
  const shiftY = `${-dy / length * 2.2 * sceneScale}px`
  const plumX = `${-dx / length * 8 * sceneScale}px`
  const plumY = `${-dy / length * 4.5 * sceneScale}px`
  const mistX = `${-dx / length * 4.5 * sceneScale}px`
  const mistY = `${-dy / length * 2.5 * sceneScale}px`
  if (mountainShiftX && mountainShiftY) {
    mountainShiftX(shiftX)
    mountainShiftY(shiftY)
    plumShiftX(plumX)
    plumShiftY(plumY)
    mistShiftX(mistX)
    mistShiftY(mistY)
  } else {
    stage.style.setProperty('--mountain-shift-x', shiftX)
    stage.style.setProperty('--mountain-shift-y', shiftY)
    stage.style.setProperty('--plum-shift-x', plumX)
    stage.style.setProperty('--plum-shift-y', plumY)
    stage.style.setProperty('--mist-shift-x', mistX)
    stage.style.setProperty('--mist-shift-y', mistY)
  }
}

function queueAtmosphere() {
  if (atmosphereFrame == null) atmosphereFrame = requestAnimationFrame(renderAtmosphere)
}

function moveAtmosphere(event) {
  if (!sceneActive.value || !atmosphereReady.value || !atmosphereMedia?.matches || event.pointerType !== 'mouse') return
  pointerPosition = { x: event.clientX, y: event.clientY }
  queueAtmosphere()
}

function enterScene(event) {
  if (event.pointerType !== 'mouse' || !atmosphereMedia?.matches) return
  sceneActive.value = true
  moveAtmosphere(event)
}

function leaveScene(event) {
  if (event.pointerType !== 'mouse') return
  sceneActive.value = false
  resetAtmosphere()
}

function resetAtmosphere() {
  pointerPosition = null
  cancelAnimationFrame(atmosphereFrame)
  atmosphereFrame = null
  renderAtmosphere()
}

function leaveAtmosphere(event) {
  if (!event.relatedTarget) resetAtmosphere()
}

function onVisibilityChange() {
  resetAtmosphere()
  if (document.hidden) homeIntro?.pauseAmbient()
  else if (atmosphereReady.value) homeIntro?.resumeAmbient()
}

function measureAtmosphere() {
  viewportWidth = Math.max(1, window.innerWidth)
  viewportHeight = Math.max(1, window.innerHeight)
  const sceneBounds = sceneElement.value?.getBoundingClientRect()
  sceneScale = 900 / (sceneBounds?.width || 900)
  if (sceneBounds) {
    stageElement.value?.style.setProperty('--scene-edge-offset', `${stageElement.value.getBoundingClientRect().right - document.documentElement.clientWidth}px`)
  }
  resetAtmosphere()
}

function moveSlip(event) {
  if (!motionEnabled || event.pointerType !== 'mouse') return
  const card = event.currentTarget
  const motion = slipMotion.get(card)
  if (!motion) return
  const bounds = card.getBoundingClientRect()
  const x = (event.clientX - bounds.left) / bounds.width * 2 - 1
  const y = (event.clientY - bounds.top) / bounds.height * 2 - 1
  motion.tiltX(`${Math.max(-1, Math.min(1, x)) * 1.4}deg`)
  motion.tiltY(`${Math.max(-1, Math.min(1, -y)) * 1.1}deg`)
  motion.spotX(`${(x + 1) * 50}%`)
  motion.spotY(`${(y + 1) * 50}%`)
}

function resetSlip(event) {
  const motion = slipMotion.get(event.currentTarget)
  if (!motion) return
  motion.tiltX('0deg')
  motion.tiltY('0deg')
  motion.spotX('50%')
  motion.spotY('35%')
}

function setupGsap() {
  gsap.registerPlugin(ScrollTrigger)
  gsapContext = gsap.context(() => {
    gsapMedia = gsap.matchMedia()
    gsapMedia.add('(prefers-reduced-motion: no-preference)', () => {
      gsapReady.value = true

      homeIntro = createHomeIntro(stageElement.value)

      gsap.timeline({
        scrollTrigger: {
          trigger: '.recent-notes',
          start: 'top 82%',
          once: true
        }
      })
        .fromTo('.recent-notes-head',
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }
        )
        .fromTo('.note-entry',
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.72, ease: 'power3.out', stagger: 0.12 },
          '-=0.28'
        )

      return () => {
        gsapReady.value = false
        homeIntro?.kill()
        homeIntro = null
      }
    })

    gsapMedia.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      motionEnabled = true
      mountainShiftX = gsap.quickTo(stageElement.value, '--mountain-shift-x', { duration: 0.7, ease: 'power3.out' })
      mountainShiftY = gsap.quickTo(stageElement.value, '--mountain-shift-y', { duration: 0.7, ease: 'power3.out' })
      plumShiftX = gsap.quickTo(stageElement.value, '--plum-shift-x', { duration: 0.48, ease: 'power3.out' })
      plumShiftY = gsap.quickTo(stageElement.value, '--plum-shift-y', { duration: 0.48, ease: 'power3.out' })
      mistShiftX = gsap.quickTo(stageElement.value, '--mist-shift-x', { duration: 0.62, ease: 'power2.out' })
      mistShiftY = gsap.quickTo(stageElement.value, '--mist-shift-y', { duration: 0.62, ease: 'power2.out' })

      gsap.utils.toArray('.slip').forEach((card) => {
        slipMotion.set(card, {
          tiltX: gsap.quickTo(card, '--slip-tilt-x', { duration: 0.42, ease: 'power3.out' }),
          tiltY: gsap.quickTo(card, '--slip-tilt-y', { duration: 0.42, ease: 'power3.out' }),
          spotX: gsap.quickTo(card, '--slip-spot-x', { duration: 0.35, ease: 'power2.out' }),
          spotY: gsap.quickTo(card, '--slip-spot-y', { duration: 0.35, ease: 'power2.out' })
        })
      })

      return () => {
        motionEnabled = false
        sceneActive.value = false
        mountainShiftX = null
        mountainShiftY = null
        plumShiftX = null
        plumShiftY = null
        mistShiftX = null
        mistShiftY = null
        slipMotion = new WeakMap()
      }
    })
  }, stageElement.value)
}

onMounted(() => {
  if (plumImage.value?.complete && plumImage.value.naturalWidth > 0) onPlumLoad()
  enterFrame = requestAnimationFrame(enter)
  setupGsap()
  atmosphereMedia = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
  measureAtmosphere()
  atmosphereMedia.addEventListener('change', measureAtmosphere)
  window.addEventListener('pointermove', moveAtmosphere, { passive: true })
  window.addEventListener('pointerout', leaveAtmosphere)
  window.addEventListener('blur', resetAtmosphere)
  window.addEventListener('resize', measureAtmosphere)
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  cancelAnimationFrame(enterFrame)
  cancelAnimationFrame(atmosphereFrame)
  atmosphereMedia?.removeEventListener('change', measureAtmosphere)
  window.removeEventListener('pointermove', moveAtmosphere)
  window.removeEventListener('pointerout', leaveAtmosphere)
  window.removeEventListener('blur', resetAtmosphere)
  window.removeEventListener('resize', measureAtmosphere)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  window.removeEventListener('keydown', onKeydown)
  homeIntro?.kill()
  homeIntro = null
  plumTimeline?.kill()
  plumTimeline = null
  gsapMedia?.revert()
  gsapContext?.revert()
  gsapMedia = null
  gsapContext = null
})
</script>

<template>
  <section ref="stageElement" class="stage" :class="{ 'is-in': entered, 'has-atmosphere': atmosphereReady, 'gsap-ready': gsapReady, 'scene-active': sceneActive }">
    <div ref="sceneElement" class="landscape-scene" aria-hidden="true" @pointerenter="enterScene" @pointerleave="leaveScene">
    <svg class="plum-art" viewBox="0 0 900 450" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="home-landscape-sides" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="900" y2="0">
          <stop offset="0" stop-color="white" stop-opacity="0" />
          <stop offset="0.025" stop-color="white" stop-opacity="0" />
          <stop offset="0.15" stop-color="white" />
          <stop offset="0.82" stop-color="white" />
          <stop offset="0.98" stop-color="white" stop-opacity="0" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="home-mountain-foot" gradientUnits="userSpaceOnUse" x1="0" y1="160" x2="0" y2="390">
          <stop offset="0" stop-color="white" />
          <stop offset="0.22" stop-color="white" />
          <stop offset="0.58" stop-color="white" stop-opacity="0.55" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
        <mask id="home-landscape-edge" maskUnits="userSpaceOnUse" x="-32" y="-32" width="964" height="514" style="mask-type: alpha">
          <rect x="-32" y="-32" width="964" height="514" fill="url(#home-landscape-sides)" />
        </mask>
        <mask id="home-mountain-base" maskUnits="userSpaceOnUse" x="-32" y="120" width="964" height="362" style="mask-type: alpha">
          <rect x="-32" y="120" width="964" height="362" fill="url(#home-mountain-foot)" />
        </mask>
        <linearGradient id="home-water-ink" gradientUnits="userSpaceOnUse" x1="32" y1="0" x2="874" y2="0">
          <stop class="landscape-water-ink" offset="0" stop-opacity="0" />
          <stop class="landscape-water-ink" offset="0.35" />
          <stop class="landscape-water-ink" offset="0.65" stop-opacity="0.85" />
          <stop class="landscape-water-ink" offset="1" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="home-mist-wash" x1="0" y1="0" x2="0" y2="1">
          <stop class="landscape-mist-color" offset="0" stop-opacity="0" />
          <stop class="landscape-mist-color" offset="0.35" stop-opacity="0.7" />
          <stop class="landscape-mist-color" offset="0.6" />
          <stop class="landscape-mist-color" offset="1" stop-opacity="0" />
        </linearGradient>
        <filter id="home-mist-soften" filterUnits="userSpaceOnUse" x="-40" y="140" width="980" height="340" color-interpolation-filters="sRGB">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      <g class="landscape-parallax">
      <g class="landscape-wash">
        <g class="landscape-birds">
          <g transform="translate(164 116)">
            <g class="landscape-bird">
              <g class="landscape-bird-wings">
                <path d="M0 0 C-4-5-9-7-14-6 C-9-5-5-2-1 1Z" />
                <path d="M0 0 C4-6 9-8 14-7 C9-5 5-2 1 1Z" />
              </g>
              <path d="M-2 0 Q0-2 2 0 L0 3Z" />
            </g>
          </g>
          <g transform="translate(128 132) scale(0.72)">
            <g class="landscape-bird landscape-bird-follower">
              <g class="landscape-bird-wings">
                <path d="M0 0 C-4-5-9-7-14-6 C-9-5-5-2-1 1Z" />
                <path d="M0 0 C4-6 9-8 14-7 C9-5 5-2 1 1Z" />
              </g>
              <path d="M-2 0 Q0-2 2 0 L0 3Z" />
            </g>
          </g>
        </g>
        <g class="landscape-distance" mask="url(#home-landscape-edge)">
        <g class="landscape-mountains" mask="url(#home-mountain-base)">
          <path class="mountain-far" d="M-40 337 C35 326 56 300 90 298 C118 296 147 245 175 232 C191 221 201 179 218 180 C237 182 246 235 267 236 C298 238 323 194 347 176 C365 162 371 131 385 140 C411 156 426 219 449 226 C473 234 498 209 520 218 C541 229 562 270 597 271 C628 272 655 231 684 239 C724 250 749 302 788 311 C833 322 879 320 940 340 L940 450H-40Z" />
          <path class="mountain-middle" d="M-40 359 C26 349 67 322 109 314 C148 307 170 278 194 273 C218 268 227 286 249 280 C270 273 285 230 307 222 C326 217 336 249 352 253 C378 260 397 243 414 254 C443 273 455 306 487 305 C523 303 550 279 580 285 C609 291 625 269 647 271 C675 273 689 317 722 319 C753 321 778 303 803 314 C836 328 880 352 940 365 L940 460H-40Z" />
          <path class="mountain-near" d="M-40 390 C32 381 83 363 134 354 C178 345 205 318 238 322 C267 325 284 344 312 343 C343 342 368 316 393 325 C421 334 438 358 474 357 C519 356 546 326 577 332 C608 338 639 363 675 362 C721 361 751 351 790 365 C835 381 889 383 940 397 L940 470H-40Z" />
        </g>
        <g class="landscape-water" stroke="url(#home-water-ink)">
          <path d="M30 351 Q97 346 168 350 T315 349 M374 351 Q458 343 552 348 M636 347 Q725 343 857 349" />
          <path d="M58 370 Q146 366 224 369 M278 368 Q359 363 435 367 T612 368 M680 366 Q761 361 880 367" />
          <path d="M24 391 Q124 386 203 390 M259 389 Q337 383 405 388 M458 390 Q548 384 642 389 T871 389" />
          <path d="M97 419 Q174 414 257 418 M329 417 Q414 411 506 416 M577 420 Q688 413 819 417" />
        </g>
        </g>
        <g class="landscape-atmosphere" mask="url(#home-landscape-edge)">
        <g class="landscape-mist" fill="url(#home-mist-wash)" filter="url(#home-mist-soften)">
          <g class="landscape-mist-breath">
          <path d="M-30 244 C91 219 166 270 277 246 S463 217 577 242 S765 268 930 236 L930 293 C772 311 672 276 558 284 S367 307 250 284 S82 290-30 305Z" />
          <path class="landscape-mist-low" d="M-30 332 C107 308 196 347 315 333 S496 313 633 330 S803 349 930 325 L930 386 C803 397 696 365 577 374 S376 399 261 376 S95 379-30 397Z" />
          </g>
        </g>
        </g>
      </g>

      </g>
    </svg>
      <div class="plum-picture">
        <img ref="plumImage" class="plum-preload" :src="plumSource" alt="" @load="onPlumLoad" />
        <svg v-if="plumLoaded" class="plum-illustration" :class="{ 'is-loaded': plumLoaded }" viewBox="0 103 436 332" aria-hidden="true" focusable="false">
          <defs>
            <mask id="home-plum-growth" maskUnits="userSpaceOnUse" x="0" y="103" width="436" height="332" style="mask-type: alpha">
              <path v-for="stroke in plumGrowthStrokes" :key="stroke.id" class="plum-brush-reveal" :d="stroke.d" :stroke-width="stroke.width" pathLength="1" :style="{ '--grow-delay': `${stroke.delay}s`, '--grow-duration': `${stroke.duration}s` }" />
            </mask>
          </defs>
          <g mask="url(#home-plum-growth)">
            <use :href="`${plumSource}#plum-branches`" />
          </g>
          <g v-for="(cluster, index) in plumFlowerClusters" :key="cluster.id" class="plum-flower-cluster" :data-final="index === plumFlowerClusters.length - 1" :style="{ '--bloom-delay': `${cluster.delay}s` }">
            <use :href="`${plumSource}#plum-${cluster.id}`" />
          </g>
        </svg>
      </div>
    </div>

    <header class="stage-head">
      <div class="brush-col">
        <h1 class="brush-mark" data-ink="拾墨手记"><span>拾墨</span><span>手记</span></h1>
        <span class="seal seal-leisure" aria-hidden="true">手作</span>
      </div>

      <div class="stage-copy">
        <div class="kicker-col"><p class="stage-kicker">温故知新</p><span class="seal seal-oval" aria-hidden="true">知新</span></div>
        <p class="stage-title">
          <span class="stage-title-a">从项目、Skill 或工具里，</span>
          <span class="stage-title-b">找回上次怎么用的。</span>
        </p>
      </div>
    </header>

    <nav class="home-catalog" aria-labelledby="home-catalog-title">
      <div class="catalog-heading">
        <div>
          <h2 id="home-catalog-title">案头所藏 <span>共{{ cn(totalNotes) }}篇手记</span></h2>
          <p class="stage-hint">
            按 <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> 翻阅 · <kbd>/</kbd> 搜索
          </p>
        </div>
        <dl class="catalog-overview" aria-label="各类记录篇数">
          <div v-for="slip in slips" :key="slip.key">
            <dt>{{ slip.name }}</dt>
            <dd>{{ cn(slip.count) }}<span>篇</span></dd>
          </div>
        </dl>
      </div>
      <div class="catalog-grid">
        <a
          v-for="(slip, index) in slips"
          :key="slip.key"
          class="slip"
          :class="{ empty: slip.count === 0 }"
          :style="{ '--i': index }"
          :href="slip.href"
          :aria-keyshortcuts="slip.kbd"
          @click="open($event, slip)"
          @pointermove="moveSlip"
          @pointerleave="resetSlip"
        >
          <span class="slip-aura" aria-hidden="true"></span>
          <span class="slip-fishtail" aria-hidden="true"><svg viewBox="0 0 28 48" focusable="false"><path d="M2 1H26L14 14 26 27H2L14 14ZM2 32H26V34H2ZM6 39H22L14 47Z" /></svg></span>
          <span class="slip-name">{{ slip.name }}</span>
          <span class="slip-duty">{{ slip.duty }}</span>
          <span class="seal slip-seal">{{ sealText(slip) }}</span>
          <span class="slip-latest">
            <span class="slip-latest-label">{{ slip.count ? '最近记录' : '待添新页' }}</span>
            <span class="slip-latest-title" :title="slip.latest || '暂无工具记录'">{{ slip.latest || '暂无工具记录' }}</span>
          </span>
          <span class="slip-action">
            <span>翻阅目录</span>
            <svg viewBox="0 0 24 16" aria-hidden="true" focusable="false"><path d="M1 8H22M15 1L22 8 15 15" /></svg>
          </span>
        </a>
      </div>
    </nav>

    <section v-if="recentNotes.length" class="recent-notes" aria-labelledby="recent-notes-title">
      <header class="recent-notes-head">
        <div class="recent-notes-kicker">
          <span class="seal recent-notes-seal" aria-hidden="true">新札</span>
          <span>廊下拾得</span>
        </div>
        <div>
          <h2 id="recent-notes-title">近记</h2>
          <p>最近写下的几页，留在手边。</p>
        </div>
        <span class="recent-notes-rule" aria-hidden="true"></span>
      </header>
      <div class="recent-notes-list">
        <a
          v-for="(note, index) in recentNotes"
          :key="note.url"
          :class="['note-entry', { 'note-entry-featured': index === 0 }]"
          :href="withBase(note.url)"
          @click="openNote($event, note)"
        >
          <span class="note-index">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="note-category">{{ note.category }}</span>
          <span class="note-body">
            <span class="note-title">{{ note.title }}</span>
            <span v-if="index === 0" class="note-context">{{ note.context }}</span>
          </span>
          <span class="note-date">{{ note.date?.slice(0, 7) }}</span>
          <span class="note-arrow" aria-hidden="true">↗</span>
        </a>
      </div>
    </section>

    <footer class="stage-colophon" aria-label="技藏落款">
      <svg class="brush-rest" viewBox="0 0 160 44" aria-hidden="true" focusable="false"><path d="M8 34Q19 31 28 13Q33 5 39 15L48 29Q54 34 59 24L73 4Q78-2 84 8L98 26Q104 35 111 25L121 14Q128 5 134 17L150 34Z" /><path d="M15 39Q80 35 146 39" fill="none" stroke="currentColor" /></svg>
      <span class="seal seal-colophon">技藏</span>
    </footer>
  </section>
</template>
