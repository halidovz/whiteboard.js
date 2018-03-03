import {AbstractTool} from "../abstract-tool";
import {fabric} from "fabric";
import {fileDialog} from "./file-dialog";
import {Whiteboard} from "../../whiteboard";

export class ImageTool extends AbstractTool {
  protected name = "image";
  private static readonly MAX_WIDTH = 400;

  constructor(whiteboard: Whiteboard) {
    super(whiteboard);
  }

  public activate() {
    const canvas = this.whiteboard.getCanvas();
    this.whiteboard.resetActiveTool();
    fileDialog({accept: "image/*"}).then((files: FileList) => {
      if (files[0].type.split("image/")[1]) {
        const fileReader = new FileReader();
        fileReader.onload = fileLoadedEvent => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = (<any>fileLoadedEvent.target).result;
          img.onload = () => {
            const image = new fabric.Image(img);
            if (img.naturalWidth > canvas.getWidth()) {
              image.scaleToWidth(ImageTool.MAX_WIDTH);
            }
            canvas.centerObject(image);
            canvas.add(image);
            this.isAvailable = true;
          };
        };

        fileReader.readAsDataURL(files[0]);
      }
    });
  }
}
