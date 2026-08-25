import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { StaticImage } from 'gatsby-plugin-image';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';
import { useLang } from '@i18n/LanguageContext';
import stTypescript from '@images/stack/typescript.png';
import stReact from '@images/stack/react.png';
import stNextjs from '@images/stack/nextjs.png';
import stExpo from '@images/stack/expo.png';
import stSupabase from '@images/stack/supabase.png';
import stNodejs from '@images/stack/nodejs.png';
import stTailwind from '@images/stack/tailwind.png';
import stClaude from '@images/stack/claude.png';
import stPython from '@images/stack/python.png';
import stPostgresql from '@images/stack/postgresql.png';
import stFirebase from '@images/stack/firebase.png';
import stStripe from '@images/stack/stripe.png';
import stVercel from '@images/stack/vercel.png';
import stGit from '@images/stack/git.png';
import stFigma from '@images/stack/figma.png';
import stFlutter from '@images/stack/flutter.png';
import stCursor from '@images/stack/cursor.png';
import stJupyter from '@images/stack/jupyter.png';

const StyledAboutSection = styled.section`
  max-width: 1100px;

  .inner {
    display: grid;
    /* card column widened so the badge reads at a comfortable size */
    grid-template-columns: 3fr 2.1fr;
    grid-template-rows: auto auto;
    /* no row gap: the stack block brings its own top margin */
    grid-gap: 0 50px;
    align-items: start;

    @media (max-width: 768px) {
      display: block;
    }
  }
`;

const StyledText = styled.div`
  min-width: 0;
  grid-column: 1;
  grid-row: 1;

  p {
    margin: 0 0 16px;
  }
`;

const StyledStackBlock = styled.div`
  /* spans the whole grid on its own row, under the copy and the badge, so the
     eight daily stickers fit on a single line */
  grid-column: 1 / -1;
  grid-row: 2;
  min-width: 0;
  margin-top: 46px;

  @media (max-width: 768px) {
    margin-top: 40px;
  }
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
  gap: 16px 18px;
  margin-bottom: 26px;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 480px) {
    gap: 16px 12px;
  }
`;

// Each sticker sits at a slight angle, as if stuck on by hand, and straightens
// when you point at it.
const TILTS = [-5, 3, -2, 6, -4, 2, -6, 4, -3, 5];

const StyledSticker = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  width: ${({ $small }) => ($small ? '78px' : '114px')};
  cursor: default;

  img,
  img[alt=''] {
    width: ${({ $small }) => ($small ? '58px' : '80px')};
    height: auto;
    /* GlobalStyle blurs img[alt=""]; this filter replaces it */
    filter: drop-shadow(0 10px 16px rgba(10, 4, 8, 0.6));
    transform: rotate(var(--tilt, 0deg));
    transition: transform 0.28s var(--easing), filter 0.28s var(--easing);
  }

  .sticker-name {
    color: var(--light-slate);
    font-family: var(--font-mono);
    font-size: ${({ $small }) => ($small ? '10px' : 'var(--fz-xxs)')};
    line-height: 1.25;
    letter-spacing: 0.04em;
    text-align: center;
    transition: var(--transition);
  }

  &:hover {
    img {
      transform: rotate(0deg) translateY(-5px) scale(1.06);
      filter: drop-shadow(0 18px 26px rgba(10, 4, 8, 0.7))
        drop-shadow(0 0 18px rgba(202, 244, 56, 0.28));
    }

    .sticker-name {
      color: var(--green);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    img,
    &:hover img {
      transform: none;
    }
  }
`;

const Sticker = ({ name, img, small, index }) => (
  <StyledSticker $small={small} style={{ '--tilt': `${TILTS[index % TILTS.length]}deg` }}>
    <img src={img} alt="" aria-hidden="true" loading="lazy" />
    <span className="sticker-name">{name}</span>
  </StyledSticker>
);

Sticker.propTypes = {
  name: PropTypes.string.isRequired,
  img: PropTypes.string.isRequired,
  small: PropTypes.bool,
  index: PropTypes.number,
};

const StyledCard = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  grid-column: 2;
  grid-row: 1;
  /* anchored to the top of the copy instead of floating in the middle */
  align-self: start;
  width: 100%;
  /* o crachá LUMON é bem mais estreito que o anterior (0,50 contra 0,79), então
     a largura cai para a altura na tela continuar equivalente */
  max-width: 290px;
  margin-left: auto;
  margin-right: 34px;

  @media (max-width: 1080px) {
    max-width: 250px;
    margin-right: 0;
  }

  @media (max-width: 768px) {
    margin: 50px auto 0;
    max-width: 260px;
  }

  .card-swing {
    width: 100%;
    /* balança a partir do prendedor, no topo do próprio crachá */
    transform-origin: 50% 3%;

    @media (prefers-reduced-motion: no-preference) {
      animation: badgeSwing 7s ease-in-out infinite;
    }
  }

  @keyframes badgeSwing {
    0%,
    100% {
      transform: rotate(-1.8deg);
    }
    50% {
      transform: rotate(1.8deg);
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
  { name: 'TypeScript', img: stTypescript },
  { name: 'React / Native', img: stReact },
  { name: 'Next.js', img: stNextjs },
  { name: 'Expo', img: stExpo },
  { name: 'Supabase', img: stSupabase },
  { name: 'Node.js', img: stNodejs },
  { name: 'Tailwind CSS', img: stTailwind },
  { name: 'Claude', img: stClaude },
];

const STACK_ALSO = [
  { name: 'Python', img: stPython },
  { name: 'PostgreSQL', img: stPostgresql },
  { name: 'Firebase', img: stFirebase },
  { name: 'Stripe', img: stStripe },
  { name: 'Vercel', img: stVercel },
  { name: 'Git', img: stGit },
  { name: 'Figma', img: stFigma },
  { name: 'Flutter', img: stFlutter },
  { name: 'Cursor', img: stCursor },
  { name: 'Jupyter', img: stJupyter },
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
            <a href="https://eccoarte.com" target="_blank" rel="noreferrer">
              ECCO
            </a>
            {t.about.p2Mid}{' '}
            <a href="https://github.com/MatheusMartinho/Lift" target="_blank" rel="noreferrer">
              The Lift
            </a>
            {t.about.p2End}
          </p>

          <p>
            {t.about.p3Start} <a href="#projects">The Pitch</a>
            {t.about.p3Mid}{' '}
            <a href="https://github.com/MatheusMartinho/cinelog" target="_blank" rel="noreferrer">
              CINELOG
            </a>
            {t.about.p3End}
          </p>
        </StyledText>

        <StyledCard>
          <div className="card-swing">
            <div className="card-frame">
              <StaticImage
                src="../../images/lumon-card.png"
                alt="Crachá de identificação com a foto de Matheus Moura Martinho, cargo Dev Full-Stack"
                placeholder="blurred"
                quality={95}
              />
            </div>
          </div>
        </StyledCard>

        <StyledStackBlock>
          <StyledStackHeader>
            <span className="stack-label">~/stack</span>
            <span className="stack-line" />
          </StyledStackHeader>

          <StyledStackGroupLabel>{t.about.stackDaily}</StyledStackGroupLabel>
          <StyledStickerSheet>
            {STACK_DAILY.map((tech, i) => (
              <Sticker key={tech.name} name={tech.name} img={tech.img} index={i} />
            ))}
          </StyledStickerSheet>

          <StyledStackGroupLabel>{t.about.stackAlso}</StyledStackGroupLabel>
          <StyledStickerSheet>
            {STACK_ALSO.map((tech, i) => (
              <Sticker key={tech.name} name={tech.name} img={tech.img} index={i + 3} small />
            ))}
          </StyledStickerSheet>
        </StyledStackBlock>
      </div>
    </StyledAboutSection>
  );
};

export default About;
