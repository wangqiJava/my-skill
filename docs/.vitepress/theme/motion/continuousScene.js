const FALLBACK_FRAME_COUNT = 36
const FALLBACK_FRAMES = Array.from({ length: FALLBACK_FRAME_COUNT }, (_, index) => `frame-${String(index).padStart(3, '0')}.webp`)

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value))
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = source
  })
}

function basePath() {
  const configuredBase = import.meta.env?.BASE_URL || '/'
  return `${configuredBase.replace(/\/$/, '')}/images/continuous-scene/`
}

function getProgress(track) {
  const bounds = track.getBoundingClientRect()
  const scrollLength = Math.max(1, track.offsetHeight - window.innerHeight)
  return clamp(-bounds.top / scrollLength)
}

export function createContinuousScene(track, canvas, stage) {
  if (!track || !canvas) return () => {}

  const context = canvas.getContext('2d', { alpha: false })
  if (!context) return () => {}

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const heroScene = stage?.querySelector('.hero-ink-scene')
  const frameImages = []
  let destroyed = false
  let frameRequest = 0
  let currentProgress = 0
  let targetProgress = 0
  let lastFrame = -1
  let lastTime = performance.now()
  let viewportWidth = 0
  let viewportHeight = 0
  let devicePixelRatio = 1

  const draw = (progress) => {
    if (!frameImages.length || destroyed) return
    const frameIndex = Math.round(progress * (frameImages.length - 1))
    const image = frameImages[frameIndex]
    if (!image || frameIndex === lastFrame) return
    lastFrame = frameIndex

    const sourceRatio = image.naturalWidth / image.naturalHeight
    const viewportRatio = viewportWidth / Math.max(1, viewportHeight)
    let drawWidth = viewportWidth
    let drawHeight = viewportHeight
    let offsetX = 0
    let offsetY = 0

    if (sourceRatio > viewportRatio) {
      drawHeight = viewportHeight
      drawWidth = drawHeight * sourceRatio
      offsetX = (viewportWidth - drawWidth) / 2
    } else {
      drawWidth = viewportWidth
      drawHeight = drawWidth / sourceRatio
      offsetY = (viewportHeight - drawHeight) / 2
    }

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(
      image,
      offsetX * devicePixelRatio,
      offsetY * devicePixelRatio,
      drawWidth * devicePixelRatio,
      drawHeight * devicePixelRatio,
    )
  }

  const setCanvasSize = () => {
    const bounds = canvas.getBoundingClientRect()
    viewportWidth = Math.max(1, bounds.width)
    viewportHeight = Math.max(1, bounds.height)
    devicePixelRatio = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(viewportWidth * devicePixelRatio)
    canvas.height = Math.round(viewportHeight * devicePixelRatio)
    context.setTransform(1, 0, 0, 1, 0, 0)
    lastFrame = -1
    draw(currentProgress)
  }

  const setCanvasOpacity = (progress) => {
    if (reducedMotion.matches) {
      canvas.style.opacity = '0'
      return
    }
    const reveal = clamp((progress - 0.015) / 0.075)
    const settle = 1 - clamp((progress - 0.9) / 0.1)
    canvas.style.opacity = String(reveal * settle)
  }

  const setHeroOpacity = (progress) => {
    if (!heroScene) return
    if (reducedMotion.matches) {
      heroScene.style.opacity = '1'
      return
    }
    const handoff = clamp((progress - 0.012) / 0.105)
    heroScene.style.opacity = String(1 - handoff)
  }

  const tick = (time) => {
    if (destroyed) return
    const elapsed = Math.min(80, Math.max(1, time - lastTime))
    lastTime = time
    const easing = 1 - Math.exp(-elapsed / 145)
    currentProgress += (targetProgress - currentProgress) * easing
    if (Math.abs(targetProgress - currentProgress) < 0.0003) currentProgress = targetProgress
    setCanvasOpacity(currentProgress)
    setHeroOpacity(currentProgress)
    draw(currentProgress)

    if (Math.abs(targetProgress - currentProgress) > 0.0003) {
      frameRequest = requestAnimationFrame(tick)
    } else {
      frameRequest = 0
    }
  }

  const requestRender = () => {
    targetProgress = getProgress(track)
    if (reducedMotion.matches) {
      currentProgress = targetProgress
      setCanvasOpacity(targetProgress)
      setHeroOpacity(targetProgress)
      draw(targetProgress)
      return
    }
    if (!frameRequest) {
      lastTime = performance.now()
      frameRequest = requestAnimationFrame(tick)
    }
  }

  const onScroll = () => requestRender()
  const onResize = () => {
    syncTrackHeight()
    setCanvasSize()
    requestRender()
  }
  const onMotionPreferenceChange = () => requestRender()

  const syncTrackHeight = () => {
    if (!stage) return
    const minimum = window.innerHeight * 1.9
    const maximum = window.innerHeight * 2.65
    const height = Math.max(minimum, Math.min(stage.offsetHeight, maximum))
    track.style.height = `${Math.round(height)}px`
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', onMotionPreferenceChange)

  syncTrackHeight()
  setCanvasSize()
  setCanvasOpacity(0)
  setHeroOpacity(0)

  const manifestUrl = `${basePath()}manifest.json`
  fetch(manifestUrl)
    .then((response) => response.ok ? response.json() : Promise.reject(new Error('continuous scene manifest unavailable')))
    .catch(() => ({ frames: FALLBACK_FRAMES }))
    .then((manifest) => Promise.all((manifest.frames || FALLBACK_FRAMES).map((frame) => loadImage(`${basePath()}${frame}`))))
    .then((images) => {
      if (destroyed) return
      frameImages.push(...images)
      syncTrackHeight()
      setCanvasSize()
      requestRender()
    })
    .catch(() => {})

  return () => {
    destroyed = true
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onResize)
    if (reducedMotion.removeEventListener) reducedMotion.removeEventListener('change', onMotionPreferenceChange)
    if (frameRequest) cancelAnimationFrame(frameRequest)
    track.style.removeProperty('height')
    heroScene?.style.removeProperty('opacity')
    frameImages.length = 0
  }
}
