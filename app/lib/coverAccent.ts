export type CoverAccent = { hue: number; saturation: number };

// Sample only the same-origin cover, ignoring near-white, black and gray pixels.
export function coverAccent(image: HTMLImageElement): CoverAccent | null {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 48;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(image, 0, 0, 48, 48);
    const pixels = context.getImageData(0, 0, 48, 48).data;
    const bins = Array.from({ length: 36 }, () => ({ weight: 0, hue: 0, saturation: 0 }));
    for (let i = 0; i < pixels.length; i += 4) {
      const [r, g, b] = [pixels[i], pixels[i + 1], pixels[i + 2]].map(value => value / 255);
      const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
      const saturation = max ? delta / max : 0;
      if (pixels[i + 3] < 128 || saturation < .15 || max < .2 || min > .85) continue;
      let hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
      hue = (hue * 60 + 360) % 360;
      const weight = saturation * saturation;
      const bin = bins[Math.floor(hue / 10)];
      bin.weight += weight;
      bin.hue += hue * weight;
      bin.saturation += saturation * weight;
    }
    const dominant = bins.reduce((best, bin) => bin.weight > best.weight ? bin : best);
    if (!dominant.weight) return { hue: 0, saturation: 0 };
    return {
      hue: Math.round(dominant.hue / dominant.weight),
      saturation: Math.round(Math.max(20, Math.min(70, dominant.saturation / dominant.weight * 100))),
    };
  } catch {
    return null;
  }
}
