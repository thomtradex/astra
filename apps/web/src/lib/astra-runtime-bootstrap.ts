import { AstraUnifiedRuntime } from "./astra-unified-runtime";
import { EngineRegistry } from "./generated-engine-registry";

type RuntimeType = {
  register?: (name: string, engine: unknown) => void;
  boot?: () => unknown;
};

export async function bootstrapRuntime() {
  const runtime = AstraUnifiedRuntime as RuntimeType;

  if (runtime.register) {
    for (const [name, engine] of Object.entries(EngineRegistry)) {
      runtime.register(name, engine);
    }
  }

  return runtime.boot ? runtime.boot() : AstraUnifiedRuntime;
}
