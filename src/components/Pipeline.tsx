import { useState, useEffect, useRef, useCallback } from 'react'
import type { DeployConfig, CreatureData } from '../types'
import { generateSprite, animateSprite, deployCreature } from '../api'

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
  switch (stageId) {
    case 'source': return [
      `> git pull origin main`,
      `> Resolving creature manifest for "${n}"...`,
      `> Dependencies locked ✓`,
    ]
    case 'build': return [
      `> docker build -t creature-registry/${n.toLowerCase().replace(/\s+/g, '-')}:latest .`,
      `> Step 1/4 : FROM pixel-base:alpine`,
      `> Step 2/4 : COPY creature.json /app/`,
      `> Step 3/4 : RUN generate-pixels --optimise`,
      `> Step 4/4 : HEALTHCHECK --interval=30s`,
      `> Image built successfully ✓`,
    ]
    case 'test': return [
      `> Running creature unit tests...`,
      `> ✓ test_has_enough_pixels (2ms)`,
      `> ✓ test_colours_are_valid (1ms)`,
      `> ✓ test_creature_is_adorable (3ms)`,
      `> ✓ test_no_frame_overflow (1ms)`,
      `> All 4 tests passed ✓`,
    ]
    case 'deploy': return [
      `> kubectl apply -f deployment.yaml --namespace=creatures`,
      `> deployment.apps/${n.toLowerCase().replace(/\s+/g, '-')}-deploy created`,
      `> strategy: ${config.strategy}`,
      `> Waiting for rollout...`,
      `> ${r}/${r} pods available ✓`,
    ]
    case 'monitor': return [
      `> Configuring liveness probes...`,
      `> Prometheus scrape target registered`,
      `> All ${r} pods reporting healthy ✓`,
      `> Dashboard ready — enjoy your creatures`,
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
  `> Model is breaking down the subject into shapes...`,
  `> Q1: describing anatomy in constrained vocabulary...`,
  `> Q2: converting description to shape primitives...`,
  `> Placing shapes on a 32×32 canvas...`,
  `> Q3: assigning colours to each body part...`,
  `> Transformer is deciding where eyes should go...`,
  `> Triangulating all the pointy bits...`,
  `> The model keeps trying to add a 7th color. We keep saying no.`,
  `> Cross-referencing shape vocabulary with anatomy...`,
  `> Model temperature: 0.4. Crisp and focused.`,
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
    let primaryColour = '#00d4ff'
    let completelyFailed = false

    async function runPipeline() {
      const durations = [800, 1200, 800, 1000, 800]

      for (let i = 0; i < STAGES.length; i++) {
        if (c.current) return

        setCurrentStage(i)
        setActiveTab(i)
        const stageLines = makeLogs(STAGES[i].id, config)
        const duration = durations[i]

        // ── Build stage: Generate sprite ──
        if (STAGES[i].id === 'build') {
          await addLogLines(i, stageLines, duration / (stageLines.length + 1), c)
          if (c.current) return

          addLogToStage(i, `> Generating sprite via LLM...`)

          const spriteQuips = shuffled(SPRITE_QUIPS)
          let quipIdx = 0
          const quipTimer = setInterval(() => {
            if (c.current || quipIdx >= spriteQuips.length) return
            addLogToStage(i, spriteQuips[quipIdx++])
          }, 1500)

          const spriteResult = await generateSprite(config.creatureName)
          clearInterval(quipTimer)
          if (c.current) return

          baseFrame = spriteResult.frame
          spritePalette = spriteResult.palette
          spriteShapes = spriteResult.shapes
          spriteDescription = spriteResult.description
          primaryColour = spriteResult.primaryColour
          completelyFailed = spriteResult.failed && spriteShapes.length === 0

          if (spriteResult.failed) {
            addLogToStage(i, `> ⚠ ${spriteResult.notice || 'Sprite generation failed'}`)
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
          } else {
            addLogToStage(i, `> Base sprite generated ✓`)
          }
        }
        // ── Test stage: Animate sprite ──
        else if (STAGES[i].id === 'test') {
          await addLogLines(i, stageLines.slice(0, -2), duration / (stageLines.length + 1), c)
          if (c.current) return

          if (!completelyFailed && spriteShapes.length > 0) {
            addLogToStage(i, `> Animating sprite...`)

            const animResult = await animateSprite(spritePalette, spriteShapes, spriteDescription, config.creatureName)
            if (c.current) return

            if (animResult.failed || animResult.frames.length === 0) {
              addLogToStage(i, `> ⚠ ${animResult.notice || 'Animation failed'} — using static sprite ✓`)
              creatureRef.current = {
                name: config.creatureName,
                frames: [baseFrame, baseFrame, baseFrame, baseFrame],
                primaryColour,
              }
            } else {
              addLogToStage(i, `> Animation frames generated ✓`)
              creatureRef.current = {
                name: config.creatureName,
                frames: [baseFrame, ...animResult.frames],
                primaryColour,
              }
            }
          }

          // Show final test logs
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
