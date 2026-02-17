# Interactive Pipeline CV - Project Plan

_This is a vague and flexible plan—especially on the implementation side. Treat as a general roadmap, not rigid specifications._

---

## Core Concept

A GitHub Pages-hosted interactive CV website demonstrating Platform Engineering skills through a playful CI/CD pipeline that "deploys" Kubernetes pods running user-requested voxel creatures/objects.

**Target audience**: Hiring managers & platform engineering teams  
**Key message**: "I build platforms that make complex infrastructure accessible and delightful"

---

## Technical Architecture (Flexible)

### Hosting & Frontend

- **Hosting**: GitHub Pages (free, static)
- **Frontend**: React + TypeScript (your wheelhouse)
- **3D Rendering**: Three.js for voxel graphics
- **Content**: Fallback to pre-generated creatures + LLM for custom requests

### API Integration (Built-in, Not Phase 2)

- **Backend**: Cloudflare Worker or Vercel Function (free tier, minimal setup)
- **LLM Options**:
  - GitHub Models (if available to you)
  - Hugging Face Inference API (free tier, ~1000 requests/month)
  - Or similar free-tier LLM service
- **Rate limiting**: Simple tracking, no complex infrastructure needed
- **Volume**: Designed for ~50 requests/month, not scaling concerns

---

## Feature Breakdown

### 1. Landing Page

- Brief intro: "Platform Engineer | Infrastructure Automation | Developer Experience"
- Prominent "Try the Pipeline" button
- Link to traditional CV (PDF/HTML)
- Contact info & GitHub/LinkedIn

### 2. Pipeline Interface

**Input Stage**:

- Text input: "What should your pods run?"
- User types anything: "dragon", "astronaut cat", "happy tree", "coffee machine"
- Configuration options:
  - Number of pods (replicas): 1-6
  - Deployment strategy: RollingUpdate, Recreate, Blue/Green (visual only)
  - Namespace theme (visual flavor)

**Pipeline Visualization**:

- Horizontal or vertical flow with stages:
  1. **Source**: "Fetching manifest" (checking user input)
  2. **Build**: "Building container image" with fake Docker layers + API call to LLM here
  3. **Test**: Unit tests, integration tests (humorous names, quick pass)
  4. **Deploy**: Kubernetes rollout with progress animation
  5. **Monitor**: Live metrics/logs from running pods

- Each stage: progress bars, animations, realistic-ish timing (2-3 seconds per stage)
- Build stage takes longest (~2-5 seconds) while waiting for LLM response
- Option to "fail" a stage for demo purposes (shows error handling)

### 3. Kubernetes Pod Visualization

**Pod Display**:

- Each pod = terminal window frame with:
  - Pod name (e.g., `creature-deploy-7f8d9c-abc12`)
  - Status indicator (Running, Pending, CrashLoopBackOff for humor)
  - Voxel creature rendered in 3D viewport
  - Scrolling "logs" (ASCII art, startup messages, creature sounds)

**Animations**:

- Idle breathing/bobbing motion
- Gentle rotation option
- Pod scaling up/down with smooth transitions
- Rolling update: old pods fade out, new ones spawn in
- Each pod instance can show slight variations

**Technical Details Shown**:

- Resource requests/limits (fake but realistic: 100m CPU, 256Mi memory)
- Readiness/liveness probes status
- Config map references
- Service endpoints
- Container image tag

### 4. Monitoring Dashboard (Optional Enhancement)

Split-screen or tabbed view:

- Pod cluster visualization (main view)
- Metrics panel:
  - Fake Prometheus-style graphs (CPU, memory, request rate)
  - Log aggregation (combined pod logs)
  - Alert rules (with humorous conditions like "cuteness threshold exceeded")
  - Uptime counters

---

## Voxel Creature System

### Dual-Mode Approach

**Mode 1: LLM Generation (Primary)**

1. User types: "elephant" or "steampunk robot" or "pizza slice"
2. During pipeline "Build" stage, call LLM API
3. LLM receives prompt:
   ```
   Generate a simple low-poly [USER_INPUT] as voxel data.
   Max 150 voxels in a 16x16x16 grid.
   Return ONLY valid JSON:
   {
     "voxels": [{"x": 0-15, "y": 0-15, "z": 0-15, "color": "#hexcode"}],
     "primaryColor": "#hexcode",
     "secondaryColor": "#hexcode",
     "scale": "small|medium|large"
   }
   Be creative but keep it recognizable.
   ```
4. Backend validates JSON structure
5. Frontend receives and renders immediately

**Mode 2: Fallback Library**

- If API fails, slow, or rate-limited: use pre-made creatures
- 5-8 hardcoded options as JSON files
- Same structure as LLM output for consistency
- User gets: "API unavailable, here's a [random creature] instead!"

**Animation System** (applies to both modes):

- Reusable animation patterns:
  - `idle-sway`: Gentle side-to-side rocking
  - `bounce`: Vertical motion
  - `rotate-slow`: Continuous Y-axis rotation
  - `breathe`: Subtle scale pulsing
- Applied based on creature type or random selection

---

## Implementation Phases (Very Flexible)

### Setup & Foundations (Days 1-3)

- [ ] Initialize React + TypeScript + Vite project
- [ ] Set up Three.js and @react-three/fiber
- [ ] Create basic voxel renderer (test with cube)
- [ ] Implement 2-3 hardcoded creature definitions
- [ ] Verify rendering works in browser

### Core Pipeline UI (Days 4-7)

- [ ] Build pipeline stage components
- [ ] Add progress animations between stages
- [ ] Create terminal-style pod frame components
- [ ] Implement basic layout and responsive design
- [ ] Add user input form

### API Integration (Days 8-10)

- [ ] Set up Cloudflare Worker or Vercel Function
- [ ] Integrate chosen LLM API (test with hardcoded prompts)
- [ ] Connect frontend to backend
- [ ] Add error handling and fallback logic
- [ ] Implement simple rate limiting

### Pod & Animation System (Days 11-14)

- [ ] Multi-pod rendering (1-6 instances)
- [ ] Deployment animations (rolling update, scale up/down)
- [ ] Fake log generation per pod
- [ ] Pod status indicators
- [ ] Smooth transitions

### Polish & Deploy (Days 15-17)

- [ ] Styling and visual polish
- [ ] Add traditional CV link and contact info
- [ ] Platform Engineering messaging throughout
- [ ] Testing on mobile/tablet
- [ ] Deploy to GitHub Pages
- [ ] Test API from production URL

### Optional Enhancements (Later)

- [ ] Monitoring dashboard view
- [ ] More deployment strategies
- [ ] YAML manifest viewer
- [ ] Easter eggs
- [ ] Analytics

---

## Tech Stack (Suggestions, Not Requirements)

**Core**:

- React 18 + TypeScript
- Vite (fast dev, GitHub Pages deployment script)
- Three.js + @react-three/fiber (React wrapper for 3D)
- @react-three/drei (helpers for Three.js)

**API Layer**:

- Cloudflare Workers (recommended: 100k requests/day free)
- Or Vercel Functions (125k invocations/month free)
- Fetch API for client-side requests

**Styling**:

- Tailwind CSS (rapid styling) or CSS Modules
- CSS animations for pipeline stages
- Modern UI: glassmorphism, gradients, smooth shadows

**Optional Libraries**:

- Framer Motion (smooth component animations)
- Zustand (lightweight state if needed)
- React Query (API call management)

---

## Platform Engineering Messaging

**Subtle integration throughout**:

- Real K8s terminology with helpful tooltips
- "View Manifest" button shows simplified YAML
- Stage descriptions tie to real work:
  - "Like the Azure VM automation at ASOS"
  - "Similar to Agradash serving 90+ engineers"
- Error messages show platform thinking ("rollback triggered", "health check failed")
- Emphasize: self-service, golden paths, developer experience

**Clear CTAs**:

- "Interested in platform engineering? Let's talk"
- Email and LinkedIn prominently placed
- "Download Traditional CV" button
- GitHub link to this project's repo

---

## API Design (Flexible)

### Endpoint

```
POST /api/generate-creature
Body: { "prompt": "elephant" }
Response: {
  "voxels": [...],
  "primaryColor": "#808080",
  "scale": "medium"
}
```

### Rate Limiting Strategy

Simple and pragmatic (no database needed):

- Track requests in Worker KV or memory
- Limit: 10 requests per IP per hour (generous for demo)
- Return 429 with friendly message: "Pipeline at capacity, using fallback creature"
- Consider: no limiting at all initially, just monitor usage

### Error Handling

- LLM timeout (>10s): fallback creature
- Invalid JSON: fallback creature
- Rate limit hit: fallback creature
- Always show user something fun, never blank errors

---

## Technical Considerations

### Performance

- **Challenge**: Rendering multiple 3D scenes simultaneously
- **Solution**:
  - Optimize geometry (merged/instanced voxels)
  - Limit voxel count (~150 max per creature)
  - Reduce scene complexity on mobile
  - Use RAF for smooth animations

### Mobile Experience

- **Challenge**: 3D performance on phones
- **Solution**:
  - Detect device, limit to 2-3 pods on mobile
  - Simplified animations
  - Ensure pipeline UI works on small screens
  - Consider portrait vs landscape layouts

### Loading Performance

- **Challenge**: Three.js bundle size
- **Solution**:
  - Code splitting (lazy load 3D components)
  - Show loading state with fun messages
  - Preload common resources
  - Target <3 second initial load

### API Reliability

- **Challenge**: LLM API might be slow or unavailable
- **Solution**:
  - Always have fallback creatures ready
  - Show "Building..." animation during wait
  - Timeout after 8-10 seconds
  - Make fallback feel intentional, not like failure

---

## Out of Scope

- Real Kubernetes deployment
- User authentication or accounts
- Persistent creature storage
- Multiplayer or sharing features
- Complex creature customization UI
- SEO optimization (direct links to CV, not search traffic)
- Analytics beyond basic visit counting
- Multi-language support

---

## Success Criteria (Informal)

✅ Site loads and works in modern browsers  
✅ LLM generates recognizable creatures most of the time  
✅ Fallback system works when needed  
✅ Mobile experience is usable (even if simplified)  
✅ Pipeline visualization looks professional yet playful  
✅ Zero ongoing infrastructure costs  
✅ Someone in an interview says "that was creative"  
✅ You enjoyed building it and learned something

---

## Next Steps

1. Initialize Vite + React + TypeScript project
2. Install Three.js and @react-three/fiber
3. Create first voxel cube rendering
4. Build out from there iteratively

**Remember**: This is exploratory and flexible. Adjust as you build and discover what works!
