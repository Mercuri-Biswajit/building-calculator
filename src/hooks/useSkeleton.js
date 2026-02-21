// ═══════════════════════════════════════════════════════════════════════════
// src/hooks/useSkeleton.js
// Controls skeleton loading state with a minimum display duration
// so the shimmer doesn't just flash for 10ms on fast connections
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";

/**
 * useSkeleton
 * @param {number} minDuration  Minimum ms to show the skeleton (default 800ms)
 * @returns {{ isLoading: boolean }}
 *
 * Usage:
 *   const { isLoading } = useSkeleton(800);
 *   if (isLoading) return <SkeletonComponent />;
 */
export function useSkeleton(minDuration = 800) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration]);

  return { isLoading };
}
