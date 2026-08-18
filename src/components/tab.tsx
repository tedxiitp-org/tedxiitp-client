'use client';

import { useEffect } from 'react';

export default function DynamicTabTitle() {
  useEffect(() => {
    let originalTitle = "";
    let intervalId: NodeJS.Timeout | null = null;
    const alertTitle = "Theme Launching Soon!";

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 1. Capture current route title
        originalTitle = document.title;
        
        // 2. Start a smooth 1.5-second alternate toggle
        let toggle = false;
        intervalId = setInterval(() => {
          document.title = toggle ? originalTitle : alertTitle;
          toggle = !toggle;
        }, 1500);
      } else {
        // 3. Clear animation loop and immediately restore exact page title
        if (intervalId) clearInterval(intervalId);
        if (originalTitle) document.title = originalTitle;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}