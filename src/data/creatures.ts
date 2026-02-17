import type { Voxel, CreatureData } from '../types'

/* ── helpers ─────────────────────────────────────────── */

function box(
  x1: number, y1: number, z1: number,
  x2: number, y2: number, z2: number,
  color: string,
): Voxel[] {
  const out: Voxel[] = []
  for (let x = x1; x <= x2; x++)
    for (let y = y1; y <= y2; y++)
      for (let z = z1; z <= z2; z++)
        out.push({ x, y, z, color })
  return out
}

function v(x: number, y: number, z: number, color: string): Voxel {
  return { x, y, z, color }
}

/* mirror on Z axis around centre=4 (for bilateral symmetry) */
function mirror(voxels: Voxel[]): Voxel[] {
  const extra: Voxel[] = []
  for (const vx of voxels) {
    const mz = 8 - vx.z
    if (mz !== vx.z) extra.push({ ...vx, z: mz })
  }
  return [...voxels, ...extra]
}

/* ── creatures ───────────────────────────────────────── */

const CAT: CreatureData = {
  name: 'cat',
  primaryColor: '#FF8C00',
  scale: 0.55,
  animation: 'sway',
  voxels: mirror([
    // body (chunky torso)
    ...box(2, 2, 3, 7, 5, 4, '#FF8C00'),
    ...box(3, 1, 3, 6, 2, 4, '#FF8C00'),
    // belly lighter
    ...box(3, 2, 3, 6, 3, 3, '#FFB347'),
    // head
    ...box(7, 3, 2, 10, 6, 4, '#FF8C00'),
    ...box(8, 2, 3, 9, 3, 4, '#FF8C00'), // chin
    // ears
    v(7, 7, 2, '#FF8C00'), v(10, 7, 2, '#FF8C00'),
    v(7, 7, 3, '#FFB347'), v(10, 7, 3, '#FFB347'), // inner ear
    // eyes
    v(9, 5, 2, '#44DD66'), v(8, 5, 2, '#44DD66'),
    v(9, 5, 1, '#111111'), v(8, 5, 1, '#111111'), // pupils
    // nose
    v(10, 4, 3, '#FF6699'),
    // whiskers (single voxel hints)
    v(11, 4, 2, '#FFDDAA'), v(11, 4, 4, '#FFDDAA'),
    // front legs
    ...box(6, 0, 3, 7, 1, 3, '#E07B00'),
    ...box(6, 0, 4, 7, 1, 4, '#E07B00'),
    // back legs
    ...box(2, 0, 3, 3, 1, 3, '#E07B00'),
    ...box(2, 0, 4, 3, 1, 4, '#E07B00'),
    // paws
    v(7, 0, 3, '#FFB347'), v(7, 0, 4, '#FFB347'),
    v(2, 0, 3, '#FFB347'), v(2, 0, 4, '#FFB347'),
    // tail curving up
    v(1, 5, 4, '#E07B00'), v(0, 6, 4, '#E07B00'),
    v(0, 7, 4, '#E07B00'), v(0, 8, 4, '#FFB347'),
    // stripes on back
    v(4, 5, 3, '#E07B00'), v(5, 5, 4, '#E07B00'),
    v(3, 5, 4, '#E07B00'),
  ]),
}

const ROCKET: CreatureData = {
  name: 'rocket',
  primaryColor: '#E0E0E0',
  scale: 0.5,
  animation: 'hover',
  voxels: mirror([
    // main body cylinder
    ...box(4, 3, 3, 6, 11, 4, '#E0E0E0'),
    ...box(3, 4, 3, 3, 10, 4, '#D0D0D0'),
    ...box(7, 4, 3, 7, 10, 4, '#D0D0D0'),
    // nose cone
    ...box(4, 12, 3, 6, 12, 4, '#FF3333'),
    ...box(5, 13, 4, 5, 13, 4, '#FF3333'),
    v(5, 14, 4, '#FF5555'),
    // window porthole
    v(5, 9, 3, '#66CCFF'), v(4, 9, 3, '#66CCFF'),
    v(6, 9, 3, '#66CCFF'),
    v(5, 8, 3, '#88DDFF'), v(5, 10, 3, '#88DDFF'),
    // racing stripe
    v(5, 5, 3, '#FF3333'), v(5, 6, 3, '#FF3333'), v(5, 7, 3, '#FF3333'),
    // fins (bigger, more dramatic)
    ...box(2, 2, 4, 3, 4, 4, '#FF3333'),
    ...box(7, 2, 4, 8, 4, 4, '#FF3333'),
    v(2, 1, 4, '#FF3333'), v(8, 1, 4, '#FF3333'),
    // bottom fins front/back
    ...box(4, 2, 2, 6, 3, 2, '#FF3333'),
    // exhaust nozzle
    ...box(4, 2, 3, 6, 2, 4, '#777777'),
    // flames
    v(5, 0, 4, '#FFCC00'),
    v(4, 0, 4, '#FF8800'), v(6, 0, 4, '#FF8800'),
    v(5, 1, 4, '#FFAA00'),
    v(5, 0, 3, '#FF6600'),
    v(4, 1, 4, '#FF6600'), v(6, 1, 4, '#FF6600'),
  ]),
}

const TREE: CreatureData = {
  name: 'tree',
  primaryColor: '#228B22',
  scale: 0.5,
  animation: 'drift',
  voxels: [
    // roots
    v(3, 0, 4, '#6B3A1F'), v(6, 0, 4, '#6B3A1F'),
    v(4, 0, 3, '#6B3A1F'), v(5, 0, 5, '#6B3A1F'),
    // trunk (thicker, textured)
    ...box(4, 0, 4, 5, 6, 5, '#8B5A2B'),
    v(4, 3, 3, '#7A4A1B'), v(5, 5, 6, '#7A4A1B'), // bark knots
    // branch stubs
    v(3, 5, 4, '#8B5A2B'), v(6, 5, 5, '#8B5A2B'),
    v(3, 4, 5, '#8B5A2B'),
    // canopy layer 1 (bottom, widest)
    ...box(1, 7, 1, 8, 8, 8, '#1E7B1E'),
    // canopy layer 2
    ...box(2, 9, 2, 7, 10, 7, '#228B22'),
    // canopy layer 3
    ...box(3, 11, 3, 6, 12, 6, '#2EA02E'),
    // canopy top
    ...box(4, 13, 4, 5, 13, 5, '#33BB33'),
    v(4, 14, 5, '#44CC44'),
    // leaf highlights (lighter patches)
    v(1, 7, 4, '#33AA33'), v(8, 8, 5, '#33AA33'),
    v(3, 9, 2, '#33AA33'), v(6, 10, 7, '#33AA33'),
    // fruits / flowers
    v(2, 7, 3, '#FF4444'), v(7, 8, 6, '#FF4444'),
    v(5, 7, 1, '#FFAA00'), v(2, 8, 7, '#FF6699'),
    // shadow leaves underneath
    v(1, 7, 2, '#166016'), v(8, 7, 7, '#166016'),
  ],
}

const ROBOT: CreatureData = {
  name: 'robot',
  primaryColor: '#888888',
  scale: 0.5,
  animation: 'waddle',
  voxels: mirror([
    // feet (chunky)
    ...box(2, 0, 3, 4, 0, 4, '#555555'),
    ...box(5, 0, 3, 7, 0, 4, '#555555'),
    // legs
    ...box(2, 1, 3, 3, 3, 4, '#777777'),
    ...box(6, 1, 3, 7, 3, 4, '#777777'),
    // knee joints
    v(2, 2, 3, '#FFCC00'), v(7, 2, 3, '#FFCC00'),
    // body (boxy torso)
    ...box(2, 4, 3, 7, 8, 4, '#AAAAAA'),
    ...box(3, 4, 2, 6, 8, 2, '#999999'),
    // chest panel
    v(4, 6, 2, '#00FF88'), v(5, 6, 2, '#00FF88'),
    v(4, 7, 2, '#00FFAA'), v(5, 7, 2, '#00FFAA'),
    v(4, 5, 2, '#FF4444'), v(5, 5, 2, '#FFCC00'), // indicator lights
    // shoulder joints
    v(1, 7, 4, '#FFCC00'), v(8, 7, 4, '#FFCC00'),
    // arms
    ...box(0, 4, 3, 1, 7, 4, '#888888'),
    ...box(8, 4, 3, 9, 7, 4, '#888888'),
    // hands (claw shape)
    v(0, 3, 3, '#FFCC00'), v(0, 3, 4, '#FFCC00'),
    v(9, 3, 3, '#FFCC00'), v(9, 3, 4, '#FFCC00'),
    // head
    ...box(3, 9, 3, 6, 11, 4, '#CCCCCC'),
    ...box(3, 9, 2, 6, 11, 2, '#BBBBBB'),
    // eyes (visor style)
    v(3, 10, 2, '#FF0000'), v(4, 10, 2, '#FF3333'),
    v(5, 10, 2, '#FF3333'), v(6, 10, 2, '#FF0000'),
    // antenna
    v(4, 12, 3, '#CCCCCC'), v(4, 13, 3, '#FF4444'),
    v(5, 12, 4, '#CCCCCC'), v(5, 13, 4, '#44AAFF'),
    // back detail
    v(4, 7, 5, '#666666'), v(5, 6, 5, '#666666'),
  ]),
}

const GHOST: CreatureData = {
  name: 'ghost',
  primaryColor: '#DDDDFF',
  scale: 0.55,
  animation: 'flutter',
  voxels: mirror([
    // main body (rounded shape)
    ...box(3, 3, 3, 7, 9, 4, '#DDDDFF'),
    ...box(2, 4, 3, 2, 8, 4, '#CCCCEE'),
    ...box(8, 4, 3, 8, 8, 4, '#CCCCEE'),
    // rounded top
    ...box(3, 10, 3, 7, 10, 4, '#EEEEFF'),
    ...box(4, 11, 3, 6, 11, 4, '#EEEEFF'),
    v(5, 12, 4, '#F5F5FF'),
    // wavy bottom tendrils
    v(2, 2, 3, '#CCCCEE'), v(4, 2, 4, '#DDDDFF'),
    v(6, 2, 3, '#CCCCEE'), v(8, 3, 4, '#CCCCEE'),
    v(3, 1, 4, '#BBBBDD'), v(5, 1, 3, '#BBBBDD'),
    v(7, 1, 4, '#BBBBDD'),
    v(3, 0, 3, '#AAAACC'), v(7, 0, 3, '#AAAACC'),
    // big expressive eyes
    v(4, 7, 3, '#222244'), v(6, 7, 3, '#222244'),
    v(4, 6, 3, '#222244'), v(6, 6, 3, '#222244'),
    v(3, 7, 3, '#222244'), v(7, 7, 3, '#222244'),
    // eye highlights
    v(4, 8, 3, '#FFFFFF'), v(6, 8, 3, '#FFFFFF'),
    // open mouth (surprised)
    v(5, 4, 3, '#333355'), v(5, 3, 3, '#333355'),
    v(4, 4, 3, '#333355'), v(6, 4, 3, '#333355'),
    // cheek blush
    v(3, 5, 3, '#FFAACC'), v(7, 5, 3, '#FFAACC'),
    // inner glow highlights
    v(5, 8, 4, '#F0F0FF'), v(5, 6, 4, '#F0F0FF'),
  ]),
}

const FISH: CreatureData = {
  name: 'fish',
  primaryColor: '#FF6B35',
  scale: 0.55,
  animation: 'swim',
  voxels: mirror([
    // body (rounder, fatter fish)
    ...box(4, 3, 3, 9, 6, 4, '#FF6B35'),
    ...box(3, 4, 3, 3, 5, 4, '#FF8855'),
    ...box(10, 4, 3, 10, 5, 4, '#FF8855'),
    // belly (lighter)
    ...box(5, 3, 4, 8, 3, 4, '#FFAA77'),
    ...box(5, 3, 3, 8, 3, 3, '#FFAA77'),
    // top of body
    ...box(5, 7, 4, 8, 7, 4, '#E05B25'),
    // head taper
    ...box(10, 4, 3, 11, 5, 4, '#FF8855'),
    // eye (big)
    v(10, 5, 3, '#FFFFFF'), v(11, 5, 3, '#111111'),
    // mouth
    v(12, 4, 4, '#FF3333'),
    // tail fin (dramatic fan)
    v(2, 4, 4, '#FFAA55'), v(2, 5, 4, '#FFAA55'),
    v(1, 3, 4, '#FFAA55'), v(1, 6, 4, '#FFAA55'),
    v(0, 2, 4, '#FF8833'), v(0, 7, 4, '#FF8833'),
    v(0, 3, 4, '#FFAA55'), v(0, 6, 4, '#FFAA55'),
    // dorsal fin (tall)
    v(6, 8, 4, '#FFAA55'), v(7, 8, 4, '#FFAA55'),
    v(7, 9, 4, '#FF8833'), v(6, 9, 4, '#FF8833'),
    // ventral fin
    v(6, 2, 4, '#FFAA55'), v(7, 2, 4, '#FFAA55'),
    // side fins
    v(8, 3, 2, '#FFCC88'), v(9, 3, 2, '#FFCC88'),
    // stripes
    v(6, 4, 3, '#FFFFFF'), v(6, 5, 3, '#FFFFFF'), v(6, 6, 3, '#FFFFFF'),
    v(8, 4, 3, '#FFFFFF'), v(8, 5, 3, '#FFFFFF'), v(8, 6, 3, '#FFFFFF'),
    // scales shimmer
    v(5, 5, 3, '#FFCC88'), v(7, 4, 3, '#FFCC88'), v(9, 5, 3, '#FFCC88'),
  ]),
}

/* ── exports ─────────────────────────────────────────── */

const ALL: CreatureData[] = [CAT, ROCKET, TREE, ROBOT, GHOST, FISH]

export function getRandomCreature(nameHint?: string): CreatureData {
  if (nameHint) {
    const lower = nameHint.toLowerCase()
    const match = ALL.find(c => lower.includes(c.name))
    if (match) return { ...match, name: nameHint }
  }
  const pick = ALL[Math.floor(Math.random() * ALL.length)]
  return { ...pick, name: nameHint || pick.name }
}

export { ALL as creatures }
