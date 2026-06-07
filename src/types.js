/**
 * This project is plain JavaScript with JSDoc-style shape comments.
 * Keeping it JS avoids a build step and makes MCP client installation simpler.
 */

export const SeverityWeights = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 3,
  info: 0
};

export const CategoryNames = [
  'security',
  'dependencies',
  'tests',
  'architecture',
  'operations',
  'maintainability'
];
