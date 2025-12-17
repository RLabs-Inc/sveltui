<script lang="ts">
import { Box, Text, Canvas, type CanvasContext, type Color } from '../index.ts'
import { getTheme } from '../theme/theme.svelte.ts'

const theme = getTheme()

// ============================================================================
// REACTIVE ANIMATION STATE - User drives the animation!
// When this state changes, the Canvas $effect re-runs and redraws
// ============================================================================

// Ball state - reactive!
let ballX = $state(20)
let ballY = $state(10)
let ballVx = $state(30)
let ballVy = $state(20)

// Particles state - reactive!
let particles = $state<{ x: number; y: number; vx: number; vy: number; r: number; g: number; b: number; life: number }[]>([])

// Time tracking
let lastTime = performance.now()

// Canvas dimensions - updated by onDraw, used by animation loop
// NOT reactive - just plain variables to avoid infinite loops
// Start small to avoid drawing outside bounds before we know real size
let canvasW = 20
let canvasH = 20

// Animation loop - updates positions AND handles bouncing
// Uses stored canvas dimensions
$effect(() => {
  const interval = setInterval(() => {
    const now = performance.now()
    const deltaTime = (now - lastTime) / 1000
    lastTime = now

    // Update ball position
    ballX += ballVx * deltaTime
    ballY += ballVy * deltaTime

    // Bounce off walls using stored canvas dimensions
    const margin = 4
    if (ballX <= margin || ballX >= canvasW - margin) {
      ballVx = -ballVx
      ballX = Math.max(margin, Math.min(canvasW - margin, ballX))
      // Spawn particles
      const colorHex = theme().colors.error ?? 0xff5555
      spawnParticles(ballX, ballY, colorHex)
    }
    if (ballY <= margin || ballY >= canvasH - margin) {
      ballVy = -ballVy
      ballY = Math.max(margin, Math.min(canvasH - margin, ballY))
      // Spawn particles
      const colorHex = theme().colors.info ?? 0x55aaff
      spawnParticles(ballX, ballY, colorHex)
    }

    // Update particles (position and lifetime)
    particles = particles
      .map(p => ({
        ...p,
        x: p.x + p.vx * deltaTime,
        y: p.y + p.vy * deltaTime,
        life: p.life - deltaTime * 2,
      }))
      .filter(p => p.life > 0)

  }, 16) // ~60fps

  return () => clearInterval(interval)
})

// Helper to spawn particles (called from setInterval, not from onDraw)
function spawnParticles(x: number, y: number, colorHex: number) {
  const r = (colorHex >> 16) & 0xff
  const g = (colorHex >> 8) & 0xff
  const b = colorHex & 0xff
  for (let i = 0; i < 5; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 40,
      vy: (Math.random() - 0.5) * 40,
      r, g, b,
      life: 1,
    })
  }
}

// ============================================================================
// STATIC DRAWING - Just draws based on theme colors
// ============================================================================
function onDrawStatic(ctx: CanvasContext) {
  const primary = ctx.color(theme().colors.primary)
  const success = ctx.color(theme().colors.success)
  const warning = ctx.color(theme().colors.warning)
  const error = ctx.color(theme().colors.error)
  const text = ctx.color(theme().colors.text ?? 0xffffff)

  // Draw border
  ctx.drawRect(0, 0, ctx.width, ctx.height, text)

  // Draw some shapes using theme colors
  ctx.fillRect(4, 4, 10, 6, error)
  ctx.fillRect(ctx.width - 14, 4, 10, 6, primary)

  // Draw circles
  ctx.fillCircle(ctx.width / 2, ctx.height / 2, 8, success)
  ctx.drawCircle(ctx.width / 2, ctx.height / 2, 12, warning)

  // Draw lines
  ctx.drawLine(0, 0, ctx.width - 1, ctx.height - 1, ctx.color(0x00ffff))
  ctx.drawLine(0, ctx.height - 1, ctx.width - 1, 0, ctx.color('magenta'))
}

// ============================================================================
// ANIMATED DRAWING - Only READS state, never writes!
// Writing state in onDraw causes infinite loops
// ============================================================================
function onDrawAnimated(ctx: CanvasContext) {
  // Store canvas dimensions for the animation loop to use
  // (plain assignment, not reactive, won't trigger re-render)
  canvasW = ctx.width
  canvasH = ctx.height

  // Get theme colors
  const bg = ctx.color(theme().colors.background ?? 0x1a1a2e)
  const primary = ctx.color(theme().colors.primary)
  const success = ctx.color(theme().colors.success)
  const warning = ctx.color(theme().colors.warning)
  const error = ctx.color(theme().colors.error)
  const info = ctx.color(theme().colors.info)
  const text = ctx.color(theme().colors.text ?? 0xffffff)

  // Clear with theme background
  ctx.clear(bg)

  // Draw particles - with bounds checking to prevent artifacts outside canvas
  for (const p of particles) {
    const px = Math.floor(p.x)
    const py = Math.floor(p.y)
    // Only draw if within canvas bounds
    if (px >= 0 && px < ctx.width && py >= 0 && py < ctx.height) {
      ctx.setPixel(px, py, { r: p.r, g: p.g, b: p.b, a: 255 })
    }
  }

  // Draw border
  ctx.drawRect(0, 0, ctx.width, ctx.height, text)

  // Draw ball - READING reactive state (triggers redraw when it changes)
  ctx.fillCircle(Math.floor(ballX), Math.floor(ballY), 3, warning)

  // Draw corner indicators
  ctx.fillRect(2, 2, 6, 4, error)
  ctx.fillRect(ctx.width - 8, 2, 6, 4, primary)
  ctx.fillRect(2, ctx.height - 6, 6, 4, success)
  ctx.fillRect(ctx.width - 8, ctx.height - 6, 6, 4, info)
}
</script>

<Box width="100%" height="100%" flexDirection="column" padding={1}>
  <Box border="single" borderColor={theme().colors.primary} padding={1} marginBottom={1}>
    <Text text="Canvas Demo - Fully Reactive Animation!" color={theme().colors.primary} bold />
  </Box>

  <Box flexDirection="row" gap={1} flexGrow={1}>
    <!-- Static drawing demo -->
    <Box flexDirection="column" flexGrow={1} flexBasis={0}>
      <Text text="Static Drawing:" color={theme().colors.textMuted} />
      <Canvas
        flexGrow={1}
        border="single"
        variant="success"
        backgroundColor={theme().colors.background}
        onDraw={onDrawStatic}
      />
    </Box>

    <!-- Animated demo - PURE REACTIVITY! -->
    <Box flexDirection="column" flexGrow={1} flexBasis={0}>
      <Text text="Animation:" color={theme().colors.textMuted} />
      <Canvas
        flexGrow={1}
        border="single"
        variant="warning"
        backgroundColor={theme().colors.background}
        onDraw={onDrawAnimated}
      />
    </Box>
  </Box>

  <Box marginTop={1}>
    <Text text="Animation driven by $state + setInterval → Canvas redraws reactively!" color={theme().colors.textMuted} />
  </Box>
</Box>
