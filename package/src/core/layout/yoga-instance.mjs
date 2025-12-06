// @bun
// src/core/layout/yoga-instance.ts
import YogaModule from "yoga-layout";
var globalConfig = YogaModule.Config.create();
globalConfig.setUseWebDefaults(false);
globalConfig.setPointScaleFactor(1);
var originalNodeCreate = YogaModule.Node.create;
YogaModule.Node.create = function() {
  return originalNodeCreate.call(YogaModule.Node, globalConfig);
};
var Yoga = YogaModule;
export {
  Yoga
};
