interface Props {
  onLaunch: () => void
  onViewCV: () => void
  onViewInfra: () => void
  hasDeployment: boolean
}

export default function LandingPage({ onLaunch, onViewCV, onViewInfra, hasDeployment }: Props) {
  return (
    <div className="landing">
      <div className="landing-emoji">🚀</div>
      <h1 className="landing-name">
        Hi, I'm <span className="highlight">Saverio</span>
      </h1>
      <p className="landing-stack">Platform: k3s · Cloudflare · Terraform · Oracle Cloud || £0/month</p>
      <div className="landing-subtitle">
        <span className="tag">☁️ Cloud Infra</span>
        <span className="tag">🔧 CI/CD</span>
        <span className="tag">🐳 Containers</span>
        <span className="tag">✨ Dev Experience</span>
      </div>
      <p className="landing-bio">
        I build the platforms that ship the product — CI/CD pipelines,
        Kubernetes clusters, and the developer tooling that makes teams
        fast. This site runs a pipeline that deploys creature pods to a
        k3s cluster on Oracle Cloud. Give it a go.
      </p>
      <div className="landing-cta-row">
        <button className="btn-launch" onClick={onLaunch}>
          {hasDeployment ? '👀 View Deployment' : '🚀 Launch Pods'}
        </button>
      </div>
      <div className="landing-cta-row">
        <button className="btn-cv" onClick={onViewInfra}>
          🗺️ Current Architecture
        </button>
        <button className="btn-cv" onClick={onViewCV}>
          📄 My CV
        </button>
      </div>
      <div className="landing-links">
        <a href="mailto:saveriocutrupi@hotmail.com">📬 Email</a>
        <a href="https://linkedin.com/in/saverio-cutrupi" target="_blank" rel="noopener noreferrer">
          💼 LinkedIn
        </a>
      </div>
    </div>
  )
}
