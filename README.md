# Particle Portrait

Interactive image-to-particle simulation engine with real-time physics, entrance animation, cursor fluid turbulence, ambient dust, multiple color palettes, automatic backdrop subtraction, and video/image capture.

![Particle Portrait](https://img.shields.io/badge/Particle_Portrait-60fps_Canvas-00d4aa?style=for-the-badge)

## ✨ Features

- **High-Performance Pixel Engine**: Renders up to 50,000+ particles smoothly at 60 FPS using direct 32-bit `Uint32Array` pixel buffer manipulation.
- **Staggered Entrance Animation**: Particles spiral in with randomized top-to-bottom delay and condense into the target portrait.
- **Fluid Hover Interaction**: Smoothstep feathered cursor interaction with fluid upward lift, lateral dispersion, and organic return decay.
- **Ambient Floating Dust**: Subtle background dust particles that react to cursor proximity with vortex/swirl physics.
- **Color Palettes**:
  - `Original + Tints`: Preserves input image colors with subtle dynamic chromatic shifts and contrast spread.
  - `Monochrome`: Clean silver/white grayscale luminance.
  - `Aurora`: Prismatic rainbow HSL spectral shift based on coordinates and luminance.
  - `Ember`: Warm, radiant fiery gold and deep orange flame tones.
- **Intelligent Backdrop Removal**: Detects uniform studio/photo backgrounds via edge-sampling standard deviation analysis and isolates the subject automatically.
- **Flexible Sizing & Fit**: Responsive fullscreen canvas or custom pixel dimensions with aspect ratio lock and `contain`, `cover` (crop), or `stretch` modes.
- **Rich Capture & Export**:
  - **PNG Export**: High-resolution image capture with optional transparent background (unpremultiplied alpha mapping).
  - **WebM Video Recording**: Direct canvas stream recording via `MediaRecorder` with configurable duration and entrance inclusion.
  - **JSON Settings**: Save and restore complete configuration presets.

## 🚀 Getting Started

Simply open `index.html` in any modern web browser:

```bash
# Direct browser opening
google-chrome index.html
# or with a local server
npx serve .
# or Python
python3 -m http.server 8080
```

## 🎮 Controls & Shortcuts

| Action | Control / Key | Description |
|---|---|---|
| **Hover / Drag** | Mouse / Touch | Repels and lifts particles fluidly |
| **Replay Entrance** | `Space` / Replay Button | Re-triggers the staggered spiral assembly |
| **Toggle Controls** | `C` / Controls Button | Collapses or expands the settings sidebar |
| **Upload Image** | Drag & Drop / File Button | Load any custom PNG, JPEG, WebP, or AVIF image |
| **Paste Image** | `Ctrl + V` / `Cmd + V` | Directly paste an image copied to clipboard |
| **Demo Portrait** | Demo Button | Instantly generates a built-in artistic sample portrait |

## 📁 Project Structure

- [`index.html`](file:///home/subarna/.openclaw/agents/gyancha/portrait-particle/index.html) - Main semantic application structure and control panel
- [`style.css`](file:///home/subarna/.openclaw/agents/gyancha/portrait-particle/style.css) - Modern dark-mode glassmorphic interface and responsive design
- [`app.js`](file:///home/subarna/.openclaw/agents/gyancha/portrait-particle/app.js) - Complete particle physics simulation engine, video recorder, and event pipeline
- [`particle-portrait.html`](file:///home/subarna/.openclaw/agents/gyancha/portrait-particle/particle-portrait.html) - Standalone single-file build
# portrait-particle
