import {AbstractShape, IChangeParams} from "../abstract-shape";
import {IObjectParams} from "../../../abstract-tool";
import {fabric} from "fabric";

export class Line extends AbstractShape {
  protected name = "line";
  protected readonly STROKE_WIDTH: number = 3;

  public create(params: IObjectParams): fabric.Object {
    return new fabric.Line([params.left, params.top, params.left, params.top], {
      stroke: params.fill,
      strokeWidth: this.STROKE_WIDTH
    });
  }

  public changeSize(object: fabric.Object, params: IChangeParams): void {
    object.set(<any>{
      x2: params.left,
      y2: params.top
    });
  }
}