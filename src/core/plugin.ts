import type { StackDetector, ErrorParser } from './types.js';
import { registry } from './registry.js';

export interface Plugin {
  name: string;
  version: string;
  detectors?: StackDetector[];
  parsers?: ErrorParser[];
}

export function loadPlugin(plugin: Plugin): void {
  if (plugin.detectors) {
    for (const detector of plugin.detectors) {
      registry.registerDetector(detector);
    }
  }

  if (plugin.parsers) {
    for (const parser of plugin.parsers) {
      registry.registerParser(parser);
    }
  }
}

export function loadPlugins(plugins: Plugin[]): void {
  for (const plugin of plugins) {
    loadPlugin(plugin);
  }
}

