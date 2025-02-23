declare global {
  interface HTMLCanvasElement {
    _previousFrame?: HTMLCanvasElement;
  }
}

export interface Filter {
  name: string;
  apply: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}

export const defaultFilter: Filter = {
  name: "Motion Blur",
  apply: () => {},
}

export const motionBlurFilter: Filter = {
  name: "Left the Soul",
  apply: (ctx, width, height) => {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    // Copy current frame to temp canvas
    tempCtx.drawImage(ctx.canvas, 0, 0);
    
    // Apply motion blur by blending previous frame
    ctx.globalAlpha = 0.8; // Adjust this value to control trail length
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.globalAlpha = 0.2; // Blend in new frame
    
    // Store this frame for next time
    if (!ctx.canvas._previousFrame) {
      ctx.canvas._previousFrame = tempCanvas;
    } else {
      ctx.drawImage(ctx.canvas._previousFrame, 0, 0);
    }
  }
};

export const pixelateFilter: Filter = {
  name: "Pixelate",
  apply: (ctx, width, height) => {
    const pixelSize = 10
    for (let y = 0; y < height; y += pixelSize) {
      for (let x = 0; x < width; x += pixelSize) {
        const pixel = ctx.getImageData(x, y, 1, 1)
        ctx.fillStyle = `rgb(${pixel.data[0]},${pixel.data[1]},${pixel.data[2]})`
        ctx.fillRect(x, y, pixelSize, pixelSize)
      }
    }
  },
}

export const kaleidoscopeFilter: Filter = {
  name: "Kaleidoscope",
  apply: (ctx, width, height) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Make segments count dynamic based on time
    const time = performance.now() / 1000;
    const segments = 8 + Math.sin(time) * 2;
    const angleStep = (Math.PI * 2) / segments;
    const scale = 1 + Math.sin(time * 0.5) * 0.2;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
    tempCanvas.width = width;
    tempCanvas.height = height;
    tempCtx.drawImage(ctx.canvas, 0, 0);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(time * 0.2); // Slowly rotate the kaleidoscope
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);

    for (let i = 0; i < segments; i++) {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(i * angleStep);
      ctx.drawImage(tempCanvas, -centerX, -centerY);
      ctx.restore();
    }

    ctx.restore();
  }
};

export const waterRippleFilter: Filter = {
  name: "Water Ripple",
  apply: (ctx, width, height) => {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    const time = Date.now() / 1000
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - width / 2
        const dy = y - height / 2
        const distance = Math.sqrt(dx * dx + dy * dy)
        const angle = Math.sin(distance / 20 - time * 5) * 0.5
        const sourceX = x + Math.cos(angle) * 20
        const sourceY = y + Math.sin(angle) * 20

        if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
          const sourceIndex = (Math.floor(sourceY) * width + Math.floor(sourceX)) * 4
          const targetIndex = (y * width + x) * 4
          data[targetIndex] = data[sourceIndex]
          data[targetIndex + 1] = data[sourceIndex + 1]
          data[targetIndex + 2] = data[sourceIndex + 2]
        }
      }
    }
    ctx.putImageData(imageData, 0, 0)
  },
}

export const asciiFilter: Filter = {
  name: "ASCII Art",
  apply: (ctx, width, height) => {
    const ascii = '@#$%=+*^·. ';
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Create temporary canvas for ASCII rendering
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    // Scale for ASCII characters (adjust these values to change density)
    const charWidth = 10;
    const charHeight = 10;
    
    // Clear the main canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'white';
    ctx.font = '10px monospace';
    
    for (let y = 0; y < height; y += charHeight) {
      for (let x = 0; x < width; x += charWidth) {
        // Get average brightness for this block
        let brightness = 0;
        for (let dy = 0; dy < charHeight && y + dy < height; dy++) {
          for (let dx = 0; dx < charWidth && x + dx < width; dx++) {
            const i = ((y + dy) * width + (x + dx)) * 4;
            brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
          }
        }
        brightness = brightness / (charWidth * charHeight);
        
        // Map brightness to ASCII character
        const charIndex = Math.floor((brightness / 255) * (ascii.length - 1));
        ctx.fillText(ascii[charIndex], x, y + charHeight);
      }
    }
  }
};

export const filters: Filter[] = [
  defaultFilter,
  motionBlurFilter,
  pixelateFilter,
  kaleidoscopeFilter,
  waterRippleFilter,
  asciiFilter,
]

