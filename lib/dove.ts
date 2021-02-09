import { Container } from 'inversify';
import { DoveClient } from '.';
import { Symbols } from './constants/symbols';
import { ContainerComposition } from './container/container-composition';
import { ModuleMode } from './interfaces/module-mode.interface';
import { ModuleConfig } from './types/ipc-module-config.type';

export default class Dove {
  private container: Container;
  private containerComposition: ContainerComposition;

  constructor(config: ModuleConfig) {
    this.createModuleContainer();
    this.setParentContainer(config);
    this.containerComposition = new ContainerComposition(this.container, config);
    this.containerComposition.composeDependencies();
  }

  private createModuleContainer() {
    this.container = new Container({ autoBindInjectable: true });
  }

  private setParentContainer(config: ModuleConfig) {
    if (config.container) {
      this.container = config.container;
    }
  }

  public start(): void {
    const moduleMode: ModuleMode = this.container.get<ModuleMode>(Symbols.ModuleMode);

    moduleMode.start();
  }

  public setControllers(controllers: Controller[]): void {
    const moduleConfig: ModuleConfig = this.container.get(Symbols.IpcModuleConfig);

    moduleConfig.controllers = [...controllers];
  }
}
