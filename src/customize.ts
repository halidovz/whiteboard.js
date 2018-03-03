import {fabric} from "fabric";

export class ObjectInteractive extends fabric.Object {
  id: string;
  order: number;
}

export function customizeFabric() {
  fabric.Object.prototype.toObject = (function (toObject) {
    return function (propertiesToInclude: string[]) {
      propertiesToInclude = (propertiesToInclude || []).concat(
        ["id", "order"]
      );
      return toObject.apply(this, [propertiesToInclude]);
    };
  })(fabric.Object.prototype.toObject);
}