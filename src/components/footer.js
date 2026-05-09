import React from 'react';
import styled from 'styled-components';
import { Icon } from '@components/icons';
import { socialMedia } from '@config';
import PortfolioV1 from '@images/portfolio-v1.png';
import PortfolioV2 from '@images/portfolio-v2.png';

const StyledFooter = styled.footer`
  ${({ theme }) => theme.mixins.flexCenter};
  flex-direction: column;
  height: auto;
  min-height: 70px;
  padding: 15px;
  text-align: center;
  position: relative;
`;

const StyledSocialLinks = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
    width: 100%;
    max-width: 270px;
    margin: 0 auto 10px;
    color: var(--light-slate);
  }

  ul {
    ${({ theme }) => theme.mixins.flexBetween};
    padding: 0;
    margin: 0;
    list-style: none;

    a {
      padding: 10px;
      svg {
        width: 20px;
        height: 20px;
      }
    }
  }
`;

const StyledCredit = styled.div`
  color: var(--light-slate);
  font-family: var(--font-mono);
  font-size: var(--fz-xxs);
  line-height: 1;

  a {
    padding: 10px;
  }

  .github-stats {
    margin-top: 10px;

    & > span {
      display: inline-flex;
      align-items: center;
      margin: 0 7px;
    }
    svg {
      display: inline-block;
      margin-right: 5px;
      width: 14px;
      height: 14px;
    }
  }
`;

const StyledVersions = styled.div`
  position: absolute;
  right: 110px;
  bottom: 24px;
  display: flex;
  align-items: flex-end;
  gap: 14px;
  pointer-events: none;

  @media (max-width: 1080px) {
    right: 80px;
  }

  a {
    pointer-events: auto;
    line-height: 0;
    outline: none;
    -webkit-tap-highlight-color: transparent;

    &:focus-visible img {
      filter: drop-shadow(0 10px 16px rgba(0, 0, 0, 0.55))
        drop-shadow(0 0 0 2px var(--green));
    }

    &:first-child img {
      transform: rotate(-3deg);
    }

    &:last-child img {
      transform: rotate(2deg);
    }

    &:hover img,
    &:focus-visible img {
      transform: rotate(0deg) translateY(-4px);
    }
  }

  img {
    height: 260px;
    width: auto;
    transition: var(--transition);
    filter: drop-shadow(0 10px 16px rgba(0, 0, 0, 0.55));
    user-select: none;
    outline: none;
    border: none;
    background: transparent !important;
  }

  @media (max-width: 900px) {
    position: static;
    margin-top: 22px;

    img {
      height: 120px;
    }
  }

  @media (max-width: 480px) {
    img {
      height: 90px;
    }
  }
`;

const Footer = () => {
  return (
    <StyledFooter>
      <StyledSocialLinks>
        <ul>
          {socialMedia &&
            socialMedia.map(({ name, url }, i) => (
              <li key={i}>
                <a href={url} aria-label={name}>
                  <Icon name={name} />
                </a>
              </li>
            ))}
        </ul>
      </StyledSocialLinks>

      <StyledCredit tabindex="-1">
        <a href="https://github.com/MatheusMartinho/portfolio-matheus">
          <div>Designed & Built by Matheus Moura Martinho</div>
        </a>
      </StyledCredit>

      <StyledVersions>
        <a
          href="https://matheusmartinho.github.io/portfolio/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Portfolio v1 (2020)">
          <img src={PortfolioV1} alt="Portfolio v1" />
        </a>
        <a
          href="https://photography-web-nine.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Portfolio v2 (Photography)">
          <img src={PortfolioV2} alt="Portfolio v2" />
        </a>
      </StyledVersions>
    </StyledFooter>
  );
};

export default Footer;
