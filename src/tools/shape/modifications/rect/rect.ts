import {AbstractShape} from "../abstract-shape";
import {IObjectParams} from "../../../abstract-tool";
import {fabric} from "fabric";

export class Rect extends AbstractShape {
  protected name = "rect";

  public create(params: IObjectParams): fabric.Object {
    return new fabric.Rect({
      ...params,
      width: 1,
      height: 1,
      fill: "transparent",
      stroke: params.fill,
      strokeWidth: this.STROKE_WIDTH
    });
  }
}
