import {AbstractTool, IFabricEvent} from "../abstract-tool";
import {SimpleBrush} from "./modifications/simple-brush/simple-brush";
import {AbstractModification} from "../abstract-modification";
import {fabric} from "fabric";

export class Brush extends AbstractTool {
  protected name = "brush";
  private target: fabric.Object;
  private createdPath: fabric.Object;
  private isMouseDown: boolean = false;
  private isDragging: boolean = false;
  private isIteracting: boolean = false;

  protected initModifications() {
    this.modifications.push(new SimpleBrush(8));
    this.modifications.push(new SimpleBrush(4));
    this.modifications.push(new SimpleBrush(2));
    this.setModification(this.modifications[2]);
  }

  public activate() {
    const canvas = this.whiteboard.getCanvas();
    canvas.isDrawingMode = true;
    this.setDrawingBrush();
    this.attachEventHandlers();
  }

  public deactivate() {
    super.deactivate();
    this.whiteboard.getCanvas().isDrawingMode = false;
  }

  public setModification(modification: AbstractModification) {
    super.setModification(modification);
    this.setDrawingBrush();
  }

  public mouseDownHandler(e: IFabricEvent) {
    if (e.target && this.whiteboard.getCanvas().getActiveObject() === e.target) {
      return;
    }
    this.whiteboard.disableSync();
    this.target = e.target;
    this.isMouseDown = true;
  }

  public mouseMoveHandler(e: IFabricEvent) {
    const canvas = this.whiteboard.getCanvas();
    if (e.target && e.target === canvas.getActiveObject()) {
      canvas.isDrawingMode = false;
    } else if (!this.isIteracting) {
      canvas.isDrawingMode = true;
    }
    if (this.isMouseDown) {
      this.isDragging = true;
    }
    canvas.renderAll();
  }

  public mouseUpHandler() {
    const canvas = this.whiteboard.getCanvas();
    this.whiteboard.enableSync();
    canvas.remove(this.createdPath);
    if (this.isDragging) {
      canvas.add(this.createdPath);
    }
    if (this.target && !this.isDragging) {
      canvas.setActiveObject(this.target);
      canvas.renderAll();
    }
    this.isMouseDown = false;
    this.isDragging = false;
    this.target = null;
  }

  private setDrawingBrush()  {
    const canvas = this.whiteboard.getCanvas();
    if (canvas.isDrawingMode) {
      (<any>canvas).freeDrawingBrush = this.activeModification.create(null, canvas, this.whiteboard.getColor());
    }
  }

  private attachEventHandlers() {
    const canvas = this.whiteboard.getCanvas();
    const handlers = {
      "path:created": (e: IFabricEvent) => {
        this.createdPath = e.path;
      },
      "object:moving": () => {
        this.isIteracting = true;
      },
      "object:scaling": () => {
        this.isIteracting = true;
      },
      "object:rotating": () => {
        this.isIteracting = true;
      },
      "object:modified": () => {
        this.isIteracting = false;
      }
    };
    canvas.on(handlers);
    this.subscribtions.push(() => {
      canvas.off(handlers);
    });
  }

  public onColorChangeHandler() {
    this.setDrawingBrush();
  }
}