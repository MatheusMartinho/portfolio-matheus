import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  clothTexture,
  coverHeightTexture,
  drawSpine,
  loadCoverTexture,
  thickness,
} from './book-materials';

export { thickness };

// WebGL version of the book stack (three.js). World units are CSS pixels:
// x grows to the right, y grows downwards (we negate it for three), the spine
// sits on the z = 0 plane and the book recedes into negative z. The camera is
// parked at a fixed distance and an off-axis projection keeps the spine
// exactly over its layout box, so plain DOM buttons can act as hit targets.

const CAMERA_TOP = 100; // viewport y (px) where the virtual camera sits
const CAMERA_DIST = 1800;
const CAM_ABOVE = 120; // how far above the stack the camera may go (keeps covers off the intro text)
const PAD_X = 48; // extra canvas around the layout box so lifted books / covers aren't clipped
const PAD_Y = 160;

export const stackMetrics = width => ({
  gap: width < 480 ? 44 : 64,
  hScale: width < 480 ? 0.78 : 1,
});

const StyledStage = styled.div`
  --pad-x: ${PAD_X}px;
  --pad-y: ${PAD_Y}px;
  position: relative;

  canvas {
    position: absolute;
    left: calc(-1 * var(--pad-x));
    top: calc(-1 * var(--pad-y));
    width: calc(100% + var(--pad-x) * 2);
    height: calc(100% + var(--pad-y) * 2);
    display: block;
    pointer-events: none;
  }

  .hit {
    position: absolute;
    left: 0;
    right: 0;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: transparent;
    font-size: 0;
    cursor: pointer;
    border-radius: 2px;

    &:focus-visible {
      outline: 2px solid var(--green);
      outline-offset: 4px;
    }
  }
`;

const BookStack3D = ({
  books,
  active,
  onSelect,
  onOpen,
  readingLabel,
  reducedMotion,
  onUnsupported,
}) => {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const stateRef = useRef({ active, lifts: [] });
  const [width, setWidth] = useState(0);

  stateRef.current.active = active;

  useEffect(() => {
    const el = stageRef.current;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(() => {
    const { gap, hScale } = stackMetrics(width || 640);
    let top = 0;
    const rows = books.map(book => {
      const h = Math.round(thickness(book.pages) * hScale);
      const row = { top, h };
      top += h + gap;
      return row;
    });
    return { rows, height: Math.max(0, top - gap) };
  }, [books, width]);

  useEffect(() => {
    if (!width || !books.length) {
      return undefined;
    }
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    let disposed = false;
    let cleanup = () => {};

    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      onUnsupported();
      return undefined;
    }

    (async () => {
      const THREE = await import('three');
      try {
        await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2000))]);
      } catch (e) {
        /* fonts API unavailable – draw with fallbacks */
      }
      if (disposed) {
        return;
      }

      const W = width;
      const Hs = layout.height;
      const D = Math.round(W * 0.64);
      const cw = W + PAD_X * 2;
      const chh = Hs + PAD_Y * 2;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        context: gl,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(cw, chh, false);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      const maxAniso = renderer.capabilities.getMaxAnisotropy();

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 10, CAMERA_DIST + D + 800);

      // ---- lights ----
      scene.add(new THREE.AmbientLight(0xfff6ea, 0.9));
      const hemi = new THREE.HemisphereLight(0xfff4e6, 0x2a151e, 0.5);
      scene.add(hemi);
      const key = new THREE.DirectionalLight(0xfff1dc, 2.4);
      key.position.set(W * 0.15, 520, 980);
      key.target.position.set(W / 2, -Hs / 2, -D / 2);
      key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048);
      const ext = Math.max(W, Hs) * 0.8 + D;
      Object.assign(key.shadow.camera, {
        near: 10,
        far: 5000,
        left: -ext,
        right: ext,
        top: ext,
        bottom: -ext,
      });
      key.shadow.bias = -0.0006;
      key.shadow.normalBias = 2;
      scene.add(key, key.target);
      const fill = new THREE.DirectionalLight(0xdfe9ff, 0.6);
      fill.position.set(W * 1.3, -Hs * 0.4, 700);
      scene.add(fill);

      // ---- books ----
      const disposables = [];
      const meshes = [];
      const lifts = books.map(() => 0);
      stateRef.current.lifts = lifts;
      const pageMat = new THREE.MeshStandardMaterial({ color: 0xefe6d3, roughness: 1 });
      disposables.push(pageMat);

      // ---- camera: off-axis projection so 1 world unit == 1 css px on the spine plane ----
      const updateCamera = () => {
        const { top } = stage.getBoundingClientRect();
        const raw = reducedMotion ? Hs * 0.25 : CAMERA_TOP - top;
        const camY = Math.min(Math.max(raw, -CAM_ABOVE), Hs * 0.6);
        const R = Math.max(Math.abs(camY + PAD_Y), Math.abs(Hs + PAD_Y - camY), W / 2 + PAD_X) + 20;
        camera.position.set(W / 2, -camY, CAMERA_DIST);
        camera.fov = (2 * Math.atan(R / CAMERA_DIST) * 180) / Math.PI;
        camera.aspect = 1;
        camera.setViewOffset(2 * R, 2 * R, R - W / 2 - PAD_X, R - camY - PAD_Y, cw, chh);
        camera.updateProjectionMatrix();
      };

      let raf = 0;
      // synchronous visibility check: IntersectionObserver can lag (or never fire
      // while an ancestor is still faded out), and a missed kick means a book
      // whose cover just loaded stays blank until the next scroll
      const inView = () => {
        const r = stage.getBoundingClientRect();
        return r.bottom > -300 && r.top < window.innerHeight + 300;
      };
      const tick = () => {
        raf = 0;
        if (disposed) {
          return;
        }
        updateCamera();
        let animating = false;
        meshes.forEach((mesh, i) => {
          const target = stateRef.current.active === i ? 36 : 0;
          const next = lifts[i] + (target - lifts[i]) * 0.16;
          if (Math.abs(next - lifts[i]) > 0.05) {
            animating = true;
          }
          lifts[i] = next;
          mesh.position.z = -D / 2 + next;
        });
        renderer.render(scene, camera);
        // the camera only moves on scroll/resize (which call kick), so keep
        // looping only while a book is still sliding in or out
        if (animating) {
          raf = requestAnimationFrame(tick);
        }
      };
      const kick = () => {
        if (!raf && !disposed && inView()) {
          raf = requestAnimationFrame(tick);
        }
      };
      window.addEventListener('scroll', kick, { passive: true });
      stateRef.current.kick = kick;

      books.forEach((book, i) => {
        const row = layout.rows[i];
        const spineCanvas = drawSpine(book, W, row.h, readingLabel);
        const spineTex = new THREE.CanvasTexture(spineCanvas);
        spineTex.colorSpace = THREE.SRGBColorSpace;
        spineTex.anisotropy = maxAniso;
        const spineHeight = new THREE.CanvasTexture(
          drawSpine(book, W, row.h, readingLabel, 'height'),
        );
        spineHeight.anisotropy = maxAniso;
        const spineMat = new THREE.MeshStandardMaterial({
          map: spineTex,
          bumpMap: spineHeight,
          bumpScale: 2,
          roughness: 0.88,
        });
        const darkMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(book.spine).multiplyScalar(0.55),
          roughness: 0.95,
        });
        const coverMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(book.spine).multiplyScalar(0.92),
          bumpMap: clothTexture(THREE, W, D),
          bumpScale: 1.2,
          roughness: 0.7,
        });
        disposables.push(spineTex, spineHeight, spineMat, darkMat, coverMat);

        if (book.coverLarge) {
          loadCoverTexture(THREE, book.coverLarge, maxAniso, Math.PI / 2, tex => {
            if (disposed) {
              return;
            }
            coverMat.map = tex;
            coverMat.color.set(0xffffff);
            const relief = coverHeightTexture(THREE, tex.image, `${book.coverLarge}|top`);
            relief.center.set(0.5, 0.5);
            relief.rotation = Math.PI / 2;
            coverMat.bumpMap = relief;
            coverMat.bumpScale = 1.6;
            coverMat.needsUpdate = true;
            if (stateRef.current.kick) {
              stateRef.current.kick();
            }
          });
        }

        const geo = new THREE.BoxGeometry(W - 4, row.h, D);
        disposables.push(geo);
        // BoxGeometry material order: +x, -x, +y (top), -y, +z (spine), -z
        const mesh = new THREE.Mesh(geo, [pageMat, pageMat, coverMat, darkMat, spineMat, darkMat]);
        mesh.position.set(W / 2, -(row.top + row.h / 2), -D / 2);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        meshes.push(mesh);
      });

      updateCamera();
      renderer.render(scene, camera);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('scroll', kick);
        disposables.forEach(d => d.dispose && d.dispose());
        renderer.dispose();
      };
    })().catch(() => onUnsupported());

    return () => {
      disposed = true;
      cleanup();
    };
  }, [width, books, layout, readingLabel, reducedMotion]);

  // re-render once when the selection changes while the loop is idle
  useEffect(() => {
    if (stateRef.current.kick) {
      stateRef.current.kick();
    }
  }, [active]);

  return (
    <StyledStage ref={stageRef} style={{ height: layout.height }}>
      <canvas ref={canvasRef} />
      {books.map((book, i) => (
        <button
          key={book.id}
          type="button"
          className="hit"
          style={{ top: layout.rows[i].top, height: layout.rows[i].h }}
          aria-pressed={active === i}
          aria-label={`${book.title} — ${book.author}`}
          onMouseEnter={() => onSelect(i)}
          onFocus={() => onSelect(i)}
          onClick={() => (onOpen ? onOpen(i) : onSelect(i))}>
          {book.title}
        </button>
      ))}
    </StyledStage>
  );
};

BookStack3D.propTypes = {
  books: PropTypes.array.isRequired,
  active: PropTypes.number.isRequired,
  onSelect: PropTypes.func.isRequired,
  onOpen: PropTypes.func,
  readingLabel: PropTypes.string.isRequired,
  reducedMotion: PropTypes.bool,
  onUnsupported: PropTypes.func.isRequired,
};

export default BookStack3D;
