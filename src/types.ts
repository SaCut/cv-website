export interface Voxel {
  x: number
  y: number
  z: number
  color: string
}

export type AnimationType = 'sway' | 'swim' | 'hover' | 'bounce' | 'waddle' | 'flutter' | 'drift'

export interface CreatureData {
  name: string
  voxels: Voxel[]
  primaryColor: string
  scale: number
  animation: AnimationType
}

export type AppState = 'landing' | 'deploying' | 'deployed'
export type StageStatus = 'pending' | 'running' | 'success' | 'failed'

export interface PipelineStage {
  id: string
  label: string
  status: StageStatus
}

export interface DeployConfig {
  creatureName: string
  replicas: number
  strategy: 'RollingUpdate' | 'Recreate'
}
