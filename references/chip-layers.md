# How the chip layers are made

## Projection

The original effect is a 2D Canvas illustration of a three-dimensional coordinate system. There is no WebGL scene, texture download, CSS 3D transform or generated bitmap.

Each point has horizontal coordinates `x,z` and a vertical height `y`. Rotate the ground plane by yaw `a`, then use an orthographic-style tilted projection:

```js
const rx = x * Math.cos(a) - z * Math.sin(a);
const rz = x * Math.sin(a) + z * Math.cos(a);
const sx = width * .46 + rx * scale;
const sy = height * .64 + rz * scale * .38 - y * scale * .62;
```

`scale = min(width × .235, height × .34)`. Depth contributes only 38% of its scale to screen height, while vertical height contributes 62%. This produces an isometric-like, flattened technical view; it is not mathematically exact isometric projection or perspective rendering. Larger `y` moves upward.

The original five planes use `y = index × .57`. The reusable renderer distributes any supplied layer count over the same 2.28-unit vertical span. Board extent tapers from 1.02 to .88. Its layering is a painter's order, not depth-buffered geometry; yaw drag is illustrative and extreme orientations can expose imperfect occlusion.

## Build one board

1. Project the four square corners. Fill the top with translucent dark green; outline it with a muted border or the selected layer colour.
2. Offset the front edge downward by six screen pixels and fill its side face with `#101e18`. This constant screen-space edge creates apparent thickness; it is not a full solid volume.
3. Draw seven fine routed paths across the board. Their small angled detours make them read as circuit traces. Additional short paths enter from the other axis.
4. Place a .6 × .6-unit central die. Give it five-by-five grid lines. The selected die turns pale sage and its traces gain contrast.
5. Move four tiny dots along straight board lanes. Their phases differ by layer and lane. They suggest activity; they are not an electrically valid signal simulation.
6. Connect a short leader to the layer's abbreviated label. Keep the full component name and description in ordinary HTML.

Draw the dot field, ground outline and vertical guide rails first. Draw boards from bottom to top. Each plane then receives its traces, die and particles. Draw the annotations last so a higher board cannot cover a lower layer’s label. This order supplies most of the depth cue.

## Motion and interaction

Yaw is the drag angle plus a very slow sine drift: `sin(elapsedMs × .00012) × .035`. Horizontal drag adds .006 radians per pixel. Signal phase uses `elapsedMs × .00013` plus lane and layer offsets.

The reusable renderer accumulates elapsed animation time rather than using absolute requestAnimationFrame timestamps. Pause, offscreen suspension and document hiding freeze that clock; resuming does not jump the particles forward. One clock drives all moving elements, which keeps the stack coherent.

Reduced motion starts paused. A later preference change to reduced motion also pauses. The operator may explicitly press Play. Selection, hover and drag never start animation; leaving and restoring visibility preserves the pause state. A `ResizeObserver` redraws at the new CSS size, with the backing-store pixel ratio capped at two.

## API

```js
import {ChipStackScene} from './chip-stack.js';
const scene = new ChipStackScene(canvas, {
  layers: [
    {label:'COMPUTE', color:'#a4c7b2'},
    {label:'TOOLS', color:'#9ec6c2'},
    {label:'POLICY', color:'#d7ad83'}
  ]
});
scene.setLayer(1);
scene.setPaused(true);
scene.draw(2400); // deterministic illustration frame
// On component removal:
scene.destroy();
```

Keep a CSS height on the canvas. `setLayer` accepts an existing integer index; colours must be six-digit hex strings because the renderer appends alpha values. The constructor copies supplied records. Subscribe to `motionchange` to update a separate Play/Pause control. For a host framework, instantiate after mounting and call `destroy()` on unmount.

Use a small layer count for readability, normally three to six. The starter renders five accessible tab buttons; adapt its CSS grid when changing their number. It supports click, ArrowLeft/ArrowRight, Home and End. Screen readers use the DOM component descriptions rather than infer information from canvas pixels.
