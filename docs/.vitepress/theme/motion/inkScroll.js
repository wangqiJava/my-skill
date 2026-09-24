import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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

  const cards = Array.from(scope.querySelectorAll('.slip'))
  const cleanups = []

  cards.forEach((card) => {
    const title = card.querySelector('.slip-name')
    const number = card.querySelector('.slip-number')
    const count = card.querySelector('.slip-count')
    const description = card.querySelector('.slip-duty')
    const setX = gsap.quickTo(card, '--ink-x', { duration: 0.46, ease: 'power3.out' })
    const setY = gsap.quickTo(card, '--ink-y', { duration: 0.46, ease: 'power3.out' })
    const setRadius = gsap.quickTo(card, '--ink-radius', { duration: 0.62, ease: 'power2.out' })
    let leaveTween

    const onMove = (event) => {
      const bounds = card.getBoundingClientRect()
      const x = Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100))
      const y = Math.max(0, Math.min(100, (event.clientY - bounds.top) / bounds.height * 100))
      setX(`${x}%`)
      setY(`${y}%`)
    }
    const onEnter = (event) => {
      leaveTween?.kill()
      card.classList.add('is-ink-hover')
      onMove(event)
      setRadius('145px')
      gsap.to(card, { '--ink-strength': 1, duration: 0.42, ease: 'power2.out', overwrite: true })
      gsap.to([number, count, title, description].filter(Boolean), {
        x: (index) => [3, 4, 6, 9][index] || 0,
        duration: 0.58,
        ease: 'power2.out',
        stagger: 0.035,
        overwrite: true
      })
    }
    const onLeave = () => {
      card.classList.remove('is-ink-hover')
      leaveTween = gsap.to(card, { '--ink-strength': 0, duration: 0.7, ease: 'power1.out', overwrite: true })
      gsap.to([number, count, title, description].filter(Boolean), {
        x: 0,
        duration: 0.44,
        ease: 'power2.out',
        stagger: 0.025,
        overwrite: true
      })
      setX('50%')
      setY('50%')
      setRadius('0px')
    }

    card.addEventListener('pointermove', onMove, { passive: true })
    card.addEventListener('pointerenter', onEnter, { passive: true })
    card.addEventListener('pointerleave', onLeave, { passive: true })
    cleanups.push(() => {
      card.removeEventListener('pointermove', onMove)
      card.removeEventListener('pointerenter', onEnter)
      card.removeEventListener('pointerleave', onLeave)
      leaveTween?.kill()
      gsap.killTweensOf([card, number, count, title, description].filter(Boolean))
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
