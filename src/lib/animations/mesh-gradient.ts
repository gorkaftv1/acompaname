/**
 * Mesh Gradient Animation Utilities
 * Helper functions for creating fluid, animated mesh gradients
 */

export interface MeshGradientStop {
  color: string;
  position: [number, number]; // [x%, y%]
  size: number; // percentage for gradient coverage
}

/**
 * Generates CSS mesh gradient string from gradient stops
 * @param stops - Array of gradient stop configurations
 * @returns CSS background string with multiple radial gradients
 */
export function generateMeshGradient(stops: MeshGradientStop[]): string {
  return stops
    .map(
      (stop) =>
        `radial-gradient(circle at ${stop.position[0]}% ${stop.position[1]}%, ${stop.color}, transparent ${stop.size}%)`
    )
    .join(', ');
}

/**
 * Calculates animated mesh gradient positions with drift effect
 * @param originalStops - Original gradient stop configurations
 * @param driftAmount - Maximum drift distance in percentage (default: 8)
 * @returns New positions with random drift
 */
export function animateMeshPositions(
  originalStops: MeshGradientStop[],
  driftAmount: number = 8
): Array<[number, number]> {
  return originalStops.map((stop) => {
    const [x, y] = stop.position;
    const driftX = (Math.random() - 0.5) * driftAmount;
    const driftY = (Math.random() - 0.5) * driftAmount;
    
    return [
      Math.max(10, Math.min(90, x + driftX)),
      Math.max(10, Math.min(90, y + driftY)),
    ];
  });
}

/**
 * Calculates blur amount for overlay layers only (not main blob)
 * Light blur to add glow without making the blob look like vapor
 * @param size - Component size in pixels
 * @returns Blur value in pixels as string
 */
export function calculateBlurAmount(size: number): string {
  if (size < 150) return '8px';   // Light blur on small
  if (size < 250) return '10px';  // Medium blur
  return '12px';                   // Subtle blur on large
}

/**
 * Optimizes mesh gradient stops for mobile devices
 * @param stops - Original gradient stops
 * @param size - Component size
 * @returns Optimized stops array (reduced for small screens)
 */
export function optimizeMeshForDevice(
  stops: MeshGradientStop[],
  size: number
): MeshGradientStop[] {
  const isMobile = size < 150;
  return isMobile ? stops.slice(0, 2) : stops;
}
