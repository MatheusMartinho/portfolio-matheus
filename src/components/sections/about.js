import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { StaticImage } from 'gatsby-plugin-image';
import styled, { keyframes } from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';

const StyledAboutSection = styled.section`
  max-width: 1100px;

  .inner {
    display: grid;
    grid-template-columns: 3fr 2fr;
    grid-gap: 60px;
    align-items: center;

    @media (max-width: 768px) {
      display: block;
    }
  }
`;

const StyledText = styled.div`
  overflow: hidden;
  min-width: 0;

  p {
    margin: 0 0 16px;
  }
`;

const StyledStackBlock = styled.div`
  margin-top: 35px;
`;

const StyledStackHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;

  .stack-label {
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
    color: var(--green);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .stack-line {
    flex: 1;
    height: 1px;
    background: var(--lightest-navy);
  }
`;

const scrollLeft = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
`;

const scrollRight = keyframes`
  from { transform: translateX(-50%); }
  to   { transform: translateX(0); }
`;

const StyledMarquee = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  mask-image: linear-gradient(
    to right,
    transparent 0,
    black 8%,
    black 92%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0,
    black 8%,
    black 92%,
    transparent 100%
  );

  & + & {
    margin-top: 12px;
  }
`;

const StyledTrack = styled.div`
  display: flex;
  gap: 10px;
  width: max-content;
  animation: ${({ $direction }) => ($direction === 'right' ? scrollRight : scrollLeft)}
    ${({ $duration }) => $duration}s linear infinite;

  ${StyledMarquee}:hover & {
    animation-play-state: paused;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const StyledChip = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border: 1px solid var(--lightest-navy);
  border-radius: 50%;
  background: var(--light-navy);
  color: var(--light-slate);
  transition: var(--transition);
  cursor: default;
  flex-shrink: 0;

  img {
    width: 28px;
    height: 28px;
    object-fit: contain;
    transition: var(--transition);
  }

  .fallback {
    font-family: var(--font-mono);
    font-size: var(--fz-md);
    font-weight: 600;
    color: var(--light-slate);
  }

  &:hover {
    border-color: var(--green);
    transform: translateY(-3px);
    box-shadow: 0 8px 16px -8px rgba(100, 255, 218, 0.35);

    img {
      transform: scale(1.1);
    }

    .fallback {
      color: var(--green);
    }
  }
`;

const TechIcon = ({ name, slug }) => {
  const [errored, setErrored] = useState(!slug);

  return (
    <StyledChip title={name} aria-label={name}>
      {errored ? (
        <span className="fallback">{name.charAt(0).toUpperCase()}</span>
      ) : (
        <img
          src={`https://cdn.simpleicons.org/${slug}`}
          alt={name}
          loading="lazy"
          onError={() => setErrored(true)}
        />
      )}
    </StyledChip>
  );
};

TechIcon.propTypes = {
  name: PropTypes.string.isRequired,
  slug: PropTypes.string,
};

const StyledCard = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 420px;
  margin-left: auto;

  @media (max-width: 768px) {
    margin: 50px auto 0;
    max-width: 320px;
  }

  .card-frame {
    position: relative;
    width: 100%;
    transform: rotate(-2deg);
    transition: var(--transition);
    filter: drop-shadow(0 25px 35px rgba(2, 12, 27, 0.7))
      drop-shadow(0 8px 12px rgba(2, 12, 27, 0.45));

    &:hover {
      transform: rotate(0deg) translateY(-6px);
      filter: drop-shadow(0 35px 45px rgba(2, 12, 27, 0.85))
        drop-shadow(0 12px 18px rgba(2, 12, 27, 0.55));
    }
  }
`;

const ROW_ONE = [
  { name: 'TypeScript', slug: 'typescript' },
  { name: 'JavaScript', slug: 'javascript' },
  { name: 'Python', slug: 'python' },
  { name: 'Next.js', slug: 'nextdotjs' },
  { name: 'React', slug: 'react' },
  { name: 'React Native', slug: 'react' },
  { name: 'Expo', slug: 'expo' },
  { name: 'Tailwind CSS', slug: 'tailwindcss' },
  { name: 'Vite', slug: 'vite' },
  { name: 'HTML5', slug: 'html5' },
  { name: 'CSS3', slug: 'css3' },
  { name: 'Angular', slug: 'angular' },
  { name: 'Flutter', slug: 'flutter' },
  { name: 'Dart', slug: 'dart' },
];

const ROW_TWO = [
  { name: 'Node.js', slug: 'nodedotjs' },
  { name: 'Express', slug: 'express' },
  { name: 'Supabase', slug: 'supabase' },
  { name: 'PostgreSQL', slug: 'postgresql' },
  { name: 'Firebase', slug: 'firebase' },
  { name: 'Stripe', slug: 'stripe' },
  { name: 'Vercel', slug: 'vercel' },
  { name: 'Cloudflare', slug: 'cloudflare' },
  { name: 'Git', slug: 'git' },
  { name: 'GitHub', slug: 'github' },
  { name: 'Figma', slug: 'figma' },
  { name: 'Insomnia', slug: 'insomnia' },
  { name: 'Claude', slug: 'claude' },
  { name: 'Cursor', slug: 'cursor' },
  { name: 'Windsurf', slug: 'codeium' },
  { name: 'Xcode', slug: 'xcode' },
  { name: 'Android Studio', slug: 'androidstudio' },
  { name: 'Jupyter', slug: 'jupyter' },
];

const About = () => {
  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    sr.reveal(revealContainer.current, srConfig());
  }, []);

  const renderRow = (items, direction, duration) => (
    <StyledMarquee>
      <StyledTrack $direction={direction} $duration={duration}>
        {[...items, ...items].map((tech, i) => (
          <TechIcon key={`${tech.name}-${i}`} name={tech.name} slug={tech.slug} />
        ))}
      </StyledTrack>
    </StyledMarquee>
  );

  return (
    <StyledAboutSection id="about" ref={revealContainer}>
      <h2 className="numbered-heading">Sobre mim</h2>

      <div className="inner">
        <StyledText>
          <p>
            Olá, sou o Matheus. Faço produtos digitais do zero ao deploy: arquitetura, código,
            infra e UX.
          </p>

          <p>
            Comecei em ciência da computação na faculdade, mas foi num bootcamp em Vancouver que
            aprendi a programar de verdade. Desde então, lancei o{' '}
            <a href="https://orca-facil-psi.vercel.app/" target="_blank" rel="noreferrer">
              OrçaFácil
            </a>{' '}
            (SaaS de orçamento com assinatura digital e pagamentos via PIX), o{' '}
            <a
              href="https://studio--musclemate-ulkfm.us-central1.hosted.app"
              target="_blank"
              rel="noreferrer">
              MuscleMate
            </a>{' '}
            (análise e otimização de treinos), e passei uma temporada codando remoto das Rocky
            Mountains.
          </p>

          <p>
            Hoje trabalho em dois projetos: o <a href="#projects">The Pitch</a>, app de check-in
            social com verificação por GPS para torcedor brasileiro no estádio, e o{' '}
            <a
              href="https://github.com/MatheusMartinho/cinelog"
              target="_blank"
              rel="noreferrer">
              CINELOG
            </a>
            , alternativa ao Letterboxd pensada para cinéfilos brasileiros. Ambos em React Native,
            Expo e Supabase. No fluxo de trabalho, uso o Claude para acelerar refactor, debug e
            revisão de código sem abrir mão da qualidade.
          </p>

          <StyledStackBlock>
            <StyledStackHeader>
              <span className="stack-label">~/stack</span>
              <span className="stack-line" />
            </StyledStackHeader>
            {renderRow(ROW_ONE, 'left', 45)}
            {renderRow(ROW_TWO, 'right', 55)}
          </StyledStackBlock>
        </StyledText>

        <StyledCard>
          <div className="card-frame">
            <StaticImage
              src="../../images/builder-card.png"
              alt="Matheus Moura Martinho — The Builder credential"
              placeholder="blurred"
              quality={95}
            />
          </div>
        </StyledCard>
      </div>
    </StyledAboutSection>
  );
};

export default About;
