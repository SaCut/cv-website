/**
 * 16×16 multi-frame pixel-art sprites for CV sections.
 * Each sprite has 3-4 frames of actual pixel-level animation.
 * Subjects are chosen to be immediately recognisable at this resolution.
 */

type Frame = (string | null)[][]

export interface CVSpriteData {
  label: string
  frames: Frame[]
  /** ms per frame — lower = faster */
  interval: number
}

const _ = null

/* ── colour shorthand helpers ───────────────────── */

/* ── 1. MONITOR — About section ─────────────────── */
/* A terminal monitor with a blinking cursor and scrolling lines */

const MON_BODY = '#3a3a4a'
const MON_BEZEL = '#2a2a3a'
const MON_SCREEN = '#1a1a2e'
const MON_GREEN = '#4ade80'
const MON_CYAN = '#22d3ee'
const MON_STAND = '#555568'
const MON_DIM = '#2d4a3a'

const monitorBase: Frame = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_GREEN, MON_GREEN, MON_GREEN, MON_GREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_CYAN, MON_CYAN, MON_CYAN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_DIM, MON_DIM, MON_DIM, MON_DIM, MON_DIM, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_GREEN, MON_GREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, _],
  [_, _, _, _, _, _, MON_STAND, MON_STAND, MON_STAND, MON_STAND, _, _, _, _, _, _],
  [_, _, _, _, _, _, MON_STAND, MON_STAND, MON_STAND, MON_STAND, _, _, _, _, _, _],
  [_, _, _, _, MON_STAND, MON_STAND, MON_STAND, MON_STAND, MON_STAND, MON_STAND, MON_STAND, MON_STAND, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
]

// Frame 2: cursor appears, line shifts
const monitorF2: Frame = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_CYAN, MON_CYAN, MON_CYAN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_DIM, MON_DIM, MON_DIM, MON_DIM, MON_DIM, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_GREEN, MON_GREEN, MON_GREEN, MON_GREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_CYAN, MON_CYAN, MON_CYAN, MON_CYAN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_GREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, _],
  [_, _, _, _, _, _, MON_STAND, MON_STAND, MON_STAND, MON_STAND, _, _, _, _, _, _],
  [_, _, _, _, _, _, MON_STAND, MON_STAND, MON_STAND, MON_STAND, _, _, _, _, _, _],
  [_, _, _, _, MON_STAND, MON_STAND, MON_STAND, MON_STAND, MON_STAND, MON_STAND, MON_STAND, MON_STAND, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
]

// Frame 3: cursor blink off, new lines
const monitorF3: Frame = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_DIM, MON_DIM, MON_DIM, MON_DIM, MON_DIM, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_GREEN, MON_GREEN, MON_GREEN, MON_GREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_CYAN, MON_CYAN, MON_CYAN, MON_CYAN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_GREEN, MON_GREEN, MON_GREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_SCREEN, MON_BEZEL, _],
  [_, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, MON_BEZEL, _],
  [_, _, _, _, _, _, MON_STAND, MON_STAND, MON_STAND, MON_STAND, _, _, _, _, _, _],
  [_, _, _, _, _, _, MON_STAND, MON_STAND, MON_STAND, MON_STAND, _, _, _, _, _, _],
  [_, _, _, _, MON_STAND, MON_STAND, MON_STAND, MON_STAND, MON_STAND, MON_STAND, MON_STAND, MON_STAND, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
]

/* ── 2. LIGHTNING BOLT — Skills section ─────────── */
/* Pulses: normal → bright flash → dim */

const LT_YEL = '#fbbf24'
const LT_BRI = '#fef9c3'
const LT_DRK = '#b45309'
const LT_DIM = '#78350f'

// Frame 1: normal charge
const gearsF1: Frame = [
  [  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,  _,LT_BRI,LT_YEL,LT_YEL,LT_YEL,LT_YEL,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,LT_BRI,LT_YEL,LT_YEL,LT_YEL,LT_YEL,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,LT_BRI,LT_YEL,LT_YEL,LT_YEL,LT_YEL,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,LT_BRI,LT_YEL,LT_YEL,LT_YEL,LT_YEL,LT_YEL,LT_YEL,LT_YEL,LT_YEL,  _,  _,  _,  _],
  [  _,  _,  _,LT_YEL,LT_YEL,LT_YEL,LT_YEL,LT_YEL,LT_YEL,LT_YEL,LT_DRK,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,  _,LT_YEL,LT_YEL,LT_YEL,LT_DRK,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,LT_YEL,LT_YEL,LT_YEL,LT_DRK,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,LT_YEL,LT_YEL,LT_YEL,LT_DRK,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,LT_YEL,LT_YEL,LT_YEL,LT_DRK,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,LT_YEL,LT_YEL,LT_YEL,LT_DRK,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,LT_YEL,LT_DRK,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
]

// Frame 2: gentle warm glow (no harsh white)
const gearsF2: Frame = [
  [  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,  _,LT_BRI,LT_BRI,LT_BRI,LT_BRI,LT_YEL,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,LT_BRI,LT_BRI,LT_BRI,LT_BRI,LT_YEL,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,LT_BRI,LT_BRI,LT_BRI,LT_BRI,LT_YEL,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,LT_BRI,LT_BRI,LT_BRI,LT_BRI,LT_BRI,LT_BRI,LT_BRI,LT_BRI,LT_YEL,  _,  _,  _,  _],
  [  _,  _,  _,LT_YEL,LT_BRI,LT_BRI,LT_BRI,LT_BRI,LT_BRI,LT_BRI,LT_DRK,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,  _,LT_YEL,LT_BRI,LT_BRI,LT_DRK,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,LT_YEL,LT_BRI,LT_BRI,LT_DRK,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,LT_YEL,LT_BRI,LT_BRI,LT_DRK,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,LT_YEL,LT_BRI,LT_BRI,LT_DRK,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,LT_YEL,LT_BRI,LT_BRI,LT_DRK,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,LT_YEL,LT_DRK,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
]

// Frame 3: dim (post-flash)
const gearsF3: Frame = [
  [  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,  _,LT_YEL,LT_DRK,LT_DRK,LT_DRK,LT_DRK,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,LT_YEL,LT_DRK,LT_DRK,LT_DRK,LT_DRK,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,LT_YEL,LT_DRK,LT_DRK,LT_DRK,LT_DRK,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,LT_YEL,LT_DRK,LT_DRK,LT_DRK,LT_DRK,LT_DRK,LT_DRK,LT_DRK,LT_DRK,  _,  _,  _,  _],
  [  _,  _,  _,LT_DRK,LT_DRK,LT_DRK,LT_DRK,LT_DRK,LT_DRK,LT_DRK,LT_DIM,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,  _,LT_DRK,LT_DRK,LT_DRK,LT_DIM,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,LT_DRK,LT_DRK,LT_DRK,LT_DIM,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,LT_DRK,LT_DRK,LT_DRK,LT_DIM,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,LT_DRK,LT_DRK,LT_DRK,LT_DIM,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,LT_DRK,LT_DRK,LT_DRK,LT_DIM,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,LT_DRK,LT_DIM,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
]


/* ── 3. SERVER RACK — Experience section ────────── */
/* Rack with blinking status lights */

const RK_FRAME = '#4a4a5a'
const RK_PANEL = '#2a2a3a'
const RK_SLOT = '#1e1e2e'
const RK_LED_G = '#4ade80'
const RK_LED_Y = '#facc15'
const RK_LED_B = '#3b82f6'
const RK_LED_OFF = '#333344'
const RK_VENT = '#3a3a4a'

const rackF1: Frame = [
  [_, _, _, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_SLOT, RK_LED_G, RK_SLOT, RK_SLOT, RK_SLOT, RK_LED_B, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_VENT, RK_VENT, RK_VENT, RK_VENT, RK_VENT, RK_VENT, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_SLOT, RK_LED_G, RK_SLOT, RK_SLOT, RK_SLOT, RK_LED_G, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_VENT, RK_VENT, RK_VENT, RK_VENT, RK_VENT, RK_VENT, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_SLOT, RK_LED_Y, RK_SLOT, RK_SLOT, RK_SLOT, RK_LED_G, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
]

// Lights blink pattern 2
const rackF2: Frame = [
  [_, _, _, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_SLOT, RK_LED_G, RK_SLOT, RK_SLOT, RK_SLOT, RK_LED_G, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_VENT, RK_VENT, RK_VENT, RK_VENT, RK_VENT, RK_VENT, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_SLOT, RK_LED_B, RK_SLOT, RK_SLOT, RK_SLOT, RK_LED_OFF, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_VENT, RK_VENT, RK_VENT, RK_VENT, RK_VENT, RK_VENT, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_SLOT, RK_LED_G, RK_SLOT, RK_SLOT, RK_SLOT, RK_LED_G, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
]

// Lights blink pattern 3
const rackF3: Frame = [
  [_, _, _, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_SLOT, RK_LED_OFF, RK_SLOT, RK_SLOT, RK_SLOT, RK_LED_G, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_VENT, RK_VENT, RK_VENT, RK_VENT, RK_VENT, RK_VENT, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_SLOT, RK_LED_G, RK_SLOT, RK_SLOT, RK_SLOT, RK_LED_B, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_SLOT, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_VENT, RK_VENT, RK_VENT, RK_VENT, RK_VENT, RK_VENT, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_SLOT, RK_LED_Y, RK_SLOT, RK_SLOT, RK_SLOT, RK_LED_OFF, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_PANEL, RK_FRAME, _, _, _],
  [_, _, _, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, RK_FRAME, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
]


/* ── 4. FLASK + BUBBLES — Projects section ──────── */
/* Erlenmeyer flask with rising bubbles */

const FL_GLASS = '#b8c4d0'
const FL_LIQ = '#3b82f6'
const FL_LIQHI = '#60a5fa'
const FL_BUBBLE = '#93c5fd'
const FL_CORK = '#a3785a'

const flaskF1: Frame = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, FL_CORK, FL_CORK, FL_CORK, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, FL_GLASS, FL_GLASS, FL_GLASS, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, FL_GLASS, _, FL_GLASS, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, FL_GLASS, _, FL_GLASS, _, _, _, _, _, _, _],
  [_, _, _, _, _, FL_GLASS, FL_GLASS, _, FL_GLASS, FL_GLASS, _, _, _, _, _, _],
  [_, _, _, _, FL_GLASS, _, _, _, _, _, FL_GLASS, _, _, _, _, _],
  [_, _, _, FL_GLASS, _, _, _, _, _, _, _, FL_GLASS, _, _, _, _],
  [_, _, FL_GLASS, _, _, _, FL_BUBBLE, _, _, _, _, _, FL_GLASS, _, _, _],
  [_, _, FL_GLASS, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_GLASS, _, _, _],
  [_, _, FL_GLASS, FL_LIQ, FL_LIQ, FL_LIQHI, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQHI, FL_LIQ, FL_LIQ, FL_GLASS, _, _, _],
  [_, _, FL_GLASS, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_GLASS, _, _, _],
  [_, _, FL_GLASS, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_GLASS, _, _, _],
  [_, _, _, FL_GLASS, FL_GLASS, FL_GLASS, FL_GLASS, FL_GLASS, FL_GLASS, FL_GLASS, FL_GLASS, FL_GLASS, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
]

// Bubble rises
const flaskF2: Frame = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, FL_CORK, FL_CORK, FL_CORK, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, FL_GLASS, FL_GLASS, FL_GLASS, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, FL_GLASS, _, FL_GLASS, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, FL_GLASS, _, FL_GLASS, _, _, _, _, _, _, _],
  [_, _, _, _, _, FL_GLASS, FL_GLASS, _, FL_GLASS, FL_GLASS, _, _, _, _, _, _],
  [_, _, _, _, FL_GLASS, _, _, FL_BUBBLE, _, _, FL_GLASS, _, _, _, _, _],
  [_, _, _, FL_GLASS, _, _, _, _, _, _, _, FL_GLASS, _, _, _, _],
  [_, _, FL_GLASS, _, _, _, _, _, _, FL_BUBBLE, _, _, FL_GLASS, _, _, _],
  [_, _, FL_GLASS, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_GLASS, _, _, _],
  [_, _, FL_GLASS, FL_LIQ, FL_LIQHI, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQHI, FL_LIQ, FL_LIQ, FL_LIQ, FL_GLASS, _, _, _],
  [_, _, FL_GLASS, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_GLASS, _, _, _],
  [_, _, FL_GLASS, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_GLASS, _, _, _],
  [_, _, _, FL_GLASS, FL_GLASS, FL_GLASS, FL_GLASS, FL_GLASS, FL_GLASS, FL_GLASS, FL_GLASS, FL_GLASS, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
]

// Bubble higher + new bubble
const flaskF3: Frame = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, FL_CORK, FL_CORK, FL_CORK, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, FL_GLASS, FL_GLASS, FL_GLASS, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, FL_GLASS, _, FL_GLASS, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, FL_GLASS, FL_BUBBLE, FL_GLASS, _, _, _, _, _, _, _],
  [_, _, _, _, _, FL_GLASS, FL_GLASS, _, FL_GLASS, FL_GLASS, _, _, _, _, _, _],
  [_, _, _, _, FL_GLASS, _, _, _, _, _, FL_GLASS, _, _, _, _, _],
  [_, _, _, FL_GLASS, _, _, _, _, FL_BUBBLE, _, _, FL_GLASS, _, _, _, _],
  [_, _, FL_GLASS, _, _, _, _, _, _, _, _, _, FL_GLASS, _, _, _],
  [_, _, FL_GLASS, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_GLASS, _, _, _],
  [_, _, FL_GLASS, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQHI, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQHI, FL_LIQ, FL_GLASS, _, _, _],
  [_, _, FL_GLASS, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_BUBBLE, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_GLASS, _, _, _],
  [_, _, FL_GLASS, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_LIQ, FL_GLASS, _, _, _],
  [_, _, _, FL_GLASS, FL_GLASS, FL_GLASS, FL_GLASS, FL_GLASS, FL_GLASS, FL_GLASS, FL_GLASS, FL_GLASS, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
]


/* ── 5. SCROLL — Education section ──────────────── */
/* An unrolled diploma/scroll */

const SC_PAPER = '#f5e6c8'
const SC_PAPHI = '#faf0dc'
const SC_ROLL = '#d4a574'
const SC_ROLLHI = '#e0b888'
const SC_INK = '#5b4636'
const SC_SEAL = '#dc2626'
const SC_SEALHI = '#ef4444'
const SC_RIBBON = '#facc15'

const scrollF1: Frame = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, SC_ROLL, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_INK, SC_INK, SC_INK, SC_INK, SC_INK, SC_INK, SC_INK, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_INK, SC_INK, SC_INK, SC_INK, SC_INK, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_INK, SC_INK, SC_INK, SC_INK, SC_INK, SC_INK, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_SEAL, SC_SEAL, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_SEAL, SC_SEALHI, SC_SEALHI, SC_SEAL, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_SEAL, SC_SEAL, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLL, _, _, _],
  [_, _, _, _, _, _, _, SC_RIBBON, SC_RIBBON, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, SC_RIBBON, _, _, SC_RIBBON, _, _, _, _, _, _],
]

// Seal glints
const scrollF2: Frame = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, SC_ROLL, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_INK, SC_INK, SC_INK, SC_INK, SC_INK, SC_INK, SC_INK, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_INK, SC_INK, SC_INK, SC_INK, SC_INK, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_INK, SC_INK, SC_INK, SC_INK, SC_INK, SC_INK, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_SEALHI, SC_SEALHI, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_SEALHI, '#fff', '#fff', SC_SEALHI, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_SEALHI, SC_SEALHI, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLL, _, _, _],
  [_, _, _, _, _, _, _, SC_RIBBON, SC_RIBBON, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, SC_RIBBON, _, _, SC_RIBBON, _, _, _, _, _, _],
]

// Ribbon sways
const scrollF3: Frame = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, SC_ROLL, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_INK, SC_INK, SC_INK, SC_INK, SC_INK, SC_INK, SC_INK, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_INK, SC_INK, SC_INK, SC_INK, SC_INK, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_INK, SC_INK, SC_INK, SC_INK, SC_INK, SC_INK, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_SEAL, SC_SEAL, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_SEAL, SC_SEALHI, SC_SEALHI, SC_SEAL, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_PAPER, SC_PAPER, SC_PAPER, SC_PAPER, SC_SEAL, SC_SEAL, SC_PAPER, SC_PAPER, SC_PAPER, SC_ROLL, _, _, _],
  [_, _, SC_ROLL, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLLHI, SC_ROLL, _, _, _],
  [_, _, _, _, _, _, SC_RIBBON, SC_RIBBON, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, SC_RIBBON, _, _, SC_RIBBON, _, _, _, _, _, _, _],
]


/* ── 6. QUOTE MARKS — Manager quotes section ───── */
/* Large quotation marks that pulse */

const QT_MARK = '#7c3aed'
const QT_HI = '#a78bfa'
const QT_DIM = '#5b21b6'

const quoteF1: Frame = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, QT_MARK, QT_MARK, QT_MARK, _, _, QT_MARK, QT_MARK, QT_MARK, _, _, _, _, _, _],
  [_, _, QT_MARK, QT_HI, QT_MARK, _, _, QT_MARK, QT_HI, QT_MARK, _, _, _, _, _, _],
  [_, _, QT_MARK, QT_MARK, QT_MARK, _, _, QT_MARK, QT_MARK, QT_MARK, _, _, _, _, _, _],
  [_, _, _, QT_MARK, QT_MARK, _, _, _, QT_MARK, QT_MARK, _, _, _, _, _, _],
  [_, _, _, _, QT_MARK, _, _, _, _, QT_MARK, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, QT_DIM, _, _, _, _, _, QT_DIM, _, _, _],
  [_, _, _, _, _, _, QT_DIM, QT_DIM, _, _, _, QT_DIM, QT_DIM, _, _, _],
  [_, _, _, _, _, _, QT_DIM, QT_MARK, QT_DIM, _, _, QT_DIM, QT_MARK, QT_DIM, _, _],
  [_, _, _, _, _, _, QT_DIM, QT_MARK, QT_DIM, _, _, QT_DIM, QT_MARK, QT_DIM, _, _],
  [_, _, _, _, _, _, QT_DIM, QT_DIM, QT_DIM, _, _, QT_DIM, QT_DIM, QT_DIM, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
]

// Pulse brighter
const quoteF2: Frame = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, QT_HI, QT_HI, QT_HI, _, _, QT_HI, QT_HI, QT_HI, _, _, _, _, _, _],
  [_, _, QT_HI, '#ddd6fe', QT_HI, _, _, QT_HI, '#ddd6fe', QT_HI, _, _, _, _, _, _],
  [_, _, QT_HI, QT_HI, QT_HI, _, _, QT_HI, QT_HI, QT_HI, _, _, _, _, _, _],
  [_, _, _, QT_HI, QT_HI, _, _, _, QT_HI, QT_HI, _, _, _, _, _, _],
  [_, _, _, _, QT_HI, _, _, _, _, QT_HI, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, QT_MARK, _, _, _, _, _, QT_MARK, _, _, _],
  [_, _, _, _, _, _, QT_MARK, QT_MARK, _, _, _, QT_MARK, QT_MARK, _, _, _],
  [_, _, _, _, _, _, QT_MARK, QT_HI, QT_MARK, _, _, QT_MARK, QT_HI, QT_MARK, _, _],
  [_, _, _, _, _, _, QT_MARK, QT_HI, QT_MARK, _, _, QT_MARK, QT_HI, QT_MARK, _, _],
  [_, _, _, _, _, _, QT_MARK, QT_MARK, QT_MARK, _, _, QT_MARK, QT_MARK, QT_MARK, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
]


/* ── 7. DOG — Footer ───────────────────────────── */
/* Sitting golden dog: blink + tail wag */

const DG_F  = '#d97706'   // amber fur
const DG_L  = '#f59e0b'   // light fur (chest, inner ear)
const DG_D  = '#92400e'   // dark fur (ears, outline)
const DG_E  = '#1c1917'   // eye / nose
const DG_C  = '#fef9c3'   // cream muzzle
const DG_T  = '#fb7185'   // tongue
const DG_TL = '#78350f'   // tail tip (darker)

// Frame 1: eyes open, tail up-right
const catF1: Frame = [
  [  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,DG_F,DG_F,DG_F,DG_F,DG_F,  _,  _,  _,  _,  _,  _],  // top of round head
  [  _,  _,DG_D,DG_D,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_D,DG_D,  _,  _,  _],  // floppy ears
  [  _,DG_D,DG_D,DG_L,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_L,DG_D,DG_D,  _,  _],  // ears wider
  [  _,DG_D,DG_D,DG_F,DG_F,DG_E,DG_F,DG_F,DG_F,DG_E,DG_F,DG_F,DG_D,DG_D,  _,  _],  // EYES
  [  _,DG_D,DG_D,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_D,DG_D,  _,  _],
  [  _,  _,DG_D,DG_F,DG_F,DG_C,DG_C,DG_C,DG_C,DG_C,DG_C,DG_F,DG_D,  _,  _,  _],  // muzzle
  [  _,  _,  _,DG_F,DG_C,DG_C,DG_C,DG_E,DG_C,DG_C,DG_C,DG_F,  _,  _,  _,  _],  // NOSE centre
  [  _,  _,  _,DG_F,DG_C,DG_C,DG_T,DG_T,DG_T,DG_C,DG_C,DG_F,  _,  _,  _,  _],  // TONGUE
  [  _,  _,  _,  _,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,  _,  _,  _,  _,  _],  // chin
  [  _,  _,  _,DG_F,DG_L,DG_F,DG_F,DG_F,DG_F,DG_F,DG_L,DG_F,  _,  _,DG_D,  _],  // chest + tail base up
  [  _,  _,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,  _,DG_D,DG_TL,  _],  // body + tail
  [  _,  _,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,  _,  _,  _,  _],  // body
  [  _,  _,DG_D,DG_D,DG_F,  _,  _,  _,  _,DG_F,DG_D,DG_D,  _,  _,  _,  _],  // legs
  [  _,DG_D,DG_D,  _,  _,  _,  _,  _,  _,  _,  _,DG_D,DG_D,  _,  _,  _],  // paws
  [  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
]

// Frame 2: eyes blink (closed), tail right (horizontal)
const catF2: Frame = [
  [  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,DG_F,DG_F,DG_F,DG_F,DG_F,  _,  _,  _,  _,  _,  _],
  [  _,  _,DG_D,DG_D,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_D,DG_D,  _,  _,  _],
  [  _,DG_D,DG_D,DG_L,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_L,DG_D,DG_D,  _,  _],
  [  _,DG_D,DG_D,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_D,DG_D,  _,  _],  // eyes CLOSED (no DG_E)
  [  _,DG_D,DG_D,DG_F,DG_D,DG_D,DG_F,DG_F,DG_F,DG_D,DG_D,DG_F,DG_D,DG_D,  _,  _],  // squint lines
  [  _,  _,DG_D,DG_F,DG_F,DG_C,DG_C,DG_C,DG_C,DG_C,DG_C,DG_F,DG_D,  _,  _,  _],
  [  _,  _,  _,DG_F,DG_C,DG_C,DG_C,DG_E,DG_C,DG_C,DG_C,DG_F,  _,  _,  _,  _],
  [  _,  _,  _,DG_F,DG_C,DG_C,DG_T,DG_T,DG_T,DG_C,DG_C,DG_F,  _,  _,  _,  _],
  [  _,  _,  _,  _,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,  _,  _,  _,  _,  _],
  [  _,  _,  _,DG_F,DG_L,DG_F,DG_F,DG_F,DG_F,DG_F,DG_L,DG_F,  _,  _,  _,  _],
  [  _,  _,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_D,DG_D,DG_TL,  _],  // tail horizontal
  [  _,  _,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,  _,  _,  _,  _],
  [  _,  _,DG_D,DG_D,DG_F,  _,  _,  _,  _,DG_F,DG_D,DG_D,  _,  _,  _,  _],
  [  _,DG_D,DG_D,  _,  _,  _,  _,  _,  _,  _,  _,DG_D,DG_D,  _,  _,  _],
  [  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
]

// Frame 3: eyes open, tail down-right
const catF3: Frame = [
  [  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [  _,  _,  _,  _,  _,DG_F,DG_F,DG_F,DG_F,DG_F,  _,  _,  _,  _,  _,  _],
  [  _,  _,DG_D,DG_D,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_D,DG_D,  _,  _,  _],
  [  _,DG_D,DG_D,DG_L,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_L,DG_D,DG_D,  _,  _],
  [  _,DG_D,DG_D,DG_F,DG_F,DG_E,DG_F,DG_F,DG_F,DG_E,DG_F,DG_F,DG_D,DG_D,  _,  _],  // EYES open
  [  _,DG_D,DG_D,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_D,DG_D,  _,  _],
  [  _,  _,DG_D,DG_F,DG_F,DG_C,DG_C,DG_C,DG_C,DG_C,DG_C,DG_F,DG_D,  _,  _,  _],
  [  _,  _,  _,DG_F,DG_C,DG_C,DG_C,DG_E,DG_C,DG_C,DG_C,DG_F,  _,  _,  _,  _],
  [  _,  _,  _,DG_F,DG_C,DG_C,DG_T,DG_T,DG_T,DG_C,DG_C,DG_F,  _,  _,  _,  _],
  [  _,  _,  _,  _,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,  _,  _,  _,  _,  _],
  [  _,  _,  _,DG_F,DG_L,DG_F,DG_F,DG_F,DG_F,DG_F,DG_L,DG_F,  _,  _,  _,  _],
  [  _,  _,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,  _,  _,  _,  _],
  [  _,  _,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_F,DG_D,  _,  _,  _],  // tail angled down
  [  _,  _,DG_D,DG_D,DG_F,  _,  _,  _,  _,DG_F,DG_D,DG_D,  _,DG_TL,  _,  _],  // legs + tail tip
  [  _,DG_D,DG_D,  _,  _,  _,  _,  _,  _,  _,  _,DG_D,DG_D,  _,  _,  _],
  [  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
]


/* ── export ─────────────────────────────────────── */

export const CV_SPRITES: Record<string, CVSpriteData> = {
  monitor:  { label: 'terminal',     frames: [monitorBase, monitorF2, monitorF3], interval: 800 },
  gears:    { label: 'lightning',    frames: [gearsF1, gearsF2, gearsF3],         interval: 900 },
  rack:     { label: 'server rack',  frames: [rackF1, rackF2, rackF3],            interval: 900 },
  flask:    { label: 'flask',        frames: [flaskF1, flaskF2, flaskF3],          interval: 700 },
  scroll:   { label: 'scroll',       frames: [scrollF1, scrollF2, scrollF3],       interval: 1200 },
  quotes:   { label: 'quote marks',  frames: [quoteF1, quoteF2],                  interval: 1400 },
  cat:      { label: 'dog',          frames: [catF1, catF2, catF3],                interval: 900 },
}
