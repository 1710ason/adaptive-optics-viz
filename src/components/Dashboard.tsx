"use client";

import { useStore } from "@/store";
import { useEffect, useState } from "react";
import { Activity, Zap, ShieldAlert, Cpu, ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";

export default function Dashboard() {
  const { turbulence, aoActive } = useStore();
  const [heat, setHeat] = useState(0);
  const [snr, setSnr] = useState(0);
  const [baseSnr, setBaseSnr] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Initialize expansion based on screen size (client-side only to avoid hydration mismatch)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsExpanded(true); // Always open on Desktop
      } else {
        setIsExpanded(false); // Default closed on Mobile
      }
    };

    // Set initial
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Map turbulence (0-1) to Heat (0-800 J)
    const currentHeat = turbulence * 800;
    setHeat(currentHeat);

    // Simulate SNR based on Heat (Approximate from Fig 12)
    const simulatedBaseSnr = Math.max(10, 80 - (currentHeat / 10)); 
    
    let simulatedAoSnr = simulatedBaseSnr;

    if (aoActive) {
        if (currentHeat < 136) {
            simulatedAoSnr = simulatedBaseSnr - 2;
        } else if (currentHeat >= 136 && currentHeat <= 450) {
            const improvementFactor = 20 * Math.sin( ((currentHeat - 136) / (450 - 136)) * Math.PI );
            simulatedAoSnr = simulatedBaseSnr + improvementFactor;
        } else {
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
    <div className={clsx(
        "absolute top-4 right-4 z-50 transition-all duration-300 pointer-events-auto",
        "bg-black/80 backdrop-blur border border-white/20 rounded-lg text-white font-mono text-sm",
        "w-[calc(100vw-2rem)] md:w-80", // Full width minus margins on mobile, fixed on desktop
        "shadow-lg shadow-black/50"
    )}>
      {/* Header - Always Visible & Clickable on Mobile */}
      <div 
        onClick={() => window.innerWidth < 768 && setIsExpanded(!isExpanded)}
        className={clsx(
            "flex items-center justify-between p-4 cursor-pointer md:cursor-default",
            isExpanded ? "border-b border-white/10" : ""
        )}
      >
        <span className="flex items-center gap-2 text-gray-400">
            <Cpu size={16} /> 
            <span className="font-bold tracking-wider">SYS STATUS</span>
        </span>
        
        <div className="flex items-center gap-3">
            <span className={clsx(
                "font-bold px-2 py-0.5 rounded text-xs",
                status === "OPTIMAL" ? "bg-green-500/20 text-green-400" :
                status === "SATURATED" ? "bg-red-500/20 text-red-400" :
                status === "OFFLINE" ? "bg-gray-500/20 text-gray-400" :
                "bg-blue-500/20 text-blue-400"
            )}>
                {status}
            </span>
            {/* Mobile Toggle Icon */}
            <span className="md:hidden text-gray-500">
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
        </div>
      </div>

      {/* Metrics Body - Collapsible */}
      <div className={clsx(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-96 opacity-100 p-4 pt-2" : "max-h-0 opacity-0 p-0"
      )}>
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
    </div>
  );
}
