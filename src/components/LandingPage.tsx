import ThemeToggle from "./ThemeToggle"

interface Props {
  onLaunch: () => void
  onViewCV: () => void
  onViewInfra: () => void
  hasDeployment: boolean
}

export default function LandingPage({
  onLaunch,
  onViewCV,
  onViewInfra,
  hasDeployment,
}: Props) {
  return (
    <div className="landing">
      <ThemeToggle />
      <h1 className="landing-name">
        Hi, I'm <span className="highlight">Saverio</span>
      </h1>
      <p className="landing-role">
        I build pipelines and tooling with AI so that important processes can
        happen with the press of a single button.
      </p>
      <div className="landing-subtitle">
        <span className="tag">☁️ Cloud Infra</span>
        <span className="tag">🔧 CI/CD</span>
        <span className="tag">🐳 Containers</span>
        <span className="tag">✨ Dev Experience</span>
      </div>

      <hr className="landing-divider" />

      <p className="landing-bio">
        Generate a sprite, deploy it to k3s, watch the pods come up.
      </p>
      <div className="landing-cta-row">
        <button className="btn-launch" onClick={onLaunch}>
          {hasDeployment ? "👀 View Deployment" : "🚀 Launch Pods"}
        </button>
      </div>
      <div className="landing-cta-row">
        <button className="btn-cv" onClick={onViewInfra}>
          About
        </button>
        <button className="btn-cv" onClick={onViewCV}>
          CV
        </button>
      </div>
      <div className="landing-links">
        <a href="mailto:saveriocutrupi@hotmail.com">📬 Email</a>
        <a
          href="https://linkedin.com/in/saverio-cutrupi"
          target="_blank"
          rel="noopener noreferrer">
          💼 LinkedIn
        </a>
      </div>
    </div>
  )
}
