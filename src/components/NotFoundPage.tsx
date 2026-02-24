interface Props {
  onBack: () => void
}

export default function NotFoundPage({ onBack }: Props) {
  return (
    <div className="not-found-page">
      <div className="not-found-code">404</div>
      <h1 className="not-found-title">Pod not found</h1>
      <p className="not-found-sub">
        That path doesn't exist in this cluster. Maybe it was deleted,
        or the TTL expired.
      </p>
      <button className="btn-launch" onClick={onBack}>
        ⬅ Back to base
      </button>
    </div>
  )
}
