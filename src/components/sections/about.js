import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { StaticImage } from 'gatsby-plugin-image';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';
import { useLang } from '@i18n/LanguageContext';

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

const StyledStackGroupLabel = styled.span`
  display: inline-block;
  margin: 4px 0 14px;
  padding: 4px 10px;
  border: 1px solid rgba(197, 220, 104, 0.35);
  border-radius: 4px;
  color: var(--green);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
`;

const StyledStickerSheet = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px 14px;
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const StyledSticker = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: ${({ $small }) => ($small ? '7px 13px 7px 10px' : '10px 16px 10px 12px')};
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.09) 0%,
    rgba(255, 255, 255, 0.04) 50%,
    rgba(255, 255, 255, 0.02) 100%
  );
  -webkit-backdrop-filter: blur(14px) saturate(150%);
  backdrop-filter: blur(14px) saturate(150%);
  color: var(--lightest-slate);
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 10px;
  font-family: var(--font-mono);
  font-size: ${({ $small }) => ($small ? 'var(--fz-xxs)' : 'var(--fz-xs)')};
  font-weight: 500;
  letter-spacing: 0.02em;
  white-space: nowrap;
  cursor: default;
  box-shadow: 0 10px 24px -14px rgba(10, 4, 8, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.14);
  transition: var(--transition);

  img,
  img[alt=''] {
    width: ${({ $small }) => ($small ? '14px' : '18px')};
    height: ${({ $small }) => ($small ? '14px' : '18px')};
    object-fit: contain;
    transition: var(--transition);
    filter: none; /* GlobalStyle blurs img[alt=""], but these are decorative by design */
  }

  &:hover {
    transform: translateY(-3px);
    color: var(--green);
    border-color: rgba(197, 220, 104, 0.5);
    box-shadow: 0 14px 30px -14px rgba(10, 4, 8, 0.7),
      0 8px 22px -10px rgba(197, 220, 104, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);

    img {
      transform: scale(1.08);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover {
      transform: none;
    }
  }
`;

const Sticker = ({ name, slug, small }) => {
  const [errored, setErrored] = useState(!slug);

  return (
    <StyledSticker title={name} $small={small}>
      {!errored && (
        <img
          src={`https://cdn.simpleicons.org/${slug}/ede0cc`}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={() => setErrored(true)}
        />
      )}
      <span>{name}</span>
    </StyledSticker>
  );
};

Sticker.propTypes = {
  name: PropTypes.string.isRequired,
  slug: PropTypes.string,
  small: PropTypes.bool,
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

  .card-swing {
    width: 100%;
    transform-origin: 50% -40px;

    @media (prefers-reduced-motion: no-preference) {
      animation: badgeSwing 7s ease-in-out infinite;
    }
  }

  @keyframes badgeSwing {
    0%,
    100% {
      transform: rotate(-2.4deg);
    }
    50% {
      transform: rotate(1.6deg);
    }
  }

  .card-frame {
    position: relative;
    width: 100%;
    filter: drop-shadow(0 25px 35px rgba(2, 12, 27, 0.7))
      drop-shadow(0 8px 12px rgba(2, 12, 27, 0.45));
  }
`;

const STACK_DAILY = [
  { name: 'TypeScript', slug: 'typescript' },
  { name: 'React / Native', slug: 'react' },
  { name: 'Next.js', slug: 'nextdotjs' },
  { name: 'Expo', slug: 'expo' },
  { name: 'Supabase', slug: 'supabase' },
  { name: 'Node.js', slug: 'nodedotjs' },
  { name: 'Tailwind CSS', slug: 'tailwindcss' },
  { name: 'Claude', slug: 'claude' },
];

const STACK_ALSO = [
  { name: 'Python', slug: 'python' },
  { name: 'PostgreSQL', slug: 'postgresql' },
  { name: 'Firebase', slug: 'firebase' },
  { name: 'Stripe', slug: 'stripe' },
  { name: 'Vercel', slug: 'vercel' },
  { name: 'Git', slug: 'git' },
  { name: 'Figma', slug: 'figma' },
  { name: 'Flutter', slug: 'flutter' },
  { name: 'Cursor', slug: 'cursor' },
  { name: 'Jupyter', slug: 'jupyter' },
];

const About = () => {
  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { t } = useLang();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    sr.reveal(revealContainer.current, srConfig());
  }, []);

  return (
    <StyledAboutSection id="about" ref={revealContainer}>
      <h2 className="numbered-heading">{t.about.title}</h2>

      <div className="inner">
        <StyledText>
          <p>{t.about.p1}</p>

          <p>
            {t.about.p2Start}{' '}
            <a href="https://orca-facil-psi.vercel.app/" target="_blank" rel="noreferrer">
              OrçaFácil
            </a>{' '}
            {t.about.p2Mid}{' '}
            <a
              href="https://studio--musclemate-ulkfm.us-central1.hosted.app"
              target="_blank"
              rel="noreferrer">
              MuscleMate
            </a>{' '}
            {t.about.p2End}
          </p>

          <p>
            {t.about.p3Start} <a href="#projects">The Pitch</a>
            {t.about.p3Mid}{' '}
            <a
              href="https://github.com/MatheusMartinho/cinelog"
              target="_blank"
              rel="noreferrer">
              CINELOG
            </a>
            {t.about.p3End}
          </p>

          <StyledStackBlock>
            <StyledStackHeader>
              <span className="stack-label">~/stack</span>
              <span className="stack-line" />
            </StyledStackHeader>

            <StyledStackGroupLabel>{t.about.stackDaily}</StyledStackGroupLabel>
            <StyledStickerSheet>
              {STACK_DAILY.map(tech => (
                <Sticker key={tech.name} name={tech.name} slug={tech.slug} />
              ))}
            </StyledStickerSheet>

            <StyledStackGroupLabel>{t.about.stackAlso}</StyledStackGroupLabel>
            <StyledStickerSheet>
              {STACK_ALSO.map(tech => (
                <Sticker key={tech.name} name={tech.name} slug={tech.slug} small />
              ))}
            </StyledStickerSheet>
          </StyledStackBlock>
        </StyledText>

        <StyledCard>
          <div className="card-swing">
            <div className="card-frame">
              <StaticImage
                src="../../images/builder-card.png"
                alt="Matheus Moura Martinho — The Builder credential"
                placeholder="blurred"
                quality={95}
              />
            </div>
          </div>
        </StyledCard>
      </div>
    </StyledAboutSection>
  );
};

export default About;
