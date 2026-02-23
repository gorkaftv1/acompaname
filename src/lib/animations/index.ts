/**
 * Animation Utilities - Centralized Export
 * 
 * Provides easy access to all animation utilities and configurations
 * for the AcompañaMe companion blob animations.
 */

// Mesh gradient utilities
export {
  generateMeshGradient,
  animateMeshPositions,
  calculateBlurAmount,
  optimizeMeshForDevice,
  type MeshGradientStop,
} from './mesh-gradient';

// Emotion configurations
export {
  emotionConfigs,
  getEmotionConfig,
  getAvailableEmotions,
} from './emotion-configs';
