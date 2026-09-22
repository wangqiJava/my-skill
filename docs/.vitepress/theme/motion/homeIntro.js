import { gsap } from 'gsap'
import { INK_EASE } from './ink.js'

// 水纹：四道各自的速度、方向与初相位，错开后不会出现整齐的同步摆动。
const WATER_RIPPLE = [
  { duration: 14, offset: 0, direction: 1 },
  { duration: 17, offset: -4, direction: -1 },
  { duration: 16, offset: -8, direction: 1 },
  { duration: 19, offset: -6, direction: -1 }
]
const RIPPLE_DISTANCE = 16

/**
 * 首屏「题款」时间线。
 * 顺序遵循传统落款：先布景（山、水、雾、梅），再题字，最后钤印。
 * 段与段之间留气口，让纸白先于墨出现。
 */
export function createHomeIntro(scope) {
  const intro = gsap.timeline({ defaults: { ease: INK_EASE.stroke } })

  // 0.00–0.28 只有纸。留白是构图的一部分，不急着落墨。
  intro
    // 整幅山水先洇出纸面，再由各层分别落墨。
    .fromTo('.landscape-wash',
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.5, ease: INK_EASE.bloom },
      0.28)
    .fromTo('.landscape-mountains',
      { autoAlpha: 0, y: 80, scaleY: 0.82 },
      { autoAlpha: 0.8, y: 55, scaleY: 0.82, duration: 0.85, ease: INK_EASE.bloom },
      0.3)
    // 水纹横扫：先窄后宽，像一笔带过。
    .fromTo('.landscape-water > path',
      { autoAlpha: 0, scaleX: 0.72 },
      { autoAlpha: 0.75, scaleX: 1, duration: 0.6, stagger: 0.07 },
      0.55)
    // 雾气洇开，最慢的一层，用来托住前面的墨。
    .fromTo('.landscape-mist-breath',
      { autoAlpha: 0, xPercent: -8 },
      { autoAlpha: 0.6, xPercent: 0, duration: 0.9, ease: INK_EASE.bloom },
      0.8)
    .fromTo('.plum-picture',
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.5, ease: INK_EASE.bloom },
      0.9)

  // 2.00 题字：逐字从上向下落墨，每字写成后渗一次墨。
  intro
    .fromTo('.brush-col',
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.3 },
      2.0)
    .fromTo('.brush-mark > span',
      { autoAlpha: 0, clipPath: 'inset(0 0 100% 0)' },
      { autoAlpha: 1, clipPath: 'inset(-3px)', duration: 0.42, stagger: 0.07 },
      2.05)

  gsap.utils.toArray('.brush-mark > span', scope).forEach((char, index) => {
    const written = 2.05 + index * 0.07 + 0.3
    intro
      .to(char, { '--ink-bleed': 1, duration: 0.12, ease: 'power2.out' }, written)
      .to(char, { '--ink-bleed': 0, duration: 0.55, ease: 'power2.out' }, written + 0.12)
  })

  // 2.60 钤印，气口前的一段静默。
  intro
    .fromTo('.brush-col .seal',
      { autoAlpha: 0, scale: 1.12, rotate: -10 },
      { autoAlpha: 1, scale: 1, rotate: -6, duration: 0.22, ease: INK_EASE.press },
      2.6)
    .fromTo('.brush-col .seal',
      { boxShadow: '0 0 0px rgb(196 58 58 / 42%)' },
      { boxShadow: '0 0 16px rgb(196 58 58 / 0%)', duration: 0.5, ease: 'power2.out' },
      2.66)

  // 2.85 副题与目录：纸片依次落位，落位后交还给 CSS 的悬浮倾斜。
  intro
    .fromTo('.stage-copy',
      { autoAlpha: 0, x: 12 },
      { autoAlpha: 1, x: 0, duration: 0.42 },
      2.85)
    .fromTo('.catalog-heading',
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 0.36 },
      2.9)
    .fromTo('.slip',
      { autoAlpha: 0, y: 12, rotate: 0.6 },
      { autoAlpha: 1, y: 0, rotate: 0, duration: 0.44, stagger: 0.09, clearProps: 'transform' },
      3.05)

  const loops = []
  let ambientStarted = false

  function register(loop) {
    loops.push(loop)
    if (ambientStarted) loop.play()
    return loop
  }

  function buildRipple(path, index) {
    const ripple = WATER_RIPPLE[index] || WATER_RIPPLE[0]
    const half = ripple.duration / 2
    const loop = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: INK_EASE.breathe } })
    loop
      .fromTo(path,
        { x: 0, y: 0, scaleX: 0.98, opacity: 0.58 },
        { x: RIPPLE_DISTANCE * ripple.direction, y: 1.5, scaleX: 1.025, opacity: 1, duration: half })
      .to(path, { x: 0, y: 0, scaleX: 0.98, opacity: 0.58, duration: half })
    loop.progress(Math.abs(ripple.offset) / ripple.duration)
    return loop
  }

  // 雾：一次呼吸 24s，与旧的 CSS keyframes 同节奏，但缓动统一为呼吸曲线。
  register(gsap.timeline({ repeat: -1, paused: true, defaults: { ease: INK_EASE.breathe } })
    .to('.landscape-mist-breath', { x: -4, y: -1, opacity: 0.7, duration: 10.8 })
    .to('.landscape-mist-breath', { x: -2, y: 0, opacity: 0.64, duration: 6.48 })
    .to('.landscape-mist-breath', { x: 0, y: 0, opacity: 0.6, duration: 6.72 }))

  gsap.utils.toArray('.landscape-bird', scope).forEach((bird, index) => {
    const delay = index * 1.6
    register(gsap.timeline({ repeat: -1, paused: true, delay })
      .set(bird, { x: 0, y: 6, opacity: 0 })
      .to(bird, { opacity: 0.72, duration: 3.2, ease: 'none' })
      .to(bird, { x: 98, y: -12, opacity: 0.62, duration: 7.68, ease: 'none' }, 3.2)
      .to(bird, { x: 178, y: -24, opacity: 0, duration: 7.68, ease: 'none' }, 10.88)
      .to(bird, { duration: 13.44 }))

    const wings = bird.querySelector('.landscape-bird-wings')
    if (!wings) return
    register(gsap.timeline({ repeat: -1, paused: true, delay, defaults: { ease: INK_EASE.breathe } })
      .set(wings, { scaleY: 0.85, rotate: -3 })
      .to(wings, { scaleY: 0.3, rotate: 2, duration: 0.648 })
      .to(wings, { scaleY: 1, rotate: -2, duration: 0.504 })
      .to(wings, { scaleY: 0.85, rotate: -3, duration: 0.576 })
      .to(wings, { scaleY: 0.7, rotate: 0, duration: 0.864 })
      .to(wings, { scaleY: 0.85, rotate: -3, duration: 1.008 }))
  })

  // 按屏幅裁剪：窄屏不做全屏模糊、少开两道水纹，并整体加快一档。
  const waterPaths = gsap.utils.toArray('.landscape-water > path', scope)
  const media = gsap.matchMedia()

  media.add('(min-width: 641px)', () => {
    gsap.fromTo('.landscape-mountains',
      { filter: 'blur(10px)' },
      { filter: 'blur(0px)', duration: 0.85, delay: 0.3, ease: INK_EASE.bloom, clearProps: 'filter' })
    const built = waterPaths.map((path, index) => register(buildRipple(path, index)))
    return () => {
      built.forEach((loop) => {
        const at = loops.indexOf(loop)
        if (at >= 0) loops.splice(at, 1)
      })
    }
  })

  media.add('(max-width: 640px)', () => {
    intro.timeScale(1.25)
    const built = [0, 2]
      .filter((index) => waterPaths[index])
      .map((index) => register(buildRipple(waterPaths[index], index)))
    return () => {
      built.forEach((loop) => {
        const at = loops.indexOf(loop)
        if (at >= 0) loops.splice(at, 1)
      })
    }
  })

  return {
    intro,
    startAmbient() {
      ambientStarted = true
      loops.forEach((loop) => loop.play())
    },
    pauseAmbient() {
      loops.forEach((loop) => loop.pause())
    },
    resumeAmbient() {
      if (ambientStarted) loops.forEach((loop) => loop.play())
    },
    kill() {
      intro.kill()
      loops.forEach((loop) => loop.kill())
      loops.length = 0
      media.kill()
    }
  }
}
