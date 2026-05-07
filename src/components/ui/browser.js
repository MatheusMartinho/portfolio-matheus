import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { GatsbyImage } from 'gatsby-plugin-image';

const StyledWrapper = styled.div`
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const StyledFrame = styled.div`
  position: relative;
  width: 100%;
  border-radius: 10px;
  background: #1a1c20;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 30px 60px -25px rgba(0, 0, 0, 0.85),
    0 18px 30px -15px rgba(2, 12, 27, 0.7);
  overflow: hidden;
`;

const StyledTopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: linear-gradient(180deg, #2a2d33 0%, #1f2126 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;

    &.red {
      background: #ff5f57;
    }
    &.yellow {
      background: #febc2e;
    }
    &.green {
      background: #28c840;
    }
  }

  .url-bar {
    flex: 1;
    margin-left: 8px;
    padding: 4px 10px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.5);
    font-family: var(--font-mono);
    font-size: 11px;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const StyledScreen = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  touch-action: pan-y;
  cursor: grab;
  overflow: hidden;

  &:active {
    cursor: grabbing;
  }
`;

const SlidesTrack = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  transform: translateX(${({ $offset }) => $offset});
  transition: ${({ $animate }) =>
    $animate ? 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)' : 'none'};
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
  }

  .gatsby-image-wrapper img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
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

const SWIPE_THRESHOLD = 50;

const Browser = ({ image, images, alt, url, className }) => {
  const slides = images && images.length > 0 ? images : image ? [image] : [];
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragDelta, setDragDelta] = useState(0);
  const startXRef = useRef(0);
  const widthRef = useRef(0);
  const screenRef = useRef(null);

  const clamp = useCallback(
    next => Math.max(0, Math.min(slides.length - 1, next)),
    [slides.length],
  );

  const beginDrag = useCallback(
    clientX => {
      if (slides.length <= 1) return;
      startXRef.current = clientX;
      widthRef.current = screenRef.current?.offsetWidth || 1;
      setDragging(true);
      setDragDelta(0);
    },
    [slides.length],
  );

  useEffect(() => {
    if (!dragging) return undefined;

    const handleMove = clientX => {
      setDragDelta(clientX - startXRef.current);
    };
    const handleEnd = () => {
      setDragDelta(currentDelta => {
        if (Math.abs(currentDelta) > SWIPE_THRESHOLD) {
          setIndex(prev => clamp(prev + (currentDelta < 0 ? 1 : -1)));
        }
        return 0;
      });
      setDragging(false);
    };

    const onMouseMove = e => handleMove(e.clientX);
    const onTouchMove = e => handleMove(e.touches[0].clientX);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [dragging, clamp]);

  const onMouseDown = e => {
    if (e.button !== 0) return;
    e.preventDefault();
    beginDrag(e.clientX);
  };

  const onTouchStart = e => {
    beginDrag(e.touches[0].clientX);
  };

  const baseOffset = -index * 100;
  const dragOffset = widthRef.current ? (dragDelta / widthRef.current) * 100 : 0;
  const offset = `calc(${baseOffset}% + ${dragOffset}%)`;

  const displayUrl =
    url || (typeof window !== 'undefined' ? window.location.host : 'preview');

  return (
    <StyledWrapper className={className}>
      <StyledFrame>
        <StyledTopBar>
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
          <span className="url-bar">{displayUrl}</span>
        </StyledTopBar>
        <StyledScreen ref={screenRef} onMouseDown={onMouseDown} onTouchStart={onTouchStart}>
          <SlidesTrack $offset={offset} $animate={!dragging}>
            {slides.map((img, i) => (
              <Slide key={i}>
                <GatsbyImage image={img} alt={`${alt} screen ${i + 1}`} draggable={false} />
              </Slide>
            ))}
          </SlidesTrack>
        </StyledScreen>
      </StyledFrame>

      {slides.length > 1 && (
        <Dots>
          {slides.map((_, i) => (
            <Dot
              key={i}
              $active={i === index}
              onClick={() => setIndex(i)}
              aria-label={`Ver tela ${i + 1}`}
            />
          ))}
        </Dots>
      )}
    </StyledWrapper>
  );
};

Browser.propTypes = {
  image: PropTypes.object,
  images: PropTypes.arrayOf(PropTypes.object),
  alt: PropTypes.string,
  url: PropTypes.string,
  className: PropTypes.string,
};

export default Browser;
