import { useState, useEffect, useRef, useMemo } from 'react'
import type { CreatureData, DeployConfig } from '../types'
import VoxelScene from './VoxelScene'

interface Props {
  creature: CreatureData
  config: DeployConfig
  onReset: () => void
}

/* ── fake pod log generator ─────────────────────── */

function usePodLogs(podName: string, creature: string) {
  const [logs, setLogs] = useState<string[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    const startupLogs = [
      `[init] pulling image creature-registry/${creature}:latest`,
      `[init] image pulled in 0.${Math.floor(Math.random() * 9)}s`,
      `[main] starting voxel renderer...`,
      `[main] creature loaded: ${creature}`,
      `[health] liveness probe: OK`,
      `[health] readiness probe: OK`,
    ]

    // show startup logs at a gentle pace
    startupLogs.forEach((log, i) => {
      setTimeout(() => setLogs(prev => [...prev, log]), 800 * (i + 1))
    })

    // periodic idle logs
    const idleMessages = [
      `[health] liveness probe: OK`,
      `[metrics] cpu: ${Math.floor(Math.random() * 30 + 5)}m, mem: ${Math.floor(Math.random() * 100 + 50)}Mi`,
      `[main] creature is vibing`,
      `[main] voxels rendered: ${Math.floor(Math.random() * 150 + 50)}`,
      `[health] readiness probe: OK`,
      `[metrics] requests: ${Math.floor(Math.random() * 10)}/s`,
      `[main] creature refuses to stop vibing`,
      `[warn] creature escaped pod briefly, retrieved`,
      `[main] voxel #${Math.floor(Math.random() * 50)} is having an existential crisis`,
      `[metrics] happiness: ${Math.floor(Math.random() * 40 + 60)}%`,
      `[health] creature passed vibe check ✓`,
      `[main] creature demands more RAM`,
      `[warn] creature tried to kubectl exec into neighboring pod`,
      `[main] tail wag frequency: ${(Math.random() * 3 + 1).toFixed(1)}Hz`,
      `[metrics] cuddle-readiness: optimal`,
      `[main] creature is writing yaml now. we've lost control`,
      `[health] emotional support probe: OK`,
      `[warn] creature discovered npm install. send help`,
      `[main] deploying additional cuteness... done`,
      `[metrics] chaos engineering score: ${Math.floor(Math.random() * 100)}/100`,
      `[main] creature has opinions about tabs vs spaces`,
    ]

    intervalRef.current = setInterval(() => {
      const msg = idleMessages[Math.floor(Math.random() * idleMessages.length)]
      setLogs(prev => [...prev.slice(-15), msg]) // keep last 15 lines
    }, 6000 + Math.random() * 6000)

    return () => clearInterval(intervalRef.current)
  }, [podName, creature])

  return logs
}

/* ── single pod ─────────────────────────────────── */

function TerminalPod({
  creature,
  index,
  delay,
}: {
  creature: CreatureData
  index: number
  delay: number
}) {
  const [visible, setVisible] = useState(false)
  const [stopped, setStopped] = useState(false)
  
  const podName = useMemo(() => {
    const hash1 = Math.random().toString(36).slice(2, 7)
    const hash2 = Math.random().toString(36).slice(2, 7)
    return `${creature.name.toLowerCase().replace(/\s+/g, '-')}-deploy-${hash1}-${hash2}`
  }, [creature.name])

  // stable random phase offset so pods animate differently
  const phaseOffset = useMemo(() => Math.random() * 20, [])

  // stable cpu/mem so they don't flicker on re-render
  const metrics = useMemo(() => ({
    cpu: `${Math.floor(Math.random() * 40 + 10)}m`,
    mem: `${Math.floor(Math.random() * 100 + 80)}Mi`,
  }), [])
  
  const logs = usePodLogs(podName, creature.name)
  const logsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight
    }
  }, [logs])

  if (!visible) return null

  return (
    <div className={`terminal-pod ${stopped ? 'pod-stopped' : ''}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="title-bar">
        <span className="pod-name">{podName}</span>
        <span className={`pod-status ${stopped ? 'terminated' : 'running'}`}>
          {stopped ? 'Terminated' : 'Running'}
        </span>
        <button
          className="btn-stop"
          onClick={() => setStopped(!stopped)}
          title={stopped ? 'Restart pod' : 'Stop pod'}
        >
          {stopped ? '▶ Start' : '■ Stop'}
        </button>
      </div>

      {!stopped && (
        <>
          <div className="voxel-viewport">
            <VoxelScene creature={creature} phaseOffset={phaseOffset} />
          </div>

          <div className="pod-logs" ref={logsRef}>
            {logs.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>

          <div className="pod-meta">
            <span><span className="label">cpu:</span> <span className="value">{metrics.cpu}</span></span>
            <span><span className="label">mem:</span> <span className="value">{metrics.mem}</span></span>
            <span><span className="label">restarts:</span> <span className="value">0</span></span>
            <span><span className="label">age:</span> <span className="value">{index + 1}s</span></span>
          </div>
        </>
      )}
    </div>
  )
}

/* ── pod cluster grid ───────────────────────────── */

export default function PodCluster({ creature, config, onReset }: Props) {
  const pods = Array.from({ length: config.replicas }, (_, i) => i)
  const delayPerPod = config.strategy === 'RollingUpdate' ? 400 : 0

  return (
    <div className="cluster-view">
      <div className="cluster-header">
        <h2>🟢 {config.replicas} pod{config.replicas > 1 ? 's' : ''} running!</h2>
        <span className="namespace">namespace: creatures</span>
        <button className="btn-reset" onClick={onReset}>💥 Tear down</button>
      </div>

      <div className="pod-grid">
        {pods.map(i => (
          <TerminalPod
            key={i}
            creature={creature}
            index={i}
            delay={i * delayPerPod}
          />
        ))}
      </div>
    </div>
  )
}
