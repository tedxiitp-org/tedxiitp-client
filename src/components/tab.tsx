'use client';

import { useEffect } from 'react';

export default function DynamicTabTitle() {
  useEffect(() => {
    let originalTitle = "";
    const alertTitle = "Tickets are now Live!";

    const handleVisibilityChange = () => {
      if (document.hidden) {
        originalTitle = document.title;
        document.title = alertTitle;
      } else {
        if (originalTitle) document.title = originalTitle;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}