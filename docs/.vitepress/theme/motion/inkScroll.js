import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { INK_SPRITE_CONFIG, createInkSprite, isInkSpriteReady, preloadInkSprite } from './inkSprite.js'

gsap.registerPlugin(ScrollTrigger)

function pointIn(element, scope, edge = 'center') {
  const rect = element.getBoundingClientRect()
  const bounds = scope.getBoundingClientRect()
  return {
    x: rect.left - bounds.left + rect.width / 2,
    y: rect.top - bounds.top + (edge === 'top' ? 0 : edge === 'bottom' ? rect.height : rect.height / 2)
  }
}

function curveBetween(a, b, tension = 0.42) {
  const bend = Math.max(42, Math.abs(b.y - a.y) * tension)
  const direction = b.y >= a.y ? 1 : -1
  return `C${a.x} ${a.y + bend * direction} ${b.x} ${b.y - bend * direction} ${b.x} ${b.y}`
}

export function createInkSpine(svg, scope) {
  let observer
  const context = gsap.context(() => {
    const main = Array.from(svg.querySelectorAll('.ink-spine-main'))
    const branches = Array.from(svg.querySelectorAll('.ink-spine-branch'))
    const mainUnder = main.find((path) => path.classList.contains('ink-spine-bleed'))
    const mainOver = main.find((path) => path.classList.contains('ink-spine-core'))
    const branchUnder = branches.filter((path) => path.classList.contains('ink-spine-bleed'))
    const branchOver = branches.filter((path) => path.classList.contains('ink-spine-core'))
    const anchors = {
      title: scope.querySelector('.brush-mark'),
      catalog: scope.querySelector('.catalog-heading'),
      cards: Array.from(scope.querySelectorAll('.slip')),
      recent: scope.querySelector('.recent-notes-head'),
      notes: Array.from(scope.querySelectorAll('.note-entry')),
      seal: scope.querySelector('.stage-colophon')
    }

    if (!mainUnder || !mainOver || !anchors.title || !anchors.catalog || !anchors.seal) return

    const drawScene = () => {
      const width = Math.max(1, scope.clientWidth)
      const height = Math.max(1, scope.scrollHeight)
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
      svg.setAttribute('width', String(width))
      svg.setAttribute('height', String(height))

      const title = pointIn(anchors.title, scope)
      const catalog = pointIn(anchors.catalog, scope, 'bottom')
      const recent = pointIn(anchors.recent || anchors.seal, scope)
      const seal = pointIn(anchors.seal, scope)
      const left = Math.max(18, width * 0.035)
      const right = width - left
      const mainPoints = [
        { x: right, y: title.y + 20 },
        { x: left, y: catalog.y + 12 },
        { x: right, y: recent.y - 10 },
        { x: left, y: seal.y }
      ]
      let d = `M${mainPoints[0].x} ${mainPoints[0].y}`
      for (let index = 1; index < mainPoints.length; index += 1) {
        d += ` ${curveBetween(mainPoints[index - 1], mainPoints[index])}`
      }
      main.forEach((path) => path.setAttribute('d', d))

      anchors.cards.forEach((card, index) => {
        const under = branchUnder[index]
        const over = branchOver[index]
        if (!under || !over) return
        const from = pointIn(anchors.catalog, scope, 'bottom')
        const to = pointIn(card, scope, 'top')
        const startX = width * (0.18 + index * 0.32)
        const branchPath = `M${startX} ${from.y} ${curveBetween({ x: startX, y: from.y }, to, 0.3)}`
        under.setAttribute('d', branchPath)
        over.setAttribute('d', branchPath)
      })

      const nodes = Array.from(svg.querySelectorAll('.ink-spine-node'))
      anchors.notes.forEach((note, index) => {
        const node = nodes[index]
        if (!node) return
        const point = pointIn(note, scope, 'center')
        node.setAttribute('transform', `translate(${point.x}, ${point.y})`)
      })
      const stamp = svg.querySelector('.ink-spine-stamp')
      if (stamp) stamp.setAttribute('transform', `translate(${seal.x}, ${seal.y})`)
    }

    drawScene()
    const paths = [...main, ...branches]
    gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 })
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(paths, { strokeDashoffset: 0 })
      gsap.set(svg.querySelectorAll('.ink-spine-node, .ink-spine-stamp'), { autoAlpha: 1 })
      observer = new ResizeObserver(() => drawScene())
      observer.observe(scope)
      return
    }
    gsap.to(paths, {
      strokeDashoffset: 0,
      ease: 'none',
      stagger: 0.09,
      scrollTrigger: {
        trigger: scope,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.55,
        invalidateOnRefresh: true
      }
    })

    anchors.cards.forEach((card) => {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 76%',
        once: true,
        onEnter: () => gsap.fromTo(card.querySelector('.slip-number'),
          { autoAlpha: 0.35, y: 7 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out', clearProps: 'transform,opacity,visibility' })
      })
    })

    anchors.notes.forEach((note, index) => {
      const node = svg.querySelectorAll('.ink-spine-node')[index]
      if (!node) return
      ScrollTrigger.create({
        trigger: note,
        start: 'center 72%',
        once: true,
        onEnter: () => gsap.fromTo(node,
          { scale: 0.25, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.36, ease: 'back.out(1.25)', overwrite: true })
      })
    })
    ScrollTrigger.create({
      trigger: anchors.seal,
      start: 'center 82%',
      once: true,
      onEnter: () => gsap.fromTo(svg.querySelector('.ink-spine-stamp'),
        { scale: 0.55, autoAlpha: 0, rotate: -8 },
        { scale: 1, autoAlpha: 1, rotate: -3, duration: 0.42, ease: 'back.out(1.2)', overwrite: true })
    })

    observer = new ResizeObserver(() => {
      drawScene()
      ScrollTrigger.refresh()
    })
    observer.observe(scope)
  }, scope)

  return () => {
    observer?.disconnect()
    context.revert()
  }
}

export function createInkCardInteractions(scope) {
  const media = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
  if (!media.matches) return () => {}

  const cards = Array.from(scope.querySelectorAll('.slip-projects'))
  const cleanups = []
  const maxWetFrame = 14
  const diffusionEase = (progress) => {
    if (progress <= 0.3) return progress / 0.3 * 0.42
    const tail = (progress - 0.3) / 0.7
    return 0.42 + (1 - Math.pow(1 - tail, 1.75)) * 0.58
  }

  cards.forEach((card) => {
    const wetLayer = card.querySelector('.slip-art-wet')
    const hoverSprite = createInkSprite({ mount: card, className: 'slip-ink-sprite' })
    let fadeTimer
    let wetTween
    let maskMetrics
    let disposed = false

    const setMaskFrame = (frame) => {
      if (!wetLayer || !maskMetrics) return
      const col = frame % INK_SPRITE_CONFIG.cols
      const row = Math.floor(frame / INK_SPRITE_CONFIG.cols)
      const left = maskMetrics.x - maskMetrics.cellWidth / 2 - col * maskMetrics.cellWidth
      const top = maskMetrics.y - maskMetrics.cellHeight / 2 - row * maskMetrics.cellHeight
      const position = `${left}px ${top}px, 0 0, 0 0`
      wetLayer.style.webkitMaskPosition = position
      wetLayer.style.maskPosition = position
    }

    const setMaskMetrics = (bounds, x, y) => {
      if (!wetLayer) return
      const spread = Math.min(0.92, Math.max(0.7, bounds.width / 430))
      const cellSize = bounds.width * spread
      const cellWidth = cellSize
      const cellHeight = cellSize
      maskMetrics = { x, y, cellWidth, cellHeight }
      wetLayer.style.setProperty('--ink-fallback-x', `${x}px`)
      wetLayer.style.setProperty('--ink-fallback-y', `${y}px`)
      const size = `${cellWidth * INK_SPRITE_CONFIG.cols}px ${cellHeight * INK_SPRITE_CONFIG.rows}px, 100% 100%, 100% 100%`
      wetLayer.style.webkitMaskSize = size
      wetLayer.style.maskSize = size
      setMaskFrame(0)
    }

    const onEnter = (event) => {
      window.clearTimeout(fadeTimer)
      wetTween?.kill()
      const bounds = card.getBoundingClientRect()
      const x = Math.max(0, Math.min(bounds.width, event.clientX - bounds.left))
      const y = Math.max(0, Math.min(bounds.height, event.clientY - bounds.top))
      card.classList.add('is-ink-hover')
      setMaskMetrics(bounds, x, y)
      hoverSprite
        ?.setPosition(x, y)
        .setScale(1)
        .setRotation('0deg')
        .reset()
      if (wetLayer) {
        wetLayer.classList.toggle('is-mask-fallback', !isInkSpriteReady())
        gsap.set(wetLayer, { opacity: 0, filter: 'grayscale(0.24) contrast(1.03) brightness(0.96) saturate(0.82)' })
        wetTween = gsap.to(wetLayer, {
          opacity: 0.94,
          filter: 'grayscale(0.06) contrast(1.22) brightness(0.9) saturate(0.92)',
          duration: 0.28,
          ease: 'power2.out',
          overwrite: true
        })
      }
      if (hoverSprite) {
        preloadInkSprite().then((ready) => {
          if (ready && !disposed) wetLayer?.classList.remove('is-mask-fallback')
        })
        hoverSprite.play({
          duration: 780,
          ease: diffusionEase,
          onUpdate: (_, frame) => setMaskFrame(Math.min(maxWetFrame, Math.round(frame * maxWetFrame / (INK_SPRITE_CONFIG.frameCount - 1))))
        })
      }
    }
    const onLeave = () => {
      card.classList.remove('is-ink-hover')
      window.clearTimeout(fadeTimer)
      fadeTimer = window.setTimeout(() => {
        if (!wetLayer) return
        wetTween?.kill()
        wetTween = gsap.to(wetLayer, {
          opacity: 0,
          filter: 'grayscale(0.24) contrast(1.03) brightness(0.96) saturate(0.82)',
          duration: 0.52,
          ease: 'power2.out',
          overwrite: true,
          onComplete: () => hoverSprite?.stop()
        })
      }, 150)
    }

    card.addEventListener('pointerenter', onEnter, { passive: true })
    card.addEventListener('pointerleave', onLeave, { passive: true })
    cleanups.push(() => {
      disposed = true
      window.clearTimeout(fadeTimer)
      card.removeEventListener('pointerenter', onEnter)
      card.removeEventListener('pointerleave', onLeave)
      wetTween?.kill()
      if (hoverSprite) {
        hoverSprite.stop()
        hoverSprite.destroy()
      }
    })
  })

  return () => cleanups.forEach((cleanup) => cleanup())
}

export function createInkChapterMotion(scope) {
  const context = gsap.context(() => {
    const heading = scope.querySelector('.recent-notes-head h2')
    if (heading) {
      gsap.fromTo(heading,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(-3px)',
          duration: 0.72,
          ease: 'power2.out',
          scrollTrigger: { trigger: heading, start: 'top 86%', once: true }
        })
    }

    const entries = gsap.utils.toArray('.note-entry', scope)
    if (entries.length) {
      ScrollTrigger.batch(entries, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => gsap.fromTo(batch,
          { clipPath: 'inset(0 0 100% 0)', y: 8 },
          { clipPath: 'inset(0)', y: 0, duration: 0.66, ease: 'power2.out', stagger: 0.1, overwrite: true })
      })
    }
  }, scope)

  return () => context.revert()
}
