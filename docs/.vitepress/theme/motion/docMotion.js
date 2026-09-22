import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { INK_EASE } from './ink.js'

/**
 * 文章页「展卷」：滚动时墨一程一程落下。
 * 段落用 batch 分批进入，避免长文一次性排上百个补间。
 */
export function createDocMotion() {
  gsap.registerPlugin(ScrollTrigger)

  return gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    const doc = document.querySelector('.vp-doc')
    if (!doc) return

    // 标题左侧的朱砂笔触自上而下写出。
    const heading = doc.querySelector('h1')
    if (heading) {
      gsap.fromTo(heading,
        { '--stroke-reveal': 0 },
        {
          '--stroke-reveal': 1,
          duration: 0.7,
          ease: INK_EASE.stroke,
          scrollTrigger: { trigger: heading, start: 'top 88%', once: true }
        })
    }

    const blocks = gsap.utils.toArray('.vp-doc > *:not(h1)', doc)
    if (blocks.length) {
      ScrollTrigger.batch(blocks, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => gsap.fromTo(batch,
          { autoAlpha: 0, y: 6 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: INK_EASE.stroke, stagger: 0.06, overwrite: true })
      })
    }

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
}
