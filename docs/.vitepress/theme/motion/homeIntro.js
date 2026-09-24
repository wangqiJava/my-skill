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
 * @param {Element} scope
 * @param {{ onSettled?: () => void }} [hooks] 落款收笔后的回调，
 *   外层用它放开常态氛围（水纹、飞鸟、雾的呼吸）。
 */
export function createHomeIntro(scope, { onSettled } = {}) {
  const select = (selector) => gsap.utils.toArray(selector, scope)
  const drop = scope.querySelector('.hero-ink-drop')
  const title = select('.brush-mark > span')
  const copy = select('.stage-kicker, .stage-title-a, .stage-title-b, .stage-inscription span')
  const seals = select('.brush-col .seal, .kicker-col .seal')
  const cards = select('.slip')
  const intro = gsap.timeline({
    defaults: { ease: INK_EASE.stroke },
    onComplete: onSettled
  })

  // 一滴浓墨落在空纸上；扩散至边缘时，远山才从纸纤维间显出来。
  intro
    .fromTo(drop,
      { autoAlpha: 1, scale: 0.12 },
      { scale: 24, autoAlpha: 0, duration: 0.86, ease: INK_EASE.bloom },
      0.34)
    .fromTo('.landscape-wash',
      { autoAlpha: 0, clipPath: 'inset(0 0 42% 0)' },
      { autoAlpha: 1, clipPath: 'inset(0)', duration: 1.45, ease: INK_EASE.bloom },
      0.62)
    .fromTo('.landscape-mountains',
      { autoAlpha: 0, y: 36 },
      { autoAlpha: 0.82, y: 0, duration: 1.32, ease: INK_EASE.bloom },
      0.76)
    .fromTo('.landscape-mist-breath',
      { autoAlpha: 0, xPercent: -4 },
      { autoAlpha: 0.58, xPercent: 0, duration: 1.5, ease: INK_EASE.bloom },
      1.08)
    .fromTo('.landscape-water > path',
      { autoAlpha: 0, scaleX: 0.86 },
      { autoAlpha: 0.72, scaleX: 1, duration: 0.72, stagger: 0.08 },
      1.38)
    .fromTo('.brush-col',
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.2 },
      1.92)
    .fromTo(title,
      { autoAlpha: 1, clipPath: 'inset(0 100% 0 0)' },
      { autoAlpha: 1, clipPath: 'inset(-4px)', duration: 0.72, stagger: 0.13, ease: INK_EASE.settle },
      2.0)

  title.forEach((char, index) => {
    const written = 2 + index * 0.13 + 0.42
    intro
      .to(char, { '--ink-bleed': 1, duration: 0.16, ease: 'power2.out' }, written)
      .to(char, { '--ink-bleed': 0, duration: 0.7, ease: INK_EASE.bloom }, written + 0.16)
  })

  // 主标题落定后再题副文，最后落下朱印。
  intro
    .fromTo(copy,
      { autoAlpha: 0, y: 8 },
      { autoAlpha: 1, y: 0, duration: 0.44, stagger: 0.09, ease: INK_EASE.stroke },
      2.76)
    .fromTo('.stage-title',
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.2 },
      2.73)
    .fromTo(seals,
      { autoAlpha: 0, scale: 0.76, rotate: -8 },
      { autoAlpha: 1, scale: 1, rotate: -3, duration: 0.36, stagger: 0.14, ease: INK_EASE.press },
      3.08)
    .fromTo('.catalog-heading',
      { autoAlpha: 0, clipPath: 'inset(0 100% 0 0)' },
      { autoAlpha: 1, clipPath: 'inset(0)', duration: 0.58, ease: INK_EASE.stroke },
      3.28)
    .fromTo(cards,
      { autoAlpha: 0, y: 16, clipPath: 'inset(0 0 100% 0)' },
      { autoAlpha: 1, y: 0, clipPath: 'inset(0)', duration: 0.68, stagger: 0.12, ease: INK_EASE.stroke },
      3.48)

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

  // 按屏幅裁剪：窄屏少开水纹，并整体加快一档；山水不做持续或全屏模糊。
  const waterPaths = gsap.utils.toArray('.landscape-water > path', scope)
  const media = gsap.matchMedia()

  media.add('(min-width: 641px)', () => {
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
