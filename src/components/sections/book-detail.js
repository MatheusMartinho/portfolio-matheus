import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import {
  clothMaterial,
  clothTexture,
  coverHeightTexture,
  drawBack,
  drawSpine,
  fabricMaterial,
  loadCoverTexture,
  makeEnvironment,
  pagesTexture,
  thickness,
} from './book-materials';
import { BOOK_EXTENT, SLOT, loadBookModel, mapToPanel } from './book-model';

// Full-screen detail view: the selected book standing up in three.js as a real
// hardcover (two cloth boards + spine wrapped around a recessed page block),
// tilting with the pointer and spinning on drag, next to its title / note /
// links. Closes on ×, Esc or backdrop.

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const riseIn = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StyledOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  overflow-y: auto;
  background: rgba(36, 17, 25, 0.96);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  animation: ${fadeIn} 0.35s var(--easing);

  .inner {
    min-height: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    align-items: center;
    gap: clamp(24px, 5vw, 72px);
    padding: 90px clamp(24px, 8vw, 140px) 60px;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
      align-items: start;
      gap: 12px;
      padding: 76px 24px 48px;
    }
  }

  .stage {
    position: relative;
    height: min(72vh, 660px);

    @media (max-width: 900px) {
      height: 54vh;
    }
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
    cursor: grab;
    touch-action: none;

    &:active {
      cursor: grabbing;
    }
  }

  .hint {
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    letter-spacing: 0.08em;
    white-space: nowrap;
    pointer-events: none;
  }

  .close {
    position: fixed;
    top: 26px;
    right: 26px;
    width: 46px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--lightest-navy);
    border-radius: 50%;
    background: transparent;
    color: var(--lightest-slate);
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
    transition: var(--transition);

    &:hover,
    &:focus-visible {
      color: var(--green);
      border-color: var(--green);
      outline: none;
    }
  }

  .info {
    max-width: 520px;
    animation: ${riseIn} 0.5s var(--easing) 0.1s both;
  }

  .label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    letter-spacing: 0.12em;
    text-transform: uppercase;

    &.is-reading:before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--green);
    }
  }

  .title {
    margin: 0 0 6px;
    color: var(--lightest-slate);
    font-family: var(--font-serif);
    font-size: clamp(30px, 4vw, 46px);
    font-weight: 500;
    line-height: 1.1;
    letter-spacing: -0.01em;
  }

  .author {
    margin: 0;
    color: var(--light-slate);
    font-family: var(--font-serif);
    font-style: italic;
    font-size: clamp(18px, 2vw, 22px);
  }

  .meta {
    margin-top: 16px;
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    letter-spacing: 0.04em;
  }

  .progress {
    margin-top: 22px;
    max-width: 320px;

    .bar {
      height: 4px;
      border-radius: 999px;
      background: var(--lightest-navy);
      overflow: hidden;
    }

    .fill {
      height: 100%;
      background: var(--green);
    }

    .pct {
      display: block;
      margin-top: 8px;
      color: var(--green);
      font-family: var(--font-mono);
      font-size: var(--fz-xxs);
    }
  }

  .note {
    margin-top: 26px;
    color: var(--light-slate);
    font-size: var(--fz-lg);
    line-height: 1.65;

    p {
      margin: 0 0 12px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .links {
    margin-top: 34px;
    border: 1px solid var(--lightest-navy);
    border-radius: var(--border-radius);
    overflow: hidden;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 18px;
    color: var(--lightest-slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
    text-decoration: none;
    transition: var(--transition);

    & + .row {
      border-top: 1px solid var(--lightest-navy);
    }

    span:last-child {
      color: var(--green);
    }

    &:hover,
    &:focus-visible {
      background: var(--green-tint);
      color: var(--green);
      outline: none;
    }
  }
`;

const BookDetail = ({ book, labels, noteHtml, blurb, site, skoobUrl, reducedMotion, onClose }) => {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const closeRef = useRef(null);

  // escape, scroll lock, focus
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const prevFocus = document.activeElement;
    if (closeRef.current) {
      closeRef.current.focus();
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (prevFocus && prevFocus.focus) {
        prevFocus.focus();
      }
    };
  }, [onClose]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import('three');
      if (disposed) {
        return;
      }

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      // Neutral keeps hue/saturation and only rolls off the highlights (ACES washes colour out)
      renderer.toneMapping = THREE.NeutralToneMapping || THREE.NoToneMapping;
      renderer.toneMappingExposure = 1;
      const maxAniso = renderer.capabilities.getMaxAnisotropy();

      const scene = new THREE.Scene();
      scene.environment = await makeEnvironment(THREE, renderer);
      if (disposed) {
        renderer.dispose();
        return;
      }
      const camera = new THREE.PerspectiveCamera(28, 1, 10, 6000);

      // lights: warm key from the upper left, cool fill from the right, rim from behind
      scene.add(new THREE.AmbientLight(0xfff6ea, 0.3));
      scene.add(new THREE.HemisphereLight(0xfff4e6, 0x2a151e, 0.3));
      const key = new THREE.DirectionalLight(0xfff1dc, 2.0);
      key.position.set(-420, 560, 900);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xdfe9ff, 0.6);
      fill.position.set(700, -120, 600);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xffffff, 1.2);
      rim.position.set(300, 300, -700);
      scene.add(rim);

      // ---- proportions (world px) ----
      const H = 560;
      const W = Math.round(H * 0.66);
      const T = Math.round((thickness(book.pages) * H) / 620) + 8;
      const B = 4; // board thickness
      const INSET = 4; // how far the page block sits inside the boards

      const clothColor = new THREE.Color(book.spine);

      // The scanned book gives us a real jacket and a real page block; if it
      // can't be fetched we still want a book, so fall back to the hand-built
      // boards it replaced.
      const model = await loadBookModel().catch(() => null);
      if (disposed) {
        renderer.dispose();
        return;
      }

      const disposables = [];
      const spineTex = new THREE.CanvasTexture(drawSpine(book, H, T, labels.status.reading));
      spineTex.colorSpace = THREE.SRGBColorSpace;
      spineTex.anisotropy = maxAniso;
      const backTex = new THREE.CanvasTexture(drawBack(book, W, H, blurb, site));
      backTex.colorSpace = THREE.SRGBColorSpace;
      backTex.anisotropy = maxAniso;
      disposables.push(spineTex, backTex);

      const pivot = new THREE.Group();
      let coverMat;

      if (model) {
        // the render's own surface detail, shared by every panel
        const finish = {
          normalMap: model.normalMap,
          aoMap: model.ormMap,
          roughnessMap: model.ormMap,
          metalness: 0,
          roughness: 1,
          envMapIntensity: 0.55,
        };
        mapToPanel(THREE, spineTex, 'spine', 'upright');
        mapToPanel(THREE, backTex, 'back', 'upright');
        coverMat = new THREE.MeshStandardMaterial({
          color: clothColor.clone().multiplyScalar(0.92),
          ...finish,
        });
        const mats = [];
        mats[SLOT.front] = coverMat;
        mats[SLOT.spine] = new THREE.MeshStandardMaterial({ map: spineTex, ...finish });
        mats[SLOT.back] = new THREE.MeshStandardMaterial({ map: backTex, ...finish });
        mats[SLOT.pages] = new THREE.MeshStandardMaterial({ map: model.baseMap, ...finish });
        disposables.push(...mats);

        // the model lies flat with its spine on -x; a quarter turn about x
        // stands it up facing the camera. Scale runs before the rotation, so it
        // is the model's own axes that map to (width, thickness, height).
        const mesh = new THREE.Mesh(model.geometry, mats);
        mesh.rotation.x = Math.PI / 2;
        mesh.scale.set(W / BOOK_EXTENT.x, T / BOOK_EXTENT.y, H / BOOK_EXTENT.z);
        pivot.add(mesh);
      } else {
        const cloth = (w, h) => clothMaterial(THREE, clothColor, w, h);
        const endpaper = new THREE.MeshStandardMaterial({ color: 0xe9e1d2, roughness: 1 });

        spineTex.center.set(0.5, 0.5);
        spineTex.rotation = -Math.PI / 2; // text runs top -> bottom on the standing spine
        const spineHeight = new THREE.CanvasTexture(
          drawSpine(book, H, T, labels.status.reading, 'height'),
        );
        spineHeight.anisotropy = maxAniso;
        spineHeight.center.set(0.5, 0.5);
        spineHeight.rotation = -Math.PI / 2;
        const spineMat = fabricMaterial(THREE, {
          map: spineTex,
          bumpMap: spineHeight,
          bumpScale: 2.2,
        });

        coverMat = fabricMaterial(THREE, {
          color: clothColor.clone().multiplyScalar(0.92),
          bumpMap: clothTexture(THREE, W, H),
          bumpScale: 1.2,
          roughness: 0.62,
          envMapIntensity: 0.55,
        });

        const backHeight = new THREE.CanvasTexture(drawBack(book, W, H, blurb, site, 'height'));
        backHeight.anisotropy = maxAniso;
        const backMat = fabricMaterial(THREE, {
          map: backTex,
          bumpMap: backHeight,
          bumpScale: 2.2,
        });

        const pagesT = T - 2 * B;
        const pagesH = H - 2 * INSET;
        const pagesW = W - B - INSET;
        // fore-edge: BoxGeometry maps u to the box's z (the book's thickness)
        const edgeMat = new THREE.MeshStandardMaterial({
          map: pagesTexture(THREE, pagesT, 'u'),
          bumpMap: pagesTexture(THREE, pagesT, 'u'),
          bumpScale: 1.2,
          roughness: 1,
        });
        const topMat = new THREE.MeshStandardMaterial({
          map: pagesTexture(THREE, pagesT),
          bumpMap: pagesTexture(THREE, pagesT),
          bumpScale: 1.2,
          roughness: 1,
        });

        // material order per box: +x, -x, +y, -y, +z, -z
        const front = new THREE.Mesh(new THREE.BoxGeometry(W, H, B), [
          cloth(B, H),
          cloth(B, H),
          cloth(W, B),
          cloth(W, B),
          coverMat,
          endpaper,
        ]);
        front.position.z = T / 2 - B / 2;

        const back = new THREE.Mesh(new THREE.BoxGeometry(W, H, B), [
          cloth(B, H),
          cloth(B, H),
          cloth(W, B),
          cloth(W, B),
          endpaper,
          backMat,
        ]);
        back.position.z = -T / 2 + B / 2;

        const spine = new THREE.Mesh(new THREE.BoxGeometry(B, H, pagesT), [
          endpaper,
          spineMat,
          cloth(B, pagesT),
          cloth(B, pagesT),
          endpaper,
          endpaper,
        ]);
        spine.position.x = -W / 2 + B / 2;

        const pages = new THREE.Mesh(new THREE.BoxGeometry(pagesW, pagesH, pagesT), [
          edgeMat,
          endpaper,
          topMat,
          topMat,
          endpaper,
          endpaper,
        ]);
        pages.position.x = -W / 2 + B + pagesW / 2;

        pivot.add(front, back, spine, pages);
        disposables.push(
          spineHeight,
          backHeight,
          ...[front, back, spine, pages].flatMap(m => [m.geometry, ...m.material]),
        );
      }

      scene.add(pivot);

      if (book.coverLarge) {
        loadCoverTexture(THREE, book.coverLarge, maxAniso, 0, tex => {
          if (disposed) {
            return;
          }
          if (model) {
            // clone so the cache's copy keeps its own (identity) transform
            const art = tex.clone();
            art.needsUpdate = true;
            disposables.push(art);
            coverMat.map = mapToPanel(THREE, art, 'front', 'upright');
          } else {
            coverMat.map = tex;
            coverMat.bumpMap = coverHeightTexture(THREE, tex.image, `${book.coverLarge}|0`);
            coverMat.bumpScale = 1.8;
          }
          coverMat.color.set(0xffffff);
          coverMat.needsUpdate = true;
        });
      }

      // ---- interaction ----
      const BASE_YAW = 0.42; // ~24°, spine towards the viewer
      const state = { yaw: 1.3, pitch: 0.12, dragYaw: 0, px: 0, py: 0, dragging: false, lastX: 0 };
      const onMove = e => {
        const r = canvas.getBoundingClientRect();
        state.px = ((e.clientX - r.left) / r.width - 0.5) * 2;
        state.py = ((e.clientY - r.top) / r.height - 0.5) * 2;
        if (state.dragging) {
          state.dragYaw += (e.clientX - state.lastX) * 0.012;
          state.lastX = e.clientX;
        }
      };
      const onDown = e => {
        state.dragging = true;
        state.lastX = e.clientX;
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch (err) {
          /* synthetic or already-released pointer */
        }
      };
      const onUp = () => {
        state.dragging = false;
      };
      const onLeave = () => {
        state.px = 0;
        state.py = 0;
      };
      canvas.addEventListener('pointermove', onMove, { passive: true });
      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointercancel', onUp);
      canvas.addEventListener('pointerleave', onLeave);

      const resize = () => {
        const w = stage.clientWidth;
        const h = stage.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // fit the book's height with some air, whatever the aspect
        const tan = Math.tan((camera.fov * Math.PI) / 360);
        const fitH = (H * 1.25) / 2 / tan;
        const fitW = (W * 1.6) / 2 / tan / camera.aspect;
        camera.position.set(0, 0, Math.max(fitH, fitW));
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(stage);

      let raf = 0;
      let t0 = 0;
      const tick = now => {
        if (disposed) {
          return;
        }
        if (!t0) {
          t0 = now;
        }
        const t = (now - t0) / 1000;
        const targetYaw = BASE_YAW + state.dragYaw + (reducedMotion ? 0 : state.px * 0.22);
        const targetPitch = reducedMotion ? 0 : -state.py * 0.14;
        const ease = state.dragging ? 0.35 : 0.08;
        state.yaw += (targetYaw - state.yaw) * ease;
        state.pitch += (targetPitch - state.pitch) * 0.08;
        pivot.rotation.set(state.pitch, state.yaw, 0);
        pivot.position.y = reducedMotion ? 0 : Math.sin(t * 1.2) * 5;
        // entrance: settle in from a slight scale-down
        pivot.scale.setScalar(Math.min(1, 0.9 + t * 0.35));
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        canvas.removeEventListener('pointermove', onMove);
        canvas.removeEventListener('pointerdown', onDown);
        canvas.removeEventListener('pointerup', onUp);
        canvas.removeEventListener('pointercancel', onUp);
        canvas.removeEventListener('pointerleave', onLeave);
        disposables.forEach(d => {
          if (d.bumpMap) {
            d.bumpMap.dispose();
          }
          if (d.dispose) {
            d.dispose();
          }
        });
        renderer.dispose();
      };
    })().catch(() => {});

    return () => {
      disposed = true;
      cleanup();
    };
  }, [book, labels.status.reading, blurb, site, reducedMotion]);

  const statusLabel = labels.status[book.status] || labels.status.read;

  return (
    <StyledOverlay
      role="dialog"
      aria-modal="true"
      aria-label={book.title}
      onClick={e => {
        if (e.target === e.currentTarget || e.target.classList.contains('inner')) {
          onClose();
        }
      }}>
      <button
        ref={closeRef}
        type="button"
        className="close"
        onClick={onClose}
        aria-label={labels.close}>
        ×
      </button>
      <div className="inner">
        <div className="stage" ref={stageRef}>
          <canvas ref={canvasRef} />
          <span className="hint">{labels.dragHint}</span>
        </div>
        <div className="info">
          <div className={`label ${book.status === 'reading' ? 'is-reading' : ''}`}>
            {statusLabel}
          </div>
          <h3 className="title">{book.title}</h3>
          <p className="author">{book.author}</p>
          {(book.year || book.pages) && (
            <div className="meta">
              {[book.year, book.pages && `${book.pages} ${labels.pages}`]
                .filter(Boolean)
                .join(' · ')}
            </div>
          )}
          {book.status === 'reading' && Number.isFinite(book.progress) && (
            <div className="progress">
              <div className="bar">
                <div className="fill" style={{ width: `${book.progress}%` }} />
              </div>
              <span className="pct">{labels.progress.replace('{n}', book.progress)}</span>
            </div>
          )}
          {noteHtml && <div className="note" dangerouslySetInnerHTML={{ __html: noteHtml }} />}
          <div className="links">
            {book.url && (
              <a className="row" href={book.url} target="_blank" rel="noopener noreferrer">
                <span>{labels.link}</span>
                <span>↗</span>
              </a>
            )}
            {skoobUrl && (
              <a className="row" href={skoobUrl} target="_blank" rel="noopener noreferrer">
                <span>{labels.cta}</span>
                <span>↗</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </StyledOverlay>
  );
};

BookDetail.propTypes = {
  book: PropTypes.object.isRequired,
  labels: PropTypes.object.isRequired,
  noteHtml: PropTypes.string,
  blurb: PropTypes.string,
  site: PropTypes.string,
  skoobUrl: PropTypes.string,
  reducedMotion: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

export default BookDetail;
