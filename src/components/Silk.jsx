import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { forwardRef, useRef, useMemo, useLayoutEffect, useEffect } from "react";
import { Color } from "three";

// Callers feed this whatever getComputedStyle() hands back for a design
// token (see use-token-colors.ts), and browsers are free to serialize a
// resolved custom property's colour as 3-digit shorthand even when the
// source declared 6 digits — confirmed live: --hero-silk-high is declared
// as #ffffff in palette.css but getComputedStyle() returned "#fff". The
// original version of this function assumed 6 digits unconditionally, so
// slice(2,4) on a 3-char string returned a single character ("f") for green
// and slice(4,6) returned "" (parseInt("", 16) = NaN) for blue — silently
// producing (1.0, 0.06, NaN) for white instead of (1.0, 1.0, 1.0). That NaN
// channel is what painted the hero's light-theme silk red-orange instead of
// white: NaN clamps toward 0 on an 8-bit framebuffer on the drivers tested.
const hexToNormalizedRGB = (hex) => {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = [...hex].map((c) => c + c).join("");
  }
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  ];
};

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Diverges from the upstream reactbits component: it took a single uColor
// and multiplied it by `pattern`, which meant the shader could only ever
// DARKEN that colour — the brightest pixel it could paint was uColor itself,
// and everything else fell away toward black. Fine on a dark page, unusable
// on a light one: this site's light theme paints a near-black headline over
// the hero, and across the pattern's 0.2-1.0 sweep that headline measured
// 4.00:1 at the single brightest pixel down to 1.01:1 in the dark bands.
//
// Taking BOTH endpoints as uniforms lets each theme pin its own floor and
// ceiling, so the light theme ripples between two near-white tones instead
// of bottoming out at black, while the dark theme keeps the ramp it had.
// The endpoint values live in tokens.css (--hero-silk-low/high).
const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
// Both ends of the tonal ramp — see the JS comment above this string.
uniform vec3  uColorLow;
uniform vec3  uColorHigh;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  // pattern sweeps 0.2-1.0, so this interpolates between the two endpoint
  // colours rather than scaling one toward black.
  vec3 silk = mix(uColorLow, uColorHigh, pattern);
  vec4 col = vec4(silk, 1.0) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

const SilkPlane = forwardRef(function SilkPlane({ uniforms }, ref) {
  const { viewport } = useThree();

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.scale.set(viewport.width, viewport.height, 1);
    }
  }, [ref, viewport]);

  useFrame((_, delta) => {
    ref.current.material.uniforms.uTime.value += 0.1 * delta;
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
});
SilkPlane.displayName = "SilkPlane";

/**
 * @param colorLow  Hex for the pattern's troughs (darkest bands).
 * @param colorHigh Hex for the pattern's crests (brightest bands).
 *
 * Both are plain hex strings because WebGL uniforms need literal channel
 * values — a CSS `var()` cannot reach a shader. Callers in this project must
 * still not hardcode them: resolve the design tokens with
 * `useSilkTokenColors()` and pass the result, so the palette stays the single
 * source of truth (see src/lib/hooks/use-token-colors.ts).
 */
const Silk = ({
  speed = 5,
  scale = 1,
  colorLow,
  colorHigh,
  noiseIntensity = 1.5,
  rotation = 0,
}) => {
  const meshRef = useRef();

  const uniforms = useMemo(
    () => ({
      uSpeed: { value: speed },
      uScale: { value: scale },
      uNoiseIntensity: { value: noiseIntensity },
      uColorLow: { value: new Color(...hexToNormalizedRGB(colorLow)) },
      uColorHigh: { value: new Color(...hexToNormalizedRGB(colorHigh)) },
      uRotation: { value: rotation },
      uTime: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    // Intentional direct mutation of WebGL uniform values to drive the
    // animation loop without a React re-render on every frame; standard
    // pattern for animating shader uniforms, required for performance.
    // This is also what makes the theme toggle repaint the silk in place:
    // new endpoint props land here and the running frameloop picks them up
    // on its next frame, with no canvas teardown or WebGL context churn.
    // eslint-disable-next-line react-hooks/immutability
    uniforms.uSpeed.value = speed;
    uniforms.uScale.value = scale;
    uniforms.uNoiseIntensity.value = noiseIntensity;
    uniforms.uColorLow.value.setRGB(...hexToNormalizedRGB(colorLow));
    uniforms.uColorHigh.value.setRGB(...hexToNormalizedRGB(colorHigh));
    uniforms.uRotation.value = rotation;
  }, [speed, scale, noiseIntensity, colorLow, colorHigh, rotation, uniforms]);

  return (
    <Canvas dpr={[1, 2]} frameloop="always">
      <SilkPlane ref={meshRef} uniforms={uniforms} />
    </Canvas>
  );
};

export default Silk;
