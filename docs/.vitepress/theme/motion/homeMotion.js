import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { INK_EASE } from './ink.js'

gsap.registerPlugin(ScrollTrigger)

export function createHomeMotion(scope) {
  if (!scope) return () => {}

  const media = gsap.matchMedia(scope)
  media.add({
    motion: '(prefers-reduced-motion: no-preference)',
    desktop: '(min-width: 900px) and (hover: hover) and (pointer: fine)',
    mobile: '(max-width: 899px)'
  }, ({ conditions }) => {
    if (!conditions.motion) return

    const mist = scope.querySelector('.hero-mist')
    const mistBreath = scope.querySelector('.hero-mist-breath')
    const sun = scope.querySelector('.hero-sun')
    const finalLayers = gsap.utils.toArray('.hero-final-layer', scope)
    const openingLayers = gsap.utils.toArray('.hero-opening-layer', scope)
    const revealShapes = gsap.utils.toArray('.hero-ink-reveal-shape', scope)
    const title = gsap.utils.toArray('.brush-mark > span', scope)
    const titleWipe = scope.querySelector('.hero-title-ink-reveal')
    const rightFar = scope.querySelector('.hero-right-far-reveal')
    const rightMid = scope.querySelector('.hero-right-mid-reveal')
    const rightForeground = scope.querySelector('.hero-right-foreground-reveal')
    const leftFar = scope.querySelector('.hero-left-far-reveal')
    const leftMid = scope.querySelector('.hero-left-mid-reveal')
    const leftForeground = scope.querySelector('.hero-left-foreground-reveal')
    const rightFields = [rightFar, rightMid, rightForeground].filter(Boolean)
    const leftFields = [leftFar, leftMid, leftForeground].filter(Boolean)
    const fields = [...rightFields, ...leftFields]
    const copy = scope.querySelector('.stage-title')
    const seal = scope.querySelector('.seal-leisure')

    gsap.set(finalLayers, { opacity: 0 })
    gsap.set(openingLayers, { autoAlpha: 1 })
    gsap.set(fields, { scale: 0.015 })
    gsap.set(title, { '--hero-title-mask': 'url(#hero-title-ink-mask)' })
    gsap.set(titleWipe, { scaleX: 0 })
    gsap.set(copy, { autoAlpha: 0, filter: 'blur(2px)' })
    gsap.set(seal, { autoAlpha: 0, scale: 1.08, rotation: 1, transformOrigin: '50% 100%', filter: 'none' })
    gsap.set(sun, { autoAlpha: 0, scale: 0.985 })
    gsap.set(mist, { autoAlpha: 0, x: -5, y: 26 })
    gsap.set(mistBreath, { x: 0, opacity: 0.82 })

    const opening = gsap.timeline({ defaults: { ease: INK_EASE.stroke } })
    opening
      .to(rightForeground, { scale: 1, duration: 0.62, ease: INK_EASE.bloom }, 0.3)
      .to(rightMid, { scale: 1, duration: 0.54, ease: INK_EASE.bloom }, 0.47)
      .to(leftForeground, { scale: 1, duration: 0.5, ease: INK_EASE.bloom }, 0.52)
      .to(rightFar, { scale: 1, duration: 0.5, ease: INK_EASE.bloom }, 0.64)
      .to(leftMid, { scale: 1, duration: 0.48, ease: INK_EASE.bloom }, 0.73)
      .to(leftFar, { scale: 1, duration: 0.43, ease: INK_EASE.bloom }, 0.91)
      .to(mist, { autoAlpha: 0.46, x: 1, y: 0, duration: 0.3, ease: INK_EASE.bloom }, 0.76)
      .to(mist, { autoAlpha: 0.12, x: -2, y: -3, duration: 0.18, ease: INK_EASE.bloom }, 1.05)
      .to(mist, { autoAlpha: 0.2, x: 0, y: -7, duration: 0.34, ease: INK_EASE.bloom }, 1.23)
      .to(titleWipe, { scaleX: 1, duration: 0.5, ease: INK_EASE.settle }, 1.05)
      .to(seal, { autoAlpha: 0.86, scale: 0.97, rotation: 1.2, duration: 0.075, ease: 'power3.in' }, 1.55)
      .to(seal, { scale: 1, rotation: 2, duration: 0.13, ease: INK_EASE.press }, 1.625)
      .to(seal, { filter: 'drop-shadow(0 0 5px rgb(147 48 42 / 20%))', duration: 0.02 }, 1.63)
      .to(seal, { filter: 'drop-shadow(0 0 0 rgb(147 48 42 / 0%))', duration: 0.16, ease: 'power1.out' }, 1.65)
      .to(copy, { autoAlpha: 1, filter: 'blur(0px)', duration: 0.36, ease: INK_EASE.stroke }, 1.65)
      .to(sun, { autoAlpha: 0.16, scale: 1, duration: 0.53, ease: INK_EASE.bloom }, 1.85)
      .to(finalLayers, { opacity: 1, duration: 0.34, ease: 'power1.out' }, 2.04)
      .to(openingLayers, { autoAlpha: 0, duration: 0.34, ease: 'power1.in' }, '<')
      .call(() => {
        openingLayers.forEach((layer) => layer.removeAttribute('mask'))
        revealShapes.forEach((shape) => shape.removeAttribute('filter'))
        gsap.set(finalLayers, { clearProps: 'opacity' })
        gsap.set(fields, { clearProps: 'transform' })
        gsap.set(title, { clearProps: '--hero-title-mask' })
        gsap.set([copy, seal, sun, mist], { clearProps: 'transform,opacity,visibility,filter,transformOrigin' })
      }, null, 2.4)

    const atmosphere = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: INK_EASE.breathe } })
    atmosphere
      .to(mistBreath, { x: 3, opacity: 0.75, duration: 8.5 })
      .to(mistBreath, { x: 0, opacity: 0.82, duration: 8.5 })
    opening.call(() => atmosphere.play(0), null, 2.4)

    const hero = scope.querySelector('.stage-head')
    const catalog = scope.querySelector('.home-catalog')
    const recent = scope.querySelector('.recent-notes')
    const colophon = scope.querySelector('.stage-colophon')
    const farMountains = scope.querySelector('.hero-far-mountains')
    const midMountains = scope.querySelector('.hero-mid-mountains')
    const foreground = scope.querySelector('.hero-foreground')
    const slips = gsap.utils.toArray('.slip', scope)

    const scrollScene = gsap.timeline({
      scrollTrigger: {
        trigger: scope,
        start: 'top top',
        end: () => `+=${Math.max(window.innerHeight * 1.7, 1400)}`,
        scrub: 0.68,
        invalidateOnRefresh: true
      }
    })

    ;[
      [farMountains, -18, 0, 0.78],
      [midMountains, -42, 0.1, 0.76],
      [foreground, -72, 0.18, 0.7],
      [mistBreath, 16, 0.24, 0.72],
      [hero, -48, 0, 0.46],
      [catalog, -28, 0.24, 0.55],
      [recent, -42, 0.55, 0.54],
      [colophon, -62, 0.78, 0.44]
    ].forEach(([target, y, start, duration]) => {
      if (!target) return
      scrollScene.fromTo(target, { y: 0 }, { y, duration, ease: 'none' }, start)
    })
    slips.forEach((slip, index) => {
      const y = [-10, -2, -14][index % 3]
      scrollScene.fromTo(slip, { y: 0 }, { y, duration: 0.5, ease: 'none' }, 0.34)
    })
    scrollScene.scrollTrigger?.disable()
    opening.call(() => {
      scrollScene.scrollTrigger?.enable()
      ScrollTrigger.refresh()
    }, null, 2.4)

    const catalogHeading = scope.querySelector('.catalog-heading-copy h2')
    if (catalogHeading) {
      gsap.fromTo(catalogHeading,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0)',
          duration: 0.76,
          ease: INK_EASE.stroke,
          scrollTrigger: { trigger: catalogHeading, start: 'top 84%', once: true }
        })
    }

    const art = gsap.utils.toArray('.ink-plate-art', scope)
    ScrollTrigger.batch(art, {
      start: 'top 83%',
      once: true,
      onEnter: (batch) => gsap.fromTo(batch,
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0)', duration: 0.94, ease: INK_EASE.bloom, stagger: 0.17, overwrite: true })
    })

    const notesHeading = scope.querySelector('.recent-notes-head h2')
    if (notesHeading) {
      gsap.fromTo(notesHeading,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0)',
          duration: 0.72,
          ease: INK_EASE.stroke,
          scrollTrigger: { trigger: notesHeading, start: 'top 86%', once: true }
        })
    }

    const entries = gsap.utils.toArray('.note-entry', scope)
    ScrollTrigger.batch(entries, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => gsap.fromTo(batch,
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0)', duration: 0.7, ease: INK_EASE.stroke, stagger: 0.12, overwrite: true })
    })

    const parallaxLayers = [
      { nodes: gsap.utils.toArray('.hero-left-far-layer', scope), distance: 2, inverse: true },
      { nodes: gsap.utils.toArray('.hero-right-far-layer', scope), distance: 2, inverse: true },
      { nodes: gsap.utils.toArray('.hero-left-mid-layer', scope), distance: 4, inverse: true },
      { nodes: gsap.utils.toArray('.hero-right-mid-layer', scope), distance: 4, inverse: true },
      { nodes: gsap.utils.toArray('.hero-left-near-layer', scope), distance: 5, inverse: true },
      { nodes: gsap.utils.toArray('.hero-right-near-layer', scope), distance: 8, inverse: true },
      { nodes: [mist], distance: 3, inverse: false },
      { nodes: [sun], distance: 1, inverse: true }
    ]
    let moveX = []
    let moveY = []
    let pointerActive = false
    const onPointerMove = (event) => {
      if (!pointerActive || event.pointerType !== 'mouse' || !hero) return
      const bounds = hero.getBoundingClientRect()
      if (event.clientY < bounds.top || event.clientY > bounds.bottom) return
      const x = ((event.clientX - bounds.left) / Math.max(1, bounds.width) - 0.5) * 2
      const y = ((event.clientY - bounds.top) / Math.max(1, bounds.height) - 0.5) * 2
      moveX.forEach((moves, index) => moves.forEach((move) => {
        const direction = parallaxLayers[index].inverse ? -1 : 1
        move(x * parallaxLayers[index].distance * direction)
      }))
      moveY.forEach((moves, index) => moves.forEach((move) => {
        const direction = parallaxLayers[index].inverse ? -1 : 1
        move(y * parallaxLayers[index].distance * direction)
      }))
    }
    const onPointerLeave = () => {
      moveX.forEach((moves) => moves.forEach((move) => move(0)))
      moveY.forEach((moves) => moves.forEach((move) => move(0)))
    }

    if (conditions.desktop && hero) {
      moveX = parallaxLayers.map(({ nodes }) => nodes.map((node) => gsap.quickTo(node, 'x', { duration: 1.15, ease: 'power2.out' })))
      moveY = parallaxLayers.map(({ nodes }) => nodes.map((node) => gsap.quickTo(node, 'y', { duration: 1.15, ease: 'power2.out' })))
      opening.call(() => { pointerActive = true }, null, 2.4)
      hero.addEventListener('pointermove', onPointerMove, { passive: true })
      hero.addEventListener('pointerleave', onPointerLeave, { passive: true })
    }

    ScrollTrigger.refresh()
    return () => {
      hero?.removeEventListener('pointermove', onPointerMove)
      hero?.removeEventListener('pointerleave', onPointerLeave)
      scrollScene.scrollTrigger?.kill()
      scrollScene.kill()
    }
  })

  return () => media.revert()
}
