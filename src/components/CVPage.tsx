interface Props {
  onBack: () => void
}

/* ── pixel-art sprites (pure CSS, 10×10) ─────────────── */
/* Each sprite is topical to its section.                  */

type Sprite = (string | null)[][]

const SPRITES: Record<string, { grid: Sprite; label: string }> = {
  /* cloud server — for the "About" intro */
  cloud: {
    label: 'cloud server',
    grid: [
      [null,    null,    null,    '#c4d9f2',null,    null,    null,    null,    null,    null   ],
      [null,    null,    '#c4d9f2','#dae8fc','#c4d9f2',null,   null,    null,    null,    null   ],
      [null,    '#c4d9f2','#dae8fc','#dae8fc','#dae8fc','#c4d9f2',null,  null,    null,    null   ],
      ['#c4d9f2','#dae8fc','#dae8fc','#dae8fc','#dae8fc','#dae8fc','#c4d9f2',null, null,   null   ],
      ['#c4d9f2','#dae8fc','#dae8fc','#dae8fc','#dae8fc','#dae8fc','#dae8fc','#c4d9f2',null, null ],
      [null,    null,    null,    null,    null,    null,    null,    null,    null,    null   ],
      [null,    null,    '#888',  '#888',  '#888',  '#888',  '#888',  '#888',  null,    null   ],
      [null,    null,    '#AAA',  '#66CCFF','#AAA', '#66CCFF','#AAA', '#AAA',  null,    null   ],
      [null,    null,    '#888',  '#888',  '#888',  '#888',  '#888',  '#888',  null,    null   ],
      [null,    null,    null,    '#666',  null,    null,    '#666',  null,    null,    null   ],
    ],
  },
  /* toolbox with wrench — for "What I work with" */
  toolbox: {
    label: 'toolbox',
    grid: [
      [null,    null,    null,    '#888',  '#888',  null,    null,    null,    null,    null   ],
      [null,    null,    '#888',  null,    null,    '#888',  null,    null,    null,    null   ],
      [null,    '#D44',  '#D44',  '#D44',  '#D44',  '#D44',  '#D44',  '#D44',  '#D44',  null   ],
      [null,    '#C33',  '#C33',  '#C33',  '#FFCC00','#FFCC00','#C33', '#C33',  '#C33',  null   ],
      [null,    '#B22',  '#B22',  '#B22',  '#B22',  '#B22',  '#B22',  '#B22',  '#B22',  null   ],
      [null,    '#B22',  '#DDD',  '#DDD',  '#B22',  '#B22',  '#B22',  '#B22',  '#B22',  null   ],
      [null,    '#B22',  '#DDD',  '#DDD',  '#B22',  '#B22',  '#B22',  '#B22',  '#B22',  null   ],
      [null,    '#A11',  '#A11',  '#A11',  '#A11',  '#A11',  '#A11',  '#A11',  '#A11',  null   ],
      [null,    null,    null,    null,    null,    null,    null,    null,    null,    null   ],
      [null,    null,    null,    null,    null,    null,    null,    null,    null,    null   ],
    ],
  },
  /* rocket launching — for "Experience" */
  rocket: {
    label: 'rocket',
    grid: [
      [null,    null,    null,    null,    '#FF3333',null,    null,    null,    null,    null   ],
      [null,    null,    null,    '#FF3333','#E0E0E0','#FF3333',null,   null,    null,    null   ],
      [null,    null,    null,    '#E0E0E0','#FF3333','#E0E0E0',null,   null,    null,    null   ],
      [null,    null,    null,    '#D0D0D0','#66CCFF','#D0D0D0',null,   null,    null,    null   ],
      [null,    null,    null,    '#E0E0E0','#E0E0E0','#E0E0E0',null,   null,    null,    null   ],
      [null,    null,    '#FF3333','#E0E0E0','#E0E0E0','#E0E0E0','#FF3333',null,  null,    null   ],
      [null,    null,    '#FF3333','#D0D0D0','#E0E0E0','#D0D0D0','#FF3333',null,  null,    null   ],
      [null,    null,    null,    '#FF6600','#FF8800','#FF6600',null,   null,    null,    null   ],
      [null,    null,    null,    null,    '#FFCC00',null,    null,    null,    null,    null   ],
      [null,    null,    null,    '#FFCC00',null,    '#FFCC00',null,    null,    null,    null   ],
    ],
  },
  /* beaker / flask — for "Independent projects" */
  flask: {
    label: 'flask',
    grid: [
      [null,    null,    null,    '#AAA',  '#AAA',  '#AAA',  null,    null,    null,    null   ],
      [null,    null,    null,    '#DDD',  '#EEE',  '#DDD',  null,    null,    null,    null   ],
      [null,    null,    null,    '#DDD',  '#EEE',  '#DDD',  null,    null,    null,    null   ],
      [null,    null,    '#DDD',  '#DDD',  '#EEE',  '#DDD',  '#DDD',  null,    null,    null   ],
      [null,    '#DDD',  '#DDD',  '#88DDFF','#88DDFF','#88DDFF','#DDD','#DDD',  null,    null   ],
      [null,    '#DDD',  '#88DDFF','#44BBEE','#44BBEE','#44BBEE','#88DDFF','#DDD',null,  null   ],
      [null,    '#DDD',  '#88DDFF','#44BBEE','#FFaa33','#44BBEE','#88DDFF','#DDD',null,  null   ],
      [null,    '#DDD',  '#44BBEE','#44BBEE','#44BBEE','#44BBEE','#44BBEE','#DDD',null,  null   ],
      [null,    null,    '#DDD',  '#DDD',  '#DDD',  '#DDD',  '#DDD',  null,    null,    null   ],
      [null,    null,    null,    null,    null,    null,    null,    null,    null,    null   ],
    ],
  },
  /* mortarboard — for "Education" */
  grad: {
    label: 'mortarboard',
    grid: [
      [null,    null,    null,    null,    null,    null,    null,    null,    null,    null   ],
      [null,    null,    null,    null,    '#333',  '#333',  null,    null,    null,    null   ],
      [null,    '#333',  '#333',  '#333',  '#333',  '#333',  '#333',  '#333',  '#333',  null   ],
      ['#333',  '#333',  '#333',  '#333',  '#333',  '#333',  '#333',  '#333',  '#333',  '#333' ],
      [null,    null,    '#444',  '#444',  '#444',  '#444',  '#444',  '#444',  null,    null   ],
      [null,    null,    '#444',  '#444',  '#444',  '#444',  '#444',  '#444',  null,    null   ],
      [null,    null,    null,    '#444',  '#444',  '#444',  '#444',  null,    null,    null   ],
      [null,    null,    null,    null,    '#FFCC00','#FFCC00',null,   null,    null,    null   ],
      [null,    null,    null,    null,    '#FFCC00','#FFCC00',null,   null,    null,    null   ],
      [null,    null,    null,    '#FFCC00','#FFCC00','#FFCC00','#FFCC00',null, null,    null   ],
    ],
  },
  /* speech bubble — for "Manager quotes" */
  speech: {
    label: 'speech bubble',
    grid: [
      [null,    '#c4d9f2','#c4d9f2','#c4d9f2','#c4d9f2','#c4d9f2','#c4d9f2','#c4d9f2',null,   null   ],
      ['#c4d9f2','#dae8fc','#dae8fc','#dae8fc','#dae8fc','#dae8fc','#dae8fc','#dae8fc','#c4d9f2',null  ],
      ['#c4d9f2','#dae8fc','#7c3aed','#7c3aed','#dae8fc','#7c3aed','#7c3aed','#dae8fc','#c4d9f2',null  ],
      ['#c4d9f2','#dae8fc','#dae8fc','#dae8fc','#dae8fc','#dae8fc','#dae8fc','#dae8fc','#c4d9f2',null  ],
      ['#c4d9f2','#dae8fc','#7c3aed','#7c3aed','#7c3aed','#7c3aed','#7c3aed','#dae8fc','#c4d9f2',null  ],
      ['#c4d9f2','#dae8fc','#dae8fc','#dae8fc','#dae8fc','#dae8fc','#dae8fc','#dae8fc','#c4d9f2',null  ],
      [null,    '#c4d9f2','#c4d9f2','#c4d9f2','#c4d9f2','#c4d9f2','#c4d9f2','#c4d9f2',null,   null   ],
      [null,    null,    null,    '#c4d9f2','#c4d9f2',null,   null,    null,    null,    null   ],
      [null,    null,    '#c4d9f2','#c4d9f2',null,    null,    null,    null,    null,    null   ],
      [null,    null,    null,    null,    null,    null,    null,    null,    null,    null   ],
    ],
  },
  /* cat — footer signature */
  cat: {
    label: 'cat',
    grid: [
      [null,    '#FF8C00',null,    null,    null,    null,    null,    null,    '#FF8C00',null   ],
      ['#FF8C00','#FFB347','#FF8C00',null,   null,    null,    null,   '#FF8C00','#FFB347','#FF8C00'],
      ['#FF8C00','#222',   '#FF8C00','#FF8C00','#FF8C00','#FF8C00','#FF8C00','#FF8C00','#222',  '#FF8C00'],
      [null,    '#FF8C00','#FF8C00','#FFB347','#FFB347','#FFB347','#FFB347','#FF8C00','#FF8C00',null   ],
      [null,    null,     '#FF8C00','#FF8C00','#FF8C00','#FF8C00','#FF8C00','#FF8C00',null,    null   ],
      [null,    '#FF8C00','#FF8C00','#FF8C00','#FF8C00','#FF8C00','#FF8C00','#FF8C00','#FF8C00',null   ],
      [null,    '#FF8C00',null,     '#FF8C00','#FF8C00','#FF8C00','#FF8C00',null,    '#FF8C00',null   ],
      [null,    null,     null,     '#E07B00',null,    null,     '#E07B00',null,    null,     null   ],
      [null,    null,     null,     null,    null,    null,     null,    null,    null,     null   ],
      [null,    null,     null,     null,    null,    null,     null,    null,    null,     null   ],
    ],
  },
}

function VoxelSprite({ name, className, size = 5 }: { name: string; className?: string; size?: number }) {
  const sprite = SPRITES[name]
  if (!sprite) return null
  const cols = sprite.grid[0]?.length ?? 10
  const rows = sprite.grid.length
  return (
    <div
      className={`voxel-sprite ${className ?? ''}`}
      aria-label={`Pixel art ${sprite.label}`}
      role="img"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${size}px)`,
        gridTemplateRows: `repeat(${rows}, ${size}px)`,
      }}
    >
      {sprite.grid.map((row, y) =>
        row.map((color, x) =>
          color ? (
            <span
              key={`${y}-${x}`}
              className="vx"
              style={{
                gridRow: y + 1,
                gridColumn: x + 1,
                background: color,
              }}
            />
          ) : null,
        ),
      )}
    </div>
  )
}

/* ── page ─────────────────────────────────────────── */

export default function CVPage({ onBack }: Props) {
  return (
    <div className="cv-page">
      <button className="cv-back-btn" onClick={onBack}>← Back to pods</button>

      {/* ── header ─────────────────────────────────── */}
      <header className="cv-header">
        <div className="cv-header-text">
          <h1>Saverio Cutrupi</h1>
          <p className="cv-headline">Platform Engineer · Full-Stack Developer</p>
          <div className="cv-contact">
            <span>Hertford, UK</span>
            <a href="mailto:saveriocutrupi@hotmail.com">saveriocutrupi@hotmail.com</a>
            <a href="https://linkedin.com/in/saverio-cutrupi" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </div>
        </div>
      </header>

      <hr className="cv-divider" />

      {/* ── about ──────────────────────────────────── */}
      <section className="cv-prose">
        <div className="cv-illustrated-section">
          <div className="cv-illustrated-text">
            <h2>About</h2>
            <p>
              I'm a platform and full-stack engineer with five years of production
              experience at one of the UK's largest e-commerce platforms. My day-to-day
              sits at the intersection of cloud infrastructure, CI/CD automation, data
              pipelines, and developer tooling — the kind of work that keeps engineers
              productive and production stable.
            </p>
            <p>
              Over the years I've built real-time dashboards used by 90+ engineers,
              designed alerting systems that can tell a genuine outage from a transient
              blip, doubled a cloud VM fleet for a major brand launch with zero downtime,
              and brought 7,000+ security vulnerabilities down to zero. Most recently
              I've been exploring AI-driven test generation and LLM-based tooling.
            </p>
            <p>
              I also speak Italian (native), English (fluent), and enough French and
              Spanish to order coffee confidently.
            </p>
          </div>
          <VoxelSprite name="cloud" size={6} className="cv-section-sprite cv-sprite-cloud" />
        </div>
      </section>

      <hr className="cv-divider" />

      {/* ── skills ─────────────────────────────────── */}
      <section className="cv-prose">
        <div className="cv-illustrated-section">
          <VoxelSprite name="toolbox" size={6} className="cv-section-sprite cv-sprite-toolbox" />
          <div className="cv-illustrated-text">
            <h2>What I work with</h2>

            <div className="cv-tier">
              <div className="tier-label">
                <span className="tier-badge core">Daily drivers</span>
                <span className="tier-line" />
              </div>
              <div className="tier-pills">
                <span className="cv-skill-pill core">TypeScript</span>
                <span className="cv-skill-pill core">JavaScript</span>
                <span className="cv-skill-pill core">Node.js</span>
                <span className="cv-skill-pill core">React</span>
                <span className="cv-skill-pill core">Azure</span>
                <span className="cv-skill-pill core">Docker</span>
                <span className="cv-skill-pill core">Jenkins</span>
                <span className="cv-skill-pill core">Bicep / YAML IaC</span>
                <span className="cv-skill-pill core">Bash</span>
                <span className="cv-skill-pill core">PowerShell</span>
                <span className="cv-skill-pill core">ElasticSearch</span>
                <span className="cv-skill-pill core">REST APIs</span>
                <span className="cv-skill-pill core">CI/CD Pipelines</span>
              </div>
            </div>

            <div className="cv-tier">
              <div className="tier-label">
                <span className="tier-badge familiar">Solid foundations</span>
                <span className="tier-line" />
              </div>
              <div className="tier-pills">
                <span className="cv-skill-pill familiar">Python</span>
                <span className="cv-skill-pill familiar">SQL / SSMS</span>
                <span className="cv-skill-pill familiar">Terraform</span>
                <span className="cv-skill-pill familiar">AWS</span>
                <span className="cv-skill-pill familiar">Azure DevOps</span>
                <span className="cv-skill-pill familiar">Selenium</span>
                <span className="cv-skill-pill familiar">Playwright</span>
                <span className="cv-skill-pill familiar">Ansible</span>
              </div>
            </div>

            <div className="cv-tier">
              <div className="tier-label">
                <span className="tier-badge exploring">Currently exploring</span>
                <span className="tier-line" />
              </div>
              <div className="tier-pills">
                <span className="cv-skill-pill exploring">LLM tooling</span>
                <span className="cv-skill-pill exploring">Agentic systems</span>
                <span className="cv-skill-pill exploring">AI-driven testing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="cv-divider" />

      {/* ── experience ─────────────────────────────── */}
      <section className="cv-prose">
        <div className="cv-illustrated-section">
          <div className="cv-illustrated-text">
            <h2>Experience</h2>

            <article className="cv-role">
              <div className="cv-role-header">
                <div>
                  <h3>ASOS.com</h3>
                  <span className="cv-role-title">Test Automation &amp; Platform Engineer</span>
                </div>
                <span className="cv-role-when">Jun 2023 – Present</span>
              </div>
              <p>
                Platform and infrastructure engineering for one of the UK's largest
                online fashion retailers. I handle infrastructure scaling, data systems,
                developer tooling, and cross-team collaboration across a pre-production
                environment serving multiple storefronts.
              </p>
              <ul>
                <li>Created automated deployment pipelines for Azure VMs — scaled the fleet from 20 to 40 machines for the Topshop/Topman launch with zero downtime.</li>
                <li>Achieved 100% disaster recovery coverage through IaC templates (Bicep, YAML, PowerShell) and wrote the recovery runbook that brought estimated restore time from weeks to hours.</li>
                <li>Built a proof-of-concept for AI-driven test generation using LLMs, including feasibility analysis, architecture roadmap, and a working pilot.</li>
                <li>Led the technical evaluation for migrating from Nightwatch/Selenium to Playwright.</li>
                <li>Presented tooling and team capabilities at two engineering-wide events.</li>
              </ul>
            </article>

            <article className="cv-role">
              <div className="cv-role-header">
                <div>
                  <h3>ASOS.com <span className="cv-via">via Sparta Global</span></h3>
                  <span className="cv-role-title">DevOps Consultant</span>
                </div>
                <span className="cv-role-when">Jun 2021 – Jun 2023</span>
              </div>
              <p>
                Supported automated testing and environment health across integrated
                pre-production environments. Built data systems, observability tooling,
                and automation to improve developer experience and incident response.
              </p>
              <ul>
                <li>Built and maintained Agradash, a React dashboard backed by ElasticSearch — 3,000+ views from 90 users, cutting root cause analysis time from hours to roughly 30 minutes.</li>
                <li>Wrote Node.js/TypeScript backend functions for data aggregation, live service status, and environment availability metrics.</li>
                <li>Designed a heuristics-based alerting system from scratch — Teams notifications within 5–10 minutes of environment changes, filtering genuine failures from noise.</li>
                <li>Maintained 50 CI/CD pipelines (Jenkins) and automated test suites supporting ~30,000 test executions per week.</li>
                <li>Built frontend monitoring achieving ~97% uptime during working hours.</li>
                <li>Eliminated all security vulnerabilities across team repositories — from 7,000+ issues (100+ critical) to zero.</li>
              </ul>
            </article>

            <article className="cv-role cv-role-compact">
              <div className="cv-role-header">
                <div>
                  <h3>Sparta Global</h3>
                  <span className="cv-role-title">DevOps Training Programme</span>
                </div>
                <span className="cv-role-when">Mar 2021 – May 2021</span>
              </div>
              <p>
                Intensive three-month AWS-based training in Python, Django, SQL / SSMS,
                Docker, Terraform, CI/CD automation, and cloud infrastructure.
              </p>
            </article>
          </div>
          <VoxelSprite name="rocket" size={6} className="cv-section-sprite cv-sprite-rocket" />
        </div>
      </section>

      <hr className="cv-divider" />

      {/* ── side projects ──────────────────────────── */}
      <section className="cv-prose">
        <div className="cv-illustrated-section">
          <VoxelSprite name="flask" size={6} className="cv-section-sprite cv-sprite-flask" />
          <div className="cv-illustrated-text">
            <h2>Independent projects</h2>
            <p>
              Computer vision pipelines with OpenCV (image manipulation, convolution,
              object detection). Statistical simulation tools including Monte Carlo
              modelling. Currently building AI-driven automation and LLM-based tooling -
              this site included.
            </p>
          </div>
        </div>
      </section>

      <hr className="cv-divider" />

      {/* ── education & certs ──────────────────────── */}
      <section className="cv-prose cv-edu-section">
        <div className="cv-illustrated-section">
          <div className="cv-illustrated-text">
            <h2>Education &amp; certification</h2>
            <div className="cv-edu-row">
              <div>
                <strong>BA Linguistics</strong> — Sapienza Università di Roma
              </div>
              <span className="cv-edu-when">2010 – 2017</span>
            </div>
            <div className="cv-edu-row">
              <div>
                <strong>AZ-900: Azure Fundamentals</strong> — Microsoft
              </div>
              <span className="cv-edu-when">Jan 2023</span>
            </div>
          </div>
          <VoxelSprite name="grad" size={6} className="cv-section-sprite cv-sprite-grad" />
        </div>
      </section>

      <hr className="cv-divider" />

      {/* ── manager quotes ─────────────────────────── */}
      <section className="cv-prose cv-quotes">
        <div className="cv-illustrated-section">
          <VoxelSprite name="speech" size={6} className="cv-section-sprite cv-sprite-speech" />
          <div className="cv-illustrated-text">
            <h2>From my manager's review</h2>
            <div className="cv-quote-grid">
              <blockquote>"Takes full ownership of his work"</blockquote>
              <blockquote>"Does not wait for direction — he sees gaps and closes them"</blockquote>
              <blockquote>"When he commits to a task, he delivers"</blockquote>
              <blockquote>"Treated infrastructure as code with the same rigor as application code"</blockquote>
            </div>
          </div>
        </div>
      </section>

      <footer className="cv-footer">
        <VoxelSprite name="cat" size={5} className="cv-footer-sprite cv-sprite-cat" />
      </footer>
    </div>
  )
}
