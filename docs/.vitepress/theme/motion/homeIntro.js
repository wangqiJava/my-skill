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
 * 首屏场景时间线：只负责山水布景与渗墨点缀。
 * 题字、钤印、副题与目录入场交给 CSS 的 .stage.is-in 动画——
 * 内容不等待 GSAP，也不会在 GSAP 就绪时被藏掉重播。
 */
export function createHomeIntro(scope) {
  const intro = gsap.timeline({ defaults: { ease: INK_EASE.stroke } })

  // 布景即刻开始，不再留整段空白气口；题字由 CSS 同步落墨。
  intro
    // 整幅山水先洇出纸面，再由各层分别落墨。
    .fromTo('.landscape-wash',
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.5, ease: INK_EASE.bloom },
      0)
    .fromTo('.landscape-mountains',
      { autoAlpha: 0, y: 80, scaleY: 0.82 },
      { autoAlpha: 0.8, y: 55, scaleY: 0.82, duration: 0.85, ease: INK_EASE.bloom },
      0.05)
    // 水纹横扫：先窄后宽，像一笔带过。
    .fromTo('.landscape-water > path',
      { autoAlpha: 0, scaleX: 0.72 },
      { autoAlpha: 0.75, scaleX: 1, duration: 0.6, stagger: 0.07 },
      0.3)
    // 雾气洇开，最慢的一层，用来托住前面的墨。
    .fromTo('.landscape-mist-breath',
      { autoAlpha: 0, xPercent: -8 },
      { autoAlpha: 0.6, xPercent: 0, duration: 0.9, ease: INK_EASE.bloom },
      0.45)
    .fromTo('.plum-picture',
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.5, ease: INK_EASE.bloom },
      0.55)

  // 渗墨点缀：题字由 CSS 落笔（820ms，两 span 错峰 120ms），写成后推一次墨，只装饰不挡内容。
  gsap.utils.toArray('.brush-mark > span', scope).forEach((char, index) => {
    const written = 0.85 + index * 0.12
    intro
      .to(char, { '--ink-bleed': 1, duration: 0.12, ease: 'power2.out' }, written)
      .to(char, { '--ink-bleed': 0, duration: 0.55, ease: 'power2.out' }, written + 0.12)
  })

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
