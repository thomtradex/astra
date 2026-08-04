import * as Core from "../core";
import * as Analytics from "../analytics";
import * as Runtime from "../runtime";
import * as Operations from "../operations";

export const ConstructionBootstrap = {
  core: Core,
  analytics: Analytics,
  runtime: Runtime,
  operations: Operations,

  initialize() {
    return {
      initialized: true,
      modules: 4,
      version: "1.0.0",
    };
  },
};
