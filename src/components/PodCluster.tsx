import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import type { CreatureData, DeployConfig } from "../types"
import { getCreaturePods, getCreatureMetrics, restartPod, teardownCreature, type PodStatus, type PodMetric } from "../api"
import PixelCreature from "./PixelCreature"

interface Props {
  creature: CreatureData
  config: DeployConfig
  onReset: () => void
  onRelaunch?: () => void
}

/* ── fake pod log generator ─────────────────────── */

type LogFn = () => string
const r = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const IDLE_LOG_FNS: LogFn[] = [
  // health
  () => `[health] liveness probe: OK`,
  () => `[health] readiness probe: OK (optimistic)`,
  () => `[health] HTTP GET /healthz returned 200 (surprisingly)`,
  () => `[health] probes passing. so far.`,
  () => `[health] no crashes detected in the last ${r(5, 90)}s`,
  () => `[health] heartbeat detected. still alive.`,
  () => `[health] wellness check: ambivalent but functional`,
  // metrics
  () => `[metrics] cpu: ${r(5, 35)}m (barely awake)`,
  () => `[metrics] mem: ${r(50, 150)}Mi (and climbing)`,
  () => `[metrics] requests: ${r(0, 12)}/s (honestly not bad)`,
  () => `[metrics] p95 latency: ${r(10, 60)}ms (we've seen worse)`,
  () => `[metrics] GC pause: ${r(1, 9)}ms (acceptable, barely)`,
  () => `[metrics] cache hit ratio: ${r(74, 96)}% (not terrible)`,
  () => `[metrics] network rx: ${r(50, 500)}KB/s, tx: ${r(20, 300)}KB/s`,
  () => `[metrics] goroutines: ${r(10, 42)} (manageable chaos)`,
  () => `[metrics] connection pool: ${r(2, 7)}/10 active`,
  () => `[metrics] open file descriptors: ${r(48, 160)} (fine. probably.)`,
  // main
  () => `[main] animation loop running. still. somehow.`,
  () => `[main] frame ${r(1, 6)}/6 rendered without incident`,
  () => `[main] pixel pipeline operational (knock on wood)`,
  () => `[main] sprite cache loaded. hope you like it.`,
  () => `[main] vsync aligned (we think)`,
  () => `[main] no errors in the last ${r(5, 120)} seconds. suspicious.`,
  () => `[main] render batch complete. moving on.`,
  () => `[main] transparency layer: mostly transparent`,
  () => `[main] background task idle. as intended. we hope.`,
  () => `[main] event loop lag: ${r(0, 4)}ms (tolerable)`,
  () => `[main] session count: ${r(1, 60)} active users (allegedly)`,
  () => `[main] antialiasing disabled. it's pixel art. obviously.`,
  () => `[main] graceful degradation standing by (hopefully unused)`,
  () => `[main] everything nominal. why does that worry us.`,
  () => `[main] accepting connections. reluctantly.`,
  () => `[main] processing queue: ${r(0, 6)} items (we're on it)`,
  () => `[main] cache eviction freed ${r(4, 28)}MB. you're welcome.`,
  // warn
  () => `[warn] upstream service timeout. retry ${r(1, 3)}/3 planned.`,
  () =>
    `[warn] slow query detected: ${r(200, 1100)}ms. someone investigate that.`,
  () =>
    `[warn] redis connection dropped. using stale cache. it's fine. probably.`,
  () =>
    `[warn] disk usage ${r(70, 90)}%. someone should look at that eventually.`,
  () =>
    `[warn] certificate expires in ${r(1, 45)} days. renewing would be wise.`,
  () =>
    `[warn] client used deprecated endpoint. they were informed. they don't care.`,
  () => `[warn] unusual traffic detected. monitoring. or possibly ignoring.`,
  () =>
    `[warn] DNS resolution took ${r(500, 1100)}ms. the internet is slow today.`,
  () => `[warn] graceful shutdown requested. request noted and filed.`,
  () => `[warn] malformed request rejected. sorry not sorry.`,
  () => `[warn] rate limit approaching: ${r(88, 99)}/100. slow down.`,
  () => `[warn] health check missed. probably just network jitter. probably.`,
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function usePodLogs(creatureName: string) {
  const [logs, setLogs] = useState<string[]>([])
  const deckRef = useRef<LogFn[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval>>()
  const startupDoneRef = useRef(false)

  // Startup logs — fire exactly once per component mount
  useEffect(() => {
    if (startupDoneRef.current) return
    startupDoneRef.current = true
    const startupLogs = [
      `[init] pulling image creature-registry/${creatureName}:latest`,
      `[init] image pulled in 0.${r(1, 9)}s`,
      `[main] starting pixel renderer...`,
      `[main] creature loaded: ${creatureName}`,
      `[health] liveness probe: OK`,
      `[health] readiness probe: OK`,
    ]
    startupLogs.forEach((log, i) => {
      setTimeout(() => setLogs(prev => [...prev, log]), 800 * (i + 1))
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Idle deck — set up once on mount
  useEffect(() => {
    deckRef.current = shuffle(IDLE_LOG_FNS)
    intervalRef.current = setInterval(
      () => {
        if (deckRef.current.length === 0) deckRef.current = shuffle(IDLE_LOG_FNS)
        const fn = deckRef.current.pop()!
        setLogs(prev => [...prev.slice(-15), fn()])
      },
      6000 + Math.random() * 6000,
    )
    return () => clearInterval(intervalRef.current)
  }, [])

  return logs
}

/* ── copyable kubectl command ───────────────────── */

function CopyableCommand({ cmd }: { cmd: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(cmd).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className="kubectl-row">
      <span className="kubectl-prompt">$</span>
      <span className="kubectl-cmd">{cmd}</span>
      <button className="kubectl-copy" onClick={copy} title="Copy to clipboard">
        {copied ? "✓" : "copy"}
      </button>
    </div>
  )
}

/* ── single pod ─────────────────────────────────── */

function TerminalPod({
  creature,
  index,
  delay,
  realPod,
  realCpu,
  realMem,
  onRestart,
}: {
  creature: CreatureData
  index: number
  delay: number
  realPod?: PodStatus
  realCpu?: string
  realMem?: string
  onRestart?: () => void
}) {
  const [visible, setVisible] = useState(false)

  const generatedName = useMemo(() => {
    const hash1 = Math.random().toString(36).slice(2, 7)
    const hash2 = Math.random().toString(36).slice(2, 7)
    return `${creature.name.toLowerCase().replace(/\s+/g, "-")}-deploy-${hash1}-${hash2}`
  }, [creature.name])
  const podName = realPod?.name ?? generatedName

  const podPhase = realPod?.phase ?? "Running"
  const isRunning = podPhase === "Running"
  const isStopped = podPhase === "Succeeded" || podPhase === "Failed"

  // stable random phase offset so pods animate differently
  const phaseOffset = useMemo(() => Math.random() * 20, [])

  // stable fake cpu/mem — shown only when real metrics are unavailable
  const fallbackMetrics = useMemo(
    () => ({
      cpu: `${Math.floor(Math.random() * 40 + 10)}m`,
      mem: `${Math.floor(Math.random() * 100 + 80)}Mi`,
    }),
    [],
  )

  // Live age — ticks every second when we have a real start time
  const [age, setAge] = useState(() => {
    if (!realPod?.started) return `${index + 1}s`
    const e = Math.floor((Date.now() - new Date(realPod.started).getTime()) / 1000)
    return e < 60 ? `${e}s` : e < 3600 ? `${Math.floor(e / 60)}m` : `${Math.floor(e / 3600)}h`
  })

  useEffect(() => {
    if (!realPod?.started) return
    const started = new Date(realPod.started).getTime()
    const tick = () => {
      const e = Math.floor((Date.now() - started) / 1000)
      setAge(e < 60 ? `${e}s` : e < 3600 ? `${Math.floor(e / 60)}m` : `${Math.floor(e / 3600)}h`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [realPod?.started])

  const logs = usePodLogs(creature.name)
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
    <div
      className={`terminal-pod ${isStopped ? "pod-stopped" : ""}`}
      style={{ animationDelay: `${delay}ms` }}>
      <div className="title-bar">
        <span className="pod-name">{podName}</span>
        <div className="title-bar-right">
          {onRestart && !isStopped && (
            <button
              className="btn-pod-restart"
              onClick={onRestart}
              title="Restart pod">
              ↻
            </button>
          )}
          <span
            className={`pod-status ${isRunning ? "running" : isStopped ? "terminated" : "pending"}`}>
            {podPhase}
          </span>
        </div>
      </div>

      {!isStopped && (
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
                    <span className={`log-level level-${m[1]}`}>[{m[1]}]</span>{" "}
                    {m[2]}
                  </div>
                )
              }
              return <div key={i}>{line}</div>
            })}
          </div>

          <div className="pod-meta">
            <span>
              <span className="label">cpu:</span>{" "}
              <span className="value">{realCpu ?? fallbackMetrics.cpu}</span>
            </span>
            <span>
              <span className="label">mem:</span>{" "}
              <span className="value">{realMem ?? fallbackMetrics.mem}</span>
            </span>
            <span>
              <span className="label">restarts:</span>{" "}
              <span className="value">{realPod?.restarts ?? 0}</span>
            </span>
            <span>
              <span className="label">age:</span>{" "}
              <span className="value">{age}</span>
            </span>
          </div>
        </>
      )}
    </div>
  )
}

/* ── pod cluster grid ───────────────────────────── */

export default function PodCluster({ creature, config, onReset, onRelaunch }: Props) {
  const [realPods, setRealPods] = useState<PodStatus[]>([])
  const [readyCount, setReadyCount] = useState(0)
  const [totalReplicas, setTotalReplicas] = useState(0)
  const [showDetails, setShowDetails] = useState(false)
  const [podMetrics, setPodMetrics] = useState<Map<string, PodMetric>>(new Map())
  const hasDeployment = !!creature.deploymentName
  const delayPerPod = config.strategy === "RollingUpdate" ? 400 : 0

  // Poll real pod status
  useEffect(() => {
    if (!creature.deploymentName) return

    let active = true

    async function poll() {
      const result = await getCreaturePods(creature.deploymentName!)
      if (!active) return
      // If k8s confirmed 404 (not a network error), the deployment is gone — clean up
      if (!result.exists && !result.error) {
        onReset()
        return
      }
      if (result.pods.length > 0) {
        setRealPods(result.pods)
        setReadyCount(result.readyReplicas)
        setTotalReplicas(result.replicas)
      }
    }

    poll()
    const interval = setInterval(poll, 4000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [creature.deploymentName, onReset])

  // Poll real CPU/mem metrics every 10s
  useEffect(() => {
    if (!creature.deploymentName) return

    let active = true

    async function pollMetrics() {
      const metrics = await getCreatureMetrics(creature.deploymentName!)
      if (!active) return
      const m = new Map<string, PodMetric>()
      for (const pm of metrics) m.set(pm.podName, pm)
      setPodMetrics(m)
    }

    pollMetrics()
    const interval = setInterval(pollMetrics, 10000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [creature.deploymentName])

  const handleRestartPod = useCallback(async (podName: string) => {
    await restartPod(podName)
    // optimistically clear that pod from list — it'll repopulate on next poll
    setRealPods(prev => prev.filter(p => p.name !== podName))
  }, [])

  const handleTeardown = useCallback(async () => {
    if (creature.deploymentName) {
      await teardownCreature(creature.deploymentName)
    }
    onReset()
  }, [creature.deploymentName, onReset])

  // Use real pods if available, otherwise generate placeholders
  const displayPods =
    hasDeployment && realPods.length > 0
      ? realPods
      : Array.from({ length: config.replicas }, (_, i) => ({
          name: "",
          phase: "Running" as const,
          ready: true,
          started: null,
        }))

  const podCount = displayPods.length
  const runningCount = hasDeployment ? readyCount : podCount

  const healthPct =
    podCount > 0 ? Math.round((runningCount / podCount) * 100) : 0

  return (
    <div className="cluster-view">
      <div className="cluster-header">
        <div className="cluster-title-row">
          <h2>
            {runningCount}/{podCount} pod{podCount > 1 ? "s" : ""} running
            {hasDeployment && (
              <span className="real-badge" title="Real pods running on k3s">
                LIVE
              </span>
            )}
          </h2>
          <div className="cluster-actions">
            {hasDeployment && onRelaunch && (
              <button
                className="btn-relaunch"
                onClick={onRelaunch}
                title="Tear down and re-deploy a fresh creature">
                Relaunch
              </button>
            )}
            {hasDeployment && (
              <button
                className="btn-details"
                onClick={() => setShowDetails((d) => !d)}
                title="Deployment details">
                {showDetails ? "Hide details" : "Details"}
              </button>
            )}
            <button className="btn-reset" onClick={handleTeardown}>
              Tear down
            </button>
          </div>
        </div>

        {/* ── status bar ── */}
        <div className="cluster-status-bar">
          <div
            className={`cluster-status-fill ${healthPct === 100 ? "healthy" : healthPct > 0 ? "partial" : "down"}`}
            style={{ width: `${healthPct}%` }}
          />
        </div>
        <span className="namespace">
          namespace: creatures{hasDeployment && " · k3s cluster"}
        </span>
      </div>

      {/* ── expert details panel ── */}
      {showDetails && hasDeployment && (
        <div className="deploy-details">
          <div className="detail-row">
            <span className="detail-label">deployment</span>
            <span className="detail-value">{creature.deploymentName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">namespace</span>
            <span className="detail-value">creatures</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">replicas</span>
            <span className="detail-value">
              {readyCount}/{totalReplicas || config.replicas} ready
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">strategy</span>
            <span className="detail-value">{config.strategy}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">image</span>
            <span className="detail-value">busybox:latest</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">resources</span>
            <span className="detail-value">10m CPU / 16Mi mem (limit)</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">TTL</span>
            <span className="detail-value">600s (auto-cleanup)</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">service account</span>
            <span className="detail-value">creature-manager</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">API route</span>
            <span className="detail-value">
              CF Worker → CF Tunnel → k3s:6443
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">cluster</span>
            <span className="detail-value">k3s v1.34 · Oracle Cloud VM</span>
          </div>

          {/* ── try it ── */}
          <div className="kubectl-section">
            <span className="kubectl-heading">try it yourself</span>
            <CopyableCommand cmd={`kubectl get pods -n creatures -l creature-deployment=${creature.deploymentName}`} />
            {realPods[0]?.name && (
              <CopyableCommand cmd={`kubectl logs ${realPods[0].name} -n creatures`} />
            )}
            <CopyableCommand cmd={`kubectl describe deployment ${creature.deploymentName} -n creatures`} />
            <CopyableCommand cmd={`kubectl top pods -n creatures -l creature-deployment=${creature.deploymentName}`} />
          </div>
        </div>
      )}

      <div className="pod-grid">
        {displayPods.map((pod, i) => {
          const m = podMetrics.get(pod.name)
          return (
            <TerminalPod
              key={pod.name || i}
              creature={creature}
              index={i}
              delay={i * delayPerPod}
              realPod={hasDeployment ? pod : undefined}
              realCpu={m?.cpu}
              realMem={m?.memory}
              onRestart={hasDeployment && pod.name ? () => handleRestartPod(pod.name) : undefined}
            />
          )
        })}
      </div>
    </div>
  )
}
