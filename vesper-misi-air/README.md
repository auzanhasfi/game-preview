<h1 align="center">Vesper Street</h1>

<p align="center">
  <em>It rained for forty days after the reservoir broke. The phones kept ringing.</em>
</p>

<p align="center">
  <a href="https://winchxyz.github.io/vesper-street/"><img alt="Play in browser" src="https://img.shields.io/badge/%E2%96%B6%20play-in%20the%20browser-e6d29a?style=for-the-badge&labelColor=0b0d10"></a>
  <a href="https://github.com/winchxyz/vesper-street/releases/latest"><img alt="Demo video" src="https://img.shields.io/badge/demo-42s%20video-c8b890?style=for-the-badge&labelColor=0b0d10"></a>
</p>

<p align="center">
  <img alt="three.js r169" src="https://img.shields.io/badge/three.js-r169-000000?logo=three.js&logoColor=white">
  <img alt="WebGL 2" src="https://img.shields.io/badge/WebGL-2.0-990000?logo=webgl&logoColor=white">
  <img alt="Vanilla ES modules" src="https://img.shields.io/badge/vanilla%20JS-no%20build%20step-f7df1e?logo=javascript&logoColor=black">
  <img alt="Assets" src="https://img.shields.io/badge/assets-zero%2C%20everything%20is%20procedural-2ea44f">
  <img alt="Audio" src="https://img.shields.io/badge/audio-synthesised%20in%20WebAudio-8a63d2">
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/badge/license-MIT-blue"></a>
</p>

<p align="center">
  <img src="media/demo.gif" alt="Vesper Street in motion: rain, neon, a flashlight beam and a hollow in the flood" width="720">
</p>

An isometric survival-horror set in a drowned town, rendered entirely from
procedural voxels in Three.js. There is no art pipeline and nothing to download:
every building, car, sign, page, puddle and drowned thing is generated in code
when the chapter loads, and all sound is synthesised on the fly. It runs in a
browser tab at the vsync cap on a mid-range laptop GPU.

Nadia Kell comes back to Vesper looking for her brother Tomas, the last person
who called out of the town after the dam broke. Three chapters, seven torn
pages, three phone calls, and the things that stand in the fog and answer.

## Play

**[winchxyz.github.io/vesper-street](https://winchxyz.github.io/vesper-street/)** — Chrome, Edge or Firefox on a desktop. Headphones recommended.

Or run it locally (ES modules need http, not `file://`):

```bash
git clone https://github.com/winchxyz/vesper-street.git
cd vesper-street
node dev-server.js        # or: python -m http.server 8801
```

Then open http://localhost:8801.

| Action | Input |
|---|---|
| Walk, or walk to a thing and use it (pages, batteries, phones, valves, doors) | click |
| Orbit the camera (vertical drag tilts within limits) | drag |
| Zoom | scroll |
| Flashlight on / off | **F** |
| Sound on / off · cycle quality · hide the HUD | **M** · **Q** · **H** |
| Put down a note, hang up a call | click, **Esc** or **space** |

## The campaign

1. **Vesper Street.** Find Tomas's three notes on the block. When you have them, every phone on the street rings; answer in the booth and the north gate opens.
2. **Low Water.** Second Street is a shallow lake. Reach Pump Station 2, find the valve wheel in the utility truck, open the outflow and watch the street drain while the floodlight kicks on. Mind the downed power line.
3. **St. Vesper Memorial.** The hospital forecourt, the ambulance bay, a key on a gurney, the chapel, and the last call. Two endings, depending on whether every page was read.

Progress and pages read are saved in the browser; **Continue** on the title screen.

## Mechanics

- **The Answered.** Drowned figures that shamble toward you while unlit. In the core of the beam they freeze and slowly burn; at its edge they only creep. When the light wavers or looks away they lunge. They will not enter a lit lamp's pool. Being caught costs a sanity mark and 15% of your battery.
- **Sanity.** Three marks. At zero the chapter restarts; pages you have read stay read.
- **Battery.** The flashlight drains, sputters when weak, and dies. Batteries lie around every chapter. A dying battery is a spiral: more sputter, less holding power, braver hollows.
- **Radio static.** A meter, the film grain and a hiss all rise as one closes in. A heartbeat when you are down to your last mark.
- **Aim assist.** Nadia tracks the nearest hollow in front of her with the beam and turns her head to it.
- **Flooding.** Chapter two starts under water (slower wading, footstep ripples) and drains over twenty seconds once the pump runs.
- **Hazards.** The live wire in the water in chapter two.

## Screenshots

| | |
|---|---|
| ![The intersection at night](media/01_vesper_street.jpg) | ![Second Street under water](media/02_low_water.jpg) |
| *Vesper Street: the motel sign, the phone booth, the police line.* | *Low Water: the avenue as a shallow lake.* |
| ![Pump Station 2 with the floodlight on](media/03_pump_station.jpg) | ![The chapel door lit](media/04_chapel.jpg) |
| *The pump is running and the street is draining.* | *St. Vesper Memorial: the chapel opens.* |
| ![The police car and the barricade](media/05_police_line.jpg) | ![The town from above](media/06_town.jpg) |
| *The east end of the block.* | *Zoomed out: the town recedes into the fog.* |

The full 42-second demo is attached to the [latest release](https://github.com/winchxyz/vesper-street/releases/latest) as an MP4.

## How it is built

**Voxels, meshed with baked ambient occlusion.** Every object is a dense voxel grid ([`voxel.js`](js/voxel.js)) meshed into merged vertex-coloured geometry with per-vertex ambient occlusion computed from neighbouring voxels, plus a box emitter for thin things (railings, wires, fire escapes). A chapter is a handful of draw calls: one merged mesh per material class (matte, glossy, emissive, glass). The 3x5 pixel font in [`util.js`](js/util.js) turns strings into voxel signage.

**Wet ground.** The street is one patched `MeshStandardMaterial` ([`ground.js`](js/ground.js)): procedural puddles, layered rain-drop ripples, footstep rings, a flood level, and a planar reflection rendered by a mirrored orthographic camera each frame. Puddles sample the sharp reflection; damp asphalt samples a vertically smeared blur for the streaky wet-road look.

**Light beams.** The flashlight and the lamps are ray-marched volumes inside a hull mesh ([`effects.js`](js/effects.js)): Gaussian density across the cone, a soft fade along it and near the ground, so there are no hard rims and no hard cut where the beam meets the road.

**Never losing the character.** The camera is orthographic with lazy follow. Building shells between the camera and the character dissolve in a dithered screen-space disc, using a per-vertex flag so signs, lamps and props stay solid.

**A living street.** GPU-instanced rain and drips lit by the flashlight and lamps, drifting ground mist, manhole steam, light halos, litter blowing in the wind, a swinging traffic light on a wire, a sputtering sodium lamp, failing neon letters, a police light bar, a phone receiver swinging on its cord, crows on the wire, a TV flicker and a figure in an apartment window, lightning with thunder, and a watcher with a torch who appears in the fog and walks away.

**Post.** HDR with MSAA, quarter-resolution bloom, ACES, a cold grade, vignette, chromatic aberration and film grain that rises with static and lost sanity. Quality drops a level automatically if the frame rate sags.

**Sound.** Rain bed, thunder timed to the lightning, footsteps and splashes, phone rings, stingers, groans, burning, the drain, a heartbeat: all generated in WebAudio from oscillators and filtered noise ([`audio.js`](js/audio.js)).

## Project layout

```
index.html         page, HUD and overlays
dev-server.js      static server with a capture endpoint for the dev tools
js/main.js         renderer, camera, input, living-world updates, level container, debug hooks
js/game.js         campaign runtime: chapters, objectives, items, enemies, sanity, battery, saves
js/levels.js       the three chapters: layout, scripting, lore text
js/world.js        voxel builders (buildings, props, vehicles, signs, set pieces)
js/hollow.js       the Answered
js/items.js        pick-up props
js/character.js    the rig, walk/idle animation, flashlight and aim assist
js/ground.js       street layout, wet material, reflection pass
js/voxel.js        palette, voxel grid, mesher, cut-out patch
js/effects.js      rain, mist, halos, steam, beams, litter
js/post.js         post-processing chain
js/audio.js        procedural sound
make_sheet.py      dev tool: contact sheets of item close-ups from several angles
make_demo.py       dev tool: assembles captured frames into the demo video
```

`window.VS` exposes debug hooks in the console (`VS.goto(chapter)`, `VS.advance(seconds)`, `VS.frameTime()`, `VS.shot()`).

## License

[MIT](LICENSE). Three.js is loaded from a CDN under its own MIT license.
