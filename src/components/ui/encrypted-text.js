import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*+-/?';
const NON_BREAKING_SPACE = '\u00A0';

const randomChar = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];

const normalizeChar = char => (char === ' ' ? NON_BREAKING_SPACE : char);

const buildInitialChars = text =>
  text.split('').map(char => (char === ' ' ? NON_BREAKING_SPACE : randomChar()));

const buildRevealedChars = (text, revealedIndex) =>
  text.split('').map((char, index) => {
    if (char === ' ') {
      return NON_BREAKING_SPACE;
    }

    if (index <= revealedIndex) {
      return char;
    }

    return randomChar();
  });

const EncryptedText = ({
  text = '',
  encryptedClassName = '',
  revealedClassName = '',
  revealDelayMs = 40,
  disabled = false,
}) => {
  const normalizedText = useMemo(() => text ?? '', [text]);

  const [revealedIndex, setRevealedIndex] = useState(disabled ? normalizedText.length : -1);
  const [displayChars, setDisplayChars] = useState(() =>
    disabled ? normalizedText.split('').map(normalizeChar) : buildInitialChars(normalizedText),
  );

  useEffect(() => {
    if (disabled) {
      setDisplayChars(normalizedText.split('').map(normalizeChar));
      setRevealedIndex(normalizedText.length - 1);
      return;
    }

    setDisplayChars(buildInitialChars(normalizedText));
    setRevealedIndex(-1);
  }, [disabled, normalizedText]);

  useEffect(() => {
    if (disabled || normalizedText.length === 0) {
      return undefined;
    }

    if (revealedIndex >= normalizedText.length - 1) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setDisplayChars(buildRevealedChars(normalizedText, revealedIndex + 1));
      setRevealedIndex(prev => prev + 1);
    }, revealDelayMs);

    return () => clearTimeout(timeout);
  }, [disabled, normalizedText, revealDelayMs, revealedIndex]);

  if (!normalizedText) {
    return null;
  }

  return (
    <span aria-label={normalizedText}>
      {displayChars.map((char, index) => {
        const isRevealed = index <= revealedIndex || char === NON_BREAKING_SPACE;
        const className = isRevealed ? revealedClassName : encryptedClassName;
        return (
          <span key={`char-${index}-${normalizedText[index] || ''}`} className={className}>
            {char}
          </span>
        );
      })}
    </span>
  );
};

export default EncryptedText;

EncryptedText.propTypes = {
  text: PropTypes.string.isRequired,
  encryptedClassName: PropTypes.string,
  revealedClassName: PropTypes.string,
  revealDelayMs: PropTypes.number,
  disabled: PropTypes.bool,
};
