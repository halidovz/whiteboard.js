import {AbstractTool, IFabricEvent} from "../abstract-tool";
import {Ellipse} from "./modifications/ellipse/ellipse";
import {Rect} from "./modifications/rect/rect";
import {Line} from "./modifications/line/line";
import {IPointer, Whiteboard} from "../../whiteboard";
import {AbstractShape} from "./modifications/abstract-shape";
import {fabric} from "fabric";
import {ObjectInteractive} from "../../customize";

export class Shape extends AbstractTool {
  protected name = "shape";
  public modifications: AbstractShape[];
  protected activeModification: AbstractShape;
  private currentPointer: IPointer;
  private activeObject: fabric.Object;
  private isDragging: boolean = false;
  private canDraw: boolean = true;
  private beneathObject: fabric.Object;

  constructor(protected whiteboard: Whiteboard = null) {
    super(whiteboard);
    this.attachEventHandlers();
  }

  protected initModifications() {
    this.modifications.push(new Line(this));
    this.modifications.push(new Ellipse(this));
    this.modifications.push(new Rect(this));
    this.setModification(this.modifications[2]);
  }

  public mouseDownHandler(e: IFabricEvent) {
    const canvas = this.whiteboard.getCanvas();
    if (!this.canDraw) {
      return;
    }
    if (e.target) {
      this.beneathObject = e.target;
      this.beneathObject.lockMovementX = true;
      this.beneathObject.lockMovementY = true;
      canvas.discardActiveObject().renderAll();
    }
    this.currentPointer = canvas.getPointer(e.e);
    this.activeObject = this.activeModification.create({
      fill: this.whiteboard.getColor(),
      left: this.currentPointer.x,
      top: this.currentPointer.y
    });
    this.whiteboard.addToCanvasWithoutSync(<ObjectInteractive>this.activeObject);
  }

  public mouseMoveHandler(e: IFabricEvent) {
    const canvas = this.whiteboard.getCanvas();
    this.canDraw = !e.target || canvas.getActiveObject() !== e.target;
    if (this.currentPointer) {
      this.isDragging = true;
    } else {
      return;
    }
    const pointer: IPointer = canvas.getPointer(e.e);
    const width = Math.abs(pointer.x - this.currentPointer.x);
    const height = Math.abs(pointer.y - this.currentPointer.y);
    this.activeModification.changeSize(this.activeObject, {
      width: width,
      height: height,
      left: pointer.x,
      top: pointer.y,
      startPointer: this.currentPointer
    });
    canvas.renderAll();
  }

  public mouseUpHandler(e: IFabricEvent) {
    const canvas = this.whiteboard.getCanvas();
    if (canvas.getActiveObject()) {
      return;
    }
    if (!this.isDragging) {
      if (this.activeModification.shouldDeleteIfNotResized) {
        canvas.remove(this.activeObject);
      }
      if (e.target) {
        this.canDraw = false;
        canvas.setActiveObject(e.target);
        canvas.renderAll();
      }
    } else {
      canvas.remove(this.activeObject);
      canvas.add(this.activeObject);
      canvas.setActiveObject(this.activeObject);
      this.activeObject.selectable = true;
    }
    if (this.beneathObject) {
      this.beneathObject.lockMovementX = false;
      this.beneathObject.lockMovementY = false;
      this.beneathObject = null;
    }
    this.activeObject = null;
    this.currentPointer = null;
    this.isDragging = false;
  }

  private attachEventHandlers() {
    const canvas = this.whiteboard.getCanvas();
    const handlers = {
      "object:scaling": (e: IFabricEvent) => {
        for (const modification of this.modifications) {
          if (e.target.type === modification.getName()) {
            modification.onObjectScaleHandler(e.target);
          }
        }
      }
    };
    canvas.on(handlers);
  }
}