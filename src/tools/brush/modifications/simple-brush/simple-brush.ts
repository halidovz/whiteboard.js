import {ObjectInteractive} from "../../../../customize";
import {IObjectParams} from "../../../abstract-tool";
import {fabric} from "fabric";
import {AbstractModification} from "../../../abstract-modification";

export class SimpleBrush extends AbstractModification {
  protected name = "brush";

  constructor(private width: number) {
    super();
  }

  public create(_params: IObjectParams, canvas: fabric.Canvas, color: string): ObjectInteractive {
    const brush = new fabric.PencilBrush(canvas);
    brush.color = color;
    brush.width = this.width;
    return <any>brush;
  }

  public getName() {
    return this.name + this.width;
  }
}