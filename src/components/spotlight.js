import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const SpotlightOverlay = styled.div`
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 30;
  background: radial-gradient(
    600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(29, 78, 216, 0.15),
    /* ← AZUL IGUAL DELA */ transparent 80%
  );
  transition: opacity 0.3s;
  opacity: ${props => (props.$isActive ? 1 : 0)};
`;

const Spotlight = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {return;}

    const updateMousePosition = e => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => setIsActive(false);

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Activate spotlight when component mounts
    setIsActive(true);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isMobile]);

  if (isMobile) {return null;}

  return <SpotlightOverlay $isActive={isActive} />;
};

export default Spotlight;
