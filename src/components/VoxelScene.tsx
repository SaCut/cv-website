import { useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { CreatureData, AnimationType } from '../types'

/* ── rounded box helper ─────────────────────────── */

function makeRoundedBoxGeometry(w: number, h: number, d: number, radius: number, segments: number) {
  const shape = new THREE.Shape()
  const hw = w / 2 - radius
  const hh = h / 2 - radius

  shape.moveTo(-hw, -h / 2)
  shape.lineTo(hw, -h / 2)
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -hh)
  shape.lineTo(w / 2, hh)
  shape.quadraticCurveTo(w / 2, h / 2, hw, h / 2)
  shape.lineTo(-hw, h / 2)
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, hh)
  shape.lineTo(-w / 2, -hh)
  shape.quadraticCurveTo(-w / 2, -h / 2, -hw, -h / 2)

  return new THREE.ExtrudeGeometry(shape, {
    depth: d - radius * 2,
    bevelEnabled: true,
    bevelThickness: radius,
    bevelSize: radius,
    bevelSegments: segments,
  }).translate(0, 0, -(d - radius * 2) / 2)
}

/* ── smooth lerp helper ─────────────────────────── */

function lerp(current: number, target: number, alpha: number) {
  return current + (target - current) * alpha
}

/* ── per-creature animation behaviours ──────────── */
/* All animations are purely time-based (no += delta  */
/* accumulation) so they look identical at any FPS.   */
/* We lerp the group towards the target pose each     */
/* frame for buttery-smooth interpolation.            */

function applyAnimation(
  group: THREE.Group,
  anim: AnimationType,
  t: number,
  smoothing: number,
) {
  let ty = 0, tx = 0, tz = 0
  let ry = 0, rx = 0, rz = 0
  let sy = 1, sx = 1, sz = 1

  switch (anim) {
    case 'sway': {
      // cat: stretchy loaf kneading, head-tilt, purring squish
      ry = Math.sin(t * 0.5) * 0.6
      rz = Math.sin(t * 1.8) * 0.15
      rx = Math.sin(t * 1.2) * 0.1
      ty = Math.abs(Math.sin(t * 2.0)) * 0.15
      sx = 1.0 + Math.sin(t * 2.0) * 0.06
      sy = 1.0 - Math.sin(t * 2.0) * 0.06
      break
    }
    case 'swim': {
      // fish: figure-eight with tail waggle
      const swimPhase = t * 0.7
      tx = Math.sin(swimPhase) * 1.2
      ty = Math.sin(swimPhase * 2) * 0.6
      tz = Math.cos(swimPhase) * 0.5
      ry = Math.atan2(Math.cos(swimPhase) * 1.2, -Math.sin(swimPhase) * 0.5)
      rz = Math.sin(t * 4.0) * 0.12
      rx = Math.sin(t * 3.0) * 0.05
      break
    }
    case 'hover': {
      // rocket: dramatic boost with exhaust vibration
      const boostCycle = t * 0.4
      ty = Math.sin(boostCycle) * 1.5 + 0.5
      rz = Math.sin(boostCycle + 0.5) * 0.08
      rx = Math.sin(boostCycle * 1.3) * 0.06
      ry = t * 0.3
      const thrust = Math.max(0, Math.cos(boostCycle))
      tx = Math.sin(t * 12) * 0.02 * thrust
      tz = Math.cos(t * 14) * 0.02 * thrust
      break
    }
    case 'bounce': {
      // elastic squash-and-stretch jump
      const jumpPhase = t * 1.8
      const raw = Math.sin(jumpPhase)
      ty = Math.abs(raw) * 1.2
      const squash = Math.cos(jumpPhase)
      sy = 1.0 + squash * 0.15
      sx = 1.0 - squash * 0.08
      sz = 1.0 - squash * 0.08
      rz = Math.sin(jumpPhase * 2) * 0.1 * (1 - Math.abs(raw))
      ry = t * 0.35
      break
    }
    case 'waddle': {
      // robot: stompy march with exaggerated tilt
      const march = t * 1.6
      rz = Math.sin(march) * 0.25
      rx = Math.sin(march + 1.0) * 0.15
      ty = Math.abs(Math.sin(march)) * 0.3
      ry = Math.floor(t * 0.3) * (Math.PI / 2) + Math.sin(t * 0.3 * Math.PI * 2) * 0.2
      tx = Math.sin(t * 8) * 0.02
      break
    }
    case 'flutter': {
      // ghost: spooky swooping figure-eight
      const drift = t * 0.5
      tx = Math.sin(drift) * 1.0
      ty = Math.sin(drift * 2) * 0.8 + Math.sin(t * 1.5) * 0.3
      tz = Math.cos(drift) * 0.6
      ry = Math.sin(drift) * 0.5
      rz = Math.sin(t * 1.2) * 0.15
      rx = Math.sin(t * 0.8) * 0.1
      const breathe = Math.sin(t * 1.0) * 0.05
      sx = 1.0 + breathe
      sy = 1.0 - breathe
      break
    }
    case 'drift': {
      // tree: wind gusts with rustling
      const gust = Math.sin(t * 0.3) * 0.5 + Math.sin(t * 0.7) * 0.3
      rz = gust * 0.12
      rx = Math.sin(t * 0.5 + 1.0) * 0.06
      tx = gust * 0.3
      ry = t * 0.15
      sx = 1.0 + Math.sin(t * 0.8) * 0.02
      sz = 1.0 + Math.sin(t * 0.8 + 1) * 0.02
      break
    }
    default: {
      ry = t * 0.4
      ty = Math.sin(t * 1.0) * 0.3
    }
  }

  group.position.x = lerp(group.position.x, tx, smoothing)
  group.position.y = lerp(group.position.y, ty, smoothing)
  group.position.z = lerp(group.position.z, tz, smoothing)

  group.rotation.x = lerp(group.rotation.x, rx, smoothing)
  group.rotation.z = lerp(group.rotation.z, rz, smoothing)

  if (anim === 'swim' || anim === 'flutter' || anim === 'sway' || anim === 'waddle') {
    group.rotation.y = lerp(group.rotation.y, ry, smoothing)
  } else {
    group.rotation.y = ry
  }

  group.scale.x = lerp(group.scale.x, sx, smoothing)
  group.scale.y = lerp(group.scale.y, sy, smoothing)
  group.scale.z = lerp(group.scale.z, sz, smoothing)
}

/* ── inner scene: instanced voxel mesh ──────────── */

function VoxelMesh({
  creature,
  phaseOffset,
}: {
  creature: CreatureData
  phaseOffset: number
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const geo = useMemo(() => makeRoundedBoxGeometry(0.88, 0.88, 0.88, 0.12, 2), [])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    const { voxels } = creature
    const mat = new THREE.Matrix4()
    const col = new THREE.Color()

    // compute center so creature orbits around its own center
    const cx = voxels.reduce((s, v) => s + v.x, 0) / voxels.length
    const cy = voxels.reduce((s, v) => s + v.y, 0) / voxels.length
    const cz = voxels.reduce((s, v) => s + v.z, 0) / voxels.length

    voxels.forEach((vx, i) => {
      mat.setPosition(vx.x - cx, vx.y - cy, vx.z - cz)
      mesh.setMatrixAt(i, mat)
      mesh.setColorAt(i, col.set(vx.color))
    })

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [creature])

  // thematic animation driven by creature type + phase offset
  // Smoothing factor of 0.12 gives buttery interpolation at any framerate
  useFrame(() => {
    if (!groupRef.current) return
    const t = performance.now() * 0.001 + phaseOffset
    applyAnimation(groupRef.current, creature.animation, t, 0.12)
  })

  return (
    <group ref={groupRef}>
      <group scale={creature.scale}>
        <instancedMesh ref={meshRef} args={[geo, undefined, creature.voxels.length]}>
          <meshStandardMaterial roughness={0.5} metalness={0.05} />
        </instancedMesh>
      </group>
    </group>
  )
}

/* ── exported canvas wrapper ────────────────────── */

export default function VoxelScene({
  creature,
  phaseOffset = 0,
}: {
  creature: CreatureData
  phaseOffset?: number
}) {
  return (
    <Canvas
      camera={{ position: [0, 3, 12], fov: 40 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
      frameloop="always"
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 8, 5]} intensity={1.0} />
      <directionalLight position={[-3, 2, -4]} intensity={0.4} color="#c084fc" />
      <VoxelMesh creature={creature} phaseOffset={phaseOffset} />
    </Canvas>
  )
}
