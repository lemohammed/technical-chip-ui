# Technical Chip UI

An open skill for the original Eden Forge website style: dark green editorial UI, pale sage accents, serif headlines and an interactive stack of circuit-board layers.

**[Read the skill](SKILL.md) · [UI anatomy](references/ui-anatomy.md) · [How the chip layers work](references/chip-layers.md)**

The effect is procedural **2.5D Canvas**: rotated board coordinates, flattened projection, a dark edge for thickness, routed traces, a central die grid, small signal particles and labelled layers. No WebGL, generated images, frameworks or runtime dependencies.

## Use as a skill

Clone this repository into your agent's skill directory, or copy this folder there. For Codex:

```sh
git clone https://github.com/lemohammed/technical-chip-ui.git ~/.codex/skills/technical-chip-ui
```

Start a fresh session, then ask:

> Use $technical-chip-ui to build a technical editorial page for my project with an interactive chip-stack diagram.

For another skill-compatible agent, place the folder in its supported skill location; `SKILL.md` is the entrypoint. The HTML/CSS/JavaScript starter works independently of any agent product.

## Run the demo

Node.js 20 or later; no install step:

```sh
npm run check
npm run preview
```

Open `http://127.0.0.1:4186`. Copy `assets/starter/` into a project to adapt it. Edit the layer records in `app.js` and the CSS design tokens. The [renderer reference](references/chip-layers.md) documents integration, deterministic stills, accessibility and cleanup.

The demo includes explicit Play/Pause, drag rotation, keyboard layer selection, reduced-motion support and suspension when offscreen or hidden. It is a conceptual diagram, not physical chip CAD or live telemetry.

## Included

- Portable skill instructions and Codex discovery metadata.
- Responsive editorial page and configurable Canvas renderer.
- UI design explanation, projection maths and source provenance.
- A dependency-free local server and focused motion/geometry checks.

MIT licensed. Original design and source: Mohamad Hassan / Eden Forge. See [provenance](docs/PROVENANCE.md) and [artifact index](INDEX.md). GitHub Actions are disabled; checks run locally.
