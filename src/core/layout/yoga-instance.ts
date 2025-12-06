// ============================================================================
// CENTRALIZED YOGA INSTANCE
// Load Yoga WebAssembly once and share everywhere
// ============================================================================

import YogaModule from 'yoga-layout'

// Create and configure the global config for terminal layout
const globalConfig = YogaModule.Config.create()
globalConfig.setUseWebDefaults(false) // Terminal layout, not web!
globalConfig.setPointScaleFactor(1)   // Characters are our pixels

// Override the Node.create to always use our config
const originalNodeCreate = YogaModule.Node.create
YogaModule.Node.create = function() {
  return originalNodeCreate.call(YogaModule.Node, globalConfig)
}

// Export the configured instance
export const Yoga = YogaModule