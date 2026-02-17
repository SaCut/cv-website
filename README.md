# Interactive CV

A toy CI/CD pipeline that deploys voxel creatures into pretend Kubernetes pods.

**Live:** [sacut.github.io/cv-website](https://sacut.github.io/cv-website/)

## What it is

I work with CI/CD pipelines and deployment tooling. Rather than just list that on a PDF, I built a simplified interactive version. You type a creature name, it goes through build/test/deploy stages, and ends up in a pod. There are deployment strategy options and silly logs.

The technical CV is also on the site if you want the actual details.

## Stack

React, TypeScript, Three.js. Deploys via GitHub Actions. There's a Cloudflare Worker for LLM-generated creatures but it currently uses a local library.

## Running locally

```bash
npm install && npm run dev
```
