'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EmotionType, IntensityType, EmotionalCompanionProps } from '@/types';
import {
  generateMeshGradient,
  animateMeshPositions,
  calculateBlurAmount,
  optimizeMeshForDevice,
} from '@/lib/animations/mesh-gradient';
import { emotionConfigs } from '@/lib/animations/emotion-configs';


/**
 * Scale values for intensity-based breathing effect
 */
const intensityScales: Record<IntensityType, [number, number, number]> = {
  low: [1, 1.03, 1],
  medium: [1, 1.05, 1],
  high: [1, 1.08, 1],
};

/**
 * EmotionalCompanion Component
 * 
 * A liquid, organic blob that represents emotional states through color,
 * movement, and morphing animations. Features multiple animation layers
 * including breathing, rotation, inner glow, ripples, and floating particles.
 * 
 * NOW WITH: Smooth transitions between emotions and more irregular shapes!
 * 
 * Designed to feel alive, soothing, and responsive - a gentle companion
 * for caregivers managing emotional complexity.
 * 
 * @example
 * ```tsx
 * <EmotionalCompanion 
 *   emotion="calm" 
 *   size={250} 
 *   intensity="medium"
 *   animated={true}
 * />
 * ```
 */
export const EmotionalCompanion: React.FC<EmotionalCompanionProps> = ({
  size = 200,
  emotion = 'calm',
  animated = true,
  intensity = 'medium',
}) => {
  const config = emotionConfigs[emotion];
  const scaleValues = intensityScales[intensity];

  // Optimize mesh for device size
  const optimizedStops = optimizeMeshForDevice(config.meshGradient.stops, size);

  // State for animated mesh positions
  const [meshPositions, setMeshPositions] = React.useState(
    optimizedStops.map((stop) => stop.position)
  );

  // State to track previous emotion for smooth transitions
  const [currentColors, setCurrentColors] = React.useState(config.colors);
  const prevEmotionRef = React.useRef(emotion);

  // Calculate light blur for overlay layers only
  const overlayBlur = calculateBlurAmount(size);

  // Smooth color transition when emotion changes
  React.useEffect(() => {
    if (prevEmotionRef.current !== emotion) {
      // Gradually transition to new colors
      setCurrentColors(config.colors);
      prevEmotionRef.current = emotion;
    }
  }, [emotion, config.colors]);

  // Animate mesh gradient positions
  React.useEffect(() => {
    if (!animated) return;

    const interval = setInterval(() => {
      setMeshPositions(animateMeshPositions(optimizedStops));
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [animated, optimizedStops]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Floating Particles - Only visible when animated */}
      {animated && (
        <>
          {/* Particle 1 - Top Right */}
          <motion.div
            className="absolute -top-6 -right-6 rounded-full"
            style={{
              width: '10px',
              height: '10px',
              filter: 'blur(4px)',
            }}
            animate={{
              backgroundColor: currentColors[0],
              y: [-15, 15, -15],
              x: [-8, 8, -8],
              opacity: [0.2, 0.5, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              backgroundColor: {
                duration: 1.5,
                ease: 'easeInOut',
              },
              y: {
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              },
              x: {
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              },
              opacity: {
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              },
              scale: {
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          />

          {/* Particle 2 - Bottom Left */}
          <motion.div
            className="absolute -bottom-4 -left-8 rounded-full"
            style={{
              width: '12px',
              height: '12px',
              filter: 'blur(6px)',
            }}
            animate={{
              backgroundColor: currentColors[1],
              y: [12, -12, 12],
              x: [6, -6, 6],
              opacity: [0.15, 0.4, 0.15],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              backgroundColor: {
                duration: 1.8,
                ease: [0.43, 0.13, 0.23, 0.96],
              },
              y: {
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              },
              x: {
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              },
              opacity: {
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              },
              scale: {
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              },
            }}
          />

          {/* Particle 3 - Top Left */}
          <motion.div
            className="absolute top-0 left-0 rounded-full"
            style={{
              width: '6px',
              height: '6px',
              filter: 'blur(3px)',
            }}
            animate={{
              backgroundColor: currentColors[2],
              y: [-20, 20, -20],
              x: [10, -10, 10],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              backgroundColor: {
                duration: 1.8,
                ease: [0.43, 0.13, 0.23, 0.96],
              },
              y: {
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              },
              x: {
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              },
              opacity: {
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              },
            }}
          />
        </>
      )}

      {/* Main Blob Container */}
      <motion.div
        className="relative"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          boxShadow: `0 ${size * 0.1}px ${size * 0.3}px rgba(0, 0, 0, 0.15)`,
          willChange: 'transform',
        }}
        initial={false}
        animate={
          animated
            ? {
                background: generateMeshGradient(
                  optimizedStops.map((stop, i) => ({
                    ...stop,
                    position: meshPositions[i],
                  }))
                ),
                borderRadius: config.shapes,
                scale: scaleValues,
                rotate: [0, 5, -5, 0],
              }
            : {
                background: generateMeshGradient(optimizedStops),
                borderRadius: config.shapes[0],
                scale: 1,
                rotate: 0,
              }
        }
        transition={
          animated
            ? {
                background: {
                  duration: 1.8,
                  ease: [0.43, 0.13, 0.23, 0.96], // Custom ease for smooth color transition
                },
                borderRadius: {
                  duration: config.duration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
                scale: {
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
                rotate: {
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }
            : {
                background: {
                  duration: 1.8,
                  ease: [0.43, 0.13, 0.23, 0.96],
                },
              }
        }
      >
        {/* Inner Glow Layer */}
        <motion.div
          className="absolute inset-0"
          style={{
            borderRadius: 'inherit',
            filter: `blur(${overlayBlur})`,
            willChange: 'transform, opacity',
          }}
          animate={
            animated
              ? {
                  background: `radial-gradient(circle at center, ${currentColors[1]}cc, transparent 65%)`,
                  opacity: [0.3, 0.5, 0.3],
                  scale: [0.9, 1.05, 0.9],
                }
              : {
                  background: `radial-gradient(circle at center, ${currentColors[1]}cc, transparent 65%)`,
                  opacity: 0.4,
                  scale: 1,
                }
          }
          transition={
            animated
              ? {
                  background: {
                    duration: 1.8,
                    ease: [0.43, 0.13, 0.23, 0.96],
                  },
                  opacity: {
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                  scale: {
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }
              : {
                  background: {
                    duration: 1.8,
                    ease: [0.43, 0.13, 0.23, 0.96],
                  },
                }
          }
        />

        {/* Liquid Ripple Effect */}
        <motion.div
          className="absolute inset-0"
          style={{
            borderRadius: 'inherit',
            filter: 'blur(10px)',
            willChange: 'transform, opacity',
          }}
          animate={
            animated
              ? {
                  background: `radial-gradient(circle at center, ${currentColors[0]}80, transparent 55%)`,
                  scale: [0.85, 1.15, 0.85],
                  opacity: [0.4, 0, 0.4],
                }
              : {
                  background: `radial-gradient(circle at center, ${currentColors[0]}80, transparent 55%)`,
                  scale: 1,
                  opacity: 0.3,
                }
          }
          transition={
            animated
              ? {
                  background: {
                    duration: 1.8,
                    ease: [0.43, 0.13, 0.23, 0.96],
                  },
                  scale: {
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeOut',
                  },
                  opacity: {
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeOut',
                  },
                }
              : {
                  background: {
                    duration: 1.8,
                    ease: [0.43, 0.13, 0.23, 0.96],
                  },
                }
          }
        />

        {/* Sharp Center Detail */}
        <motion.div
          className="absolute inset-0"
          style={{
            filter: 'blur(8px)',
            borderRadius: 'inherit',
            willChange: 'opacity',
          }}
          animate={
            animated
              ? {
                  background: `radial-gradient(circle at center, ${currentColors[1]}, transparent 40%)`,
                  opacity: [0.4, 0.6, 0.4],
                }
              : {
                  background: `radial-gradient(circle at center, ${currentColors[1]}, transparent 40%)`,
                  opacity: 0.5,
                }
          }
          transition={
            animated
              ? {
                  background: {
                    duration: 1.8,
                    ease: [0.43, 0.13, 0.23, 0.96],
                  },
                  opacity: {
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }
              : {
                  background: {
                    duration: 1.8,
                    ease: [0.43, 0.13, 0.23, 0.96],
                  },
                }
          }
        />

        {/* Edge Definition Layer */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'transparent',
            borderRadius: 'inherit',
          }}
          animate={{
            border: `1px solid ${currentColors[1]}30`,
          }}
          transition={{
            duration: 1.8,
            ease: [0.43, 0.13, 0.23, 0.96],
          }}
        />
      </motion.div>
    </div>
  );
};
