import type Client from "@tai-kun/surrealdb/clients/basic";
import type { EngineEventMap } from "@tai-kun/surrealdb/engine";
import { WebSocketEngineError } from "@tai-kun/surrealdb/errors";
import { TaskEmitter } from "@tai-kun/surrealdb/utils";

export type AutoReconnectEventMap = {
  enqueue: [endpoint: URL];
  pending: [endpoint: URL, duration: number];
  connect: [endpoint: URL];
  success: [endpoint: URL];
  failure: [endpoint: URL, error: unknown];
  error: [error: unknown];
};
// TODO(tai-kun): ステータスとフェーズのイベントリスナー必要？
// & {
//   [P in `state:*`]: [event: {
//     type: ReconnectionState;
//     endpoint: URL;
//   }];
// }
// & {
//   [P in `phase:*`]: [event: {
//     type: ReconnectionPhase;
//     endpoint: URL;
//   }];
// }
// & {
//   [P in `state:${ReconnectionState}`]: [event: {
//     type: ReconnectionState;
//     endpoint: URL;
//   }];
// }
// & {
//   [P in `phase:${ReconnectionPhase}`]: [event: {
//     type: ReconnectionPhase;
//     endpoint: URL;
//   }];
// };

export interface AutoReconnectOptions {
  readonly backoffLimit?: number | undefined;
  readonly initialDelay?: number | undefined;
  readonly maxDelay?: number | undefined;
  readonly shouldReconnect?:
    | {
      readonly ping?:
        | {
          readonly threshold: number;
          readonly perMillis: number;
        }
        | undefined;
    }
    | ((...args: EngineEventMap["error"]) => boolean)
    | undefined;
}

// state
// - waiting: 初期状態
// - running: 実行中
// - success: 最終的な再接続の結果 (成功)
// - failure: 最終的な再接続の結果 (失敗)
// phase
// - waiting: 初期状態
// - pending: 再接続する時が来るまで待機
// - disconnecting: 切断中
// - connecting: 再接続中
// - succeeded: 再接続に成功した
// - failed: 再接続に失敗した
export type ReconnectionInfo = {
  state: "waiting";
  phase: "waiting" | "pending";
} | {
  state: "running";
  phase: "disconnecting" | "connecting";
} | {
  state: "success";
  phase: "pending" | "succeeded";
} | {
  state: "failure";
  phase: "pending" | "failed";
};

export type ReconnectionState = ReconnectionInfo["state"];

export type ReconnectionPhase = ReconnectionInfo["phase"];

class AutoReconnect extends TaskEmitter<AutoReconnectEventMap> {
  readonly db: Client;
  readonly maxDelay: number;
  readonly backoffLimit: number;
  readonly initialDelay: number;
  readonly shouldReconnect: (...args: EngineEventMap["error"]) => boolean;

  private _enabled = true;
  private _counter = 0;
  private _info: ReconnectionInfo = {
    state: "waiting",
    phase: "waiting",
  };

  constructor(db: Client, options: AutoReconnectOptions | undefined = {}) {
    super();
    this.db = db;
    const {
      maxDelay = 30_000,
      backoffLimit = Infinity,
      initialDelay = 500,
      shouldReconnect = {},
    } = options;
    this.maxDelay = maxDelay;
    this.backoffLimit = backoffLimit;
    this.initialDelay = initialDelay;

    if (typeof shouldReconnect === "function") {
      this.shouldReconnect = shouldReconnect;
    } else {
      const {
        ping = {
          // デフォルトで「1 分以内に 3 回以上 ping に失敗した場合は再接続すべき」
          threshold: 3,
          perMillis: 60_000,
        },
      } = shouldReconnect;
      const {
        threshold,
        perMillis,
      } = ping;
      let time = Date.now();
      let counter = 0;
      this.shouldReconnect = e => {
        const now = Date.now();

        if (now - time > perMillis) {
          time = now;
          counter = 0;
        }

        if (e instanceof WebSocketEngineError && e.code === 3153) {
          counter += 1;
        }

        if (counter >= threshold) {
          time = now;
          counter = 0;

          return true;
        }

        return false;
      };
    }

    this.on("failure", (_, endpoint) => {
      this._info = {
        state: "failure",
        phase: "failed",
      };
      this.emit("enqueue", endpoint);
    });
    this.on("success", () => {
      this._info = {
        state: "success",
        phase: "succeeded",
      };
      this.reset();
    });
    this.on("connect", async ({ signal }, endpoint) => {
      this._info = {
        state: "running",
        phase: "disconnecting",
      };

      try {
        await this.db.disconnect({ signal });
      } catch (e) {
        this.emit("error", e);
      }

      this._info = {
        state: "running",
        phase: "connecting",
      };

      try {
        await this.db.connect(endpoint, { signal });
        this.emit("success", endpoint);
      } catch (e) {
        this.emit("failure", endpoint, e);
      }
    });
    this.on("pending", ({ signal }, endpoint, duration) => {
      this._info.phase = "pending";
      const t = setTimeout(() => this.emit("connect", endpoint), duration);
      signal.addEventListener("abort", () => clearTimeout(t), { once: true });
    });
    this.on("enqueue", (_, endpoint) => {
      const duration = Math.min(
        this.initialDelay * (2 ** this._counter++),
        this.maxDelay,
      );
      this.emit("pending", endpoint, duration);
    });
    this.db.on("error", (_, e) => {
      if (
        this.enabled
        && this.state !== "running"
        // TODO(tai-kun): 上限に達したら error イベントだす？
        && this._counter < this.backoffLimit
        && this.shouldReconnect(e)
      ) {
        const { endpoint } = this.db;

        if (endpoint) {
          this.emit("enqueue", endpoint);
        }
      }
    });
  }

  getReconnectionInfo(): ReconnectionInfo {
    return { ...this._info };
  }

  get state(): ReconnectionState {
    return this._info.state;
  }

  get phase(): ReconnectionPhase {
    return this._info.phase;
  }

  get enabled(): boolean {
    return this._enabled;
  }

  enable(): void {
    this._enabled = true;
  }

  disable(): void {
    this._enabled = false;
  }

  reset(): void {
    this._counter = 0;
  }
}

/**
 * @experimental
 */
export default function autoReconnect(
  ...args: ConstructorParameters<typeof AutoReconnect>
): AutoReconnect {
  return new AutoReconnect(...args);
}
