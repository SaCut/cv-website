import { useState, useCallback, useEffect } from 'react'
import type { AppState, CreatureData, DeployConfig } from './types'
import { teardownCreature } from './api'
import LandingPage from './components/LandingPage'
import Pipeline from './components/Pipeline'
import PodCluster from './components/PodCluster'
import CVPage from './components/CVPage'

/* ── sessionStorage persistence ─────────────────── */

const STORAGE_KEY = 'cv-deployment'

interface SavedDeployment {
  creature: CreatureData
  config: DeployConfig
}

function loadDeployment(): SavedDeployment | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

function saveDeployment(creature: CreatureData, config: DeployConfig) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ creature, config }))
}

function clearDeployment() {
  sessionStorage.removeItem(STORAGE_KEY)
}

/* ── app ────────────────────────────────────────── */

export default function App() {
  const saved = loadDeployment()
  const [phase, setPhase] = useState<'idle' | 'config' | 'deploying' | 'deployed'>(
    saved ? 'deployed' : 'idle'
  )
  const [showCV, setShowCV] = useState(false)
  const [config, setConfig] = useState<DeployConfig>(
    saved?.config ?? { creatureName: '', replicas: 3, strategy: 'RollingUpdate' }
  )
  const [creature, setCreature] = useState<CreatureData | null>(saved?.creature ?? null)

  const handleLaunch = useCallback(() => {
    if (creature !== null) {
      setPhase('deployed')
    } else {
      setPhase('config')
    }
  }, [creature])

  const handleDeploy = useCallback((cfg: DeployConfig) => {
    setConfig(cfg)
    setPhase('deploying')
  }, [])

  const handleDeployComplete = useCallback((data: CreatureData) => {
    setCreature(data)
    setPhase('deployed')
    saveDeployment(data, config)
  }, [config])

  const handleReset = useCallback(() => {
    setPhase('idle')
    setCreature(null)
    clearDeployment()
  }, [])

  const handleRelaunch = useCallback(async () => {
    // Tear down current deployment, then rerun Pipeline with same config
    if (creature?.deploymentName) {
      await teardownCreature(creature.deploymentName)
    }
    setCreature(null)
    clearDeployment()
    setPhase('deploying')
  }, [creature])

  if (showCV) {
    return (
      <div className="app">
        <CVPage onBack={() => setShowCV(false)} />
      </div>
    )
  }

  const expanded = phase !== 'idle'

  return (
    <div className={`app panorama ${expanded ? 'panorama-expanded' : ''}`}>
      <section className="pano-landing">
        <LandingPage 
          onLaunch={handleLaunch} 
          onViewCV={() => setShowCV(true)}
          hasDeployment={creature !== null}
        />
      </section>

      {expanded && (
        <section className="pano-deploy">
          {phase === 'config' && (
            <ConfigPanel onDeploy={handleDeploy} onClose={() => setPhase('idle')} />
          )}

          {phase === 'deploying' && (
            <Pipeline config={config} onComplete={handleDeployComplete} />
          )}

          {phase === 'deployed' && creature && (
            <PodCluster creature={creature} config={config} onReset={handleReset} onRelaunch={handleRelaunch} />
          )}
        </section>
      )}
    </div>
  )
}

/* ── inline config panel (small, not worth a file) ── */

function ConfigPanel({ onDeploy, onClose }: { onDeploy: (c: DeployConfig) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [replicas, setReplicas] = useState(3)
  const [strategy, setStrategy] = useState<'RollingUpdate' | 'Recreate'>('RollingUpdate')

  return (
    <div className="config-panel">
      <button className="config-close" onClick={onClose} title="Close">✕</button>
      <h2>Build your deployment</h2>

      <div className="config-field">
        <label>Creature / Object</label>
        <input
          type="text"
          placeholder='a dragon? a happy cactus? a tiny robot?'
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
      </div>

      <div className="config-field">
        <label>Replicas: {replicas}</label>
        <input
          type="range"
          min={1}
          max={6}
          value={replicas}
          onChange={e => setReplicas(Number(e.target.value))}
        />
        <div className="range-labels">
          <span>1</span><span>6</span>
        </div>
      </div>

      <div className="config-field">
        <label>Strategy</label>
        <div className="strategy-options">
          <label>
            <input
              type="radio"
              name="strategy"
              value="RollingUpdate"
              checked={strategy === 'RollingUpdate'}
              onChange={() => setStrategy('RollingUpdate')}
            />
            RollingUpdate
          </label>
          <label>
            <input
              type="radio"
              name="strategy"
              value="Recreate"
              checked={strategy === 'Recreate'}
              onChange={() => setStrategy('Recreate')}
            />
            Recreate
          </label>
        </div>
      </div>

      <button
        className="btn-deploy"
        disabled={!name.trim()}
        onClick={() => onDeploy({ creatureName: name.trim(), replicas, strategy })}
      >
Deploy
      </button>
    </div>
  )
}

