interface Props {
  onLaunch: () => void
  onViewCV: () => void
}

export default function LandingPage({ onLaunch, onViewCV }: Props) {
  return (
    <div className="landing">
      <div className="landing-emoji">🚀</div>
      <h1 className="landing-name">
        Hi, I'm <span className="highlight">Saverio</span>
      </h1>
      <p className="landing-title">Platform Engineer</p>
      <div className="landing-subtitle">
        <span className="tag">☁️ Cloud Infra</span>
        <span className="tag">🔧 CI/CD</span>
        <span className="tag">🐳 Containers</span>
        <span className="tag">✨ Dev Experience</span>
      </div>
      <p className="landing-bio">
        I like making infrastructure that just works - and making
        tools that people actually enjoy using. This little toy lets you
        spin up voxel creatures inside pretend Kubernetes pods.
        Give it a go!
      </p>
      <div className="landing-cta-row">
        <button className="btn-launch" onClick={onLaunch}>
          🚀 Launch Pods
        </button>
        <button className="btn-cv" onClick={onViewCV}>
          📄 View CV
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
