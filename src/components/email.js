import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { email } from '@config';
import { Side } from '@components';
import { useLang } from '@i18n/LanguageContext';

const StyledLinkWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  .status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--green);

    @media (prefers-reduced-motion: no-preference) {
      animation: statusPulse 2.4s ease-out infinite;
    }
  }

  @keyframes statusPulse {
    0% {
      box-shadow: 0 0 0 0 rgba(202, 244, 56, 0.45);
    }
    70% {
      box-shadow: 0 0 0 9px rgba(202, 244, 56, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(202, 244, 56, 0);
    }
  }

  .status-label {
    color: var(--green);
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    writing-mode: vertical-rl;
  }

  &:after {
    content: '';
    display: block;
    width: 1px;
    height: 90px;
    margin: 0 auto;
    background: linear-gradient(to bottom, var(--light-slate), transparent);
  }

  a {
    margin: 16px auto 20px;
    padding: 10px;
    color: var(--light-slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    line-height: var(--fz-lg);
    letter-spacing: 0.1em;
    writing-mode: vertical-rl;

    &:hover,
    &:focus-visible {
      color: var(--green);
      transform: translateY(-3px);
    }
  }
`;

const Email = ({ isHome }) => {
  const { t } = useLang();

  return (
    <Side isHome={isHome} orientation="right">
      <StyledLinkWrapper>
        <div className="status">
          <span className="status-dot" aria-hidden="true" />
          <span className="status-label">{t.side.status}</span>
        </div>
        <a href={`mailto:${email}`}>{email}</a>
      </StyledLinkWrapper>
    </Side>
  );
};

Email.propTypes = {
  isHome: PropTypes.bool,
};

export default Email;
