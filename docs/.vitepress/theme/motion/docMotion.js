import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { INK_EASE } from './ink.js'

/**
 * 文章页「展卷」：滚动时墨一程一程落下。
 * 段落用 batch 分批进入，避免长文一次性排上百个补间。
 */
export function createDocMotion() {
  gsap.registerPlugin(ScrollTrigger)

  const media = gsap.matchMedia()
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const doc = document.querySelector('.vp-doc')
    if (!doc) return

    // 标题由墨扫过后留下正文；真实文本节点始终保留，SEO 与复制不受影响。
    const heading = doc.querySelector('h1')
    if (heading) {
      gsap.fromTo(heading,
        { '--stroke-reveal': 0, clipPath: 'inset(0 100% 0 0)' },
        {
          '--stroke-reveal': 1,
          clipPath: 'inset(-4px)',
          duration: 0.82,
          ease: INK_EASE.settle,
          scrollTrigger: { trigger: heading, start: 'top 92%', once: true }
        })
    }

    // 章节标题横向显字，分隔线由中心行笔；不把每段正文都做成同一款淡入。
    gsap.utils.toArray('.vp-doc h2, .vp-doc h3', doc).forEach((chapter) => {
      gsap.fromTo(chapter,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(-3px)',
          duration: 0.62,
          ease: INK_EASE.stroke,
          scrollTrigger: { trigger: chapter, start: 'top 88%', once: true }
        })
    })

    const lists = gsap.utils.toArray('.vp-doc ul, .vp-doc ol', doc)
    lists.forEach((list) => {
      const entries = Array.from(list.children)
      ScrollTrigger.create({
        trigger: list,
        start: 'top 88%',
        once: true,
        onEnter: () => gsap.fromTo(entries,
          { autoAlpha: 0.45, x: -8 },
          { autoAlpha: 1, x: 0, duration: 0.48, ease: INK_EASE.stroke, stagger: 0.075, overwrite: true })
      })
    })

    gsap.utils.toArray('.vp-doc blockquote, .vp-doc table, .vp-doc div[class*="language-"]', doc).forEach((panel) => {
      gsap.fromTo(panel,
        { clipPath: 'inset(0 0 100% 0)' },
        {
          clipPath: 'inset(0)',
          duration: 0.72,
          ease: INK_EASE.bloom,
          scrollTrigger: { trigger: panel, start: 'top 90%', once: true }
        })
    })

    // 分隔线是一笔横扫，从中心向两侧展开。
    gsap.utils.toArray('.vp-doc hr', doc).forEach((rule) => {
      gsap.fromTo(rule,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.6,
          ease: INK_EASE.stroke,
          transformOrigin: 'center center',
          scrollTrigger: { trigger: rule, start: 'top 92%', once: true }
        })
    })

    ScrollTrigger.refresh()
  })

  return media
}
