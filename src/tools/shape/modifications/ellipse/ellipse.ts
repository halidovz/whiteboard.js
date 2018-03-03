import {AbstractShape, IChangeParams} from "../abstract-shape";
import {IObjectParams} from "../../../abstract-tool";
import {fabric} from "fabric";

export class Ellipse extends AbstractShape {
  protected name = "ellipse";

  public create(params: IObjectParams): fabric.Object {
    return new fabric.Ellipse({
      ...params,
      rx: 1,
      ry: 1,
      fill: "transparent",
      stroke: params.fill,
      strokeWidth: this.STROKE_WIDTH
    });
  }

  public changeSize(object: fabric.Object, params: IChangeParams): void {
    let rx = params.width;
    let ry = params.height;
    if (this.tool.isShift) {
      rx = ry = Math.min(rx, ry);
    }
    object.set(<any>{
      rx: rx / 2,
      ry: ry / 2,
      scaleX: 1,
      scaleY: 1
    });
    if (params.left - params.startPointer.x < 0) {
      object.set({
        left: params.startPointer.x - rx
      });
    }
    if (params.top - params.startPointer.y < 0) {
      object.set({
        top: params.startPointer.y - ry
      });
    }
  }
}
