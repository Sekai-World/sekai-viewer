export interface Live2DPlayerEvents {
  warn: (msg: string) => void;
}

export class Live2DPlayerEventEmitter {
  private listeners: {
    [E in keyof Live2DPlayerEvents]?: Live2DPlayerEvents[E][];
  } = {};

  on<E extends keyof Live2DPlayerEvents>(
    event: E,
    listener: Live2DPlayerEvents[E]
  ): this {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
    return this;
  }

  off<E extends keyof Live2DPlayerEvents>(
    event: E,
    listener: Live2DPlayerEvents[E]
  ): this {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (l) => l !== listener
      ) as any;
    }
    return this;
  }

  emit<E extends keyof Live2DPlayerEvents>(
    event: E,
    ...args: Parameters<Live2DPlayerEvents[E]>
  ): boolean {
    if (this.listeners[event]) {
      this.listeners[event].forEach((listener) => (listener as any)(...args));
      return true;
    }
    return false;
  }
}
