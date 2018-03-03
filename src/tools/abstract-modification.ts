import {AbstractTool, IObjectParams} from "./abstract-tool";
import {fabric} from "fabric";

export abstract class AbstractModification {
  protected name: string;

  constructor(protected tool: AbstractTool = null) {
  }

  public getName() {
    return this.name;
  }

  abstract create(params: IObjectParams, ...args: any[]): fabric.Object;
}