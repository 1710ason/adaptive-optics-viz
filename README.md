# Adaptive Optics Visualization

This interactive website visualizes the research paper **"Evaluation of Adaptive Optics for Correcting Atmospheric Distortions in Free-Space Optical Communication"**.

It uses **React Three Fiber** to create a 3D "Scrollytelling" experience that explains how Adaptive Optics (AO) systems mitigate atmospheric turbulence.

## Features

- **Interactive 3D Scene:** Visualizes a laser beam passing through turbulence and reflecting off a Deformable Mirror (DM).
- **Real-time Simulation:** Calculates simulated Signal-to-Noise Ratio (SNR) and Heat (Q) based on the paper's mathematical models.
- **Scrollytelling Narrative:** Guides the user through the physics of FSO communication, from the problem (Turbulence) to the solution (AO) and its limits.
- **Dynamic Shaders:** Custom WebGL shaders for the laser beam and mirror surface.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **3D Engine:** React Three Fiber (Three.js)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Animations:** Framer Motion

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser.

## key Research Findings Visualized

- **Effective Range:** The AO system is shown to be most effective between 136 J and 450 J of heat transfer.
- **Saturation:** Beyond 450 J, the visualization demonstrates the system failing due to actuator limits (13.6 µm stroke).
