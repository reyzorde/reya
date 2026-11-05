import type { Mood } from "./store";

/** Higher-detail pixel face (128×128). Style inspired by user reference: soft brown hair, large blue eyes. */
const W = 128;
const H = 128;
type RGB = [number, number, number];

const C = {
  hairDeep: [72, 52, 48] as RGB,
  hair: [110, 82, 68] as RGB,
  hairMid: [140, 108, 88] as RGB,
  hairLite: [180, 148, 118] as RGB,
  hairShine: [220, 196, 170] as RGB,
  skin: [255, 220, 200] as RGB,
  skinShade: [240, 190, 170] as RGB,
  blush: [255, 140, 150] as RGB,
  line: [60, 40, 40] as RGB,
  white: [255, 255, 255] as RGB,
  irisOuter: [40, 110, 200] as RGB,
  iris: [70, 160, 230] as RGB,
  irisLite: [140, 210, 255] as RGB,
  pupil: [20, 30, 50] as RGB,
  mouth: [220, 90, 100] as RGB,
  tongue: [255, 140, 150] as RGB,
  teeth: [255, 245, 240] as RGB,
  tear: [120, 190, 255] as RGB,
  shirt: [170, 200, 230] as RGB,
  bg: [6, 10, 16] as RGB,
};

function rect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  c: RGB,
  a = 1,
) {
  ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, c: RGB, a = 1) {
  rect(ctx, x, y, 1, 1, c, a);
}

export function paintFace(canvas: HTMLCanvasElement, mood: Mood, mouthOpen: number, tick: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  if (canvas.width !== W) {
    canvas.width = W;
    canvas.height = H;
  }
  ctx.imageSmoothingEnabled = false;
  rect(ctx, 0, 0, W, H, C.bg);

  const tilt = mood === "curious" || mood === "shy" ? 1 : mood === "disappointed" ? 2 : 0;
  const bob =
    mood === "laughing"
      ? Math.sin(tick / 3) * 1.5
      : mood === "speaking"
        ? Math.sin(tick / 6) * 0.6
        : Math.sin(tick / 50) * 0.4;

  ctx.save();
  ctx.translate(tilt, bob);

  // --- hair back mass ---
  rect(ctx, 22, 18, 84, 70, C.hair);
  rect(ctx, 16, 28, 12, 50, C.hairDeep);
  rect(ctx, 100, 26, 12, 54, C.hairDeep);
  rect(ctx, 18, 70, 18, 22, C.hairDeep);
  rect(ctx, 92, 68, 18, 24, C.hairDeep);
  // wavy side locks
  rect(ctx, 14, 48, 10, 28, C.hairMid);
  rect(ctx, 104, 46, 10, 30, C.hairMid);
  rect(ctx, 12, 62, 8, 18, C.hair);
  rect(ctx, 108, 60, 8, 20, C.hair);

  // --- face ---
  rect(ctx, 34, 34, 60, 54, C.skin);
  rect(ctx, 38, 30, 52, 10, C.skin);
  rect(ctx, 42, 84, 44, 10, C.skin);
  rect(ctx, 48, 92, 32, 6, C.skinShade);
  // soft jaw shade
  rect(ctx, 36, 78, 8, 10, C.skinShade);
  rect(ctx, 84, 78, 8, 10, C.skinShade);

  // bangs over forehead
  rect(ctx, 30, 26, 68, 16, C.hair);
  rect(ctx, 28, 32, 14, 18, C.hairMid);
  rect(ctx, 42, 28, 16, 16, C.hair);
  rect(ctx, 56, 26, 18, 14, C.hairMid);
  rect(ctx, 72, 28, 16, 16, C.hair);
  rect(ctx, 86, 32, 14, 18, C.hairMid);
  // fringe gaps so eyes peek
  rect(ctx, 40, 40, 12, 6, C.skin);
  rect(ctx, 76, 40, 12, 6, C.skin);
  // highlights
  rect(ctx, 36, 22, 14, 4, C.hairLite);
  rect(ctx, 52, 18, 20, 5, C.hairShine);
  rect(ctx, 78, 22, 12, 4, C.hairLite);
  px(ctx, 58, 20, C.white, 0.5);
  px(ctx, 62, 21, C.white, 0.35);

  // blush
  const blushStrong = mood === "shy" || mood === "love" || mood === "laughing" || mood === "happy" || mood === "proud";
  const blushA = mood === "shy" ? 0.85 : blushStrong ? 0.55 : 0.25;
  rect(ctx, 36, 64, 12, 6, C.blush, blushA);
  rect(ctx, 80, 64, 12, 6, C.blush, blushA);

  const blink =
    mood === "sleeping" ||
    mood === "laughing" ||
    (tick % 180 > 172 && mood !== "surprised" && mood !== "angry");
  const lookX =
    mood === "shy" ? 2 : mood === "thinking" || mood === "curious" ? -2 : mood === "disappointed" ? 1 : 0;
  const wide = mood === "surprised" || mood === "angry";

  drawEye(ctx, 42, 48, blink && mood !== "wink", lookX, wide, mood, false);
  drawEye(ctx, 74, 48, mood === "wink" ? true : blink, lookX, wide, mood, true);

  // brows
  if (mood === "angry") {
    rect(ctx, 42, 44, 14, 2, C.line);
    rect(ctx, 46, 42, 10, 2, C.line);
    rect(ctx, 72, 42, 10, 2, C.line);
    rect(ctx, 72, 44, 14, 2, C.line);
  } else if (mood === "sad" || mood === "crying" || mood === "worried") {
    rect(ctx, 42, 44, 12, 2, C.line);
    rect(ctx, 42, 46, 4, 2, C.line);
    rect(ctx, 74, 44, 12, 2, C.line);
    rect(ctx, 82, 46, 4, 2, C.line);
  } else if (mood === "surprised" || mood === "curious") {
    rect(ctx, 42, 42, 14, 2, C.hairDeep);
    rect(ctx, 72, 42, 14, 2, C.hairDeep);
  } else {
    rect(ctx, 42, 45, 14, 2, C.hairDeep);
    rect(ctx, 72, 45, 14, 2, C.hairDeep);
  }

  drawMouth(ctx, mood, mouthOpen);

  // nose hint
  px(ctx, 63, 66, C.skinShade);
  px(ctx, 64, 67, C.skinShade);

  // tears
  if (mood === "crying" || mood === "sad") {
    const drop = (tick % 30) / 3;
    rect(ctx, 48, 64 + drop, 2, 5, C.tear);
    if (mood === "crying") rect(ctx, 80, 65 + drop * 0.8, 2, 5, C.tear);
  }

  // shirt collar
  rect(ctx, 48, 100, 32, 8, C.shirt);
  rect(ctx, 44, 98, 10, 6, C.shirt);
  rect(ctx, 74, 98, 10, 6, C.shirt);

  // fx
  if (mood === "happy" || mood === "laughing" || mood === "love") {
    const s = tick % 40;
    px(ctx, 20 + s, 30, C.hairShine);
    px(ctx, 100 - (s % 20), 40, C.white, 0.6);
  }
  if (mood === "sleeping" && tick % 60 < 30) {
    rect(ctx, 100, 24, 4, 3, C.irisLite);
    rect(ctx, 108, 18, 3, 3, C.irisLite, 0.6);
  }
  if (mood === "thinking") {
    rect(ctx, 102, 22, 4, 4, C.hairLite);
    px(ctx, 108, 18, C.hairLite);
  }

  ctx.restore();
}

function drawEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  closed: boolean,
  look: number,
  wide: boolean,
  mood: Mood,
  _right: boolean,
) {
  if (closed) {
    rect(ctx, x, y + 8, 16, 2, C.line);
    rect(ctx, x + 1, y + 7, 14, 1, C.line);
    return;
  }
  const h = wide ? 20 : 16;
  // white
  rect(ctx, x, y, 16, h, C.white);
  // upper lid shadow
  rect(ctx, x, y, 16, 3, C.line, 0.15);
  // iris
  let iris = C.iris;
  let outer = C.irisOuter;
  if (mood === "angry") {
    iris = [220, 70, 90] as RGB;
    outer = [140, 30, 40] as RGB;
  } else if (mood === "sad" || mood === "crying") {
    iris = [100, 150, 220] as RGB;
    outer = [50, 90, 160] as RGB;
  }
  const ix = x + 3 + look;
  const iy = y + (wide ? 3 : 2);
  rect(ctx, ix, iy, 10, h - 5, outer);
  rect(ctx, ix + 1, iy + 1, 8, h - 7, iris);
  rect(ctx, ix + 2, iy + 2, 6, 5, C.irisLite, 0.7);
  // pupil
  rect(ctx, ix + 3, iy + 3, 4, 5, C.pupil);
  // specular highlights (anime eyes)
  rect(ctx, ix + 5, iy + 2, 3, 3, C.white);
  px(ctx, ix + 2, iy + 6, C.white, 0.8);
  // lower shine
  rect(ctx, ix + 2, iy + h - 9, 6, 2, C.white, 0.25);
}

function drawMouth(ctx: CanvasRenderingContext2D, mood: Mood, mouthOpen: number) {
  const cx = 64;
  const y = 76;

  if (mood === "speaking") {
    const h = 3 + Math.round(mouthOpen * 8);
    rect(ctx, cx - 10, y, 20, h, C.mouth);
    rect(ctx, cx - 8, y + 1, 16, Math.max(1, h - 2), C.teeth);
    if (h > 6) rect(ctx, cx - 5, y + h - 3, 10, 2, C.tongue);
    return;
  }

  if (mood === "laughing" || mood === "happy" || mood === "confident" || mood === "proud") {
    // open cheerful smile like reference
    rect(ctx, cx - 12, y, 24, 12, C.mouth);
    rect(ctx, cx - 10, y + 1, 20, 4, C.teeth);
    rect(ctx, cx - 8, y + 6, 16, 4, C.tongue);
    // corners
    px(ctx, cx - 13, y + 2, C.mouth);
    px(ctx, cx + 12, y + 2, C.mouth);
    return;
  }

  if (mood === "love" || mood === "wink") {
    rect(ctx, cx - 10, y + 1, 20, 4, C.mouth);
    rect(ctx, cx - 8, y + 1, 16, 2, C.teeth);
    return;
  }

  if (mood === "surprised") {
    rect(ctx, cx - 7, y, 14, 14, C.mouth);
    rect(ctx, cx - 5, y + 2, 10, 8, C.teeth);
    return;
  }

  if (mood === "shy") {
    rect(ctx, cx - 6, y + 3, 12, 2, C.mouth);
    return;
  }

  if (
    mood === "angry" ||
    mood === "disappointed" ||
    mood === "sad" ||
    mood === "crying" ||
    mood === "worried"
  ) {
    rect(ctx, cx - 8, y + 4, 16, 2, C.mouth);
    rect(ctx, cx - 10, y + 2, 4, 2, C.mouth);
    rect(ctx, cx + 6, y + 2, 4, 2, C.mouth);
    return;
  }

  // idle / listening / thinking — soft smile
  rect(ctx, cx - 8, y + 2, 16, 3, C.mouth);
  rect(ctx, cx - 6, y + 2, 12, 1, C.teeth, 0.5);
}
