"use client";

import { useEffect, useRef, useState } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";

// Vendored from reactbits.dev (ts/tailwind variant, Backgrounds/MoltenMetal —
// https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/ts-tailwind/Backgrounds/MoltenMetal/MoltenMetal.tsx),
// replacing Threads per docs/design-decisions.md's hero-background swap
// record. Sourced the same way Threads originally was: `pnpm dlx jsrepo
// add` fails against reactbits.dev's manifest endpoint (still returns HTML,
// not JSON), so this is copied by hand from the same upstream GitHub source
// jsrepo would fetch. MIT + Commons Clause.
//
// Confirmed by reading this file rather than assumed: `color1`/`color2`/
// `color3` take arbitrary hex STRINGS (converted to 0-1 internally by the
// component's own `hexToRgb`, unlike Threads' raw [r,g,b] tuple prop) and
// `mouseInteraction` is a boolean. The three colors blend by intensity —
// `col = mix(mix(color1, color2, ...), color3, ...)` — so `color3` is the
// terminal colour at the brightest/most-opaque pixels; see
// molten-metal-background.tsx's default export for why it's deliberately
// pinned to the exact same worst-case colour Threads used, so the existing
// scrim math in hero-scrim.tsx carries over unchanged.
export type MoltenMetalColorMode = "molten" | "ember" | "frost";

interface MoltenMetalProps {
  color1?: string;
  color2?: string;
  color3?: string;
  speed?: number;
  scale?: number;
  detail?: number;
  glow?: number;
  coreSize?: number;
  swirl?: number;
  fold?: number;
  blackPoint?: number;
  brightness?: number;
  colorMode?: MoltenMetalColorMode;
  grain?: boolean;
  grainIntensity?: number;
  mouseInteraction?: boolean;
  mouseStrength?: number;
  opacity?: number;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [
    Number.parseInt(result[1], 16) / 255,
    Number.parseInt(result[2], 16) / 255,
    Number.parseInt(result[3], 16) / 255,
  ];
};

const colorModeToFloat = (mode: MoltenMetalColorMode): number =>
  mode === "ember" ? 1 : mode === "frost" ? 2 : 0;

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uScale;
uniform float uDetail;
uniform float uGlow;
uniform float uCoreSize;
uniform float uSwirl;
uniform float uFold;
uniform float uBlackPoint;
uniform float uBrightness;
uniform float uColorMode;
uniform float uGrain;
uniform float uGrainIntensity;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform bool uEnableMouse;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  float time = iTime * uSpeed;
  vec2 p = uScale * ((gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y) - 0.5;

  vec2 drift = vec2(0.0);
  if (uEnableMouse) {
    drift = (uMouse - 0.5) * uMouseStrength * 2.0;
  }
  p += drift;

  vec2 i = p;
  float c = 0.0;
  float r = length(p + vec2(sin(time), sin(time * 0.3 + 5.0)) * 0.5);
  float d = length(p);
  float rot = d + time + p.x * uSwirl;

  float cosRot = cos(rot);
  mat2 warp = mat2(cos(rot - sin(time / 5.0)), sin(rot), -sin(cosRot - time), cosRot) * uFold;
  float glowCore = uGlow * uCoreSize;

  for (float n = 0.0; n < 8.0; n++) {
    if (n >= uDetail) break;
    p *= warp;
    float t = r - time / (n + 3.0);
    i -= p + vec2(cos(t - i.x - r) + sin(t + i.y), sin(t - i.y) + cos(t + i.x) + r);
    c += glowCore / length(vec2(sin(i.x + t), cos(i.y + t)));
  }

  c /= 6.0;

  float intensity = max(c - uBlackPoint, 0.0) * uBrightness;

  float g = clamp(intensity, 0.0, 1.0);

  float mid = 0.5;
  if (uColorMode > 1.5) {
    mid = 0.65;
  } else if (uColorMode > 0.5) {
    mid = 0.35;
  }

  vec3 col = mix(uColor1, uColor2, smoothstep(0.0, mid, g));
  col = mix(col, uColor3, smoothstep(mid, 1.0, g));

  float a = g;
  if (uGrain > 0.5) {
    float gr = hash(gl_FragCoord.xy + iTime);
    a += (gr - 0.5) * uGrainIntensity;
  }
  a = clamp(a, 0.0, 1.0) * uOpacity;
  fragColor = vec4(col * a, a);
}
`;

type MoltenMetalCtx = {
  renderer: InstanceType<typeof Renderer>;
  program: InstanceType<typeof Program>;
  mesh: InstanceType<typeof Mesh>;
};
const ctxMap = new WeakMap<HTMLDivElement, MoltenMetalCtx>();

function MoltenMetal({
  color1 = "#5227FF",
  color2 = "#FF9FFC",
  color3 = "#FFFFFF",
  speed = 0.35,
  scale = 4,
  detail = 3,
  glow = 1.6,
  coreSize = 0.1,
  swirl = 1,
  fold = -0.2,
  blackPoint = 0.05,
  brightness = 1.3,
  colorMode = "molten",
  grain = true,
  grainIntensity = 0.05,
  mouseInteraction = true,
  mouseStrength = 0.3,
  opacity = 1.0,
}: MoltenMetalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      webgl: 2,
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uSpeed: { value: 0.35 },
        uScale: { value: 4 },
        uDetail: { value: 3 },
        uGlow: { value: 1.6 },
        uCoreSize: { value: 0.1 },
        uSwirl: { value: 1 },
        uFold: { value: -0.2 },
        uBlackPoint: { value: 0.05 },
        uBrightness: { value: 1.3 },
        uColorMode: { value: 0 },
        uGrain: { value: 1 },
        uGrainIntensity: { value: 0.05 },
        uOpacity: { value: 1.0 },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uMouseStrength: { value: 0.3 },
        uEnableMouse: { value: true },
        uColor1: { value: new Float32Array([1, 1, 1]) },
        uColor2: { value: new Float32Array([1, 1, 1]) },
        uColor3: { value: new Float32Array([1, 1, 1]) },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    ctxMap.set(container, { renderer, program, mesh });

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      renderer.setSize(w, h);
      const res = program.uniforms.iResolution.value as Float32Array;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
      renderer.render({ scene: mesh });
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(container);
    setSize();

    const targetMouse: [number, number] = [0.5, 0.5];
    const currentMouse: [number, number] = [0.5, 0.5];

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouse[0] = (e.clientX - rect.left) / rect.width;
      targetMouse[1] = 1.0 - (e.clientY - rect.top) / rect.height;
    };
    const handleMouseLeave = () => {
      targetMouse[0] = 0.5;
      targetMouse[1] = 0.5;
    };
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    let raf = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    const t0 = performance.now();

    const loop = (t: number) => {
      program.uniforms.iTime.value = (t - t0) * 0.001;
      currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
      currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
      const m = program.uniforms.uMouse.value as Float32Array;
      m[0] = currentMouse[0];
      m[1] = currentMouse[1];
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };

    const tryStart = () => {
      if (isVisible && isPageVisible && raf === 0)
        raf = requestAnimationFrame(loop);
    };
    const tryStop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) tryStart();
        else tryStop();
      },
      { threshold: 0 },
    );
    io.observe(container);

    const onVisibility = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) tryStart();
      else tryStop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    tryStart();

    return () => {
      tryStop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      ctxMap.delete(container);
      try {
        container.removeChild(canvas);
      } catch {
        // Container already unmounted by React before this cleanup ran.
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ctx = ctxMap.get(container);
    if (!ctx) return;
    const u = ctx.program.uniforms;

    u.uSpeed.value = speed;
    u.uScale.value = scale;
    u.uDetail.value = detail;
    u.uGlow.value = glow;
    u.uCoreSize.value = Math.max(coreSize, 0.001);
    u.uSwirl.value = swirl;
    u.uFold.value = fold;
    u.uBlackPoint.value = blackPoint;
    u.uBrightness.value = brightness;
    u.uColorMode.value = colorModeToFloat(colorMode);
    u.uGrain.value = grain ? 1 : 0;
    u.uGrainIntensity.value = grainIntensity;
    u.uOpacity.value = opacity;
    u.uMouseStrength.value = mouseStrength;
    u.uEnableMouse.value = mouseInteraction;
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    const c3 = hexToRgb(color3);
    const uc1 = u.uColor1.value as Float32Array;
    const uc2 = u.uColor2.value as Float32Array;
    const uc3 = u.uColor3.value as Float32Array;
    uc1[0] = c1[0];
    uc1[1] = c1[1];
    uc1[2] = c1[2];
    uc2[0] = c2[0];
    uc2[1] = c2[1];
    uc2[2] = c2[2];
    uc3[0] = c3[0];
    uc3[1] = c3[1];
    uc3[2] = c3[2];
  }, [
    color1,
    color2,
    color3,
    speed,
    scale,
    detail,
    glow,
    coreSize,
    swirl,
    fold,
    blackPoint,
    brightness,
    colorMode,
    grain,
    grainIntensity,
    mouseInteraction,
    mouseStrength,
    opacity,
  ]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="relative size-full overflow-hidden"
    />
  );
}

// This is the piece that actually matters for this project: MoltenMetal
// driven by raw palette tokens instead of the sourced defaults (a violet/
// pink/white trio — pink has no place in this cool-toned system). All
// three colours stay within the already-defined --palette-brand-* family,
// so no new palette entries are needed for a "warm" molten-metal look —
// this reads as a slow-moving violet plasma instead, consistent with
// design-system rule 3 ("no warm colours enter the palette").
//
// color3 (the terminal colour at the brightest/most-opaque pixels — see
// the fragment shader's final mix) is deliberately pinned to
// --palette-brand-500, the EXACT value Threads' worst-case pixel used.
// hero-scrim.tsx's contrast verification was computed against "a single
// fully opaque --palette-brand-500 pixel" — keeping that same ceiling here
// means that verification still holds without re-deriving it for a
// different worst-case colour.
export default function MoltenMetalBackground() {
  // Read once, in a lazy useState initializer: like ThreadsBackground
  // before it, this component only ever renders on the client (always
  // loaded through `dynamic(..., { ssr: false })` from hero-background.tsx),
  // so `document` is guaranteed to exist here, and none of these three
  // raw palette values change at runtime (no `.dark` override on any of
  // them — the brand hue doesn't flip with light/dark).
  const [colors] = useState(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      color1: style.getPropertyValue("--palette-brand-700").trim(),
      color2: style.getPropertyValue("--palette-brand-600").trim(),
      color3: style.getPropertyValue("--palette-brand-500").trim(),
    };
  });

  return (
    <MoltenMetal
      color1={colors.color1}
      color2={colors.color2}
      color3={colors.color3}
      mouseInteraction
    />
  );
}
