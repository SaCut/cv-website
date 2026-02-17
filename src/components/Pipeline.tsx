import { useState, useEffect, useRef, useCallback } from 'react'
import type { DeployConfig, CreatureData } from '../types'
import { generateCreature } from '../api'
import type { GenerateResult } from '../api'

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

/** Messages shown while waiting for the AI to finish generating. */
const WAITING_QUIPS = [
  `> Warming up the neural kiln...`,
  `> Mixing pixels in a cauldron...`,
  `> Consulting the colour oracle...`,
  `> Teaching the AI about cuteness...`,
  `> Sharpening the pixel chisel...`,
  `> De-fragmenting the imagination buffer...`,
  `> Cross-referencing the bestiary...`,
  `> Calibrating the adorableness dial...`,
  `> Rendering at one billion frames per thought...`,
  `> Polishing the transparency channel...`,
  `> Translating art into JSON...`,
  `> Asking the model to stay inside the lines...`,
  `> Checking the creature's passport...`,
  `> Loading 20×20 canvases...`,
  `> Running the aesthetic lint pass...`,
  `> Warming up animation keyframes...`,
  `> Generating six frames of whimsy...`,
  `> Adding sub-pixel personality...`,
  `> The AI is choosing its favourite colours...`,
  `> Indexing the palette with extreme prejudice...`,
  `> Compiling cuteness down to hex codes...`,
  `> Waiting for creative inspiration to strike...`,
  `> Optimising the fluffiness gradient...`,
  `> The model is sketching thumbnails...`,
  `> Pixel budget approved — rendering now...`,
  `> Interpolating between "aww" and "cool"...`,
  `> Double-checking the creature manual...`,
  `> Applying anti-boredom shaders...`,
  `> Sending good vibes to the inference cluster...`,
  `> The bits are queuing up nicely...`,
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
  const logsEndRef = useRef<HTMLDivElement>(null)

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

    async function runPipeline() {
      const durations = [800, 1200, 800, 1000, 800]

      for (let i = 0; i < STAGES.length; i++) {
        if (c.current) return

        setCurrentStage(i)
        setActiveTab(i) // auto-follow the running stage
        const stageLines = makeLogs(STAGES[i].id, config)
        const duration = durations[i]

        if (STAGES[i].id === 'build') {
          // Show build logs first
          await addLogLines(i, stageLines, duration / (stageLines.length + 1), c)
          if (c.current) return

          // Start the API request
          addLogToStage(i, `> Generating creature sprite via API...`)
          const apiPromise = generateCreature(config.creatureName)

          // While waiting, print fun quips every 1.5 s
          const quipQueue = shuffled(WAITING_QUIPS)
          let quipIdx = 0
          const quipTimer = setInterval(() => {
            if (c.current || quipIdx >= quipQueue.length) return
            addLogToStage(i, quipQueue[quipIdx++])
          }, 1500)

          const result: GenerateResult = await apiPromise
          clearInterval(quipTimer)
          if (c.current) return

          creatureRef.current = result.creature

          if (result.notice) {
            addLogToStage(i, `⚠ ${result.notice}`)
          }

          if (result.aiFailed) {
            addLogToStage(i, `> Loaded fallback creature "${result.creature.name}" from warehouse ✓`)
          } else {
            addLogToStage(i, `> Creature "${result.creature.name}" generated ✓`)
          }
        } else {
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

  // auto-scroll logs when the active tab's logs change
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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

      <div className="pipeline-logs">
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
        <div ref={logsEndRef} />
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
