import { EngineRegistry } from "./generated-engine-registry";

export function runtimeHealth(){

    return{

        engines:Object.keys(EngineRegistry).length,

        status:"online"

    }

}
