import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subscription} from "rxjs/Subscription";
import {fabric} from "fabric";
import {ObjectInteractive} from "./customize";
import {AbstractModification} from "./tools/abstract-modification";
import {AbstractTool, IFabricEvent} from "./tools/abstract-tool";
import {Brush} from "./tools/brush/brush";
import {Shape} from "./tools/shape/shape";
import {Text} from "./tools/text/text";
import {ImageTool} from "./tools/image-tool/image-tool";

export interface IPointer {
  x: number;
  y: number;
}

export class Whiteboard {
  private canvas: fabric.Canvas;
  private objectCounter: number = 0;
  private objects: { [x: string]: ObjectInteractive } = {};
  private color: string;
  private isSyncEnabled: boolean = true;
  private objectsOrder: number = 0;
  private subs: Subscription[] = [];
  private onAddObject = new Subject<ObjectInteractive>();
  private id: string = "";
  private window: Window;
  private tools = new BehaviorSubject<AbstractTool[]>([]);
  private activeTool: AbstractTool;

  public activeObject: ObjectInteractive;
  public readonly colors = ["#88c24e", "#ff3d6f", "#5d9cec", "#ffffff", "#333333"];
  public onAddObject$ = this.onAddObject.asObservable();
  public tools$ = this.tools.asObservable();

  constructor(
    container: HTMLElement,
    window: Window,
    id?: string
  ) {
    this.window = window;
    this.id = (id || Math.random()).toString();
    this.color = this.colors[2];
    this.configureCanvas(container);
    this.initTools();
    this.bindCanvasEventHandlers();
    this.bindWindowEventHandlers();
  }

  public destroy() {
    for (const sub of this.subs) {
      sub.unsubscribe();
    }
    if (this.activeTool) {
      this.activeTool.deactivate();
    }
  }

  public initTools(): void {
    const tools = this.tools.getValue();
    tools.push(new Brush(this));
    tools.push(new Shape(this));
    tools.push(new Text(this));
    tools.push(new ImageTool(this));
    this.activateTool(tools[0]);
  }

  private configureCanvas(element: HTMLElement): void {
    const canvas = document.createElement("canvas");
    canvas.width = element.offsetWidth;
    canvas.height = element.offsetHeight;
    element.appendChild(canvas);
    const baseElementOffset = element.getBoundingClientRect();
    const canvasOffset = canvas.getBoundingClientRect();
    canvas.style.marginLeft = `${(baseElementOffset.left - canvasOffset.left)}px`;
    canvas.style.marginTop = `${(baseElementOffset.top - canvasOffset.top)}px`;
    this.canvas = new fabric.Canvas(canvas);
    this.canvas.preserveObjectStacking = true;
    this.canvas.selection = false;
    this.canvas.perPixelTargetFind = true;
    this.canvas.targetFindTolerance = 10;
  }

  private addObjectToCanvas(object: ObjectInteractive): void {
    this.saveObject(object);
    this.addToCanvasWithoutSync(object);
  }

  private saveObject(object: ObjectInteractive) {
    this.objects[object.id] = object;
  }

  private syncObject(object: ObjectInteractive): void {
    if (!this.isSyncEnabled) {
      return;
    }
    const serialized = object.toObject();
    object.id = serialized.id = object.id || `${this.id}${++this.objectCounter}`;
    object.order = serialized.order = object.order || ++this.objectsOrder;
    this.saveObject(object);
    this.onAddObject.next(object.toObject());
  }

  private bindCanvasEventHandlers(): void {
    this.canvas.on("object:modified", (e: IFabricEvent) => {
      this.syncObject(<ObjectInteractive>e.target);
    });
    this.canvas.on("object:added", (e: IFabricEvent) => {
      this.syncObject(<ObjectInteractive>e.target);
    });
    this.canvas.on("path:created", (e: IFabricEvent) => {
      this.syncObject(<ObjectInteractive>e.path);
    });
    this.canvas.on("mouse:down", (e: IFabricEvent) => {
      if (this.activeTool) {
        this.activeTool.mouseDownHandler(e);
      }
    });
    this.canvas.on("mouse:move", (e: IFabricEvent) => {
      if (this.activeTool) {
        this.activeTool.mouseMoveHandler(e);
      }
    });
    this.canvas.on("mouse:up", (e: IFabricEvent) => {
      if (this.activeTool) {
        this.activeTool.mouseUpHandler(e);
      }
    });
    this.canvas.on("object:selected", (e: IFabricEvent) => {
      this.activeObject = <ObjectInteractive>e.target;
      // we use timeout to be sure that object was selected and no active tool deselected it someway
      this.window.setTimeout(() => {
        if (!this.activeObject) {
          return;
        }
        if (this.colors.indexOf(this.activeObject.stroke) >= 0) {
          this.setColor(this.activeObject.stroke);
        } else if (this.colors.indexOf(this.activeObject.fill) >= 0) {
          this.setColor(this.activeObject.fill);
        }
      }, 300);
    });
    this.canvas.on("selection:cleared", () => {
      this.resetActiveObject();
    });
  }

  private bindWindowEventHandlers() {
    const KEY_CODE = {
      backspace: 8,
      delete: 46,
    };
    const sub = Observable.fromEvent(this.window, "keydown").subscribe((event: KeyboardEvent) => {
      if ((event.keyCode === KEY_CODE.backspace) || (event.keyCode === KEY_CODE.delete)) {
        this.deleteObject();
      }
    });
    this.subs.push(sub);
  }

  public restoreObjects(objects: ObjectInteractive[]): void {
    objects.sort((a: ObjectInteractive, b: ObjectInteractive) => {
      return a.order - b.order;
    });
    if (!objects.length) {
      return;
    }
    this.objectsOrder = objects[objects.length - 1].order;
    fabric.util.enlivenObjects(objects, (objects: ObjectInteractive[]) => {
      for (const object of objects) {
        const id = parseInt(object.id.split(this.id)[1]);
        if (id > this.objectCounter) {
          this.objectCounter = id;
        }
        if (this.objects[object.id]) {
          this.canvas.remove(this.objects[object.id]);
        }
        this.addObjectToCanvas(object);
      }
    }, "");
  }

  public activateTool(tool: AbstractTool, modification?: AbstractModification): void {
    if (!tool.isAvailable) {
      return;
    }
    this.canvas.discardActiveObject().renderAll();
    if (this.activeTool !== tool) {
      if (this.activeTool) {
        this.activeTool.deactivate();
      }
      this.activeTool = tool;
      this.activeTool.activate();
    } else if (!modification) {
      this.activeTool.deactivate();
      this.resetActiveTool();
    }
    if (modification) {
      this.activeTool.setModification(modification);
    }
    this.tools.next([...this.tools.getValue()]);
  }

  public getActiveTool() {
    return this.activeTool;
  }

  public getCanvas(): fabric.Canvas {
    return this.canvas;
  }

  public setColor(color: string) {
    this.color = color;
    if (this.activeTool) {
      this.activeTool.onColorChangeHandler();
    }
    const object = this.canvas.getActiveObject();
    if (object instanceof fabric.Object) {
      if (object.stroke) {
        object.set({
          stroke: color,
        });
      } else if (object.fill) {
        object.setColor(color);
      }
      if (object.stroke || object.fill) {
        this.syncObject(<any>object);
        this.canvas.renderAll();
      }
    }
  }

  public getColor(): string {
    return this.color;
  }

  public deleteObject() {
    if (this.activeObject) {
      this.activeObject.set({
        visible: false,
      });
      this.canvas.add(this.activeObject);
      this.canvas.discardActiveObject();
      this.resetActiveObject();
    }
  }

  public resetActiveObject() {
    this.activeObject = null;
  }

  public resetActiveTool() {
    this.activeTool = null;
  }

  public addToCanvasWithoutSync(object: ObjectInteractive) {
    this.isSyncEnabled = false;
    this.canvas.add(object);
    this.isSyncEnabled = true;
  }

  public enableSync() {
    this.isSyncEnabled = true;
  }

  public disableSync() {
    this.isSyncEnabled = false;
  }

  public getWindow(): Window {
    return this.window;
  }
}
