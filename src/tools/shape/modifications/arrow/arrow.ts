import {AbstractShape, IChangeParams} from "../abstract-shape";
import {IObjectParams} from "../../../abstract-tool";
import {fabric} from "fabric";

const arrowSvg = <string>require("!html-loader!image-webpack-loader?{}!./arrow.svg");

export class Arrow extends AbstractShape {
  protected name = "arrow";
  public shouldDeleteIfNotResized = false;
  private arrow: fabric.Object;

  constructor() {
    super();
    fabric.loadSVGFromString(arrowSvg, (objects) => {
      this.arrow = objects[0];
    });
  }

  public create(params: IObjectParams): fabric.Object {
    const arrow = fabric.util.object.clone(this.arrow);
    const left = params.left - 100;
    arrow.set({ ...params, left: left > 0 ? left : 0 });
    return arrow;
  }

  public changeSize(object: fabric.Object, params: IChangeParams): void {
    const max = 1 + Math.max(params.width, params.height) / 100;
    object.set({
      scaleX: max,
      scaleY: max
    });
  }
}
