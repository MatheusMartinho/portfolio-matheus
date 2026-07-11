import React, { useState, useEffect } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { StaticImage } from 'gatsby-plugin-image';
import styled from 'styled-components';
import { navDelay, loaderDelay } from '@utils';
import { usePrefersReducedMotion, useTilt } from '@hooks';
import { useLang } from '@i18n/LanguageContext';
import EncryptedText from '@components/ui/encrypted-text';

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`;

const StyledHeroSection = styled.section`
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  align-items: center;
  gap: 60px;
  min-height: 100vh;
  padding: calc(var(--nav-height) + 10px) 0 30px;

  .big-heading {
    font-size: clamp(36px, 5.5vw, 64px);
    line-height: 1.02;
    letter-spacing: -0.02em;
  }

  @media (max-width: 1080px) {
    gap: 40px;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    align-content: center;
    justify-items: start;
    gap: 50px;
    height: auto;
    min-height: auto;
    padding: var(--nav-height) 0 60px;

    .big-heading {
      font-size: clamp(38px, 7.5vw, 68px);
    }
  }

  @media (max-height: 700px) and (min-width: 700px), (max-width: 360px) {
    height: auto;
    padding-top: var(--nav-height);
  }

  h1 {
    margin: 0 0 24px 4px;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: clamp(var(--fz-sm), 5vw, var(--fz-md));
    font-weight: 400;

    @media (max-width: 480px) {
      margin: 0 0 20px 2px;
    }
  }

  h3 {
    display: flex;
    align-items: baseline;
    gap: 18px;
    margin-top: 12px;
    color: var(--slate);
    font-weight: 600;
    line-height: 1.05;
    letter-spacing: -0.02em;

    /* brutalist square marker */
    &:before {
      content: '';
      flex-shrink: 0;
      width: 0.42em;
      height: 0.42em;
      background: var(--green);
    }

    @media (max-width: 480px) {
      font-size: clamp(24px, 6vw, 32px);
      gap: 12px;
    }
  }

  .hero-name {
    display: inline-block;
    max-width: 100%;
    text-transform: uppercase;
    word-break: normal;
    overflow-wrap: break-word;

    @media (max-width: 540px) {
      font-size: clamp(30px, 9vw, 48px);
      line-height: 1.06;
    }
  }

  .hero-name__surname {
    display: inline;

    @media (max-width: 540px) {
      display: block;
      margin-top: 4px;
    }
  }

  .hero-name__encrypted {
    color: var(--slate);
  }

  .hero-name__revealed {
    color: var(--lightest-slate);
  }

  p {
    margin: 24px 0 0;
    max-width: 540px;
  }
`;

const StyledHeroContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
`;

const StyledStats = styled.div`
  display: flex;
  align-items: stretch;
  margin-top: 30px;
  border-top: 1px solid var(--lightest-navy);
  border-bottom: 1px solid var(--lightest-navy);

  .stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 16px 28px 14px 0;

    & + .stat {
      padding-left: 28px;
      border-left: 1px solid var(--lightest-navy);
    }
  }

  .stat-value {
    color: var(--lightest-slate);
    font-family: var(--font-mono);
    font-size: clamp(20px, 2.4vw, 26px);
    font-weight: 600;
    line-height: 1;
  }

  .stat-label {
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  @media (max-width: 480px) {
    .stat {
      padding-right: 16px;

      & + .stat {
        padding-left: 16px;
      }
    }

    .stat-label {
      white-space: normal;
    }
  }
`;

const StyledCtaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 22px;
  margin-top: 34px;
  flex-wrap: wrap;

  .hero-cta {
    ${({ theme }) => theme.mixins.bigButton};
    display: inline-flex;
    align-items: center;
    gap: 12px;

    .arrow {
      font-size: 1.1em;
      line-height: 0;
      transition: var(--transition);
    }

    &:hover .arrow,
    &:focus-visible .arrow {
      transform: translate(2px, -2px);
    }
  }

  .cta-note {
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    letter-spacing: 0.04em;
  }
`;

const StyledStrip = styled.div`
  grid-column: 1 / -1;
  align-self: end;
  width: 100%;
  margin-top: 30px;
  padding: 13px 0;
  border-top: 1px solid var(--lightest-navy);
  border-bottom: 1px solid var(--lightest-navy);
  overflow: hidden;

  .strip-track {
    display: flex;
    gap: 0;
    width: max-content;

    @media (prefers-reduced-motion: no-preference) {
      animation: stripScroll 42s linear infinite;
    }
  }

  &:hover .strip-track {
    animation-play-state: paused;
  }

  @keyframes stripScroll {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }

  .strip-item {
    display: inline-flex;
    align-items: center;
    gap: 28px;
    padding-right: 28px;
    color: var(--light-slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    font-weight: 600;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    white-space: nowrap;

    &:after {
      content: '✦';
      color: var(--green);
      letter-spacing: 0;
    }
  }

  @media (max-width: 900px) {
    margin-top: 0;
  }
`;

const StyledPortrait = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 360px;
  justify-self: end;

  @media (max-width: 900px) {
    justify-self: start;
    max-width: 280px;
    order: -1;
  }

  &:before {
    content: '';
    position: absolute;
    inset: -14px -14px 14px 14px;
    border: 2px solid var(--green);
    border-radius: 4px;
    z-index: 0;
    transition: var(--transition);
  }

  .portrait-frame {
    position: relative;
    z-index: 1;
    width: 100%;
    border-radius: 4px;
    overflow: hidden;
    transform: rotate(-1.5deg) perspective(900px) rotateX(var(--tilt-x, 0deg))
      rotateY(var(--tilt-y, 0deg));
    transition: transform 0.18s ease-out;
    box-shadow: 0 25px 40px -25px rgba(2, 12, 27, 0.9);
    will-change: transform;

    &:after {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--navy);
      mix-blend-mode: screen;
      opacity: 0.35;
      transition: var(--transition);
      pointer-events: none;
    }
  }

  .portrait-grain {
    position: absolute;
    inset: -50%;
    z-index: 2;
    background-image: ${GRAIN_SVG};
    opacity: 0.16;
    mix-blend-mode: overlay;
    pointer-events: none;

    @media (prefers-reduced-motion: no-preference) {
      animation: heroGrain 0.9s steps(4) infinite;
    }
  }

  @keyframes heroGrain {
    0% {
      transform: translate(0, 0);
    }
    25% {
      transform: translate(-4%, 3%);
    }
    50% {
      transform: translate(3%, -2%);
    }
    75% {
      transform: translate(-2%, -4%);
    }
    100% {
      transform: translate(0, 0);
    }
  }

  &:hover {
    &:before {
      inset: -10px -10px 10px 10px;
    }

    .portrait-frame {
      &:after {
        opacity: 0;
      }
    }
  }
`;

const Hero = () => {
  const [isMounted, setIsMounted] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { t } = useLang();
  const tiltRef = useTilt({ max: 5, disabled: prefersReducedMotion });

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const timeout = setTimeout(() => setIsMounted(true), navDelay);
    return () => clearTimeout(timeout);
  }, []);

  const one = <h1>{t.hero.greeting}</h1>;
  const two = (
    <h2 className="big-heading hero-name">
      <EncryptedText
        text="Matheus Moura"
        encryptedClassName="hero-name__encrypted"
        revealedClassName="hero-name__revealed"
        revealDelayMs={50}
        disabled={prefersReducedMotion}
      />
      <span className="hero-name__surname">
        {' '}
        <EncryptedText
          text="Martinho."
          encryptedClassName="hero-name__encrypted"
          revealedClassName="hero-name__revealed"
          revealDelayMs={50}
          disabled={prefersReducedMotion}
        />
      </span>
    </h2>
  );
  const three = <h3 className="big-heading">{t.hero.tagline}</h3>;
  const four = (
    <>
      <p>
        {t.hero.paragraphPart1} <a href="#projects">The Pitch</a>
        {t.hero.paragraphPart2}{' '}
        <a href="https://github.com/MatheusMartinho/cinelog" target="_blank" rel="noreferrer">
          CINELOG
        </a>
        {t.hero.paragraphPart3}
      </p>
    </>
  );
  const five = (
    <StyledStats>
      {t.hero.stats.map(stat => (
        <div className="stat" key={stat.label}>
          <span className="stat-value">{stat.value}</span>
          <span className="stat-label">{stat.label}</span>
        </div>
      ))}
    </StyledStats>
  );
  const six = (
    <StyledCtaRow>
      <a className="hero-cta" href="mailto:matmouramartinho@gmail.com">
        {t.hero.cta}
        <span className="arrow" aria-hidden="true">
          ↗
        </span>
      </a>
      <span className="cta-note">{t.hero.ctaNote}</span>
    </StyledCtaRow>
  );

  const items = [one, two, three, four, five, six];

  const stripItems = [...t.hero.strip, ...t.hero.strip];

  const portrait = (
    <StyledPortrait>
      <div className="portrait-frame" ref={tiltRef}>
        <StaticImage
          src="../../images/hero-portrait.png"
          alt="Matheus Moura - Portfolio"
          placeholder="blurred"
          quality={95}
          loading="eager"
        />
        <div className="portrait-grain" aria-hidden="true" />
      </div>
    </StyledPortrait>
  );

  return (
    <StyledHeroSection>
      <StyledHeroContent>
        {prefersReducedMotion ? (
          <>
            {items.map((item, i) => (
              <div key={i}>{item}</div>
            ))}
          </>
        ) : (
          <TransitionGroup component={null}>
            {isMounted &&
              items.map((item, i) => (
                <CSSTransition key={i} classNames="fadeup" timeout={loaderDelay}>
                  <div style={{ transitionDelay: `${i + 1}00ms` }}>{item}</div>
                </CSSTransition>
              ))}
          </TransitionGroup>
        )}
      </StyledHeroContent>

      {prefersReducedMotion ? (
        portrait
      ) : (
        <TransitionGroup component={null}>
          {isMounted && (
            <CSSTransition classNames="fadeup" timeout={loaderDelay}>
              <div style={{ transitionDelay: '300ms' }}>{portrait}</div>
            </CSSTransition>
          )}
        </TransitionGroup>
      )}

      <StyledStrip aria-hidden="true">
        <div className="strip-track">
          {stripItems.map((item, i) => (
            <span className="strip-item" key={i}>
              {item}
            </span>
          ))}
        </div>
      </StyledStrip>
    </StyledHeroSection>
  );
};

export default Hero;
