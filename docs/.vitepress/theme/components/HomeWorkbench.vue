<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vitepress'
import { data as catalog } from '../../catalog.data.js'

const router = useRouter()
const route = useRoute()
const entered = ref(false)

const NUMERALS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

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
    name: 'AI 工具',
    duty: '编辑器、模型、MCP',
    ...summarize('tools')
  }
])

function sealText(slip) {
  return slip.count === 0 ? '待写' : `${cn(slip.count)}篇`
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

onMounted(() => {
  requestAnimationFrame(() => {
    entered.value = true
  })
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <section class="stage" :class="{ 'is-in': entered }">
    <header class="stage-head">
      <div class="brush-col" aria-hidden="true">
        <span class="brush-mark">手记</span>
        <span class="seal seal-head">技藏</span>
      </div>

      <div class="stage-copy">
        <h1 class="stage-title">
          <span class="stage-title-a">从项目、Skill 或工具里</span>
          <span class="stage-title-b">找回上次怎么用的。</span>
        </h1>
        <p class="stage-hint">
          点题签进入 · <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> · <kbd>/</kbd> 搜索
        </p>
      </div>
    </header>

    <div class="handscroll" aria-label="三类入口">
      <span class="rod rod-l" aria-hidden="true"></span>
      <div class="paper">
        <a
          v-for="(slip, index) in slips"
          :key="slip.key"
          class="slip"
          :class="{ empty: slip.count === 0 }"
          :style="{ '--i': index }"
          :href="slip.href"
          @click="open($event, slip)"
        >
          <span class="slip-kbd">{{ slip.kbd }}</span>
          <span class="slip-name">{{ slip.name }}</span>
          <span class="slip-duty">{{ slip.duty }}</span>
          <span class="seal slip-seal">{{ sealText(slip) }}</span>
          <span class="slip-latest">
            <template v-if="slip.count === 0">打开目录补第一篇</template>
            <template v-else>{{ slip.latest }}</template>
          </span>
        </a>
      </div>
      <span class="rod rod-r" aria-hidden="true"></span>
    </div>
  </section>
</template>
