export function fileDialog (args: {accept?: string}): Promise<FileList> {
  const input = document.createElement("input");

  // Set config
  if (args.accept) {
    input.setAttribute("accept", args.accept);
  }
  input.setAttribute("type", "file");

  // Return promise/callvack
  return new Promise<FileList>((resolve, _reject) => {
    input.addEventListener("change", () => {
      resolve(input.files);
    });
    // Simluate click event
    const evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    input.dispatchEvent(evt);
  });
}
