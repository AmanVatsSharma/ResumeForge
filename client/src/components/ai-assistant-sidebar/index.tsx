/**
 * Compatibility layer for components that may be importing AIAssistantSidebar
 * from the old path. This redirects to our new unified implementation.
 */

import { AIAssistantSidebar } from "../ai-assistant-adapters";

// Re-export the component
export { AIAssistantSidebar }; 