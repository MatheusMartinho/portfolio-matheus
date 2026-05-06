import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import StickerLogo from '@images/sticker-logo.png';

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
`;

const StyledLoader = styled.div`
  ${({ theme }) => theme.mixins.flexCenter};
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: var(--navy);
  z-index: 99;
  opacity: ${props => (props.isLeaving ? 0 : 1)};
  transition: opacity 0.4s ease;
  pointer-events: ${props => (props.isLeaving ? 'none' : 'auto')};

  .logo-wrapper {
    width: 140px;
    max-width: 140px;
    transition: opacity 0.5s ease, transform 0.6s ease;
    opacity: ${props => (props.isMounted ? 1 : 0)};
    transform: ${props => (props.isMounted ? 'scale(1)' : 'scale(0.85)')};
    filter: drop-shadow(0 8px 22px rgba(132, 204, 22, 0.4));

    img {
      display: block;
      width: 100%;
      height: auto;
      animation: ${pulse} 1.6s ease-in-out infinite;
      user-select: none;
    }
  }
`;

const Loader = ({ finishLoading }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setIsMounted(true), 50);
    const t2 = setTimeout(() => setIsLeaving(true), 1800);
    const t3 = setTimeout(() => finishLoading(), 2300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <StyledLoader className="loader" isMounted={isMounted} isLeaving={isLeaving}>
      <Helmet bodyAttributes={{ class: `hidden` }} />

      <div className="logo-wrapper">
        <img src={StickerLogo} alt="Matheus logo" />
      </div>
    </StyledLoader>
  );
};

Loader.propTypes = {
  finishLoading: PropTypes.func.isRequired,
};

export default Loader;
