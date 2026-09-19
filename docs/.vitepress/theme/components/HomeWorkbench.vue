<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useData, useRoute, useRouter, withBase } from 'vitepress'
import { data as catalog } from '../../catalog.data.js'

const router = useRouter()
const route = useRoute()
const { isDark } = useData()
const plumSource = computed(() => withBase(`/images/plum-blossom${isDark.value ? '-dark' : ''}.svg`))
const entered = ref(false)
const plumLoaded = ref(false)
const plumImage = ref(null)
const atmosphereReady = ref(false)
const stageElement = ref(null)
const sceneElement = ref(null)
let enterFrame
let atmosphereFrame
let atmosphereMedia
let pointerPosition = null
let viewportWidth = 1
let viewportHeight = 1
let sceneScale = 1

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

function onPlumRevealEnd(event) {
  if (event.animationName === 'plum-bloom' && event.target.dataset.final === 'true') atmosphereReady.value = true
}

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

function sealText(slip) {
  return slip.count === 0 ? '待' : `${cn(slip.count)}篇`
}

function open(event, slip) {
  event.preventDefault()
  router.go(slip.href)
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

  stage.style.setProperty('--mountain-shift-x', `${-dx / length * 1.5 * sceneScale}px`)
  stage.style.setProperty('--mountain-shift-y', `${-dy / length * 1.5 * sceneScale}px`)
}

function queueAtmosphere() {
  if (atmosphereFrame == null) atmosphereFrame = requestAnimationFrame(renderAtmosphere)
}

function moveAtmosphere(event) {
  if (!atmosphereReady.value || !atmosphereMedia?.matches || event.pointerType !== 'mouse') return
  pointerPosition = { x: event.clientX, y: event.clientY }
  queueAtmosphere()
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

onMounted(() => {
  if (plumImage.value?.complete && plumImage.value.naturalWidth > 0) onPlumLoad()
  enterFrame = requestAnimationFrame(enter)
  atmosphereMedia = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
  measureAtmosphere()
  atmosphereMedia.addEventListener('change', measureAtmosphere)
  window.addEventListener('pointermove', moveAtmosphere, { passive: true })
  window.addEventListener('pointerout', leaveAtmosphere)
  window.addEventListener('blur', resetAtmosphere)
  window.addEventListener('resize', measureAtmosphere)
  document.addEventListener('visibilitychange', resetAtmosphere)
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
  document.removeEventListener('visibilitychange', resetAtmosphere)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <section ref="stageElement" class="stage" :class="{ 'is-in': entered, 'has-atmosphere': atmosphereReady }">
    <div ref="sceneElement" class="landscape-scene" aria-hidden="true">
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
        <svg class="plum-illustration" :class="{ 'is-loaded': plumLoaded }" viewBox="0 103 436 332" aria-hidden="true" focusable="false" @animationend="onPlumRevealEnd">
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
    <p class="stage-hint">
      按 <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> 翻阅 · <kbd>/</kbd> 搜索
    </p>

    <nav class="home-catalog" aria-label="三类入口">
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
        >
          <span class="slip-aura" aria-hidden="true"></span>
          <span class="slip-fishtail" aria-hidden="true"><svg viewBox="0 0 28 48" focusable="false"><path d="M2 1H26L14 14 26 27H2L14 14ZM2 32H26V34H2ZM6 39H22L14 47Z" /></svg></span>
          <span class="slip-name">{{ slip.name }}</span>
          <span class="slip-duty">{{ slip.duty }}</span>
          <span class="seal slip-seal">{{ sealText(slip) }}</span>
          <span class="slip-latest">
            <template v-if="slip.count === 0">打开目录补第一篇</template>
            <template v-else>{{ slip.latest }}</template>
          </span>
        </a>
      </div>
    </nav>
    <footer class="stage-colophon" aria-label="技藏落款">
      <svg class="brush-rest" viewBox="0 0 160 44" aria-hidden="true" focusable="false"><path d="M8 34Q19 31 28 13Q33 5 39 15L48 29Q54 34 59 24L73 4Q78-2 84 8L98 26Q104 35 111 25L121 14Q128 5 134 17L150 34Z" /><path d="M15 39Q80 35 146 39" fill="none" stroke="currentColor" /></svg>
      <span class="seal seal-colophon">技藏</span>
    </footer>
  </section>
</template>
