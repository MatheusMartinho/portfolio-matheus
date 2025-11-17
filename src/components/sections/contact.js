import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { StaticImage } from 'gatsby-plugin-image';
import { srConfig, email } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';

const StyledContactSection = styled.section`
  max-width: 600px;
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
    margin: 20px auto 16px;
    width: min(100%, 420px);
    display: block;
    border-radius: 8px;
    filter: drop-shadow(0 15px 26px rgba(2, 12, 27, 0.26))
      drop-shadow(0 6px 14px rgba(2, 12, 27, 0.2));
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

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealContainer.current, srConfig());
  }, []);

  return (
    <StyledContactSection id="contact" ref={revealContainer}>
      <h2 className="numbered-heading overline">E agora?</h2>

      <h2 className="title">Entre em Contato</h2>

      <p className="contact-text">
        Atualmente estou aberto a novas oportunidades, minha inbox está sempre aberta. Seja se você
        tem uma pergunta ou só quer dar um alô, vou fazer o meu melhor pra te responder!
      </p>

      <StaticImage
        className="contact-card"
        src="../../images/cartao-png.png"
        alt="Cartão de contato"
        placeholder="blurred"
        formats={['AUTO', 'WEBP', 'AVIF']}
      />

      <a className="email-link" href={`mailto:${email}`}>
        Diga Olá
      </a>
    </StyledContactSection>
  );
};

export default Contact;
