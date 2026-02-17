import { useState, useEffect, useRef, useCallback } from 'react'
import type { DeployConfig, CreatureData } from '../types'
import { generateCreature } from '../api'

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
      `> Step 1/4 : FROM voxel-base:alpine`,
      `> Step 2/4 : COPY creature.json /app/`,
      `> Step 3/4 : RUN generate-voxels --optimise`,
      `> Step 4/4 : HEALTHCHECK --interval=30s`,
      `> Image built successfully ✓`,
    ]
    case 'test': return [
      `> Running creature unit tests...`,
      `> ✓ test_has_enough_voxels (2ms)`,
      `> ✓ test_colours_are_valid (1ms)`,
      `> ✓ test_creature_is_adorable (3ms)`,
      `> ✓ test_no_voxel_overflow (1ms)`,
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

export default function Pipeline({ config, onComplete }: Props) {
  const [currentStage, setCurrentStage] = useState(-1)
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set())
  const [logs, setLogs] = useState<string[]>([])
  const [pipelineDone, setPipelineDone] = useState(false)
  const creatureRef = useRef<CreatureData | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  const addLogLines = useCallback((lines: string[], interval: number, cancelled: { current: boolean }): Promise<void> => {
    return new Promise(resolve => {
      lines.forEach((line, i) => {
        setTimeout(() => {
          if (!cancelled.current) setLogs(prev => [...prev, line])
        }, interval * (i + 1))
      })
      setTimeout(resolve, interval * (lines.length + 1))
    })
  }, [])

  useEffect(() => {
    const c = { current: false }

    async function runPipeline() {
      const durations = [800, 1200, 800, 1000, 800]

      for (let i = 0; i < STAGES.length; i++) {
        if (c.current) return

        setCurrentStage(i)
        const stageLines = makeLogs(STAGES[i].id, config)
        const duration = durations[i]

        if (STAGES[i].id === 'build') {
          const [creature] = await Promise.all([
            generateCreature(config.creatureName),
            addLogLines(stageLines, duration / (stageLines.length + 1), c),
          ])
          if (c.current) return
          creatureRef.current = creature
        } else {
          await addLogLines(stageLines, duration / (stageLines.length + 1), c)
        }

        if (c.current) return
        setCompletedStages(prev => new Set([...prev, i]))
      }

      // Pipeline done — wait for user to click through
      if (!c.current) setPipelineDone(true)
    }

    runPipeline()
    return () => { 
      c.current = true
    }
  }, [config, addLogLines])

  // auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const handleViewResources = useCallback(() => {
    if (creatureRef.current) onComplete(creatureRef.current)
  }, [onComplete])

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
            showConnector={i < STAGES.length - 1}
            connectorDone={completedStages.has(i)}
          />
        ))}
      </div>

      <div className="pipeline-logs">
        {logs.map((line, i) => (
          <div
            key={i}
            className={`log-line ${line.includes('✓') ? 'success' : line.startsWith('>') ? 'info' : ''}`}
          >
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

function PipelineNode({ label, status, showConnector, connectorDone }: {
  label: string
  status: 'pending' | 'running' | 'success'
  showConnector: boolean
  connectorDone: boolean
}) {
  return (
    <>
      <div className="pipeline-stage">
        <div className={`stage-dot ${status}`}>
          {status === 'success' ? '✓' : status === 'running' ? '●' : '○'}
        </div>
        <span className={`stage-label ${status === 'running' ? 'active' : ''}`}>
          {label}
        </span>
      </div>
      {showConnector && (
        <div className={`stage-connector ${connectorDone ? 'done' : ''}`} />
      )}
    </>
  )
}
