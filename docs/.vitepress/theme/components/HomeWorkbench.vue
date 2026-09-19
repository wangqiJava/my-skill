<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vitepress'
import { data as catalog } from '../../catalog.data.js'

const router = useRouter()
const route = useRoute()
const entered = ref(false)
let enterFrame

const NUMERALS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

const plumBranches = [
  { d: 'M436 167 Q422 151 429 128 L419 102 Q424 87 418 70 L422 43', width: 3.4, delay: 1.3, duration: 1.9 },
  { d: 'M428 128 L453 110 Q459 95 470 83 L476 62', width: 1.6, delay: 2.1, duration: 1.4 },
  { d: 'M421 93 L397 77 390 53 376 39', width: 1.2, delay: 2.4, duration: 1.4 },
  { d: 'M375 141 Q352 159 329 171 L310 169 Q291 180 270 181 L242 199', width: 2.5, delay: 2.0, duration: 1.8 },
  { d: 'M329 171 L322 195 Q305 205 299 224', width: 1.2, delay: 2.8, duration: 1.2 },
  { d: 'M288 180 L271 164 249 163 237 150', width: 0.8, delay: 3.1, duration: 1.1 },
  { d: 'M321 127 L309 101 Q312 83 299 65 L302 40 292 23', width: 2.1, delay: 2.3, duration: 1.8 },
  { d: 'M307 94 Q327 82 332 66 L351 52', width: 1.1, delay: 3.0, duration: 1.2 },
  { d: 'M301 57 L279 48 272 33', width: 0.75, delay: 3.4, duration: 1.0 },
  { d: 'M229 104 L209 126 Q193 129 179 143 L154 148 135 161', width: 1.8, delay: 2.9, duration: 1.7 },
  { d: 'M181 142 L174 123 156 118', width: 0.8, delay: 3.6, duration: 1.0 },
  { d: 'M179 91 L165 73 164 50 147 36', width: 1.3, delay: 3.2, duration: 1.4 },
  { d: 'M142 91 L123 108 102 108 81 119', width: 0.85, delay: 3.6, duration: 1.2 }
]

const plumBlossoms = [
  { x: 422, y: 83, scale: 0.8, rotate: 18, delay: 3.8 },
  { x: 439, y: 112, scale: 0.5, rotate: -22, delay: 4.1 },
  { x: 466, y: 86, scale: 0.63, rotate: 10, delay: 4.4 },
  { x: 393, y: 60, scale: 0.46, rotate: 35, delay: 4.5 },
  { x: 324, y: 192, scale: 0.65, rotate: -12, delay: 4.5 },
  { x: 269, y: 180, scale: 0.78, rotate: 22, delay: 4.7 },
  { x: 252, y: 192, scale: 0.4, rotate: -18, delay: 5.0 },
  { x: 302, y: 66, scale: 0.82, rotate: 8, delay: 4.6 },
  { x: 331, y: 70, scale: 0.56, rotate: -8, delay: 4.9 },
  { x: 279, y: 47, scale: 0.4, rotate: 32, delay: 5.2 },
  { x: 183, y: 139, scale: 0.72, rotate: -20, delay: 5.0 },
  { x: 165, y: 59, scale: 0.63, rotate: 24, delay: 5.3 },
  { x: 145, y: 152, scale: 0.42, rotate: 5, delay: 5.5 },
  { x: 107, y: 108, scale: 0.5, rotate: -8, delay: 5.6 }
]

const plumBuds = [
  { x: 422, y: 45, rotate: 12, delay: 3.5 },
  { x: 474, y: 65, rotate: 30, delay: 3.8 },
  { x: 299, y: 221, rotate: -130, delay: 4.0 },
  { x: 239, y: 153, rotate: -55, delay: 4.3 },
  { x: 293, y: 26, rotate: -20, delay: 4.3 },
  { x: 349, y: 53, rotate: 40, delay: 4.5 },
  { x: 149, y: 38, rotate: -35, delay: 4.7 },
  { x: 83, y: 118, rotate: -70, delay: 4.8 }
]

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

onMounted(() => {
  enterFrame = requestAnimationFrame(enter)
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  cancelAnimationFrame(enterFrame)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <section class="stage" :class="{ 'is-in': entered }">
    <div class="landscape-scene" aria-hidden="true">
    <svg class="plum-art" viewBox="0 0 520 400" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="home-landscape-sides" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="520" y2="0">
          <stop offset="0" stop-color="white" stop-opacity="0" />
          <stop offset="0.06" stop-color="white" stop-opacity="0" />
          <stop offset="0.28" stop-color="white" />
          <stop offset="0.68" stop-color="white" />
          <stop offset="0.94" stop-color="white" stop-opacity="0" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="home-mountain-foot" gradientUnits="userSpaceOnUse" x1="0" y1="220" x2="0" y2="350">
          <stop offset="0" stop-color="white" />
          <stop offset="0.22" stop-color="white" />
          <stop offset="0.58" stop-color="white" stop-opacity="0.55" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
        <mask id="home-landscape-edge" maskUnits="userSpaceOnUse" x="-32" y="-32" width="584" height="464" style="mask-type: alpha">
          <rect x="-32" y="-32" width="584" height="464" fill="url(#home-landscape-sides)" />
        </mask>
        <mask id="home-mountain-base" maskUnits="userSpaceOnUse" x="-32" y="180" width="584" height="252" style="mask-type: alpha">
          <rect x="-32" y="180" width="584" height="252" fill="url(#home-mountain-foot)" />
        </mask>
        <linearGradient id="home-water-ink" gradientUnits="userSpaceOnUse" x1="48" y1="0" x2="478" y2="0">
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
        <filter id="home-mist-soften" filterUnits="userSpaceOnUse" x="-40" y="140" width="600" height="280" color-interpolation-filters="sRGB">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <linearGradient id="home-plum-mist-fade" gradientUnits="userSpaceOnUse" x1="450" y1="0" x2="518" y2="0">
          <stop offset="0" stop-color="white" />
          <stop offset="0.2" stop-color="white" />
          <stop offset="1" stop-color="black" />
        </linearGradient>
        <mask id="home-plum-mist" maskUnits="userSpaceOnUse" x="0" y="0" width="520" height="400">
          <rect width="520" height="400" fill="url(#home-plum-mist-fade)" />
        </mask>
        <mask id="home-plum-trunk" maskUnits="userSpaceOnUse" x="0" y="0" width="520" height="400">
          <path
            class="plum-growth plum-trunk-reveal"
            d="M540 218 L494 195 Q478 180 459 184 L434 168 430 157 407 162 Q387 153 374 141 L340 131 321 127 Q301 109 281 101 L251 108 229 104 205 95 179 91 144 93 117 80 91 72"
            pathLength="100"
            stroke="white"
            stroke-width="38"
            :style="{ '--grow-delay': '0.6s', '--grow-duration': '3.6s' }"
          />
        </mask>
      </defs>

      <g class="landscape-wash">
        <g class="landscape-distance" mask="url(#home-landscape-edge)">
        <g class="landscape-mountains" mask="url(#home-mountain-base)">
          <path class="mountain-far" d="M-24 315 C42 313 68 284 98 278 C123 271 130 241 149 240 C163 239 175 270 192 268 C213 266 231 222 251 219 C270 216 281 252 303 256 C329 261 345 228 364 233 C386 239 400 274 430 278 C468 285 490 303 544 307 L544 400H-24Z" />
          <path class="mountain-middle" d="M-24 337 C48 329 75 312 104 307 C129 302 149 268 170 265 C192 262 199 286 218 288 C241 292 260 271 280 276 C298 281 320 240 340 243 C360 247 375 282 399 288 C423 294 443 276 463 290 C484 304 499 316 544 323 L544 400H-24Z" />
          <path class="mountain-near" d="M-24 363 C40 352 70 336 107 327 C145 317 159 300 183 302 C207 304 221 322 247 323 C274 324 292 301 314 300 C339 299 355 320 384 328 C423 339 470 340 544 359 L544 410H-24Z" />
        </g>
        <g class="landscape-water" stroke="url(#home-water-ink)">
          <path d="M46 330 C101 326 136 331 177 330 S249 326 279 328 M315 328 Q380 322 473 327" />
          <path d="M69 344 Q135 339 192 343 T319 341 M356 342 Q403 338 481 342" />
          <path d="M54 359 Q114 355 172 358 M215 357 Q274 353 327 357 T471 358" />
          <path d="M98 374 Q155 370 211 373 M268 374 Q322 368 390 372 T465 373" />
        </g>
        </g>
        <g class="landscape-atmosphere" mask="url(#home-landscape-edge)">
        <g class="landscape-mist" fill="url(#home-mist-wash)" filter="url(#home-mist-soften)">
          <g class="landscape-mist-breath">
          <path d="M-20 225 C60 202 119 248 190 234 S290 199 349 212 S448 242 540 209 L540 266 C451 281 390 245 326 253 S227 286 159 265 S53 263-20 276Z" />
          <path class="landscape-mist-low" d="M-20 301 C68 282 115 318 196 304 S310 277 383 297 S469 316 540 294 L540 345 C461 360 405 329 341 333 S227 359 153 341 S48 335-20 351Z" />
          </g>
        </g>
        </g>
      </g>

      <g class="plum-bough">
      <g mask="url(#home-plum-mist)">
      <g mask="url(#home-plum-trunk)">
        <path
          class="plum-trunk"
          d="M518 225 C506 219 498 210 490 205 Q484 199 478 191 C468 198 453 183 442 178 Q432 182 428 170 L425 163 Q417 170 408 168 C393 166 380 149 371 147 Q357 146 341 135 C332 137 323 134 317 128 Q300 114 281 106 C268 106 259 115 249 111 Q238 113 226 107 C209 108 192 92 180 94 Q163 90 145 95 C124 91 106 80 76 69 Q110 77 145 90 C160 88 172 83 182 87 Q202 85 226 99 C241 104 250 105 260 102 Q275 90 286 98 C300 99 315 117 325 120 Q332 125 344 124 C361 126 378 138 390 146 Q404 158 411 155 C419 146 430 148 435 155 L440 165 Q451 170 460 176 C470 170 483 178 491 187 Q502 191 518 198Z"
        />
        <path class="plum-bark" d="M511 212q-8-5-13-11m-28-17-6-2m-28-10-4-5m-15-5-7 1m-20-8-9-7m-25-15-12-2m-24-6-9-9m-22-12-6-1m-28 5-8 1" />
        <path class="plum-bark plum-bark-fine" d="M505 205l-6-5m-18-11-4-1m-17-5-6-3m-21-14-2-5m-21 2-5-2m-33-18-8-4m-24-8-6-2m-30-15-5-3m-82-10-8-3m-27-7-7 1" />
        <path class="plum-knots" d="M492 198q-7-7-12-5m-47-29q-6-5-8 0m-53-22 7 4m-99-43-7 2m-95-13 5 2" />
      </g>
      </g>

      <path
        v-for="branch in plumBranches"
        :key="branch.d"
        class="plum-growth plum-twig"
        :d="branch.d"
        :stroke-width="branch.width"
        pathLength="100"
        :style="{ '--grow-delay': `${branch.delay}s`, '--grow-duration': `${branch.duration}s` }"
      />

      <g
        v-for="bud in plumBuds"
        :key="`${bud.x}-${bud.y}`"
        :transform="`translate(${bud.x} ${bud.y}) rotate(${bud.rotate})`"
        :style="{ '--bloom-delay': `${bud.delay}s` }"
      >
        <g class="plum-bud">
          <path class="plum-bud-petal" d="M0 3 C-6 0 -5 -8 -1 -9 C4 -10 7 -2 0 3Z" />
          <path class="plum-calyx" d="M-4 0 L0 4 L4 -1" />
        </g>
      </g>

      <g
        v-for="flower in plumBlossoms"
        :key="`${flower.x}-${flower.y}`"
        :transform="`translate(${flower.x} ${flower.y}) rotate(${flower.rotate}) scale(${flower.scale})`"
        :style="{ '--bloom-delay': `${flower.delay}s` }"
      >
        <circle class="plum-flower-bud" r="3.2" />
        <g class="plum-flower">
          <path
            v-for="petal in 5"
            :key="petal"
            class="plum-petal"
            d="M0 2 C-5 1 -11 -5 -8 -11 C-6 -16 1 -17 5 -12 C10 -7 7 0 0 2Z"
            :transform="`rotate(${(petal - 1) * 72})`"
          />
          <path class="plum-stamen" d="M0 0 L-3 -7 M0 0 L5 -5 M0 0 L7 3 M0 0 L0 7 M0 0 L-6 3" />
          <g class="plum-pollen">
            <circle cx="-3" cy="-7" r="1.2" />
            <circle cx="5" cy="-5" r="1" />
            <circle cx="7" cy="3" r="1.1" />
            <circle cx="0" cy="7" r="1" />
            <circle cx="-6" cy="3" r="1.2" />
          </g>
          <circle class="plum-flower-heart" r="2" />
        </g>
      </g>
      </g>
    </svg>
      <span class="falling-petal falling-petal-one"></span>
      <span class="falling-petal falling-petal-two"></span>
      <span class="falling-petal falling-petal-three"></span>
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
