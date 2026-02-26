import ThemeToggle from "./ThemeToggle"

interface Props {
  onViewCV: () => void
}

export default function StickyHeader({ onViewCV }: Props) {
  return (
    <header className="sticky-header">
      <div className="header-left">
        <span className="header-name">Saverio Cutrupi</span>
      </div>
      <div className="header-right">
        <ThemeToggle />
        <button className="header-btn cv" onClick={onViewCV}>CV</button>
        <a className="header-btn" href="mailto:saveriocutrupi@hotmail.com">📬</a>
        <a
          className="header-btn"
          href="https://linkedin.com/in/saverio-cutrupi"
          target="_blank"
          rel="noopener noreferrer"
        >
          💼
        </a>
      </div>
    </header>
  )
}
