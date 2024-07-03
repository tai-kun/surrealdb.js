import type { TaskRunnerArgs } from "~/_internal";
import type { EngineEvents } from "~/engines";
import type Client from "./Abc";

export default function defaultErrorHandler(
  this: Client,
  _args: TaskRunnerArgs,
  ...[error]: EngineEvents["error"]
): void {
  if (error.fatal) {
    console.error("[FATAL]", error);
    this.disconnect({ force: true }).then(null, reason => {
      console.error(reason);
    });
  } else {
    console.warn("[WARNING]", error);
  }
}
