# Improvement Plan — saveriocutrupi.com

Source: conversation with Claude (saved in `_chat_with_ideas/`).  
Goal: turn the existing visual demo into a real, provable senior platform engineering portfolio at £0/month.

ArgoCD has been dropped from the plan. It adds significant complexity (RAM, configuration, a separate UI to expose) without meaningfully changing what's demonstrated. The CI/CD story is just as strong with GitHub Actions deploying directly via SSH + kubectl.

---

## Manual steps (account / external setup — can't be automated)

- [x] **Create a cloud account** — Oracle Cloud. 2 AMD VMs, 2 vCPU, 12 GB RAM each, free forever.
- [x] **Provision the VM** via the provider's web console — public IP: `143.47.255.170`.
- [x] **Open firewall rules** for ports 6443 (k3s API), 80, 443.
- [x] **SSH into the VM and install k3s** — k3s v1.34.4 installed and running. `KUBECONFIG` and `SSH_PRIVATE_KEY` saved as GitHub Actions secrets.

---

## Phase 1 — Real infrastructure with Terraform (2–3 weekends)

Goal: the repo contains actual IaC that provisions the VM, not just documentation.

- [x] Create a `terraform/` folder in the repo.
- [x] Write provider config, VM definition, network/firewall rules (`provider.tf`, `main.tf`, `variables.tf`).
- [x] Add a `terraform/README.md` explaining how to init and apply.
- [ ] Commit — this puts real IaC on the public repo, visible to reviewers.

---

## Phase 2 — CI/CD pipeline with real container deploy (1 weekend)

Goal: GitHub Actions builds an image, pushes it to a registry, and rolls it out to k3s. No extra tools needed.

- [x] Add a `Dockerfile` for the Vite frontend (nginx, static serve).
- [x] Create a `k8s/` folder with `deployment.yaml`, `service.yaml`, `ingress.yaml`.
- [x] Update the GitHub Actions workflow on push to `main`:
  1. Build Docker image
  2. Push to GitHub Container Registry (GHCR -- free, no new account)
  3. SSH into the VM -> `kubectl set image` to roll out the new tag
- [x] Keep GitHub Pages as a fallback/redirect.

---

## Phase 3 — Live infrastructure panel on the site (1 weekend)

Goal: a small panel visible to all visitors showing real cluster state — "Running on k3s · pod uptime 4d 3h · last deploy 2 min ago."

- [x] Extend the existing Cloudflare Worker (`worker/src/index.ts`) to proxy a read-only subset of the k3s REST API: pod status, uptime, last deploy timestamp.
- [x] Add a `LiveInfraPanel` React component to the CV page that fetches from the Worker.
- [x] Cloudflare Tunnel (`cloudflared`) to securely expose the k3s API without opening port 6443 publicly or dealing with self-signed certs.
- [x] Non-tech visitors see a confidence signal; tech reviewers see proof.

---

## Phase 4 — Wire creature deployment to real Kubernetes (1–2 weekends)

Goal: the "deploy a creature to a pod" UI flow creates a real, short-lived Kubernetes pod.

- [x] Extend the Cloudflare Worker to accept a POST → call the k3s API → create a pod from a minimal container image.
- [x] Use a TTL-based pod spec (or a CronJob) to auto-clean up deployed creatures.
- [x] Update the UI to poll the Worker for live pod status (running / terminating / evicted).
- [x] This closes the loop: the silly concept becomes a genuine, verifiable K8s demo.

---

## Phase 5 — README and polish (1 evening)

Goal: the first thing a technical reviewer sees is a clear architecture diagram and status badges.

- [x] Add an architecture diagram to `README.md`: GitHub Actions → GHCR → kubectl (SSH) → k3s on VM, with Cloudflare Worker as the API proxy.
- [x] Add a GitHub Actions pipeline status badge.
- [x] Briefly document the `terraform/` and `k8s/` folders.
- [x] Panorama layout (fixed-width side-expand desktop, scroll-snap swipe mobile).
- [x] Real live pod stats: age (ticking), restarts, healthbar, expert details panel.
- [x] Real CPU/memory metrics via metrics-server (`GET /k8s/pod-metrics`, polling every 10 s).
- [x] Per-pod restart button (DELETE pod → ReplicaSet respawns).
- [x] Relaunch deployment button (tear down + re-run Pipeline with same config).
- [x] Three-layer orphan prevention: Worker cron (*/10), `ctx.waitUntil` on pod polls, frontend auto-reset on `exists: false`.

---

## Cost summary

| Resource                              | Cost         |
| ------------------------------------- | ------------ |
| Cloud VM (Oracle or GCP free tier)    | £0           |
| GitHub Container Registry             | £0           |
| Cloudflare Workers (existing account) | £0           |
| Terraform                             | £0           |
| Domain (already owned)                | £0           |
| **Total**                             | **£0/month** |

---

## Skills demonstrated on the public repo when done

Terraform IaC · Kubernetes (k3s) · Container registry (GHCR) · CI/CD (GitHub Actions) · Cloudflare Workers · Docker · Observability/status surfacing
