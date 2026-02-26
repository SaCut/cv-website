# Animated containers — design intent

## What we want

Each running container displays a pixel art animation that:

- Reflects the nature of the deployed subject (a creature walks, a machine hums, a plant sways)
- Runs independently per container — same deployment, divergent animation states
- Uses rasterised video frames rather than hand-authored sprite sheets
- Looks intentionally pixel art, not like a degraded video

The replica count becomes meaningful: more replicas = more independently animated instances, visually distinct by phase.

## Current state

- Static sprite (or trivially looping frames) from `/animate-sprite`
- All pods within a deployment show the same frame at the same time
- Animation frames are derived from a single FLUX-generated still image

## What needs to be built

### 1. Motion-aware frame generation

Instead of animating a still image post-hoc, prompt the model to produce images that imply motion, then generate a sequence.

Options:

- **Multi-shot prompting**: generate N frames with explicit pose descriptions ("frame 1: weight on left foot, frame 2: mid-stride…")
- **Video model**: use a text-to-video or image-to-video model (e.g. LTX-Video on CF AI if/when available) to produce a short clip, then rasterise each frame
- **Pose interpolation**: generate keyframes and interpolate intermediate frames

Open question: what motion is appropriate for an arbitrary subject? Needs either subject classification (animal → walk cycle, plant → sway, object → idle bob) or a model that infers motion from the prompt.

### 2. Per-frame pixel rasterisation

Each video frame must go through the same pipeline as the current still:

- Native canvas at source resolution
- Background mask (flood fill, tolerance=15, 1 erode pass)
- Unsharp mask → inner-block colour sampling → quantisation (step=32)
- Output: 64×64 pixel grid

The frame count and interval should be determined by the animation type, not hard-coded.

### 3. Independent per-container animation phase

The frontend receives all N frames for the animation. Each container tile picks a random initial frame offset on mount and advances independently on its own timer.

No shared animation state. Same frames, different phase — visually distinct without requiring separate generation per pod.

Implementation: each `PodTile` component holds local frame index state, initialised to `Math.floor(Math.random() * frameCount)`.

### 4. Subject classification (to determine animation type)

Given a free-text creature/subject name, determine what motion to apply.

Options:

- Simple keyword matching (animal names → walk cycle, plants → sway, vehicles → idle)
- Ask the AI to classify the subject and return an animation intent alongside the sprite
- Let the user choose from a small set of motion types in the config panel

## Open questions

- Which video/animation model is available or will be available on CF AI Workers?
- How many frames is practical? (4–8 is likely the sweet spot for k8s budget and render time)
- Does the rasterisation pipeline hold up on motion frames, or does the background mask break on mid-action poses?
- Is per-container phase offset enough, or do we want genuinely different animation variants per pod?

## Nice to have

- Animation length and speed tunable via config panel (alongside replica count)
- Transition animation when a pod restarts (fade out → respawn)
- The idle state (pod pending/not ready) shows a static frame; the running state triggers animation
