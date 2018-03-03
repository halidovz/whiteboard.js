import {IPointer} from "../../whiteboard";
import {AbstractTool, IFabricEvent} from "../abstract-tool";
import {fabric} from "fabric";

export class Text extends AbstractTool {
  protected name = "text";
  private activeText: fabric.Object;

  public mouseDownHandler(e: IFabricEvent) {
    if (e.target && e.target.type !== "i-text") {
      this.whiteboard.getCanvas().discardActiveObject();
    }
    if (this.activeText || (e.target && e.target.type === "i-text")) {
      this.activeText = null;
      return;
    }
    const canvas = this.whiteboard.getCanvas();
    const pointer: IPointer = canvas.getPointer(e.e);
    const text = new fabric.IText("", {
      left: pointer.x,
      top: pointer.y,
      fontFamily: "Open Sans",
      fill: this.whiteboard.getColor(),
      lineHeight: 1.1,
      fontSize: 18
    });
    text.on("editing:exited", () => {
      canvas.remove(text);
      if (text.text) {
        canvas.add(text);
      }
    });
    this.whiteboard.addToCanvasWithoutSync(<any>text);
    canvas.setActiveObject(text);
    text.enterEditing();
    (<any>text).hiddenTextarea.focus();
    this.activeText = text;
    this.whiteboard.resetActiveObject();
  }

  public deactivate() {
    this.activeText = null;
  }
}