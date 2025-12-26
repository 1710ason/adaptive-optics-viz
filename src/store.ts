import { create } from 'zustand';

interface AppState {
  turbulence: number; // 0.0 to 1.0 (Mapping to approx 0 - 800 J)
  aoActive: boolean;
  scrollProgress: number;
  currentSection: number;
  
  setTurbulence: (val: number) => void;
  setAoActive: (active: boolean) => void;
  setScrollProgress: (val: number) => void;
  setCurrentSection: (section: number) => void;
}

export const useStore = create<AppState>((set) => ({
  turbulence: 0,
  aoActive: false,
  scrollProgress: 0,
  currentSection: 0,

  setTurbulence: (val) => set({ turbulence: Math.max(0, Math.min(1, val)) }),
  setAoActive: (active) => set({ aoActive: active }),
  setScrollProgress: (val) => set({ scrollProgress: val }),
  setCurrentSection: (section) => set({ currentSection: section }),
}));
