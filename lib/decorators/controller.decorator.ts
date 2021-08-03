import { CONTROLLER_PATTERN_METADATA } from '../constants/decorators';

export function Controller(pattern: string): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(CONTROLLER_PATTERN_METADATA, pattern, target.prototype);
  };
}
