import {AbstractShape} from "../abstract-shape";
import {IObjectParams} from "../../../abstract-tool";
import {fabric} from "fabric";

export class Triagnle extends AbstractShape {
  protected name = "triangle";

  public create(params: IObjectParams): fabric.Object {
    return new fabric.Triangle({
      ...params,
      width: 1,
      height: 1,
      fill: "rgba(0,0,0,0)",
      stroke: params.fill,
      strokeWidth: 5
    });
  }
}
