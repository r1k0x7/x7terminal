import { useRef, useEffect, useState, useCallback } from 'react';

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform float u_time;
uniform float u_scrollOffset;
uniform vec2 u_resolution;
uniform float u_aggregation;
uniform vec2 u_mouse;
uniform float u_opacity;

varying vec2 v_uv;

#define PI 3.14159265359
#define TAU 6.28318530718

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise1d(float x) {
  float f = fract(x);
  float i = floor(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(hash(i), hash(i + 1.0), f);
}

float noise2d(vec2 p) {
  vec2 ip = floor(p);
  vec2 fp = fract(p);
  fp = fp * fp * (3.0 - 2.0 * fp);
  float a = hash2(ip);
  float b = hash2(ip + vec2(1.0, 0.0));
  float c = hash2(ip + vec2(0.0, 1.0));
  float d = hash2(ip + vec2(1.0, 1.0));
  return mix(mix(a, b, fp.x), mix(c, d, fp.x), fp.y);
}

float fbm1d(float x, int octaves) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    v += a * noise1d(x);
    x *= 2.0;
    a *= 0.5;
  }
  return v;
}

float fbm2d(vec2 p, int octaves) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    v += a * noise2d(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

vec2 domainWarp(vec2 p, float t) {
  vec2 q = vec2(fbm2d(p + vec2(0.0, 0.0), 3), fbm2d(p + vec2(5.2, 1.3), 3));
  vec2 r = vec2(
    fbm2d(p + 4.0 * q + vec2(1.7, 9.2) + 0.05 * t, 3),
    fbm2d(p + 4.0 * q + vec2(8.3, 2.8) + 0.06 * t, 3)
  );
  return p + 3.5 * r;
}

float smoothMax(float a, float b, float k) {
  float h = clamp((b - a + k) / (2.0 * k), 0.0, 1.0);
  return mix(b, a, h) + k * h * (1.0 - h);
}

float metaballField(vec2 p, float t) {
  float field = 0.0;
  float numBalls = 5.0;
  for (float i = 0.0; i < 5.0; i++) {
    float fi = float(i);
    float angle = TAU * fi / numBalls + t * (0.1 + 0.05 * fi);
    float radius = 0.15 + 0.1 * sin(t * 0.2 + fi * 2.0);
    vec2 center = vec2(cos(angle) * radius, sin(angle * 1.5) * radius * 0.6);
    float d = length(p - center);
    field += 0.015 / (d * d + 0.001);
  }
  return field;
}

vec2 bidAskField(vec2 p, float t) {
  p = domainWarp(p * 1.5, t);
  float bidField = 0.0;
  float askField = 0.0;
  float numClusters = 4.0;
  for (float i = 0.0; i < 4.0; i++) {
    float fi = float(i);
    float angle = TAU * fi / numClusters + t * 0.15;
    float radius = 0.2 + 0.08 * sin(t * 0.3 + fi * 3.0);
    vec2 bidCenter = vec2(cos(angle) * radius - 0.25, sin(angle * 1.3) * radius * 0.5);
    vec2 askCenter = vec2(cos(angle + PI) * radius + 0.25, sin((angle + PI) * 1.3) * radius * 0.5);
    float bidDist = length(p - bidCenter);
    float askDist = length(p - askCenter);
    bidField += 0.012 / (bidDist * bidDist + 0.0008);
    askField += 0.012 / (askDist * askDist + 0.0008);
  }
  bidField = smoothstep(0.3, 3.0, bidField);
  askField = smoothstep(0.3, 3.0, askField);
  return vec2(bidField, askField);
}

vec2 scrollingOrderbook(vec2 uv, float t) {
  float price = uv.y * 2.0 - 1.0;
  float timeScroll = uv.x - t * 0.06;
  float slice = floor(timeScroll * 60.0);
  float bidDepth = 0.0;
  float askDepth = 0.0;
  for (int i = 0; i < 8; i++) {
    float sliceIdx = slice - float(i);
    float sliceHash = hash2(vec2(sliceIdx * 0.73, sliceIdx * 1.31));
    float sliceNoise = noise1d(sliceIdx * 0.5);
    float priceLevel = floor(price * 20.0 + sliceNoise * 4.0);
    float levelHash = hash(sliceIdx * 17.31 + priceLevel * 43.71);
    float bidSize = levelHash * (1.0 + 2.0 * smoothstep(0.0, -0.6, price)) * smoothstep(0.8, 0.0, abs(price));
    float askSize = fract(levelHash * 7.13) * (1.0 + 2.0 * smoothstep(0.0, 0.6, price)) * smoothstep(0.8, 0.0, abs(price));
    bidDepth += bidSize * exp(-abs(timeScroll * 60.0 - sliceIdx) * 2.0);
    askDepth += askSize * exp(-abs(timeScroll * 60.0 - sliceIdx) * 2.0);
  }
  float fade = smoothstep(0.0, 0.15, uv.x) * smoothstep(1.0, 0.85, uv.x);
  return vec2(bidDepth, askDepth) * fade;
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x = (uv.x - 0.5) * aspect + 0.5;

  float t = u_time * 0.5;
  float scrollOffset = u_scrollOffset;

  vec2 bgUV = uv * 2.0;
  vec2 bgWarp = domainWarp(bgUV, t);
  float metaField = metaballField(bgWarp - vec2(0.5), t);
  vec2 bidAsk = bidAskField((uv - 0.5) * 1.8 + vec2(0.0, sin(t * 0.1) * 0.1), t);
  vec2 scrollingDepth = scrollingOrderbook(uv, t + scrollOffset);

  float combinedBid = clamp(bidAsk.x + scrollingDepth.x * 0.7, 0.0, 1.0);
  float combinedAsk = clamp(bidAsk.y + scrollingDepth.y * 0.7, 0.0, 1.0);

  vec3 deepBg = vec3(0.02, 0.03, 0.04);
  vec3 midTone = vec3(0.04, 0.06, 0.08);
  vec3 bidColor = vec3(0.0, 0.9, 0.6);
  vec3 askColor = vec3(1.0, 0.3, 0.4);
  vec3 midPrice = vec3(0.0, 0.83, 1.0);
  vec3 hotBid = vec3(0.6, 1.0, 0.8);
  vec3 hotAsk = vec3(1.0, 0.7, 0.8);

  float fieldNorm = clamp(metaField / 2.5, 0.0, 1.0);
  vec3 bgColor = mix(deepBg, midTone, fieldNorm);
  float bgPulse = 0.5 + 0.5 * sin(t * 0.5);
  bgColor += vec3(0.02) * bgPulse * smoothstep(0.3, 0.8, fieldNorm);

  vec3 col = bgColor;

  float midLine = 1.0 - smoothstep(0.0, 0.012, abs(uv.y - 0.5 + sin(t * 0.07) * 0.05));
  col += midPrice * midLine * 0.7;

  float bidMask = smoothstep(0.05, 0.3, combinedBid);
  float askMask = smoothstep(0.05, 0.3, combinedAsk);
  float bidBright = smoothstep(0.3, 0.9, combinedBid);
  float askBright = smoothstep(0.3, 0.9, combinedAsk);

  vec3 bidColorMix = mix(bidColor, hotBid, bidBright);
  vec3 askColorMix = mix(askColor, hotAsk, askBright);

  col += bidColorMix * bidMask * 0.6;
  col += askColorMix * askMask * 0.6;

  float overlap = bidMask * askMask;
  col -= vec3(0.3, 0.15, 0.0) * overlap * 0.5;

  float vig = 1.0 - dot((uv - 0.5) * 1.2, (uv - 0.5) * 1.2);
  vig = clamp(vig, 0.0, 1.0);
  vig = vig * vig;
  col *= vig;

  col *= u_opacity;

  gl_FragColor = vec4(col, 1.0);
}
`;

export function OrderbookHeatmap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);
  const scrollOffsetRef = useRef(0);
  const isPausedRef = useRef(false);
  const mouseRef = useRef({ x: -1, y: -1 });

  const [opacity, setOpacity] = useState(0.85);
  const [aggregation, setAggregation] = useState(1.0);
  const [isPaused, setIsPaused] = useState(false);

  const togglePause = useCallback(() => {
    setIsPaused(prev => {
      isPausedRef.current = !prev;
      return !prev;
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;
    glRef.current = gl;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Compile shaders
    function compileShader(src: string, type: number) {
      const shader = gl!.createShader(type)!;
      gl!.shaderSource(shader, src);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error('Shader error:', gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = compileShader(VERTEX_SHADER, gl.VERTEX_SHADER);
    const fs = compileShader(FRAGMENT_SHADER, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    programRef.current = program;
    gl.useProgram(program);

    // Fullscreen triangle
    const vertices = new Float32Array([-1, -1, 3, -1, -1, 3]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uScrollOffset = gl.getUniformLocation(program, 'u_scrollOffset');
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uAggregation = gl.getUniformLocation(program, 'u_aggregation');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const uOpacity = gl.getUniformLocation(program, 'u_opacity');

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.uniform2f(uResolution, canvas!.width, canvas!.height);
    }

    resize();
    window.addEventListener('resize', resize);

    function render() {
      if (!isPausedRef.current) {
        timeRef.current += 0.016;
      }

      gl!.uniform1f(uTime, timeRef.current);
      gl!.uniform1f(uScrollOffset, scrollOffsetRef.current);
      gl!.uniform1f(uAggregation, aggregation);
      gl!.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
      gl!.uniform1f(uOpacity, opacity);

      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [aggregation, opacity]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    scrollOffsetRef.current += e.deltaY / 1000.0;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: 1.0 - (e.clientY - rect.top) / rect.height,
      };
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1, y: -1 };
  }, []);

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        backgroundColor: '#111318',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        height: '400px',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 h-10 border-b"
        style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
      >
        <span className="text-[10px] font-mono-data font-semibold tracking-widest text-qs-cyan">
          ORDERBOOK HEATMAP
        </span>
        <div className="flex items-center gap-2">
          {['0.1', '1', '10', '100'].map(agg => (
            <button
              key={agg}
              onClick={() => setAggregation(parseFloat(agg))}
              className="px-2 py-0.5 rounded text-[10px] font-mono-data font-medium transition-colors"
              style={{
                backgroundColor: aggregation === parseFloat(agg) ? '#1A1D24' : 'transparent',
                color: aggregation === parseFloat(agg) ? '#00D4FF' : 'rgba(255, 255, 255, 0.4)',
                border: aggregation === parseFloat(agg) ? '1px solid rgba(0, 212, 255, 0.2)' : '1px solid transparent',
              }}
            >
              {agg}
            </button>
          ))}
          <button
            onClick={togglePause}
            className="px-2 py-0.5 rounded text-[10px] font-mono-data font-medium transition-colors ml-2"
            style={{
              backgroundColor: '#1A1D24',
              color: isPaused ? '#FF4D6A' : '#00E5A0',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {isPaused ? 'PLAY' : 'PAUSE'}
          </button>
        </div>
      </div>

      {/* WebGL Canvas */}
      <div className="relative flex-1">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />

        {/* Controls overlay */}
        <div
          className="absolute bottom-3 left-3 flex items-center gap-3 px-3 py-1.5 rounded-lg"
          style={{
            backgroundColor: 'rgba(10, 11, 15, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <span className="text-[10px] font-mono-data text-white/40">Opacity</span>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(opacity * 100)}
            onChange={(e) => setOpacity(parseInt(e.target.value) / 100)}
            className="w-20 h-1 accent-qs-cyan"
          />
          <span className="text-[10px] font-mono-data text-white/60">{Math.round(opacity * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
