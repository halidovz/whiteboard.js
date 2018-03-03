import {AbstractModification} from "../../abstract-modification";
import {IPointer} from "../../../whiteboard";
import {fabric} from "fabric";

export interface IChangeParams {
  width: number;
  height: number;
  left: number;
  top: number;
  startPointer: IPointer;
}

export abstract class AbstractShape extends AbstractModification {
  public shouldDeleteIfNotResized = true;
  protected readonly STROKE_WIDTH: number = 2.5;

  public changeSize(object: fabric.Object, params: IChangeParams): void {
    let width = params.width;
    let height = params.height;
    if (this.tool.isShift) {
      width = height = Math.min(width, height);
    }
    object.set({
      width,
      height,
      scaleX: 1,
      scaleY: 1
    });
    if (params.left - params.startPointer.x < 0) {
      object.set({
        left: params.startPointer.x - width
      });
    }
    if (params.top - params.startPointer.y < 0) {
      object.set({
        top: params.startPointer.y - height
      });
    }
  }

  public onObjectScaleHandler(obj: fabric.Object) {
    obj.set({
      strokeWidth: this.STROKE_WIDTH / ( obj.scaleX > 1 ? obj.scaleX : 1)
    });
  }
}