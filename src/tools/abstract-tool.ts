import {Whiteboard} from "../whiteboard";
import {AbstractModification} from "./abstract-modification";
import {Observable} from "rxjs/Observable";
import {fabric} from "fabric";

export interface IObjectParams {
  fill: string;
  left: number;
  top: number;
}

export interface IFabricEvent {
  e: MouseEvent;
  target: fabric.Object;
  path: fabric.Object;
}

export abstract class AbstractTool {
  protected name: string;
  protected activeModification: AbstractModification;
  protected subscribtions: Function[] = [];
  public isShift: boolean = false;
  public readonly modifications: AbstractModification[] = [];
  public isAvailable: boolean = true;

  constructor(protected whiteboard: Whiteboard = null) {
    this.initModifications();
  }

  public activate() {
    this.bindEventHandlers();
  }

  private bindEventHandlers() {
    const $window = this.whiteboard.getWindow();

    const sub1 = Observable.fromEvent($window, "keydown").subscribe((e: MouseEvent) => {
      this.isShift = e.shiftKey;
    });
    const sub2 = Observable.fromEvent($window, "keyup").subscribe(() => {
      this.isShift = false;
    });
    this.subscribtions.push(() => sub1.unsubscribe());
    this.subscribtions.push(() => sub2.unsubscribe());
  }

  public deactivate() {
    this.unsub();
  }

  public mouseDownHandler(_e: IFabricEvent) {
  }

  public mouseMoveHandler(_e: IFabricEvent) {
  }

  public mouseUpHandler(_e: IFabricEvent) {
  }

  protected initModifications() {
  }

  protected unsub() {
    for (const sub of this.subscribtions) {
      sub();
    }
  }

  public setModification(modification: AbstractModification) {
    this.activeModification = modification;
  }

  public getActiveModification(): AbstractModification {
    return this.activeModification;
  }

  public getName(): string {
    return this.name;
  }

  public onColorChangeHandler() {}
}