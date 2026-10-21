const coverThemes = new Map<string, string>();
const fallbackTheme = "rgb(95, 122, 168)";

/** Sample the original cover, favouring its dominant coloured pixels. */
export function getCoverTheme(image: HTMLImageElement): string | undefined {
  const source = image.currentSrc || image.src;
  const cached = coverThemes.get(source);
  if (cached) return cached;
  if (!image.naturalWidth) return;

  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 32;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    context.drawImage(image, 0, 0, 32, 32);
    const pixels = context.getImageData(0, 0, 32, 32).data;
    const buckets = new Map<number, { weight: number; red: number; green: number; blue: number }>();

    for (let i = 0; i < pixels.length; i += 4) {
      const [red, green, blue, alpha] = pixels.slice(i, i + 4);
      const high = Math.max(red, green, blue);
      const low = Math.min(red, green, blue);
      const saturation = high ? (high - low) / high : 0;
      // Ignore white, pale neutrals and greys; use a coloured detail instead.
      if (alpha < 128 || high < 25 || low > 190 || saturation < .12) continue;
      const weight = (alpha / 255) * (.15 + saturation * saturation * 2);
      const key = (red >> 5) * 64 + (green >> 5) * 8 + (blue >> 5);
      const bucket = buckets.get(key) || { weight: 0, red: 0, green: 0, blue: 0 };
      bucket.weight += weight;
      bucket.red += red * weight;
      bucket.green += green * weight;
      bucket.blue += blue * weight;
      buckets.set(key, bucket);
    }

    const dominant = [...buckets.values()].sort((a, b) => b.weight - a.weight)[0];
    if (!dominant) {
      coverThemes.set(source, fallbackTheme);
      return fallbackTheme;
    }
    const rgb = [dominant.red, dominant.green, dominant.blue]
      .map((channel) => Math.round(channel / dominant.weight));
    // Keep the sampled hue, but prevent a pastel cover producing a white tint.
    const high = Math.max(...rgb);
    const low = Math.min(...rgb);
    const saturation = Math.max((high - low) / high, .32);
    const visibleRgb = rgb.map((channel) => Math.round(
      Math.min(high, 180) * (1 - (high - channel) / (high - low) * saturation),
    ));
    const theme = `rgb(${visibleRgb.join(", ")})`;
    coverThemes.set(source, theme);
    return theme;
  } catch {
    // An unreadable or cross-origin cover keeps the neutral fallback.
    return;
  }
}
