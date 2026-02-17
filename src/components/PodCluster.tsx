import { useState, useEffect, useRef, useMemo } from 'react'
import type { CreatureData, DeployConfig } from '../types'
import PixelCreature from './PixelCreature'

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
      `[main] starting pixel renderer...`,
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
      // health
      `[health] liveness probe: OK`,
      `[health] readiness probe: OK`,
      `[health] creature passed vibe check ✓`,
      `[health] emotional support probe: OK`,
      `[health] no anomalies detected (suspicious)`,
      `[health] wellness score: immaculate`,
      `[health] heartbeat strong and rhythmic`,
      `[health] existential-dread probe: negative`,

      // metrics
      `[metrics] cpu: ${Math.floor(Math.random() * 30 + 5)}m, mem: ${Math.floor(Math.random() * 100 + 50)}Mi`,
      `[metrics] requests: ${Math.floor(Math.random() * 10)}/s`,
      `[metrics] happiness: ${Math.floor(Math.random() * 40 + 60)}%`,
      `[metrics] cuddle-readiness: optimal`,
      `[metrics] chaos engineering score: ${Math.floor(Math.random() * 100)}/100`,
      `[metrics] pixel saturation: ${Math.floor(Math.random() * 20 + 80)}%`,
      `[metrics] whimsy factor: ${(Math.random() * 5 + 5).toFixed(1)} mW`,
      `[metrics] sass level: moderate`,
      `[metrics] charm per second: ${Math.floor(Math.random() * 50 + 10)}`,
      `[metrics] caffeine reserves: ${Math.floor(Math.random() * 30 + 70)}%`,
      `[metrics] estimated time to boredom: ∞`,
      `[metrics] fluffiness index: ${(Math.random() * 2 + 8).toFixed(2)}`,
      `[metrics] GC pause: ${Math.floor(Math.random() * 5)}ms (acceptable)`,

      // main
      `[main] creature is vibing`,
      `[main] pixels rendered: ${Math.floor(Math.random() * 150 + 50)}`,
      `[main] creature refuses to stop vibing`,
      `[main] pixel #${Math.floor(Math.random() * 50)} is having an existential crisis`,
      `[main] creature demands more RAM`,
      `[main] tail wag frequency: ${(Math.random() * 3 + 1).toFixed(1)}Hz`,
      `[main] creature is writing yaml now. we've lost control`,
      `[main] deploying additional cuteness... done`,
      `[main] creature has opinions about tabs vs spaces`,
      `[main] creature autonomously refactored the codebase`,
      `[main] creature made a PR. it was merged instantly`,
      `[main] frame ${Math.floor(Math.random() * 6) + 1}/6 is creature's favourite`,
      `[main] creature claims this pod is "cosy"`,
      `[main] creature is debugging itself (meta)`,
      `[main] rendering micro-expression #${Math.floor(Math.random() * 200)}`,
      `[main] creature updated its LinkedIn`,
      `[main] creature requests a window seat`,
      `[main] sprite compression ratio: excellent`,
      `[main] creature achieved inner pixel peace`,
      `[main] drawing antialiased thoughts...`,
      `[main] creature just learned about dependency injection`,
      `[main] creature filed a JIRA ticket about its snack schedule`,
      `[main] creature started a side project inside this pod`,
      `[main] palette optimisation pass complete`,
      `[main] creature quietly judging your code review`,
      `[main] scheduled micro-nap in 3... 2... cancelled, back to work`,
      `[main] creature nominated for Best Pod Resident Q1`,
      `[main] creature is humming the k8s theme song`,
      `[main] idle animation loop #${Math.floor(Math.random() * 999)}: smooth`,

      // warn
      `[warn] creature escaped pod briefly, retrieved`,
      `[warn] creature tried to kubectl exec into neighbouring pod`,
      `[warn] creature discovered npm install. send help`,
      `[warn] creature opened 47 browser tabs in the container`,
      `[warn] creature ate the readiness probe cookie`,
      `[warn] pixel overflow detected in quadrant 3 — contained`,
      `[warn] creature asking about Kubernetes secrets. do not answer.`,
      `[warn] creature attempted lateral movement. charm-based.`,
      `[warn] creature is now root. this is fine.`,
      `[warn] creature's pull request has merge conflicts with reality`,
      `[warn] creature found the production database. distracted with snacks.`,
      `[warn] creature's side-eye is consuming 12% CPU`,
      `[warn] pod disruption budget violated by cuteness overflow`,
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
          <div className="pixel-viewport">
            <PixelCreature creature={creature} phaseOffset={phaseOffset} />
          </div>

          <div className="pod-logs" ref={logsRef}>
            {logs.map((line, i) => {
              const m = line.match(/^\[(\w+)\]\s?(.*)/)
              if (m) {
                return (
                  <div key={i}>
                    <span className={`log-level level-${m[1]}`}>[{m[1]}]</span> {m[2]}
                  </div>
                )
              }
              return <div key={i}>{line}</div>
            })}
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
