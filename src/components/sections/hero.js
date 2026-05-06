import React, { useState, useEffect } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { StaticImage } from 'gatsby-plugin-image';
import styled from 'styled-components';
import { navDelay, loaderDelay } from '@utils';
import { usePrefersReducedMotion } from '@hooks';
import EncryptedText from '@components/ui/encrypted-text';

const StyledHeroSection = styled.section`
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  align-items: center;
  gap: 60px;
  min-height: 100vh;
  padding: 0;

  .big-heading {
    font-size: clamp(36px, 5.5vw, 64px);
    line-height: 1.05;
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
      font-size: clamp(40px, 8vw, 72px);
    }
  }

  @media (max-height: 700px) and (min-width: 700px), (max-width: 360px) {
    height: auto;
    padding-top: var(--nav-height);
  }

  h1 {
    margin: 0 0 30px 4px;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: clamp(var(--fz-sm), 5vw, var(--fz-md));
    font-weight: 400;

    @media (max-width: 480px) {
      margin: 0 0 20px 2px;
    }
  }

  h3 {
    margin-top: 8px;
    color: var(--slate);
    line-height: 1.1;

    @media (max-width: 480px) {
      font-size: clamp(24px, 6vw, 32px);
    }
  }

  .hero-name {
    display: inline-block;
    max-width: 100%;
    word-break: normal;
    overflow-wrap: break-word;

    @media (max-width: 540px) {
      font-size: clamp(32px, 10vw, 52px);
      line-height: 1.1;
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
    margin: 20px 0 0;
    max-width: 540px;
  }

  .email-link {
    ${({ theme }) => theme.mixins.bigButton};
    margin-top: 50px;
  }
`;

const StyledHeroContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
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
    transform: rotate(-1.5deg);
    transition: var(--transition);
    box-shadow: 0 25px 40px -25px rgba(2, 12, 27, 0.9);

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

  &:hover {
    &:before {
      inset: -10px -10px 10px 10px;
    }

    .portrait-frame {
      transform: rotate(0deg) translate(-4px, -4px);

      &:after {
        opacity: 0;
      }
    }
  }
`;

const Hero = () => {
  const [isMounted, setIsMounted] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const timeout = setTimeout(() => setIsMounted(true), navDelay);
    return () => clearTimeout(timeout);
  }, []);

  const one = <h1>Oi, meu nome é</h1>;
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
  const three = <h3 className="big-heading">e eu construo experiências digitais.</h3>;
  const four = (
    <>
      <p>
        Sou um desenvolvedor especializado em construir experiências digitais que resolvem problemas
        reais. Atualmente, estou focado em desenvolver produtos escaláveis usando Next.js,
        TypeScript e IA como parceira de desenvolvimento. Estou trabalhando principalmente no{' '}
        <a href="#projects">The Pitch</a> e no{' '}
        <a href="https://github.com/MatheusMartinho/cinelog" target="_blank" rel="noreferrer">
          CINELOG
        </a>
        .
      </p>
    </>
  );
  const five = (
    <a className="email-link" href="mailto:matmouramartinho@gmail.com">
      Café Virtual?
    </a>
  );

  const items = [one, two, three, four, five];

  const portrait = (
    <StyledPortrait>
      <div className="portrait-frame">
        <StaticImage
          src="../../images/hero-portrait.png"
          alt="Matheus Moura - Portfolio"
          placeholder="blurred"
          quality={95}
          loading="eager"
        />
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
    </StyledHeroSection>
  );
};

export default Hero;
