import { useEffect, useRef, useState } from 'react';
import { type MotionValue } from 'framer-motion';

/**
 * Renders a green-screen video with the green background removed in
 * real time via a WebGL chroma-key shader, so only the subject is
 * visible (transparent canvas, not a rectangular video element).
 *
 * - YCbCr chroma-distance keying (more robust to lighting/compression
 *   variance than a plain RGB threshold).
 * - Smoothstep-based feathered edges instead of a hard cutout.
 * - Green-spill suppression: desaturates residual green tint near
 *   the keyed edge instead of leaving a green fringe.
 * - object-fit: contain style UV remap so the source video's native
 *   aspect ratio is preserved instead of being stretched to fill
 *   whatever box the canvas happens to sit in.
 * - Optional scroll-scrubbing: pass a 0..1 MotionValue and the video
 *   plays back frame-accurately in step with scroll instead of on a
 *   free-running loop.
 */

const VERTEX_SRC = `
  attribute vec2 a_position;
  varying vec2 v_canvasUV;
  void main() {
    v_canvasUV = a_position * 0.5 + 0.5;
    v_canvasUV.y = 1.0 - v_canvasUV.y;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SRC = `
  precision mediump float;
  uniform sampler2D u_video;
  uniform vec3 u_keyColor;
  uniform float u_similarity;
  uniform float u_smoothness;
  uniform float u_spill;
  // object-fit: contain mapping from canvas-space UV to video-space UV
  uniform vec2 u_fitScale;
  uniform vec2 u_fitOffset;
  varying vec2 v_canvasUV;

  vec2 rgbToUV(vec3 c) {
    return vec2(
      c.r * -0.169 + c.g * -0.331 + c.b *  0.5   + 0.5,
      c.r *  0.5   + c.g * -0.419 + c.b * -0.081 + 0.5
    );
  }

  void main() {
    vec2 uv = (v_canvasUV - u_fitOffset) / u_fitScale;

    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      gl_FragColor = vec4(0.0);
      return;
    }

    vec4 tex = texture2D(u_video, uv);
    vec3 rgb = tex.rgb;

    vec2 chroma = rgbToUV(rgb) - rgbToUV(u_keyColor);
    float dist = length(chroma);

    float alpha = smoothstep(u_similarity, u_similarity + u_smoothness, dist);

    // Spill suppression: pull the green channel toward max(r,b) near
    // the keyed edge so residual green tint doesn't fringe the subject.
    float spillAmount = (1.0 - alpha) * u_spill;
    float desatG = min(rgb.g, max(rgb.r, rgb.b));
    rgb.g = mix(rgb.g, desatG, spillAmount);

    gl_FragColor = vec4(rgb * alpha, alpha);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

interface ChromaKeyVideoProps {
  src: string;
  className?: string;
  /**
   * A 0..1 progress value (typically from useScroll). When provided,
   * playback is disabled and video.currentTime is driven directly by
   * this value instead — the animation scrubs with scroll.
   */
  scrollProgress?: MotionValue<number>;
}

export function ChromaKeyVideo({ src, className, scrollProgress }: ChromaKeyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const progressRef = useRef(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!scrollProgress) return;
    progressRef.current = scrollProgress.get();
    const unsubscribe = scrollProgress.on('change', (v) => {
      progressRef.current = v;
    });
    return unsubscribe;
  }, [scrollProgress]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true });
    if (!gl) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC));
    gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC));
    gl.linkProgram(program);
    gl.useProgram(program);

    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    const positionLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Measured from the source footage — a strong, slightly-impure green.
    gl.uniform3f(gl.getUniformLocation(program, 'u_keyColor'), 0.02, 0.87, 0.02);
    gl.uniform1f(gl.getUniformLocation(program, 'u_similarity'), 0.22);
    gl.uniform1f(gl.getUniformLocation(program, 'u_smoothness'), 0.14);
    gl.uniform1f(gl.getUniformLocation(program, 'u_spill'), 0.6);
    const fitScaleLoc = gl.getUniformLocation(program, 'u_fitScale');
    const fitOffsetLoc = gl.getUniformLocation(program, 'u_fitOffset');
    gl.uniform2f(fitScaleLoc, 1, 1);
    gl.uniform2f(fitOffsetLoc, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    video.muted = true;
    video.playsInline = true;

    if (scrollProgress) {
      // Scrubbed externally — don't let it free-run.
      video.loop = false;
      video.autoplay = false;
      video.pause();
    } else {
      video.play().catch(() => {
        // Autoplay can be blocked before user interaction on some browsers;
        // the draw loop will simply wait until playback starts.
      });
    }

    let cancelled = false;

    const updateFit = () => {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh || !canvas.width || !canvas.height) return;
      const videoAspect = vw / vh;
      const canvasAspect = canvas.width / canvas.height;
      let scaleX = 1;
      let scaleY = 1;
      if (videoAspect > canvasAspect) {
        // video relatively wider than canvas -> fit width, letterbox y
        scaleY = canvasAspect / videoAspect;
      } else {
        // video relatively taller than canvas -> fit height, letterbox x
        scaleX = videoAspect / canvasAspect;
      }
      gl.uniform2f(fitScaleLoc, scaleX, scaleY);
      gl.uniform2f(fitOffsetLoc, (1 - scaleX) / 2, (1 - scaleY) / 2);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      updateFit();
    };
    resize();
    window.addEventListener('resize', resize);
    video.addEventListener('loadedmetadata', resize);

    let lastScrubTime = -1;

    const draw = () => {
      if (cancelled) return;

      if (scrollProgress && video.readyState >= video.HAVE_METADATA && video.duration) {
        const target = progressRef.current * video.duration;
        if (Math.abs(target - lastScrubTime) > 1 / 60) {
          video.currentTime = target;
          lastScrubTime = target;
        }
      }

      if (video.readyState >= video.HAVE_CURRENT_DATA) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        if (!ready) setReady(true);
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      video.removeEventListener('loadedmetadata', resize);
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollProgress]);

  return (
    <div className={className} style={{ position: 'relative' }}>
      <video
        ref={videoRef}
        src={src}
        muted
        loop={!scrollProgress}
        autoPlay={!scrollProgress}
        playsInline
        preload="auto"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.4s ease' }}
      />
    </div>
  );
}
