/** Color helpers for the theme editor. */

export function normalizeColorToHex(value: string): string {
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) {
    let hex = trimmed.slice(1);
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    if (hex.length === 8) hex = hex.slice(0, 6);
    return `#${hex.toLowerCase()}`;
  }

  const rgbMatch = trimmed.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+)?\s*\)$/i,
  );
  if (rgbMatch) {
    const r = Math.round(clamp(Number(rgbMatch[1]), 0, 255));
    const g = Math.round(clamp(Number(rgbMatch[2]), 0, 255));
    const b = Math.round(clamp(Number(rgbMatch[3]), 0, 255));
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // Try canvas for named colors / other CSS color forms when in browser
  if (typeof document !== "undefined") {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillStyle = trimmed;
        const computed = ctx.fillStyle;
        if (typeof computed === "string" && /^#[0-9a-fA-F]{6}$/i.test(computed)) {
          return computed.toLowerCase();
        }
        if (typeof computed === "string") {
          const m = computed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
          if (m) {
            return `#${toHex(+m[1])}${toHex(+m[2])}${toHex(+m[3])}`;
          }
        }
      }
    } catch {
      /* ignore */
    }
  }

  return "#ffffff";
}

/** Parse a CSS color into `R, G, B` for --accent-rgb. Returns null if unparsable. */
export function colorToRgbChannels(value: string): string | null {
  const hex = normalizeColorToHex(value);
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return null;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export function syncAccentRgb(
  variables: { name: string; value: string; type: string }[],
): typeof variables {
  const accent = variables.find((v) => v.name === "--accent");
  if (!accent) return variables;
  const rgb = colorToRgbChannels(accent.value);
  if (!rgb) return variables;
  return variables.map((v) =>
    v.name === "--accent-rgb" ? { ...v, value: rgb } : v,
  );
}

export function supportsEyeDropper(): boolean {
  return typeof window !== "undefined" && "EyeDropper" in window;
}

export async function pickColorWithEyeDropper(): Promise<string | null> {
  if (!supportsEyeDropper()) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dropper = new (window as any).EyeDropper();
    const result = await dropper.open();
    return typeof result?.sRGBHex === "string" ? result.sRGBHex : null;
  } catch {
    return null;
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function toHex(n: number): string {
  return n.toString(16).padStart(2, "0");
}
