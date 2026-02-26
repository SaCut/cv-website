/**
 * Infrastructure diagram page -- visual map of the site's architecture.
 * Pure CSS card layout (no SVG) for a solid, readable feel that matches
 * the rest of the site.
 */

interface Props {
  onBack: () => void
}

/* ── data ──────────────────────────────────────────── */

interface Node {
  id: string
  label: string
  sub: string
  colour: string
}

interface Edge {
  from: string
  to: string
  label: string
  dashed?: boolean
}

const TIERS: { title: string; nodes: Node[] }[] = [
  {
    title: "Client",
    nodes: [
      {
        id: "ghpages",
        label: "GitHub Pages",
        sub: "Static hosting",
        colour: "var(--text)",
      },
      {
        id: "browser",
        label: "React SPA",
        sub: "Vite + TypeScript",
        colour: "var(--accent)",
      },
    ],
  },
  {
    title: "Edge",
    nodes: [
      {
        id: "worker",
        label: "Cloudflare Worker",
        sub: "pipeline-cv-worker",
        colour: "var(--orange)",
      },
    ],
  },
  {
    title: "AI",
    nodes: [
      {
        id: "flux",
        label: "FLUX.1 schnell",
        sub: "Workers AI binding",
        colour: "var(--pink)",
      },
      {
        id: "ghmodels",
        label: "GitHub Models",
        sub: "GPT-4o / 4o-mini",
        colour: "var(--cyan)",
      },
    ],
  },
  {
    title: "Compute",
    nodes: [
      {
        id: "k3s",
        label: "k3s Cluster",
        sub: "Oracle Cloud ARM",
        colour: "var(--green)",
      },
    ],
  },
]

const EDGES: Edge[] = [
  { from: "ghpages", to: "browser", label: "serves SPA" },
  { from: "browser", to: "worker", label: "/generate-sprite, /animate-sprite" },
  {
    from: "browser",
    to: "worker",
    label: "/k8s/deploy, /k8s/pods, /k8s/pod-metrics",
  },
  { from: "browser", to: "worker", label: "/k8s/heartbeat", dashed: true },
  { from: "worker", to: "flux", label: "AI.run() -- image generation" },
  { from: "worker", to: "ghmodels", label: "Vision QA + bg-removal plan" },
  {
    from: "worker",
    to: "ghmodels",
    label: "Colour hint, fallback Q1-Q5, animation",
  },
  { from: "worker", to: "k3s", label: "k8s API -- deployment CRUD" },
  {
    from: "worker",
    to: "k3s",
    label: "Cron: cleanup stale deployments",
    dashed: true,
  },
]

/* ── component ────────────────────────────────────── */

export default function InfraPage({ onBack }: Props) {
  return (
    <div className="infra-page">
      <button className="cv-back-btn" onClick={onBack}>
        ⬅ Back
      </button>

      <h1 className="infra-title">Architecture</h1>
      <p className="infra-subtitle">
        How this site generates pixel creatures and deploys them to a real
        Kubernetes cluster.
      </p>

      <div className="infra-cost-banner">
        <span className="infra-cost-label">Total Cost</span>
        <span className="infra-cost-value">£0</span>
        <span className="infra-cost-note">/ month</span>
      </div>

      {/* diagram */}
      <div className="infra-tiers">
        {TIERS.map((tier, ti) => (
          <div key={tier.title} className="infra-tier">
            <span className="tier-label">{tier.title}</span>
            <div className="tier-nodes">
              {tier.nodes.map((n) => (
                <div
                  key={n.id}
                  className="infra-node"
                  style={{ borderColor: n.colour }}>
                  <span
                    className="infra-node-dot"
                    style={{ background: n.colour }}
                  />
                  <div>
                    <div className="infra-node-label">{n.label}</div>
                    <div className="infra-node-sub">{n.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            {ti < TIERS.length - 1 && (
              <div className="tier-connector">
                <span className="tier-arrow">↓</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* connections table */}
      <div className="infra-connections">
        <h2>Connections</h2>
        <table>
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {EDGES.map((e, i) => (
              <tr key={i} className={e.dashed ? "edge-optional" : ""}>
                <td>
                  {
                    TIERS.flatMap((t) => t.nodes).find((n) => n.id === e.from)
                      ?.label
                  }
                </td>
                <td>
                  {
                    TIERS.flatMap((t) => t.nodes).find((n) => n.id === e.to)
                      ?.label
                  }
                </td>
                <td>
                  <code>{e.label}</code>
                  {e.dashed && <span className="edge-tag">async</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* narrative */}
      <section className="infra-narrative">
        <h2>Request flow</h2>
        <ol>
          <li>
            <strong>GitHub Pages</strong> serves the React SPA (Vite build) to
            the browser. No server-side rendering.
          </li>
          <li>
            The user types a creature name and hits Deploy. The browser sends{" "}
            <code>POST /generate-sprite</code> to the
            <strong> Cloudflare Worker</strong>.
          </li>
          <li>
            The worker calls <strong>FLUX.1 schnell</strong> via the Workers AI
            binding. Image generation takes ~3 s and returns a base64 JPEG.
          </li>
          <li>
            In parallel, the worker sends the image to
            <strong> GPT-4o-mini</strong> (GitHub Models, vision mode) for
            quality gating and background-removal planning. A colour hint is
            fetched at the same time.
          </li>
          <li>
            The browser receives the image + bg-ops plan. Rasterisation happens
            client-side: unsharp mask, BFS flood fill, erosion → 64×64 pixel
            grid.
          </li>
          <li>
            The worker creates a real <strong>k3s Deployment</strong> on Oracle
            Cloud (ARM). Pods run busybox with a 10-minute TTL. The browser
            polls pod status and displays live CPU/memory metrics from
            metrics-server.
          </li>
          <li>
            A <strong>cron trigger</strong> (every 10 min) sweeps stale
            deployments. Heartbeats from active browsers extend the TTL.
          </li>
          <li>
            If Workers AI is unavailable, the worker falls back to a 5-query LLM
            pipeline (describe → structure → colour → motion → animate) via
            GitHub Models.
          </li>
        </ol>
      </section>
    </div>
  )
}
