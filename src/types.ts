export type PixelFrame = (string | null)[][]

export interface CreatureData {
  name: string
  frames: PixelFrame[]
  primaryColour: string
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
