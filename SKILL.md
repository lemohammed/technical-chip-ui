---
name: technical-chip-ui
description: Build restrained technical editorial websites and interactive layered chip diagrams using HTML, CSS, and Canvas. Use for Eden Forge-style UI, isometric circuitry stacks, or chip-layer system explainers; not photoreal chip renders or general 3D modelling.
license: MIT
---

# Technical Chip UI

Create an editorial page around an interactive, procedural chip-stack diagram. The included implementation preserves the original Eden Forge design: deep forest green, pale sage, large serif headlines, small monospaced scientific labels, thin rules, and a five-layer Canvas figure.

## Start with the explanation

Identify the user's real components and what selecting each layer should explain. Keep visual layers aligned with named artifacts or system boundaries. Do not inherit Eden's subject matter merely because its appearance is the reference. If an existing brand is supplied, adapt the tokens while preserving composition and hierarchy.

For a page, copy [assets/starter/](assets/starter/) into the project's source directory and use its existing build/preview system. For a diagram alone, use `chip-stack.js` with `geometry.js`, a sized canvas, an explicit Play/Pause button, and accessible DOM layer controls. The demo needs no package installation; `npm run preview` from this skill repository serves it locally.

Read [UI anatomy](references/ui-anatomy.md) when reproducing the full website. Read [chip layers](references/chip-layers.md) when adapting the renderer, projection, motion or labels. The complete reusable example is in `assets/starter/index.html`, `styles.css`, and `app.js`.

## Preserve the visual mechanism

- Use a split hero: editorial copy on the left, a framed diagram on the right. Stack them on narrow screens.
- Keep the palette coherent. Give active layers a pale accent; use restrained semantic colour on inactive traces and labels.
- Build each layer from a projected board polygon, a six-pixel dark front edge, routed traces, a small central die and its grid. The result is 2.5D Canvas, not a CAD model or physical chip design.
- Draw lower layers first. Keep slow camera yaw and signal particles on one elapsed-time clock; avoid independent wobble.
- Retain short canvas labels, full DOM descriptions and visible selection controls. Canvas text alone is not an accessible interface.
- Treat the dots as conceptual motion. Only label anything live telemetry when it is backed by actual data.

## Adapt the working starter

Edit the `layers` array in `app.js`: each record has `label`, `title`, `description` and a six-digit hex `color`. Use short labels that fit the diagram; keep full names in the DOM. Rename the hero, section copy and figure caption to match the user's project. Adjust CSS tokens for colour and type; preserve contrast and the layout's whitespace.

`ChipStackScene` exposes `setLayer(index)`, `setPaused(boolean)`, `draw(elapsedMs)` and `destroy()`. Its `motionchange` event keeps a separate control synchronized. Calling `draw()` is useful for a deterministic still; pause the animation first. Do not duplicate the requestAnimationFrame loop in a host framework. Destroy the scene when its component unmounts.

Start paused for reduced motion. An explicit Play must work; hover, focus, layer selection, dragging and viewport restoration must never undo a user's Pause. The included renderer also pauses in a hidden document, stops drawing offscreen and clamps pixel density to two. Its time freezes during a pause so particles and yaw do not jump on resume.

## Check the delivered page

Inspect the actual page at desktop and phone widths, with both a selected layer and an expanded explanation. Confirm labels fit, there is no horizontal overflow, keyboard selection works, and Play/Pause survives leaving and returning to the diagram. Use reduced-motion emulation when available. Run `npm run check` after editing the packaged renderer. Review the resulting picture as well as the checks.

The skill provides source and design guidance. Use the user's existing hosting and release workflow when publication is requested; it does not require a particular provider or authorize unrelated account changes.
