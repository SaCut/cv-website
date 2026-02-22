import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://pipeline-cv-worker.xartab-mail-flare.workers.dev'
const POLL_INTERVAL = 60_000

interface PodInfo {
  name: string
  phase: string
  ready: boolean
  started: string | null
}

interface InfraStatus {
  status: 'running' | 'not-deployed' | 'error'
  replicas?: number
  readyPods?: number
  pods?: PodInfo[]
  lastDeploy?: string | null
  image?: string | null
  message?: string
}

function formatUptime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${mins % 60}m`

  return `${mins}m`
}

function formatRelative(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diff / 60_000)

  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`

  const hours = Math.floor(mins / 60)

  if (hours < 24) return `${hours}h ago`

  return `${Math.floor(hours / 24)}d ago`
}

export default function LiveInfraPanel() {
  const [data, setData] = useState<InfraStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function poll() {
      try {
        const res = await fetch(`${API_URL}/infra-status`)
        const json = await res.json() as InfraStatus

        if (mounted) setData(json)
      } catch {
        if (mounted) setData({ status: 'error', message: 'Could not reach status endpoint' })
      } finally {
        if (mounted) setLoading(false)
      }
    }

    poll()
    const interval = setInterval(poll, POLL_INTERVAL)

    return () => { mounted = false; clearInterval(interval) }
  }, [])

  if (loading) {
    return (
      <div className="infra-panel infra-loading">
        <span className="infra-dot pulse" /> Checking cluster status...
      </div>
    )
  }

  if (!data || data.status === 'error') {
    return (
      <div className="infra-panel infra-error">
        <span className="infra-dot off" /> Cluster unreachable
      </div>
    )
  }

  if (data.status === 'not-deployed') {
    return (
      <div className="infra-panel infra-pending">
        <span className="infra-dot off" /> Not yet deployed to k3s
      </div>
    )
  }

  const oldestPod = data.pods
    ?.filter(p => p.started)
    .sort((a, b) => new Date(a.started!).getTime() - new Date(b.started!).getTime())[0]

  return (
    <div className="infra-panel infra-running">
      <span className="infra-dot on" />
      <span className="infra-label">Running on k3s</span>
      <span className="infra-sep" />
      <span>{data.readyPods}/{data.replicas} pods ready</span>

      {oldestPod?.started && (
        <>
          <span className="infra-sep" />
          <span>uptime {formatUptime(oldestPod.started)}</span>
        </>
      )}

      {data.lastDeploy && (
        <>
          <span className="infra-sep" />
          <span>last deploy {formatRelative(data.lastDeploy)}</span>
        </>
      )}
    </div>
  )
}
