import { useState, useEffect, useRef, useCallback } from 'react'
import type { DeployConfig, CreatureData } from '../types'
import { generateSprite, deployCreature, rasterizeImageToGrid } from '../api'

interface Props {
  config: DeployConfig
  onComplete: (creature: CreatureData) => void
}

const STAGES = [
  { id: 'source',  label: 'Source' },
  { id: 'build',   label: 'Build' },
  { id: 'test',    label: 'Test' },
  { id: 'deploy',  label: 'Deploy' },
  { id: 'monitor', label: 'Monitor' },
]

function makeLogs(stageId: string, config: DeployConfig): string[] {
  const n = config.creatureName
  const r = config.replicas
  const slug = n.toLowerCase().replace(/\s+/g, '-')
  switch (stageId) {
    case 'source': return [
      `> git pull origin main`,
      `> HEAD is now at ${Math.random().toString(16).slice(2, 9)}`,
      `> Resolving creature manifest for "${n}"...`,
      `> Dependencies locked ✓`,
    ]
    case 'build': return [
      `> docker build -t creature-registry/${slug}:latest .`,
      `> Step 1/5 : FROM pixel-base:alpine AS builder`,
      `> Step 2/5 : RUN apk add --no-cache libpixel imagetools`,
      `> Step 3/5 : COPY creature.json /app/`,
      `> Step 4/5 : RUN pixelate --optimise --palette=256`,
      `> Step 5/5 : HEALTHCHECK --interval=30s CMD wget -qO- /healthz`,
      `> Image built successfully ✓`,
    ]
    case 'test': return [
      `> Running test suite...`,
      `> ✓ test_pixel_count_nonzero (2ms)`,
      `> ✓ test_palette_within_bounds (1ms)`,
      `> ✓ test_no_frame_overflow (1ms)`,
      `> ✓ test_image_dimensions_valid (2ms)`,
      `> 4 passed, 0 failed ✓`,
    ]
    case 'deploy': return [
      `> kubectl apply -f deployment.yaml --namespace=creatures`,
      `> deployment.apps/${slug}-deploy created`,
      `> strategy: ${config.strategy}`,
      `> Waiting for rollout...`,
      `> ${r}/${r} pods available ✓`,
    ]
    case 'monitor': return [
      `> Attaching liveness probe → /healthz (30s interval)`,
      `> Prometheus scrape target registered`,
      `> Grafana dashboard provisioned`,
      `> All ${r} pods reporting healthy ✓`,
    ]
    default: return []
  }
}

/** Classify a log line for styling. */
function logClass(line: string): string {
  if (line.includes('✓')) return 'success'
  if (line.startsWith('⚠')) return 'notice'
  if (line.startsWith('>')) return 'info'
  return ''
}

/** Messages shown while waiting for sprite generation. */
const SPRITE_QUIPS = [
  `> Q1: encoding subject anatomy into shape vocabulary...`,
  `> Decomposing description into geometric primitives...`,
  `> Q2: mapping shape primitives to 64×64 canvas...`,
  `> Q3: assigning palette to body regions...`,
  `> Resolving ambiguous silhouette boundaries...`,
  `> Quantising to 256-colour palette...`,
  `> Model checked the spec twice. Still disagrees with it.`,
  `> Cross-referencing pixel boundaries with shape regions...`,
  `> Model temperature: 0.4`,
  `> Q4: finalising edge pixels and outline pass...`,
]

function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function Pipeline({ config, onComplete }: Props) {
  const [currentStage, setCurrentStage] = useState(-1)
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set())
  // Logs stored per-stage so clicking a stage tab shows only that stage's logs
  const [stageLogs, setStageLogs] = useState<string[][]>(STAGES.map(() => []))
  const [activeTab, setActiveTab] = useState(0)
  const [pipelineDone, setPipelineDone] = useState(false)
  const creatureRef = useRef<CreatureData | null>(null)
  const logsBoxRef = useRef<HTMLDivElement>(null)

  const addLogToStage = useCallback((stageIdx: number, line: string) => {
    setStageLogs(prev => {
      const copy = [...prev]
      copy[stageIdx] = [...copy[stageIdx], line]
      return copy
    })
  }, [])

  const addLogLines = useCallback((
    stageIdx: number,
    lines: string[],
    interval: number,
    cancelled: { current: boolean },
  ): Promise<void> => {
    return new Promise(resolve => {
      lines.forEach((line, i) => {
        setTimeout(() => {
          if (!cancelled.current) addLogToStage(stageIdx, line)
        }, interval * (i + 1))
      })
      setTimeout(resolve, interval * (lines.length + 1))
    })
  }, [addLogToStage])

  useEffect(() => {
    const c = { current: false }
    let baseFrame: any = null
    let spritePalette: Record<string, string> = {}
    let spriteShapes: any[] = []
    let spriteDescription = config.creatureName
    /** Set when CF AI returned an image that was rasterised to a grid */
    let gridRasterised = false
    let primaryColour = '#00d4ff'
    let completelyFailed = false

    // Fire sprite generation immediately — runs in parallel with fake logs
    const spritePromise = generateSprite(config.creatureName, config.debugSprites)

    async function runPipeline() {
      const durations = [1200, 1400, 1200, 1000, 1200]

      for (let i = 0; i < STAGES.length; i++) {
        if (c.current) return

        setCurrentStage(i)
        setActiveTab(i)
        const stageLines = makeLogs(STAGES[i].id, config)
        const duration = durations[i]

        // ── Build stage: Generate sprite ──
        if (STAGES[i].id === 'build') {
          addLogToStage(i, `> Generating sprite via LLM...`)

          const spriteQuips = shuffled(SPRITE_QUIPS)
          let quipIdx = 0
          const quipTimer = setInterval(() => {
            if (c.current || quipIdx >= spriteQuips.length) return
            addLogToStage(i, spriteQuips[quipIdx++])
          }, 1500)

          // Fake logs + real fetch run concurrently; await both
          const [spriteResult] = await Promise.all([
            spritePromise,
            addLogLines(i, stageLines, duration / (stageLines.length + 1), c),
          ])
          clearInterval(quipTimer)
          if (c.current) return

          baseFrame = spriteResult.frame
          spritePalette = spriteResult.palette
          spriteShapes = spriteResult.shapes
          spriteDescription = spriteResult.description
          primaryColour = spriteResult.primaryColour
          completelyFailed = spriteResult.failed && spriteShapes.length === 0

          // CF AI returned a real image — rasterise it to 64×64 pixel grid on the spot
          if (spriteResult.imageBase64) {
            addLogToStage(i, `> Rasterising CF AI image to 64×64 grid...`)
            baseFrame = await rasterizeImageToGrid(spriteResult.imageBase64, 64, spriteResult.bgOps)
            if (c.current) return
            if (baseFrame && baseFrame.length > 0) {
              gridRasterised = true
              addLogToStage(i, `> Sprite rasterised ✓`)
            } else {
              addLogToStage(i, `> ⚠ Rasterisation failed`)
              completelyFailed = true
            }
          }

          if (spriteResult.failed) {
            addLogToStage(i, `> ✗ ${spriteResult.notice || 'Sprite generation failed'}`)
            if (completelyFailed) {
              addLogToStage(i, `> Using fallback sprite from warehouse ✓`)
              creatureRef.current = {
                name: config.creatureName,
                frames: [baseFrame, baseFrame, baseFrame, baseFrame],
                primaryColour,
              }
            } else {
              addLogToStage(i, `> Base sprite generated (degraded) ✓`)
            }
          } else if (gridRasterised) {
            addLogToStage(i, `> CF AI sprite ready ✓`)
          } else {
            addLogToStage(i, `> Base sprite generated ✓`)
          }
        }
        // ── Test stage: Set static sprite (animation disabled) ──
        else if (STAGES[i].id === 'test') {
          await addLogLines(i, stageLines.slice(0, -2), duration / (stageLines.length + 1), c)
          if (c.current) return

          addLogToStage(i, `> Sprite tests passed ✓`)
          creatureRef.current = {
            name: config.creatureName,
            frames: [baseFrame, baseFrame, baseFrame, baseFrame],
            primaryColour,
          }

          await addLogLines(i, stageLines.slice(-2), 200, c)
        }
        // ── Other stages: Normal logs ──
        // ── Deploy stage: Create real k8s deployment ──
        else if (STAGES[i].id === 'deploy') {
          // Show initial log lines
          await addLogLines(i, stageLines.slice(0, 2), 300, c)
          if (c.current) return

          addLogToStage(i, `> Creating deployment in namespace creatures...`)

          const deployResult = await deployCreature(
            config.creatureName,
            config.replicas,
            config.strategy,
          )
          if (c.current) return

          if (deployResult.error) {
            addLogToStage(i, `> ⚠ k8s deploy failed: ${deployResult.error}`)
            addLogToStage(i, `> Continuing with simulated pods ✓`)
          } else {
            addLogToStage(i, `> deployment.apps/${deployResult.deployment} created`)
            addLogToStage(i, `> strategy: ${deployResult.strategy}`)
            addLogToStage(i, `> TTL: ${deployResult.ttl}s`)
            // Store deployment name on the creature data
            if (creatureRef.current) {
              creatureRef.current.deploymentName = deployResult.deployment
            }
          }

          await addLogLines(i, stageLines.slice(-1), 300, c)
        }
        else {
          await addLogLines(i, stageLines, duration / (stageLines.length + 1), c)
        }

        if (c.current) return
        setCompletedStages(prev => new Set([...prev, i]))
      }

      if (!c.current) setPipelineDone(true)
    }

    runPipeline()
    return () => { c.current = true }
  }, [config, addLogLines, addLogToStage])

  // auto-scroll log box when the active tab's logs change
  useEffect(() => {
    const el = logsBoxRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [stageLogs, activeTab])

  const handleViewResources = useCallback(() => {
    if (creatureRef.current) onComplete(creatureRef.current)
  }, [onComplete])

  const visibleLogs = stageLogs[activeTab] || []

  return (
    <div className="pipeline-view">
      <div className="pipeline-stages">
        {STAGES.map((stage, i) => (
          <PipelineNode
            key={stage.id}
            label={stage.label}
            status={
              completedStages.has(i) ? 'success' :
              i === currentStage ? 'running' : 'pending'
            }
            active={i === activeTab}
            onClick={() => i <= currentStage && setActiveTab(i)}
            showConnector={i < STAGES.length - 1}
            connectorDone={completedStages.has(i)}
          />
        ))}
      </div>

      <div className="pipeline-logs" ref={logsBoxRef}>
        {visibleLogs.length === 0 && (
          <div className="log-line info" style={{ opacity: 0.5 }}>
            Waiting for stage to start...
          </div>
        )}
        {visibleLogs.map((line, i) => (
          <div key={i} className={`log-line ${logClass(line)}`}>
            {line}
          </div>
        ))}
      </div>

      {pipelineDone && (
        <div className="pipeline-complete">
          <p>✓ All {config.replicas} pods healthy</p>
          <button className="btn-view-resources" onClick={handleViewResources}>
            View deployment →
          </button>
        </div>
      )}
    </div>
  )
}

function PipelineNode({ label, status, active, onClick, showConnector, connectorDone }: {
  label: string
  status: 'pending' | 'running' | 'success'
  active: boolean
  onClick: () => void
  showConnector: boolean
  connectorDone: boolean
}) {
  return (
    <>
      <div
        className={`pipeline-stage ${status !== 'pending' ? 'clickable' : ''} ${active ? 'tab-active' : ''}`}
        onClick={onClick}
        role={status !== 'pending' ? 'button' : undefined}
        tabIndex={status !== 'pending' ? 0 : undefined}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      >
        <div className={`stage-dot ${status}`}>
          {status === 'success' ? '✓' : status === 'running' ? '●' : '○'}
        </div>
        <span className={`stage-label ${active ? 'active' : ''}`}>
          {label}
        </span>
      </div>
      {showConnector && (
        <div className={`stage-connector ${connectorDone ? 'done' : ''}`} />
      )}
    </>
  )
}
