import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { GatsbyImage } from 'gatsby-plugin-image';

const StyledWrapper = styled.div`
  width: 100%;
  max-width: 260px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  @media (max-width: 1080px) {
    max-width: 230px;
  }
`;

const StyledFrame = styled.div`
  position: relative;
  width: 100%;
  padding: 10px;
  border-radius: 48px;
  background: linear-gradient(145deg, #2a2d33 0%, #1a1c20 45%, #2a2d33 100%);
  box-shadow:
    inset 0 0 0 2px #3a3d42,
    inset 0 0 0 4px #0a0b0d,
    0 30px 60px -25px rgba(0, 0, 0, 0.85),
    0 18px 30px -15px rgba(2, 12, 27, 0.7);

  &:before,
  &:after {
    content: '';
    position: absolute;
    background: #1a1c20;
    box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.6);
    z-index: 4;
  }

  &:before {
    top: 90px;
    left: -2.5px;
    width: 3px;
    height: 28px;
    border-radius: 2px 0 0 2px;
    box-shadow:
      0 42px 0 #1a1c20,
      0 90px 0 #1a1c20;
  }

  &:after {
    top: 110px;
    right: -2.5px;
    width: 3px;
    height: 60px;
    border-radius: 0 2px 2px 0;
  }
`;

const StyledScreen = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1206 / 2622;
  border-radius: 40px;
  overflow: hidden;
  background: #000;
  touch-action: pan-y;
  cursor: grab;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  &:active {
    cursor: grabbing;
  }

  &:focus-visible {
    outline: 2px solid var(--green);
    outline-offset: 4px;
  }

  &:before {
    content: '';
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    width: 90px;
    height: 26px;
    border-radius: 18px;
    background: #000;
    z-index: 3;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.04);
  }
`;

const SlidesTrack = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  will-change: transform;
`;

const Slide = styled.div`
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  background: #000;

  .gatsby-image-wrapper {
    width: 100% !important;
    height: 100% !important;
    display: block;
    pointer-events: none;
  }

  .gatsby-image-wrapper img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    -webkit-user-drag: none;
  }
`;

const Dots = styled.div`
  display: flex;
  gap: 6px;
`;

const Dot = styled.button`
  appearance: none;
  border: none;
  padding: 0;
  width: ${({ $active }) => ($active ? '20px' : '6px')};
  height: 6px;
  border-radius: 3px;
  background: ${({ $active }) => ($active ? 'var(--green)' : 'var(--lightest-navy)')};
  cursor: pointer;
  transition: width 0.3s ease, background 0.3s ease;

  &:focus-visible {
    outline: 2px solid var(--green);
    outline-offset: 2px;
  }
`;

/* iOS-style spring-out curve */
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
/* flick faster than this (px/ms) always turns the page */
const FLICK_VELOCITY = 0.35;
/* otherwise the drag needs to cross this fraction of the screen */
const DISTANCE_THRESHOLD = 0.35;

/* iOS rubber-band: resistance grows the further past the edge you pull */
const rubber = (overflow, width) => {
  const c = 0.55;
  return (1 - 1 / ((overflow * c) / width + 1)) * width;
};

const Iphone = ({ image, images, alt, className }) => {
  const slides = images && images.length > 0 ? images : image ? [image] : [];
  const count = slides.length;
  const [index, setIndex] = useState(0);

  const screenRef = useRef(null);
  const trackRef = useRef(null);
  const indexRef = useRef(0);
  const gestureRef = useRef(null);
  const wheelRef = useRef({ acc: 0, locked: false, timer: null });
  const hintRef = useRef({ played: false, timers: [] });

  const getWidth = useCallback(() => screenRef.current?.offsetWidth || 1, []);

  const positionFor = useCallback(i => -i * getWidth(), [getWidth]);

  const applyTransform = useCallback((px, transition) => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    track.style.transition = transition || 'none';
    track.style.transform = `translate3d(${px}px, 0, 0)`;
  }, []);

  /* live position mid-animation, so a grab can interrupt a settle */
  const readCurrentTx = useCallback(() => {
    const track = trackRef.current;
    if (!track) {
      return positionFor(indexRef.current);
    }
    const t = window.getComputedStyle(track).transform;
    if (t && t !== 'none') {
      const m2 = t.match(/matrix\(([^)]+)\)/);
      if (m2) {
        return parseFloat(m2[1].split(',')[4]);
      }
      const m3 = t.match(/matrix3d\(([^)]+)\)/);
      if (m3) {
        return parseFloat(m3[1].split(',')[12]);
      }
    }
    return positionFor(indexRef.current);
  }, [positionFor]);

  const cancelHint = useCallback(() => {
    const hint = hintRef.current;
    hint.played = true;
    hint.timers.forEach(clearTimeout);
    hint.timers = [];
  }, []);

  const settleTo = useCallback(
    (next, velocity = 0) => {
      const width = getWidth();
      const clamped = Math.max(0, Math.min(count - 1, next));
      const target = -clamped * width;
      const distance = Math.abs(target - readCurrentTx());
      const speed = Math.abs(velocity);
      /* faster flick = snappier settle, just like UIScrollView */
      let duration = speed > 0.1 ? distance / speed : 320;
      duration = Math.max(200, Math.min(440, duration));
      applyTransform(target, `transform ${Math.round(duration)}ms ${EASE}`);
      indexRef.current = clamped;
      setIndex(clamped);
    },
    [count, getWidth, readCurrentTx, applyTransform],
  );

  const onPointerDown = e => {
    if (count <= 1) {
      return;
    }
    if (e.pointerType === 'mouse' && e.button !== 0) {
      return;
    }
    if (e.pointerType === 'mouse') {
      e.preventDefault();
    }
    cancelHint();
    const tx = readCurrentTx();
    applyTransform(tx, 'none');
    gestureRef.current = {
      pointerId: e.pointerId,
      startTx: tx,
      startX: e.clientX,
      lastX: e.clientX,
      lastT: e.timeStamp,
      velocity: 0,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = e => {
    const g = gestureRef.current;
    if (!g || e.pointerId !== g.pointerId) {
      return;
    }
    const dt = e.timeStamp - g.lastT;
    if (dt > 0) {
      const instant = (e.clientX - g.lastX) / dt;
      g.velocity = 0.8 * instant + 0.2 * g.velocity;
    }
    g.lastX = e.clientX;
    g.lastT = e.timeStamp;

    const width = getWidth();
    const min = -(count - 1) * width;
    const max = 0;
    let pos = g.startTx + (e.clientX - g.startX);
    if (pos > max) {
      pos = max + rubber(pos - max, width);
    } else if (pos < min) {
      pos = min - rubber(min - pos, width);
    }
    applyTransform(pos, 'none');
  };

  const endGesture = e => {
    const g = gestureRef.current;
    if (!g || e.pointerId !== g.pointerId) {
      return;
    }
    gestureRef.current = null;

    const width = getWidth();
    const delta = g.lastX - g.startX;
    const v = g.velocity;
    let next = indexRef.current;
    if (v <= -FLICK_VELOCITY || delta <= -width * DISTANCE_THRESHOLD) {
      next += 1;
    } else if (v >= FLICK_VELOCITY || delta >= width * DISTANCE_THRESHOLD) {
      next -= 1;
    }
    settleTo(next, v);
  };

  const onKeyDown = e => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      cancelHint();
      settleTo(indexRef.current + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      cancelHint();
      settleTo(indexRef.current - 1);
    }
  };

  /* two-finger trackpad swipe over the phone = paging, like the real device */
  useEffect(() => {
    const el = screenRef.current;
    if (!el || count <= 1) {
      return undefined;
    }
    const onWheel = e => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) {
        return; /* vertical scroll passes through untouched */
      }
      e.preventDefault(); /* keeps macOS back-swipe from hijacking */
      const w = wheelRef.current;
      clearTimeout(w.timer);
      w.timer = setTimeout(() => {
        w.acc = 0;
        w.locked = false;
      }, 180);
      if (w.locked) {
        return;
      }
      w.acc += e.deltaX;
      if (Math.abs(w.acc) > 70) {
        w.locked = true;
        cancelHint();
        settleTo(indexRef.current + (w.acc > 0 ? 1 : -1), 0.6);
        w.acc = 0;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      clearTimeout(wheelRef.current.timer);
    };
  }, [count, settleTo, cancelHint]);

  /* keep the current slide framed when the layout resizes */
  useEffect(() => {
    const onResize = () => applyTransform(positionFor(indexRef.current), 'none');
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [applyTransform, positionFor]);

  /* one-time peek when the phone scrolls into view, hinting it swipes */
  useEffect(() => {
    if (count <= 1 || typeof window === 'undefined') {
      return undefined;
    }
    if (
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }
    const el = screenRef.current;
    if (!el) {
      return undefined;
    }
    const hint = hintRef.current;
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting || hint.played) {
            return;
          }
          hint.played = true;
          io.disconnect();
          hint.timers.push(
            setTimeout(() => {
              if (gestureRef.current) {
                return;
              }
              applyTransform(positionFor(indexRef.current) - 22, `transform 450ms ${EASE}`);
              hint.timers.push(
                setTimeout(() => {
                  if (gestureRef.current) {
                    return;
                  }
                  applyTransform(positionFor(indexRef.current), `transform 600ms ${EASE}`);
                }, 470),
              );
            }, 900),
          );
        });
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      hint.timers.forEach(clearTimeout);
    };
  }, [count, applyTransform, positionFor]);

  return (
    <StyledWrapper className={className}>
      <StyledFrame>
        <StyledScreen
          ref={screenRef}
          className="iphone-screen"
          role="group"
          aria-roledescription="carrossel"
          aria-label={`${alt} — tela ${index + 1} de ${count}`}
          tabIndex={count > 1 ? 0 : -1}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endGesture}
          onPointerCancel={endGesture}
          onKeyDown={onKeyDown}>
          <SlidesTrack ref={trackRef}>
            {slides.map((img, i) => (
              <Slide key={i} aria-hidden={i !== index}>
                <GatsbyImage
                  image={img}
                  alt={`${alt} screen ${i + 1}`}
                  loading="eager"
                  draggable={false}
                />
              </Slide>
            ))}
          </SlidesTrack>
        </StyledScreen>
      </StyledFrame>

      {count > 1 && (
        <Dots>
          {slides.map((_, i) => (
            <Dot
              key={i}
              $active={i === index}
              onClick={() => {
                cancelHint();
                settleTo(i);
              }}
              aria-label={`Ver tela ${i + 1}`}
            />
          ))}
        </Dots>
      )}
    </StyledWrapper>
  );
};

Iphone.propTypes = {
  image: PropTypes.object,
  images: PropTypes.arrayOf(PropTypes.object),
  alt: PropTypes.string,
  className: PropTypes.string,
};

export default Iphone;
