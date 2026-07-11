import React, { useState, useEffect } from 'react';
import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styled, { css } from 'styled-components';
import { navLinks } from '@config';
import { loaderDelay } from '@utils';
import { useScrollDirection, usePrefersReducedMotion } from '@hooks';
import { Menu } from '@components';
import { useLang } from '@i18n/LanguageContext';
import ProfileLogo from '@images/sticker-logo.png';

const StyledHeader = styled.header`
  ${({ theme }) => theme.mixins.flexBetween};
  position: fixed;
  top: 0;
  z-index: 11;
  padding: 0px 50px;
  width: 100%;
  height: var(--nav-height);
  background-color: ${props => (props.scrolledToTop ? 'transparent' : 'rgba(64, 34, 45, 0.82)')};
  -webkit-backdrop-filter: ${props => (props.scrolledToTop ? 'none' : 'blur(12px)')};
  backdrop-filter: ${props => (props.scrolledToTop ? 'none' : 'blur(12px)')};
  border-bottom: 1px solid
    ${props => (props.scrolledToTop ? 'transparent' : 'var(--lightest-navy)')};
  box-shadow: ${props =>
    props.scrolledToTop ? 'none' : '0 10px 30px -10px var(--navy-shadow)'};
  filter: none !important;
  pointer-events: auto !important;
  user-select: auto !important;
  transition: var(--transition);

  @media (max-width: 1080px) {
    padding: 0 40px;
  }
  @media (max-width: 768px) {
    padding: 0 25px;
  }

  @media (prefers-reduced-motion: no-preference) {
    ${props =>
    props.scrollDirection === 'up' &&
    !props.scrolledToTop &&
    css`
        height: var(--nav-scroll-height);
        transform: translateY(0px);
        background-color: rgba(64, 34, 45, 0.82);
        -webkit-backdrop-filter: blur(12px);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--lightest-navy);
        box-shadow: 0 10px 30px -10px var(--navy-shadow);
      `};

    ${props =>
    props.scrollDirection === 'down' &&
    !props.scrolledToTop &&
    css`
        height: var(--nav-scroll-height);
        /* hide by the full nav height: the logo overflows the shrunk bar,
           so sliding only by the scroll-height leaves it peeking out */
        transform: translateY(calc(var(--nav-height) * -1.2));
        box-shadow: 0 10px 30px -10px var(--navy-shadow);
      `};
  }
`;

const StyledNav = styled.nav`
  ${({ theme }) => theme.mixins.flexBetween};
  position: relative;
  width: 100%;
  color: var(--lightest-slate);
  font-family: var(--font-mono);
  counter-reset: item 0;
  z-index: 12;

  @keyframes logoWiggle {
    0% {
      transform: translateY(0) rotate(0deg) scale(1);
    }
    40% {
      transform: translateY(-4px) rotate(-3deg) scale(1.05);
    }
    70% {
      transform: translateY(-2px) rotate(2deg) scale(1.03);
    }
    100% {
      transform: translateY(0) rotate(0deg) scale(1);
    }
  }

  .logo {
    ${({ theme }) => theme.mixins.flexCenter};

    a {
      color: var(--green);
      width: 100px;
      height: 100px;
      position: relative;
      z-index: 1;

      &:hover,
      &:focus {
        outline: 0;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        filter: drop-shadow(0 8px 16px rgba(202, 244, 56, 0.25));
        @media (prefers-reduced-motion: no-preference) {
          transition: var(--transition);
        }
      }

      &:hover img,
      &:focus img {
        filter: drop-shadow(0 12px 24px rgba(202, 244, 56, 0.45));
      }

      @media (prefers-reduced-motion: no-preference) {
        &:hover img,
        &:focus img {
          animation: logoWiggle 650ms ease forwards;
        }
      }
    }
  }
`;

const StyledLinks = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }

  ol {
    ${({ theme }) => theme.mixins.flexBetween};
    padding: 0;
    margin: 0;
    list-style: none;

    li {
      margin: 0 6px;
      position: relative;
      counter-increment: item 1;

      a {
        position: relative;
        padding: 10px 10px 12px;
        color: var(--lightest-slate);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.14em;
        text-transform: uppercase;

        &:before {
          content: '0' counter(item);
          margin-right: 7px;
          color: var(--green);
          font-size: 10px;
          font-weight: 400;
        }

        /* sliding underline */
        &:after {
          content: '';
          position: absolute;
          left: 10px;
          right: 10px;
          bottom: 5px;
          height: 2px;
          background: var(--green);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s var(--easing);
        }

        &:hover,
        &:focus-visible {
          color: var(--white);

          &:after {
            transform: scaleX(1);
          }
        }
      }
    }
  }

  .resume-button {
    ${({ theme }) => theme.mixins.smallButton};
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-left: 18px;
    font-size: var(--fz-xs);

    .arrow {
      font-size: 1.05em;
      line-height: 0;
      transition: var(--transition);
    }

    &:hover .arrow,
    &:focus-visible .arrow {
      transform: translate(2px, -2px);
    }
  }

  .lang-switch {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    margin-left: 16px;
    padding: 6px 4px;
    border: none;
    background: transparent;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: var(--transition);

    .lang {
      color: var(--slate);
      transition: var(--transition);
    }

    .lang.active {
      color: var(--green);
      font-weight: 600;
    }

    .lang-divider {
      color: var(--lightest-navy);
    }

    &:hover .lang:not(.active),
    &:focus-visible .lang:not(.active) {
      color: var(--lightest-slate);
    }

    &:focus-visible {
      outline: 2px solid var(--green);
      outline-offset: 3px;
    }
  }
`;

const Nav = ({ isHome }) => {
  const [isMounted, setIsMounted] = useState(!isHome);
  const scrollDirection = useScrollDirection('down');
  const [scrolledToTop, setScrolledToTop] = useState(true);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { lang, setLanguage, t } = useLang();

  const handleScroll = () => {
    setScrolledToTop(window.pageYOffset < 50);
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const timeout = setTimeout(() => {
      setIsMounted(true);
    }, 100);

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const timeout = isHome ? loaderDelay : 0;
  const fadeClass = isHome ? 'fade' : '';
  const fadeDownClass = isHome ? 'fadedown' : '';

  const LogoImage = <img src={ProfileLogo} alt="Matheus logo" />;
  const Logo = (
    <div className="logo" tabIndex="-1">
      {isHome ? (
        <a href="/" aria-label="home">
          {LogoImage}
        </a>
      ) : (
        <Link to="/" aria-label="home">
          {LogoImage}
        </Link>
      )}
    </div>
  );

  const ResumeLink = (
    <a className="resume-button" href="/resume" target="_blank" rel="noopener noreferrer">
      {t.nav.resume}
      <span className="arrow" aria-hidden="true">
        ↗
      </span>
    </a>
  );

  const LangSwitch = (
    <button
      type="button"
      className="lang-switch"
      onClick={() => setLanguage(lang === 'pt' ? 'en' : 'pt')}
      aria-label="Toggle language">
      <span className={`lang${lang === 'pt' ? ' active' : ''}`}>PT</span>
      <span className="lang-divider" aria-hidden="true">
        /
      </span>
      <span className={`lang${lang === 'en' ? ' active' : ''}`}>EN</span>
    </button>
  );

  return (
    <StyledHeader scrollDirection={scrollDirection} scrolledToTop={scrolledToTop}>
      <StyledNav>
        {prefersReducedMotion ? (
          <>
            {Logo}

            <StyledLinks>
              <ol>
                {navLinks &&
                  navLinks.map(({ url, key }, i) => (
                    <li key={i}>
                      <Link to={url}>{t.nav[key]}</Link>
                    </li>
                  ))}
              </ol>
              <div>{ResumeLink}</div>
              {LangSwitch}
            </StyledLinks>

            <Menu />
          </>
        ) : (
          <>
            <TransitionGroup component={null}>
              {isMounted && (
                <CSSTransition classNames={fadeClass} timeout={timeout}>
                  <>{Logo}</>
                </CSSTransition>
              )}
            </TransitionGroup>

            <StyledLinks>
              <ol>
                <TransitionGroup component={null}>
                  {isMounted &&
                    navLinks &&
                    navLinks.map(({ url, key }, i) => (
                      <CSSTransition key={i} classNames={fadeDownClass} timeout={timeout}>
                        <li key={i} style={{ transitionDelay: `${isHome ? i * 100 : 0}ms` }}>
                          <Link to={url}>{t.nav[key]}</Link>
                        </li>
                      </CSSTransition>
                    ))}
                </TransitionGroup>
              </ol>

              <TransitionGroup component={null}>
                {isMounted && (
                  <CSSTransition classNames={fadeDownClass} timeout={timeout}>
                    <div style={{ transitionDelay: `${isHome ? navLinks.length * 100 : 0}ms` }}>
                      {ResumeLink}
                    </div>
                  </CSSTransition>
                )}
              </TransitionGroup>

              <TransitionGroup component={null}>
                {isMounted && (
                  <CSSTransition classNames={fadeDownClass} timeout={timeout}>
                    <div
                      style={{
                        transitionDelay: `${isHome ? (navLinks.length + 1) * 100 : 0}ms`,
                      }}>
                      {LangSwitch}
                    </div>
                  </CSSTransition>
                )}
              </TransitionGroup>
            </StyledLinks>

            <TransitionGroup component={null}>
              {isMounted && (
                <CSSTransition classNames={fadeClass} timeout={timeout}>
                  <Menu />
                </CSSTransition>
              )}
            </TransitionGroup>
          </>
        )}
      </StyledNav>
    </StyledHeader>
  );
};

Nav.propTypes = {
  isHome: PropTypes.bool,
};

export default Nav;
