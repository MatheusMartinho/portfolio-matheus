import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { socialMedia } from '@config';
import { Side } from '@components';
import { Icon } from '@components/icons';
import StripTop from '@images/side-strip-top-left.png';
import StripBody from '@images/side-strip-body-left.png';

// The left rail is a vertical cut of the red strip artwork (mirrored, since it
// now hugs the left edge): the photographic block sits at the top and the red
// band runs down behind the social icons, repeating one tile to any height.
const STRIP_W = 62;
const RAIL_W = 40;

const StyledStrip = styled.div`
  width: ${STRIP_W}px;
  margin-left: ${(RAIL_W - STRIP_W) / 2}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  filter: drop-shadow(0 18px 26px rgba(20, 8, 12, 0.55));

  /* on short viewports the artwork would crowd the page, so drop it */
  @media (max-height: 620px) {
    .strip-top {
      display: none;
    }
  }

  .strip-top {
    display: block;
    width: 100%;
    height: auto;
    user-select: none;
  }

  ul {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0;
    padding: 10px 0 24px;
    list-style: none;
    background: url(${StripBody}) repeat-y center top;
    background-size: 100% auto;
  }

  li a {
    display: block;
    padding: 9px;
    color: var(--white);
    filter: drop-shadow(0 1px 2px rgba(90, 12, 0, 0.5));
    transition: var(--transition);

    &:hover,
    &:focus-visible {
      color: var(--green);
      transform: translateY(-3px);
    }

    svg {
      width: 19px;
      height: 19px;
    }
  }
`;

const Social = ({ isHome }) => (
  <Side isHome={isHome} orientation="left">
    <StyledStrip>
      <img className="strip-top" src={StripTop} alt="Arte: um par de olhos" />
      <ul>
        {socialMedia &&
          socialMedia.map(({ url, name }, i) => (
            <li key={i}>
              <a href={url} aria-label={name} target="_blank" rel="noreferrer">
                <Icon name={name} />
              </a>
            </li>
          ))}
      </ul>
    </StyledStrip>
  </Side>
);

Social.propTypes = {
  isHome: PropTypes.bool,
};

export default Social;
