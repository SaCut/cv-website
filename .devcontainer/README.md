# Dev Container

A containerised development environment that provides Terraform, kubectl, and Node without installing them on the host machine. Based on Ubuntu 24.04 via the [Dev Containers](https://containers.dev/) spec.

## Prerequisites

- Docker Desktop (or Docker Engine on Linux)
- VS Code with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

If Docker is absent or not running, the pre-start check script will offer to install or start it automatically.

## Usage

Open the repo in VS Code and select **Dev Containers: Reopen in Container** from the command palette (`Ctrl+Shift+P`). The container builds on first use (~2 min) and reopens instantly thereafter.

To return to the host environment: **Dev Containers: Reopen Folder Locally**.

## Included tools

| Tool      | Purpose                             |
| --------- | ----------------------------------- |
| Node LTS  | Build and run the Vite frontend     |
| Terraform | Provision and inspect OCI infra     |
| kubectl   | Interact with the k3s cluster       |

## Common tasks

```bash
# Frontend dev server — available at http://localhost:5173
npm run dev

# Validate Terraform (no credentials required)
cd terraform && terraform init -backend=false && terraform validate

# Cluster access (requires kubeconfig configured)
kubectl get pods -A
```
