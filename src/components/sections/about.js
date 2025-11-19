import React, { useEffect, useMemo, useRef } from 'react';
import { StaticImage } from 'gatsby-plugin-image';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';
import IconCloud from '@components/icon-cloud';

const StyledAboutSection = styled.section`
  max-width: 900px;

  .inner {
    display: grid;
    grid-template-columns: 3fr 2fr;
    grid-gap: 50px;

    @media (max-width: 768px) {
      display: block;
    }
  }
`;

const StyledText = styled.div`
  overflow: hidden;
  min-width: 0;
`;

const StyledIconCloudWrapper = styled.div`
  margin-top: -60px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 320px;
  aspect-ratio: 1/1;
  margin-left: 185px;
  margin-right: auto;

  @media (max-width: 768px) {
    margin: 30px auto 0;
  }

  @media (max-width: 480px) {
    max-width: 260px;
  }

  canvas {
    width: 100% !important;
    height: auto !important;
    max-width: 100%;
  }
`;

const StyledPic = styled.div`
  position: relative;
  max-width: 300px;

  @media (max-width: 768px) {
    margin: 50px auto 0;
    width: 70%;
  }

  .wrapper {
    ${({ theme }) => theme.mixins.boxShadow};
    display: block;
    position: relative;
    width: 100%;
    border-radius: var(--border-radius);
    background-color: var(--green);

    &:hover,
    &:focus {
      outline: 0;
      transform: translate(-4px, -4px);

      &:after {
        transform: translate(8px, 8px);
      }

      .img {
        filter: none;
        mix-blend-mode: normal;
      }
    }

    .img {
      position: relative;
      border-radius: var(--border-radius);
      mix-blend-mode: multiply;
      filter: grayscale(100%) contrast(1);
      transition: var(--transition);
    }

    &:before,
    &:after {
      content: '';
      display: block;
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: var(--border-radius);
      transition: var(--transition);
    }

    &:before {
      top: 0;
      left: 0;
      background-color: var(--navy);
      mix-blend-mode: screen;
    }

    &:after {
      border: 2px solid var(--green);
      top: 14px;
      left: 14px;
      z-index: -1;
    }
  }
`;

const About = () => {
  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealContainer.current, srConfig());
  }, []);

  // 🎨 Skills com SVG logos
  const iconSlugs = useMemo(
    () => [
      // Linguagens
      'typescript',
      'javascript',
      'python',

      // Frontend
      'react',
      'nextdotjs',
      'html5',
      'Vite',
      'tailwindcss',

      // Mobile
      'flutter',
      'dart',
      'android',
      'Jupyter',

      // Backend
      'nodedotjs',
      'express',
      'supabase',
      'postgresql',
      'stripe',

      // Cloud/Deploy
      'vercel',
      'Angular',
      'firebase',
      'cloudflare',

      // Database
      'postgresql',
      'css',

      // Tools
      'git',
      'github',
      'Claude',
      'figma',
      'Insomnia',
      'Expo',

      // Testing
      'Xcode',
      'Windsurf',
    ],
    [],
  );

  return (
    <StyledAboutSection id="about" ref={revealContainer}>
      <h2 className="numbered-heading">Sobre mim</h2>

      <div className="inner">
        <StyledText>
          <div>
            <p>
              Olá! Sou Matheus, desenvolvedor focado em criar experiências digitais que resolvem
              problemas reais. Minha jornada começou na faculdade de ciência da computação, mas foi
              ao fazer um bootcamp em Vancouver que descobri minha verdadeira vocação — aprender
              construindo.
            </p>

            <p>
              Ao longo da minha carreira, construí{' '}
              <a href="/">sistemas de orçamento com assinatura digital</a>,{' '}
              <a href="/">plataformas de análise financeira</a>, e trabalhei remotamente das{' '}
              <a href="/">Rochosas canadenses</a>. Hoje combino desenvolvimento tradicional com IA
              para criar produtos escaláveis usando Next.js, TypeScript e React.
            </p>

            <p>
              Atualmente desenvolvendo o <a href="/">CINELOG</a>, uma plataforma social para
              cinéfilos brasileiros — pensada como alternativa ao Letterboxd para nosso mercado,
              utilizando React Native, Supabase e TMDB.
            </p>

            <p className="tech-title">Tecnologias que utilizo:</p>
            <StyledIconCloudWrapper>
              <IconCloud slugs={iconSlugs} size={260} rotationSpeed={0.35} iconScale={0.7} />
            </StyledIconCloudWrapper>
          </div>
        </StyledText>

        <StyledPic>
          <div className="wrapper">
            <StaticImage
              className="img"
              src="../../images/matheus.jpeg"
              width={500}
              quality={95}
              formats={['AUTO', 'WEBP', 'AVIF']}
              alt="Headshot"
            />
          </div>
        </StyledPic>
      </div>
    </StyledAboutSection>
  );
};

export default About;
