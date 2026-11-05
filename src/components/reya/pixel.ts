import type { Mood } from "./store";

const W = 64;
const H = 64;
type RGB = [number, number, number];

const C = {
  hair: [78, 36, 112] as RGB,
  hair2: [168, 96, 210] as RGB,
  hair3: [214, 160, 240] as RGB,
  skin: [255, 214, 190] as RGB,
  blush: [240, 120, 150] as RGB,
  line: [36, 22, 48] as RGB,
  white: [248, 252, 255] as RGB,
  iris: [70, 200, 220] as RGB,
  pupil: [18, 24, 48] as RGB,
  mouth: [190, 78, 110] as RGB,
  tear: [120, 190, 255] as RGB,
  bg: [6, 10, 16] as RGB,
};

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: RGB, a = 1) {
  ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  ctx.fillRect(x, y, w, h);
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
      ? Math.sin(tick / 3)
      : mood === "speaking"
        ? Math.sin(tick / 6) * 0.4
        : Math.sin(tick / 40) * 0.3;
  ctx.save();
  ctx.translate(tilt, bob);

  rect(ctx, 12, 6, 40, 10, C.hair);
  rect(ctx, 8, 12, 48, 28, C.hair);
  rect(ctx, 6, 20, 6, 26, C.hair2);
  rect(ctx, 52, 18, 6, 30, C.hair);
  rect(ctx, 16, 8, 8, 3, C.hair3);
  rect(ctx, 40, 10, 6, 2, C.hair3);
  rect(ctx, 14, 16, 10, 8, C.hair);
  rect(ctx, 40, 16, 10, 7, C.hair);

  rect(ctx, 18, 18, 28, 26, C.skin);
  rect(ctx, 22, 42, 20, 4, C.skin);

  const blushOn = mood === "shy" || mood === "love" || mood === "laughing" || mood === "happy";
  if (blushOn) {
    rect(ctx, 18, 32, 5, 2, C.blush, mood === "shy" ? 0.9 : 0.55);
    rect(ctx, 41, 32, 5, 2, C.blush, mood === "shy" ? 0.9 : 0.55);
  }

  const blink =
    mood === "sleeping" ||
    mood === "laughing" ||
    mood === "wink" ||
    (tick % 170 > 162 && mood !== "surprised" && mood !== "angry");
  const look =
    mood === "shy" ? 2 : mood === "thinking" || mood === "curious" ? -1 : mood === "disappointed" ? 1 : 0;
  const wide = mood === "surprised" || mood === "angry";

  drawEye(ctx, 22, 24 + (mood === "thinking" && tick % 30 < 15 ? -1 : 0), blink && mood !== "wink", look, wide, mood);
  drawEye(ctx, 36, 24, mood === "wink" ? true : blink, look, wide, mood);

  if (mood === "angry") {
    rect(ctx, 22, 22, 6, 1, C.line);
    rect(ctx, 24, 21, 4, 1, C.line);
    rect(ctx, 36, 21, 4, 1, C.line);
    rect(ctx, 38, 22, 4, 1, C.line);
  } else if (mood === "sad" || mood === "crying" || mood === "worried") {
    rect(ctx, 22, 22, 5, 1, C.line);
    rect(ctx, 38, 22, 5, 1, C.line);
    rect(ctx, 22, 23, 2, 1, C.line);
  } else if (mood === "surprised" || mood === "curious") {
    rect(ctx, 22, 21, 6, 1, C.line);
    rect(ctx, 36, 21, 6, 1, C.line);
  } else {
    rect(ctx, 22, 23, 6, 1, C.hair);
    rect(ctx, 36, 23, 6, 1, C.hair);
  }

  drawMouth(ctx, mood, mouthOpen);

  if (mood === "crying" || mood === "sad") {
    const drop = (tick % 24) / 4;
    rect(ctx, 26, 32 + drop, 1, 3, C.tear);
    if (mood === "crying") rect(ctx, 40, 33 + drop * 0.7, 1, 3, C.tear);
  }
  if (mood === "sleeping" && tick % 50 < 25) {
    rect(ctx, 50, 14, 2, 2, C.iris);
    rect(ctx, 54, 10, 2, 2, C.iris, 0.6);
  }
  if (mood === "thinking") rect(ctx, 50, 12, 2, 2, C.hair3);
  if (mood === "love") {
    rect(ctx, 48, 14, 3, 2, C.blush);
    rect(ctx, 49, 13, 1, 1, C.blush);
  }
  if (mood === "happy" || mood === "laughing") {
    rect(ctx, 12 + (tick % 20), 12, 1, 1, C.hair3);
    rect(ctx, 50, 20 + (tick % 10), 1, 1, C.white);
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
) {
  if (closed) {
    rect(ctx, x, y + 3, 7, 1, C.line);
    return;
  }
  const h = wide ? 8 : 6;
  rect(ctx, x, y, 7, h, C.white);
  const iris =
    mood === "angry"
      ? ([220, 70, 90] as RGB)
      : mood === "sad" || mood === "crying"
        ? ([120, 160, 220] as RGB)
        : C.iris;
  rect(ctx, x + 2 + look, y + 1, 3, h - 2, iris);
  rect(ctx, x + 3 + look, y + 2, 2, 2, C.pupil);
  rect(ctx, x + 4, y + 1, 1, 1, C.white);
}

function drawMouth(ctx: CanvasRenderingContext2D, mood: Mood, mouthOpen: number) {
  const y = 40;
  if (mood === "speaking") {
    const h = 1 + Math.round(mouthOpen * 4);
    rect(ctx, 28, y, 8, h, C.mouth);
    rect(ctx, 29, y, 6, 1, C.white);
    return;
  }
  if (mood === "happy" || mood === "confident" || mood === "proud" || mood === "love") {
    rect(ctx, 27, y, 10, 2, C.mouth);
    rect(ctx, 28, y, 8, 1, C.white);
    return;
  }
  if (mood === "laughing") {
    rect(ctx, 26, y - 1, 12, 5, C.mouth);
    rect(ctx, 28, y, 8, 2, C.white);
    return;
  }
  if (mood === "angry" || mood === "disappointed" || mood === "sad" || mood === "crying" || mood === "worried") {
    rect(ctx, 28, y + 1, 8, 1, C.mouth);
    rect(ctx, 27, y, 2, 1, C.mouth);
    rect(ctx, 35, y, 2, 1, C.mouth);
    return;
  }
  if (mood === "surprised") {
    rect(ctx, 29, y, 6, 4, C.mouth);
    return;
  }
  if (mood === "shy") {
    rect(ctx, 29, y, 6, 1, C.mouth);
    return;
  }
  rect(ctx, 28, y, 8, 1, C.mouth);
}
