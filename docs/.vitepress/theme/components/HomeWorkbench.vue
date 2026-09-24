<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter, withBase } from 'vitepress'
import { data as catalog } from '../../catalog.data.js'
import HeroInkScene from './HeroInkScene.vue'
import InkPlateArt from './InkPlateArt.vue'
import { createHomeMotion } from '../motion/homeMotion.js'
import { createInkCardInteractions } from '../motion/inkScroll.js'

const router = useRouter()
const stageElement = ref(null)
let stopHomeMotion
let stopCardInteractions

const NUMERALS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

function cn(n) {
  if (n <= 10) return NUMERALS[n]
  if (n < 20) return `十${NUMERALS[n - 10]}`
  if (n < 100) return `${NUMERALS[Math.floor(n / 10)]}十${n % 10 ? NUMERALS[n % 10] : ''}`
  return String(n)
}

function summarize(key) {
  const pages = catalog[key] || []
  return { count: pages.length, latest: pages[0]?.title || '' }
}

const slips = computed(() => [
  { key: 'projects', kbd: '1', href: '/projects/index.html', name: '工作项目', duty: '这个项目里怎么用 Skill', ...summarize('projects') },
  { key: 'skills', kbd: '2', href: '/skills/index.html', name: 'Skill 记录', duty: '换项目还能用的 Skill', ...summarize('skills') },
  { key: 'tools', kbd: '3', href: '/tools/index.html', name: '工具', duty: '编辑器、模型、MCP', ...summarize('tools') }
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

function open(event, href) {
  event.preventDefault()
  router.go(href)
}

function openNote(event, note) {
  event.preventDefault()
  router.go(note.url)
}

function onKeydown(event) {
  if (event.metaKey || event.ctrlKey || event.altKey) return
  if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select')) return
  const slip = slips.value.find((item) => item.kbd === event.key)
  if (slip) {
    event.preventDefault()
    router.go(slip.href)
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  stopHomeMotion = createHomeMotion(stageElement.value)
  stopCardInteractions = createInkCardInteractions(stageElement.value)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  stopHomeMotion?.()
  stopCardInteractions?.()
  stopHomeMotion = null
  stopCardInteractions = null
})
</script>

<template>
  <section ref="stageElement" class="stage">
    <div class="stage-paper-layer" aria-hidden="true"></div>
    <span class="hero-ink-drop" aria-hidden="true"><i></i><i></i><i></i></span>
    <HeroInkScene />

    <header class="stage-head">
      <div class="stage-copy">
        <h1 class="brush-mark"><span>拾墨</span><span>手记</span><i class="seal seal-leisure" aria-hidden="true">记</i></h1>
        <p class="stage-title">
          <span class="stage-title-a">把做过的事，</span>
          <span class="stage-title-b">留在纸上慢慢看。</span>
        </p>
      </div>
    </header>

    <nav class="home-catalog" aria-labelledby="home-catalog-title">
      <div class="catalog-heading">
        <div class="catalog-heading-copy">
          <h2 id="home-catalog-title">案头所藏</h2>
          <p>{{ cn(totalNotes) }}篇手记 <span aria-hidden="true">·</span> 按 <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> 翻阅 <span aria-hidden="true">·</span> <kbd>/</kbd> 搜索</p>
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
          :class="`slip-${slip.key}`"
          :href="withBase(slip.href)"
          :aria-keyshortcuts="slip.kbd"
          @click="open($event, slip.href)"
        >
          <InkPlateArt :scene="slip.key" />
          <span class="slip-ink" aria-hidden="true"></span>
          <span class="slip-number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="slip-note">
            <span class="slip-name">{{ slip.name }}</span>
            <span class="slip-duty">{{ slip.duty }}</span>
            <span class="slip-latest">
              <span class="slip-latest-label">{{ slip.count ? '最近记录' : '待添新页' }}</span>
              <span class="slip-latest-title" :title="slip.latest || '暂无工具记录'">{{ slip.latest || '暂无工具记录' }}</span>
            </span>
          </span>
          <span class="slip-count">{{ slip.count ? `${cn(slip.count)}篇` : '待' }}</span>
          <span class="slip-action" aria-hidden="true">
            <svg viewBox="0 0 24 16" focusable="false"><path d="M1 8H22M15 1L22 8 15 15" /></svg>
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
          <span class="note-landscape" aria-hidden="true"></span>
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
      <span class="seal seal-colophon">技藏</span>
    </footer>
  </section>
</template>
