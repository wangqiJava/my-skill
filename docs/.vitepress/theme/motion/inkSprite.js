export const INK_SPRITE_CONFIG = Object.freeze({
  source: '/images/ink-diffusion-sprite.png',
  cols: 8,
  rows: 4,
  frameCount: 30,
  fps: 52,
  frameWidth: 222,
  frameHeight: 222,
  inset: 2
})

const preloadCache = new Map()

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function preloadInkSprite(source = INK_SPRITE_CONFIG.source) {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (preloadCache.has(source)) return preloadCache.get(source).promise

  const state = { ready: false, promise: null }
  state.promise = new Promise((resolve) => {
    const image = new Image()
    image.onload = () => {
      state.ready = true
      resolve(true)
    }
    image.onerror = () => resolve(false)
    image.src = source
  })
  preloadCache.set(source, state)
  return state.promise
}

export function isInkSpriteReady(source = INK_SPRITE_CONFIG.source) {
  return Boolean(preloadCache.get(source)?.ready)
}

export function createInkSprite(options = {}) {
  if (typeof document === 'undefined') return null

  const config = { ...INK_SPRITE_CONFIG, ...options }
  const mount = config.mount || document.body
  const element = document.createElement('span')
  const className = ['ink-sprite', config.className].filter(Boolean).join(' ')
  let frame = 0
  let raf = 0

  element.className = className
  element.setAttribute('aria-hidden', 'true')
  element.style.width = `${config.frameWidth}px`
  element.style.height = `${config.frameHeight}px`
  element.style.backgroundImage = `url("${config.source}")`
  element.style.backgroundSize = `${config.cols * 100}% ${config.rows * 100}%`
  element.style.backgroundRepeat = 'no-repeat'
  element.style.setProperty('--ink-sprite-inset', `${config.inset}px`)
  element.style.setProperty('--ink-scale', '1')
  element.style.setProperty('--ink-rotation', '0deg')
  mount.appendChild(element)

  function renderFrame(nextFrame) {
    frame = clamp(Math.round(nextFrame), 0, config.frameCount - 1)
    const col = frame % config.cols
    const row = Math.floor(frame / config.cols)
    const x = config.cols === 1 ? 0 : col / (config.cols - 1) * 100
    const y = config.rows === 1 ? 0 : row / (config.rows - 1) * 100
    element.style.backgroundPosition = `${x}% ${y}%`
    element.dataset.frame = String(frame)
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf)
    raf = 0
  }

  function run(from, to, duration, onUpdate, onComplete, ease) {
    stop()
    const start = performance.now()
    const distance = to - from
    const tick = (now) => {
      const progress = clamp((now - start) / Math.max(1, duration), 0, 1)
      const easedProgress = ease ? ease(progress) : progress
      const nextFrame = from + distance * easedProgress
      renderFrame(nextFrame)
      onUpdate?.(easedProgress, frame)
      if (progress >= 1) {
        raf = 0
        onComplete?.()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
  }

  const api = {
    element,
    get frame() {
      return frame
    },
    get isPlaying() {
      return Boolean(raf)
    },
    play({ duration = 1000 / config.fps * (config.frameCount - 1), from = 0, onUpdate, onComplete, ease } = {}) {
      renderFrame(from)
      run(from, config.frameCount - 1, duration, onUpdate, onComplete, ease)
      return api
    },
    reverse({ duration = 380, onUpdate, onComplete } = {}) {
      run(frame, 0, duration, onUpdate, onComplete)
      return api
    },
    stop() {
      stop()
      return api
    },
    reset() {
      stop()
      renderFrame(0)
      return api
    },
    setFrame(nextFrame) {
      stop()
      renderFrame(nextFrame)
      return api
    },
    setPosition(x, y) {
      element.style.left = `${x}px`
      element.style.top = `${y}px`
      return api
    },
    setScale(scale) {
      element.style.setProperty('--ink-scale', String(scale))
      return api
    },
    setRotation(rotation) {
      element.style.setProperty('--ink-rotation', String(rotation))
      return api
    },
    setOpacity(opacity) {
      element.style.opacity = String(opacity)
      return api
    },
    destroy() {
      stop()
      element.remove()
    }
  }

  renderFrame(0)
  return api
}

export const useInkSprite = createInkSprite
