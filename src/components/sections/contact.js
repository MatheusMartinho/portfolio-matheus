import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { StaticImage } from 'gatsby-plugin-image';
import { srConfig, email } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';
import { useLang } from '@i18n/LanguageContext';

const StyledContactSection = styled.section`
  max-width: 720px;
  margin: 0 auto 100px;
  text-align: center;

  @media (max-width: 768px) {
    margin: 0 auto 50px;
  }

  .overline {
    display: block;
    margin-bottom: 20px;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-md);
    font-weight: 400;

    &:before {
      bottom: 0;
      font-size: var(--fz-sm);
    }

    &:after {
      display: none;
    }
  }

  .title {
    font-size: clamp(40px, 5vw, 60px);
  }

  .contact-body {
    margin: 18px auto 0;
    max-width: 540px;
    color: var(--light-slate);
  }

  .card-scene {
    perspective: 1400px;
    width: min(100%, 460px);
    margin: 50px auto 0;

    @media (prefers-reduced-motion: no-preference) {
      animation: cardFloat 6s ease-in-out infinite;
    }
  }

  @keyframes cardFloat {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-7px);
    }
  }

  .card-flip {
    position: relative;
    display: block;
    width: 100%;
    aspect-ratio: 660 / 450;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    transform-style: preserve-3d;
    transition: transform 0.8s cubic-bezier(0.4, 0.1, 0.2, 1);

    &:focus-visible {
      outline: 2px dashed var(--green);
      outline-offset: 8px;
    }
  }

  @media (hover: hover) {
    .card-scene:hover .card-flip {
      transform: rotateY(180deg);
    }
  }

  .card-flip.is-flipped {
    transform: rotateY(180deg);
  }

  @media (prefers-reduced-motion: reduce) {
    .card-flip {
      transition: none;
    }
  }

  .card-face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 10px;
    overflow: hidden;
    filter: drop-shadow(0 25px 35px rgba(2, 12, 27, 0.5))
      drop-shadow(0 8px 14px rgba(2, 12, 27, 0.35));

    .gatsby-image-wrapper {
      width: 100%;
      height: 100%;
      background: transparent !important;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .card-back {
    transform: rotateY(180deg);
  }

  .flip-hint {
    margin: 18px 0 0;
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    letter-spacing: 0.06em;
  }

  .email-link {
    ${({ theme }) => theme.mixins.bigButton};
    margin-top: 45px;
  }
`;

const Contact = () => {
  const revealContainer = useRef(null);
  const [flipped, setFlipped] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { t } = useLang();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealContainer.current, srConfig());
  }, []);

  return (
    <StyledContactSection id="contact" ref={revealContainer}>
      <h2 className="numbered-heading overline">{t.contact.overline}</h2>

      <h2 className="title">{t.contact.title}</h2>

      <p className="contact-body">{t.contact.body}</p>

      <div className="card-scene">
        <button
          type="button"
          className={`card-flip${flipped ? ' is-flipped' : ''}`}
          onClick={() => setFlipped(f => !f)}
          aria-label="Cartão de visita — clique para virar">
          <div className="card-face card-front">
            <StaticImage
              src="../../images/martinho-card-front.png"
              alt="Cartão de contato Martinho — frente"
              placeholder="blurred"
              formats={['AUTO', 'WEBP', 'AVIF']}
            />
          </div>
          <div className="card-face card-back">
            <StaticImage
              src="../../images/martinho-card-back.png"
              alt="Cartão de contato Martinho — verso"
              placeholder="blurred"
              formats={['AUTO', 'WEBP', 'AVIF']}
            />
          </div>
        </button>
      </div>

      <p className="flip-hint">{t.contact.flipHint}</p>

      <a className="email-link" href={`mailto:${email}`}>
        {t.contact.cta}
      </a>
    </StyledContactSection>
  );
};

export default Contact;
