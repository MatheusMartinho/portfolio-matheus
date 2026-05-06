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
  aspect-ratio: 1284 / 2778;
  border-radius: 40px;
  overflow: hidden;
  background: #000;
  touch-action: pan-y;
  cursor: grab;

  &:active {
    cursor: grabbing;
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
  transform: translateX(${({ $offset }) => $offset});
  transition: ${({ $animate }) => ($animate ? 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)' : 'none')};
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

const Iphone = ({ image, images, alt, className }) => {
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

  return (
    <StyledWrapper className={className}>
      <StyledFrame>
        <StyledScreen
          ref={screenRef}
          className="iphone-screen"
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}>
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

Iphone.propTypes = {
  image: PropTypes.object,
  images: PropTypes.arrayOf(PropTypes.object),
  alt: PropTypes.string,
  className: PropTypes.string,
};

export default Iphone;
