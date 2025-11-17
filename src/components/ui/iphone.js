import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { GatsbyImage } from 'gatsby-plugin-image';

const StyledWrapper = styled.div`
  width: 100%;
  max-width: 280px;
  margin: 0 auto;

  @media (max-width: 1080px) {
    max-width: 240px;
  }
`;

const StyledFrame = styled.div`
  position: relative;
  width: 100%;
  padding: 14px 10px 22px;
  border-radius: 34px;
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.6));
  border: 2px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 25px 35px -20px rgba(2, 12, 27, 0.75);
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 12px;
    border-radius: 0 0 12px 12px;
    background: rgba(15, 23, 42, 0.95);
    z-index: 3;
  }
`;

const StyledScreen = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 19.5;
  border-radius: 26px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.9);

  .gatsby-image-wrapper,
  .screen-image {
    width: 100% !important;
    height: 100% !important;
    display: block;
  }

  .gatsby-image-wrapper img,
  .screen-image img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover;
  }
`;

const Iphone = ({ image, alt, className }) => (
  <StyledWrapper className={className}>
    <StyledFrame>
      <StyledScreen className="iphone-screen">
        {image ? <GatsbyImage image={image} alt={alt} className="screen-image" /> : null}
      </StyledScreen>
    </StyledFrame>
  </StyledWrapper>
);

Iphone.propTypes = {
  image: PropTypes.object,
  alt: PropTypes.string,
  className: PropTypes.string,
};

export default Iphone;
