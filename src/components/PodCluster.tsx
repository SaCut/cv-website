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
      `[health] startup probe: OK (delayed ${Math.floor(Math.random() * 5)}s)`,
      `[health] TCP check on :8080 succeeded`,
      `[health] HTTP GET /healthz returned 200`,
      `[health] no crash loops detected`,
      `[health] OOM score: ${Math.floor(Math.random() * 50)}`,
      `[health] all probes nominal`,

      // metrics
      `[metrics] cpu: ${Math.floor(Math.random() * 30 + 5)}m, mem: ${Math.floor(Math.random() * 100 + 50)}Mi`,
      `[metrics] requests: ${Math.floor(Math.random() * 10)}/s`,
      `[metrics] p95 latency: ${Math.floor(Math.random() * 50 + 10)}ms`,
      `[metrics] active connections: ${Math.floor(Math.random() * 20)}`,
      `[metrics] goroutines: ${Math.floor(Math.random() * 30 + 10)}`,
      `[metrics] GC pause: ${Math.floor(Math.random() * 8)}ms`,
      `[metrics] heap allocated: ${Math.floor(Math.random() * 80 + 40)}Mi`,
      `[metrics] network rx: ${Math.floor(Math.random() * 500)}KB/s, tx: ${Math.floor(Math.random() * 300)}KB/s`,
      `[metrics] open file descriptors: ${Math.floor(Math.random() * 100 + 50)}`,
      `[metrics] thread count: ${Math.floor(Math.random() * 20 + 5)}`,
      `[metrics] cache hit ratio: ${Math.floor(Math.random() * 30 + 70)}%`,
      `[metrics] request queue depth: ${Math.floor(Math.random() * 5)}`,

      // main
      `[main] frame buffer rendered ${Math.floor(Math.random() * 60)} frames`,
      `[main] animation loop tick ${Math.floor(Math.random() * 999)}`,
      `[main] sprite cache warm`,
      `[main] pixel pipeline idle`,
      `[main] colour palette loaded (${Math.floor(Math.random() * 5 + 5)} entries)`,
      `[main] transparency layer optimised`,
      `[main] render batch complete`,
      `[main] frame ${Math.floor(Math.random() * 6) + 1}/6 in buffer`,
      `[main] vsync aligned`,
      `[main] no dropped frames in last ${Math.floor(Math.random() * 60)}s`,
      `[main] graceful degradation mode: disabled`,
      `[main] antialiasing pass skipped (pixel art)`,
      `[main] scaling filter: nearest-neighbour`,
      `[main] accepting WebSocket connections`,
      `[main] background worker idle`,
      `[main] event loop lag: ${Math.floor(Math.random() * 3)}ms`,
      `[main] database connection pool: 5/10 active`,
      `[main] cache eviction ran, freed ${Math.floor(Math.random() * 20)}MB`,
      `[main] session count: ${Math.floor(Math.random() * 50)}`,
      `[main] rate limiter: ${Math.floor(Math.random() * 100)} tokens remaining`,

      // warn
      `[warn] retry attempt ${Math.floor(Math.random() * 3) + 1}/3 for upstream service`,
      `[warn] slow query detected: ${Math.floor(Math.random() * 800 + 200)}ms`,
      `[warn] connection timeout to redis, using fallback`,
      `[warn] disk usage at ${Math.floor(Math.random() * 20 + 70)}%`,
      `[warn] TLS certificate expires in ${Math.floor(Math.random() * 30 + 1)} days`,
      `[warn] deprecated API endpoint called`,
      `[warn] unusual traffic pattern detected, monitoring`,
      `[warn] DNS resolution slow (${Math.floor(Math.random() * 500 + 500)}ms)`,
      `[warn] graceful shutdown initiated but ignored`,
      `[warn] client sent malformed request, rejected`,
      `[warn] load balancer health check missed (transient)`,
      `[warn] rate limit almost exceeded: ${Math.floor(Math.random() * 10 + 90)}/100`,
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
