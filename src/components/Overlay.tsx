"use client";

import { motion } from "framer-motion";

const Section = ({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" | "center" }) => {
  return (
    <section className={`h-screen w-full p-10 flex flex-col justify-center pointer-events-none ${
        align === "left" ? "items-start" : align === "right" ? "items-end" : "items-center"
    }`}>
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="bg-black/50 backdrop-blur-md p-8 rounded-lg border border-white/10 max-w-lg pointer-events-auto"
      >
        {children}
      </motion.div>
    </section>
  );
};

export default function Overlay() {
  return (
    <div className="w-full">
      <Section align="left">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-neon to-laser bg-clip-text text-transparent">
          Adaptive Optics
        </h1>
        <p className="text-xl text-gray-300">
          Correcting Atmospheric Distortions in Free-Space Optical Communication.
        </p>
        <p className="mt-4 text-sm text-gray-500 font-mono">
          Based on research by Dongbeom Son
        </p>
      </Section>

      <Section align="right">
        <h2 className="text-4xl font-bold mb-4 text-white">The Challenge: Turbulence</h2>
        <p className="text-lg text-gray-300">
          As the laser beam travels through the atmosphere, temperature gradients create 
          turbulent eddies. These variations in air density change the refractive index, 
          distorting the wavefront.
        </p>
        <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded">
          <p className="text-red-400 font-mono text-sm">
            Warning: High Phase Distortion Detected
          </p>
        </div>
      </Section>

      <Section align="left">
        <h2 className="text-4xl font-bold mb-4 text-neon">The Solution: Adaptive Optics</h2>
        <p className="text-lg text-gray-300">
          A Wavefront Sensor (WFS) detects the distortion, and a Deformable Mirror (DM) 
          changes its shape in real-time to cancel it out.
        </p>
        <ul className="list-disc list-inside mt-4 text-gray-400 space-y-2">
            <li>Dynamic Phase Correction</li>
            <li>Closed-loop Feedback</li>
            <li>Restores Signal Intensity</li>
        </ul>
      </Section>

      <Section align="center">
        <h2 className="text-4xl font-bold mb-4 text-orange-400">The Limit</h2>
        <p className="text-lg text-gray-300">
            Performance isn't infinite. Under extreme turbulence ({'>'} 450 J), the system fails.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/5 p-4 rounded">
                <h3 className="font-bold text-white">Actuator Limit</h3>
                <p className="text-sm text-gray-400">Max stroke 13.6 µm</p>
            </div>
            <div className="bg-white/5 p-4 rounded">
                <h3 className="font-bold text-white">Latency</h3>
                <p className="text-sm text-gray-400">Processing delay vs rapid changes</p>
            </div>
        </div>
      </Section>

      <Section align="center">
        <h2 className="text-4xl font-bold mb-4 text-white">Results</h2>
        <p className="text-lg text-gray-300 mb-6">
            The study identifies a "Sweet Spot" for AO effectiveness.
        </p>
        <div className="flex justify-around w-full border-t border-gray-700 pt-6">
             <div className="text-center">
                 <div className="text-3xl font-bold text-neon">136 J</div>
                 <div className="text-xs text-gray-500 uppercase tracking-widest">Min Threshold</div>
             </div>
             <div className="text-center">
                 <div className="text-3xl font-bold text-neon">450 J</div>
                 <div className="text-xs text-gray-500 uppercase tracking-widest">Max Effective</div>
             </div>
        </div>
      </Section>

      <Section align="center">
        <h2 className="text-4xl font-bold mb-4 text-white">Read the Full Report</h2>
        <p className="text-lg text-gray-300 mb-8 max-w-md text-center">
          Dive deeper into the methodology, experimental setup, and detailed error analysis.
        </p>
        <a 
          href="/DONGBEOM_SON_Year3_Lab_Report.pdf" 
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-neon rounded-full transition-all duration-300"
        >
          <span className="text-neon group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          </span>
          <span className="font-mono text-lg tracking-wide text-white">Download PDF</span>
        </a>
      </Section>
    </div>
  );
}
