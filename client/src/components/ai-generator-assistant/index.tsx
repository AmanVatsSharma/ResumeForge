/**
 * Compatibility layer for components that may be importing AIGeneratorAssistant
 * from the old path. This redirects to our new unified implementation.
 */

import { AIGeneratorAssistant } from "../ai-assistant-adapters";

// Re-export the component
export { AIGeneratorAssistant }; 