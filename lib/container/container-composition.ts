import { Container } from 'inversify';
import { IpcModuleConfig } from '../interfaces/ipc-module-config.type';
import { AbstractContainerComposer } from './abstract/abstract-container-composer';
import ControllerMiddlewareComposer from './composers/controller-middleware.composer';
import { ControllersMetadataFactoryComposer } from './composers/factory/controllers-metadata-factory.composer';
import { DoveClientComposer } from './composers/dove-client.composer';
import { IpcTransportComposer } from './composers/ipc-transport.composer';
import { MetadataReadersComposer } from './composers/metadata-readers.composer';
import { MiddlewareComposer } from './composers/middleware.composer';
import { ModuleConfigComposer } from './composers/module-config.composer';
import { ModuleModeComposer } from './composers/module-mode.composer';

type Composers = { new (container: Container): AbstractContainerComposer }[];

export class ContainerComposition {
  private static composersOrder: Composers = [
    IpcTransportComposer,
    DoveClientComposer,
    MetadataReadersComposer,
    ControllersMetadataFactoryComposer,
    ControllerMiddlewareComposer,
    MiddlewareComposer,
    ModuleModeComposer,
  ];

  constructor(private container: Container, private config: IpcModuleConfig) {}

  public composeDependencies(): void {
    this.composeConfigDependency();
    this.composeDependenciesInOrder();
  }

  private composeConfigDependency(): void {
    new ModuleConfigComposer(this.container, this.config).compose();
  }

  private composeDependenciesInOrder(): void {
    for (const ComposerClass of ContainerComposition.composersOrder) {
      const composerInstance: AbstractContainerComposer = new ComposerClass(this.container);

      composerInstance.compose();
    }
  }
}
