import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { usePrefersReducedMotion } from '@hooks';
import deckImg from '@images/turntable/deck.png';
import tonearmImg from '@images/turntable/tonearm.png';
import discCinelog from '@images/turntable/disc-cinelog.png';
import discEcco from '@images/turntable/disc-ecco.png';
import discLift from '@images/turntable/disc-lift.png';

// Medidas tiradas do PNG da vitrola (459x519). O disco trocável precisa cobrir
// por inteiro o vinil que já está na foto, senão ele aparece por baixo, o que
// só é visível quando o disco escolhido é claro.
//
// Chutar no olho não funcionou nas duas primeiras tentativas: o círculo foi
// ajustado por mínimos quadrados sobre a borda real do vinil, amostrada de
// 3 em 3 graus, descartando os raios do braço como outliers.
const DECK_W = 459;
const DECK_H = 519;
const DISC_CX = 210;
const DISC_CY = 260.8;
// O vinil que vinha na foto foi apagado do deck.png e substituído pelo feltro
// do prato, pintado num raio de 198. O disco preenche esse círculo inteiro.
const DISC_D = 396;

const DISC_LEFT = ((DISC_CX - DISC_D / 2) / DECK_W) * 100;
const DISC_TOP = ((DISC_CY - DISC_D / 2) / DECK_H) * 100;
const DISC_W = (DISC_D / DECK_W) * 100;
const DISC_H = (DISC_D / DECK_H) * 100;

const RECORDS = [
  { id: 'cinelog', label: 'CINELOG', img: discCinelog },
  { id: 'ecco', label: 'Ecco Arte', img: discEcco },
  { id: 'lift', label: 'The Lift', img: discLift },
];

const StyledTurntable = styled.div`
  width: 100%;

  .deck {
    position: relative;
    width: 100%;
    filter: drop-shadow(0 22px 34px rgba(6, 2, 5, 0.6));

    /* só a base e o braço: o disco tem tamanho próprio e não pode herdar
       width 100% daqui, senão ele estoura o prato */
    > .base,
    > .base[alt=''] {
      display: block;
      width: 100%;
      height: auto;
      /* GlobalStyle aplica blur(5px) em img[alt=""]; aqui a base e o braço são
         decorativos de propósito, então o filtro precisa ser anulado */
      filter: none;
    }
  }

  /* o disco fica entre a base e o braço, como num toca-discos de verdade */
  .disc,
  .disc[alt=''] {
    position: absolute;
    left: ${DISC_LEFT}%;
    top: ${DISC_TOP}%;
    width: ${DISC_W}%;
    height: ${DISC_H}%;
    z-index: 1;
    border-radius: 50%;
    animation: spin 3.4s linear infinite;
    transition: opacity 0.28s var(--easing);

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }

  .disc.trocando {
    opacity: 0;
  }

  .tonearm,
  .tonearm[alt=''] {
    position: absolute;
    inset: 0;
    z-index: 2;
    width: 100%;
    filter: none;
    pointer-events: none;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .picker {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 14px;
  }

  .picker button {
    padding: 5px 9px;
    background: transparent;
    border: 1px solid var(--lightest-navy);
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    transition: var(--transition);

    &:hover,
    &:focus-visible {
      color: var(--lightest-slate);
      border-color: var(--green);
    }

    &[aria-pressed='true'] {
      color: var(--ink);
      background: var(--green);
      border-color: var(--green);
    }

    &:focus-visible {
      outline: 2px solid var(--green);
      outline-offset: 2px;
    }
  }
`;

const Turntable = ({ hint }) => {
  const [index, setIndex] = useState(0);
  const [trocando, setTrocando] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const trocar = i => {
    if (i === index) {
      return;
    }
    if (prefersReducedMotion) {
      setIndex(i);
      return;
    }
    // some, troca o disco fora da vista, volta
    setTrocando(true);
    setTimeout(() => {
      setIndex(i);
      setTrocando(false);
    }, 280);
  };

  const atual = RECORDS[index];

  return (
    <StyledTurntable>
      <div className="deck">
        <img className="base" src={deckImg} alt="" aria-hidden="true" />
        <img
          className={`disc${trocando ? ' trocando' : ''}`}
          src={atual.img}
          alt={`Disco do ${atual.label} girando na vitrola`}
        />
        <img className="tonearm" src={tonearmImg} alt="" aria-hidden="true" />
      </div>

      <div className="picker" role="group" aria-label={hint || 'Trocar o disco'}>
        {RECORDS.map((r, i) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={i === index}
            onClick={() => trocar(i)}>
            {r.label}
          </button>
        ))}
      </div>
    </StyledTurntable>
  );
};

Turntable.propTypes = {
  hint: PropTypes.string,
};

export default Turntable;
