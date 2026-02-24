#!/usr/bin/env node
/**
 * Deploy the Cloudflare Worker.
 * Reads CLOUDFLARE_API_TOKEN from worker/.env if present.
 */

const { execSync } = require("child_process")
const { existsSync, readFileSync } = require("fs")
const { join } = require("path")

const envPath = join(__dirname, ".env")
let token = process.env.CLOUDFLARE_API_TOKEN

// Try to read from .env file if not already set
if (!token && existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8")
  const match = envContent.match(/CLOUDFLARE_API_TOKEN=(.+)/)
  if (match) {
    token = match[1].trim()
  }
}

if (!token) {
  console.error("❌ CLOUDFLARE_API_TOKEN not found.")
  console.error("Set it via environment variable or in worker/.env")
  process.exit(1)
}

console.log("🚀 Deploying worker to Cloudflare...\n")

try {
  execSync("npx wrangler deploy", {
    cwd: __dirname,
    stdio: "inherit",
    env: { ...process.env, CLOUDFLARE_API_TOKEN: token },
  })
  console.log("\n✅ Worker deployed successfully")
} catch (err) {
  console.error("\n❌ Deployment failed")
  process.exit(1)
}
