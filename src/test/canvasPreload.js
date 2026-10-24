const Module = require('module');
const originalLoad = Module._load;

Module._load = function patchedLoad(request, parent, isMain) {
  if (request === 'canvas') {
    const noopContext = {
      fillRect: () => {},
      clearRect: () => {},
      getImageData: () => ({ data: [] }),
      putImageData: () => {},
      createImageData: () => [],
      setTransform: () => {},
      drawImage: () => {},
      save: () => {},
      fillText: () => {},
      strokeText: () => {},
      measureText: () => ({ width: 0 }),
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      rect: () => {},
      clip: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
    };

    const canvas = {
      getContext: () => noopContext,
      toDataURL: () => '',
      toBuffer: () => Buffer.alloc(0),
      width: 0,
      height: 0,
      style: {},
    };

    const stub = {
      createCanvas: () => canvas,
      Image: function Image() {},
      ImageData: function ImageData() {},
      Canvas: function Canvas() {},
      CanvasGradient: function CanvasGradient() {},
      CanvasPattern: function CanvasPattern() {},
      CanvasRenderingContext2D: function CanvasRenderingContext2D() {},
      DOMMatrix: global.DOMMatrix || function DOMMatrix() {},
    };

    stub.default = stub;
    return stub;
  }

  return originalLoad.apply(this, arguments);
};
