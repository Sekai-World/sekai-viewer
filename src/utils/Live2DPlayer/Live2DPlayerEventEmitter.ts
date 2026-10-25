export interface Live2DPlayerEvents {
  warn: (msg: string) => void;
}

export class Live2DPlayerEventEmitter {
  private listeners: {
    [E in keyof Live2DPlayerEvents]?: Live2DPlayerEvents[E][];
  } = {};

  on(event: "warn", listener: Live2DPlayerEvents["warn"]): this {
    this.listeners[event] ??= [];
    this.listeners[event].push(listener);
    return this;
  }

  off(event: "warn", listener: Live2DPlayerEvents["warn"]): this {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (l) => l !== listener
      );
    }
    return this;
  }

  emit(
    event: "warn",
    ...args: Parameters<Live2DPlayerEvents["warn"]>
  ): boolean {
    if (this.listeners[event]) {
      this.listeners[event].forEach((listener) => listener(...args));
      return true;
    }
    return false;
  }
}
