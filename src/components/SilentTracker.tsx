"use client";

import { useEffect, useRef } from 'react';

export default function SilentTracker() {
  const loggedRef = useRef(false);

  useEffect(() => {
    if (loggedRef.current) return;
    loggedRef.current = true;

    const gatherAndLog = async () => {
      // 1. Screen & Window
      const screenData = {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth,
        pixelRatio: window.devicePixelRatio,
        orientation: window.screen.orientation?.type || 'unknown',
      };

      // 2. Browser & Language
      const browserData = {
        platform: navigator.platform || 'unknown', // MacIntel, Win32, etc.
        userAgent: navigator.userAgent, // Full UA string for better parsing
        language: navigator.language,
        languages: navigator.languages,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookiesEnabled: navigator.cookieEnabled,
        cores: navigator.hardwareConcurrency,
        memory: (navigator as any).deviceMemory || 'unknown', // RAM in GB (approx)
      };

      // 3. GPU Info (Crucial for WebGL apps)
      let gpuInfo = { vendor: 'unknown', renderer: 'unknown' };
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            // @ts-ignore
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                // @ts-ignore
                gpuInfo.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                // @ts-ignore
                gpuInfo.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }
        }
      } catch (e) {
        console.warn('GPU detect failed');
      }

      // 4. Network Connection (if available)
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      const netInfo = connection ? {
        effectiveType: connection.effectiveType, // '4g', '3g', etc.
        rtt: connection.rtt,
        downlink: connection.downlink,
        saveData: connection.saveData
      } : 'unavailable';

      // Send to Server
      await fetch('/api/log-client-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screen: screenData,
          browser: browserData,
          gpu: gpuInfo,
          network: netInfo,
          referrer: document.referrer
        })
      });
    };

    // Small delay to ensure page load doesn't stutter
    setTimeout(gatherAndLog, 1000);

  }, []);

  return null; // Invisible component
}
