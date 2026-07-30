import { IEventSystem, EventType } from "../api/types";

export class EventSystem implements IEventSystem {
  private listeners: Record<string, Array<(data: any) => void>> = {};

  on(event: EventType, listener: (data: any) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  emit(event: EventType, data: any): void {
    if (this.listeners[event]) {
      for (const listener of this.listeners[event]) {
        try {
          listener(data);
        } catch (e) {
          console.error(`Error in event listener for ${event}`, e);
        }
      }
    }
  }
}
