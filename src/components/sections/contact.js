import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { StaticImage } from 'gatsby-plugin-image';
import { srConfig, email } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';
import { useLang } from '@i18n/LanguageContext';

const StyledContactSection = styled.section`
  max-width: 960px;
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

  .email-link {
    ${({ theme }) => theme.mixins.bigButton};
    margin-top: 50px;
  }

  .contact-card {
    margin: 30px auto 16px;
    width: min(100%, 860px);
    display: block;
    border-radius: 8px;
    filter: drop-shadow(0 25px 35px rgba(2, 12, 27, 0.35))
      drop-shadow(0 10px 18px rgba(2, 12, 27, 0.25));
    background: transparent;

    img {
      width: 100%;
      border-radius: 8px;
      box-shadow: none;
      display: block;
    }
  }

  .contact-text {
    margin-top: 12px;
  }
`;

const Contact = () => {
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
    <StyledContactSection id="contact" ref={revealContainer}>
      <h2 className="numbered-heading overline">{t.contact.overline}</h2>

      <h2 className="title">{t.contact.title}</h2>

      <StaticImage
        className="contact-card"
        src="../../images/martinho-card.png"
        alt="Cartão de contato Martinho"
        placeholder="blurred"
        formats={['AUTO', 'WEBP', 'AVIF']}
      />

      <a className="email-link" href={`mailto:${email}`}>
        {t.contact.cta}
      </a>
    </StyledContactSection>
  );
};

export default Contact;
