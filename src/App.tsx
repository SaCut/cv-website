import { useState, useCallback } from 'react'
import type { AppState, CreatureData, DeployConfig } from './types'
import LandingPage from './components/LandingPage'
import Pipeline from './components/Pipeline'
import PodCluster from './components/PodCluster'
import StickyHeader from './components/StickyHeader'
import CVPage from './components/CVPage'

export default function App() {
  const [state, setState] = useState<AppState>('landing')
  const [showConfig, setShowConfig] = useState(false)
  const [showCV, setShowCV] = useState(false)
  const [config, setConfig] = useState<DeployConfig>({
    creatureName: '',
    replicas: 3,
    strategy: 'RollingUpdate',
  })
  const [creature, setCreature] = useState<CreatureData | null>(null)

  const handleLaunch = useCallback(() => setShowConfig(true), [])

  const handleDeploy = useCallback((cfg: DeployConfig) => {
    setConfig(cfg)
    setShowConfig(false)
    setState('deploying')
  }, [])

  const handleDeployComplete = useCallback((data: CreatureData) => {
    setCreature(data)
    setState('deployed')
  }, [])

  const handleReset = useCallback(() => {
    setState('landing')
    setShowConfig(false)
    setShowCV(false)
    setCreature(null)
  }, [])

  if (showCV) {
    return (
      <div className="app">
        <CVPage onBack={() => setShowCV(false)} />
      </div>
    )
  }

  return (
    <div className="app">
      {state === 'landing' && (
        <>
          <LandingPage onLaunch={handleLaunch} onViewCV={() => setShowCV(true)} />
          {showConfig && <ConfigPanel onDeploy={handleDeploy} />}
        </>
      )}

      {state === 'deploying' && (
        <Pipeline config={config} onComplete={handleDeployComplete} />
      )}

      {state === 'deployed' && creature && (
        <>
          <StickyHeader onViewCV={() => setShowCV(true)} />
          <PodCluster creature={creature} config={config} onReset={handleReset} />
        </>
      )}
    </div>
  )
}

/* ── inline config panel (small, not worth a file) ── */

function ConfigPanel({ onDeploy }: { onDeploy: (c: DeployConfig) => void }) {
  const [name, setName] = useState('')
  const [replicas, setReplicas] = useState(3)
  const [strategy, setStrategy] = useState<'RollingUpdate' | 'Recreate'>('RollingUpdate')

  return (
    <div className="config-panel">
      <h2>🛠️ Build your deployment</h2>

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
🚀 Deploy!
      </button>
    </div>
  )
}
