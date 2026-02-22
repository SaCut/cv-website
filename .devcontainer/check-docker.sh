#!/bin/sh
# Runs on the HOST (Linux/macOS) before the dev container starts.
# Checks Docker is installed and the daemon is reachable.
# On Linux: offers to install Docker and/or start the daemon if needed.

OS="$(uname -s)"

# ── Check if Docker is installed ────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
RESET='\033[0m'

if ! command -v docker > /dev/null 2>&1; then
  echo ""
  printf "${RED}ERROR: Docker is not installed.${RESET}\n"

  if [ "$OS" = "Linux" ]; then
    echo ""
    printf "   Install Docker now? (requires sudo) [y/N]: "
    read -r answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
      echo ""
      printf "${CYAN}   Installing Docker via the official convenience script...${RESET}\n"
      curl -fsSL https://get.docker.com | sh
      echo ""
      printf "${CYAN}   Adding current user to the docker group (no sudo needed after re-login)...${RESET}\n"
      sudo usermod -aG docker "$USER"
      echo ""
      printf "${CYAN}   Starting the daemon...${RESET}\n"
      sudo systemctl enable --now docker
      printf "${GREEN}   Done. You may need to log out and back in for group membership to apply.${RESET}\n"
      echo "   Then reopen VS Code and try again."
      exit 0
    else
      echo ""
      printf "${YELLOW}   Install manually: https://docs.docker.com/engine/install/${RESET}\n"
      echo ""
      exit 1
    fi

  elif [ "$OS" = "Darwin" ]; then
    echo ""
    if command -v brew > /dev/null 2>&1; then
      printf "   Install Docker Desktop via Homebrew? [y/N]: "
      read -r answer
      if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        echo ""
        printf "${CYAN}   Installing Docker Desktop...${RESET}\n"
        brew install --cask docker
        echo ""
        printf "${GREEN}   Installed. Open Docker Desktop from your Applications folder, then try again.${RESET}\n"
        exit 0
      fi
    fi
    printf "${YELLOW}   Install from: https://www.docker.com/products/docker-desktop/${RESET}\n"
    echo "   Opening download page..."
    open "https://www.docker.com/products/docker-desktop/" 2>/dev/null || true
    echo ""
    exit 1
  fi
fi

# ── Check if the daemon is running ──────────────────────
if ! docker info > /dev/null 2>&1; then
  echo ""
  printf "${RED}ERROR: Docker is installed but not running.${RESET}\n"

  if [ "$OS" = "Linux" ]; then
    echo ""
    printf "   Start the Docker daemon now? (requires sudo) [y/N]: "
    read -r answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
      sudo systemctl start docker
      printf "${GREEN}   Docker started.${RESET}\n"
      exit 0
    else
      printf "${YELLOW}   Run: sudo systemctl start docker${RESET}\n"
      echo ""
      exit 1
    fi

  elif [ "$OS" = "Darwin" ]; then
    echo "   Opening Docker Desktop..."
    open -a Docker 2>/dev/null || open "https://www.docker.com/products/docker-desktop/"
    printf "${YELLOW}   Wait for Docker to finish starting, then try again.${RESET}\n"
    echo ""
    exit 1
  fi
fi

printf "${GREEN}Docker is running.${RESET}\n"
