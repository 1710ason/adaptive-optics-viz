"use client";

import { useStore } from "@/store";
import { useEffect, useState } from "react";
import { Activity, Zap, ShieldAlert, Cpu } from "lucide-react";
import clsx from "clsx";

export default function Dashboard() {
  const { turbulence, aoActive } = useStore();
  const [heat, setHeat] = useState(0);
  const [snr, setSnr] = useState(0);
  const [baseSnr, setBaseSnr] = useState(0);

  useEffect(() => {
    // Map turbulence (0-1) to Heat (0-800 J)
    const currentHeat = turbulence * 800;
    setHeat(currentHeat);

    // Simulate SNR based on Heat (Approximate from Fig 12)
    // Base SNR drops as heat increases
    const simulatedBaseSnr = Math.max(10, 80 - (currentHeat / 10)); // 80 -> 0 range
    
    let simulatedAoSnr = simulatedBaseSnr;

    if (aoActive) {
        if (currentHeat < 136) {
            // Minor degradation due to mirror imperfections
            simulatedAoSnr = simulatedBaseSnr - 2;
        } else if (currentHeat >= 136 && currentHeat <= 450) {
            // Sweet spot - improvement
            // Improvement peaks around 300J
            const improvementFactor = 20 * Math.sin( ((currentHeat - 136) / (450 - 136)) * Math.PI );
            simulatedAoSnr = simulatedBaseSnr + improvementFactor;
        } else {
            // Saturation - rapid decline back to base
             simulatedAoSnr = simulatedBaseSnr + Math.max(0, 10 - (currentHeat - 450)/10);
        }
    }
    
    setBaseSnr(simulatedBaseSnr);
    setSnr(aoActive ? simulatedAoSnr : simulatedBaseSnr);

  }, [turbulence, aoActive]);

  const status = aoActive 
    ? (heat > 450 ? "SATURATED" : heat < 136 ? "IDLE" : "OPTIMAL") 
    : "OFFLINE";

  return (
    <div className="absolute top-4 right-4 w-80 p-4 bg-black/80 backdrop-blur border border-white/20 rounded-lg text-white font-mono text-sm pointer-events-auto">
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
        <span className="flex items-center gap-2 text-gray-400">
            <Cpu size={16} /> SYSTEM STATUS
        </span>
        <span className={clsx(
            "font-bold px-2 py-0.5 rounded",
            status === "OPTIMAL" ? "bg-green-500/20 text-green-400" :
            status === "SATURATED" ? "bg-red-500/20 text-red-400" :
            status === "OFFLINE" ? "bg-gray-500/20 text-gray-400" :
            "bg-blue-500/20 text-blue-400"
        )}>
            {status}
        </span>
      </div>

      <div className="space-y-4">
        {/* Heat Metric */}
        <div>
            <div className="flex justify-between mb-1">
                <span className="flex items-center gap-2 text-gray-400"><Zap size={14}/> Heat (Q)</span>
                <span>{heat.toFixed(1)} J</span>
            </div>
            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-orange-500 to-red-500" 
                    style={{ width: `${(heat / 800) * 100}%` }}
                />
            </div>
        </div>

        {/* SNR Metric */}
        <div>
            <div className="flex justify-between mb-1">
                <span className="flex items-center gap-2 text-gray-400"><Activity size={14}/> SNR</span>
                <span className={aoActive && snr > baseSnr ? "text-neon" : "text-white"}>
                    {snr.toFixed(1)} dB
                </span>
            </div>
            {/* Comparative Bar Chart */}
            <div className="relative w-full bg-gray-800 h-10 rounded overflow-hidden flex items-end">
                {/* Base SNR Ghost */}
                <div 
                    className="bg-gray-600 w-1/2 absolute bottom-0 left-0 transition-all duration-300" 
                    style={{ height: `${baseSnr}%` }}
                />
                {/* Active SNR */}
                <div 
                    className={clsx(
                        "w-1/2 absolute bottom-0 left-0 transition-all duration-300 mix-blend-screen opacity-80",
                        aoActive ? "bg-neon" : "bg-gray-600"
                    )}
                    style={{ height: `${snr}%` }}
                />
            </div>
            {aoActive && snr > baseSnr && (
                <div className="text-right text-xs text-neon mt-1">
                    +{(snr - baseSnr).toFixed(1)} dB Boost
                </div>
            )}
        </div>

        {/* Alerts */}
        {heat > 450 && (
            <div className="flex items-center gap-2 text-red-400 text-xs border border-red-900/50 bg-red-900/20 p-2 rounded animate-pulse">
                <ShieldAlert size={16} />
                <span>CRITICAL: ACTUATOR STROKE LIMIT</span>
            </div>
        )}
      </div>
    </div>
  );
}
