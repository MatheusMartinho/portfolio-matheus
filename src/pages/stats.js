import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { Layout } from '@components';
import { usePrefersReducedMotion } from '@hooks';
import { useLang } from '@i18n/LanguageContext';
import { fetchVisitStats, getVisitorNumber } from '@utils/visits';
import StatsPortrait from '@images/stats-portrait.jpg';

const GITHUB_USER = 'MatheusMartinho';
const CACHE_KEY = 'gh-stats-v1';
const CACHE_TTL = 60 * 60 * 1000; // 1h

const StyledMain = styled.main`
  max-width: 1240px;

  header {
    margin-bottom: 60px;
  }

  .stats-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 48px;
    align-items: start;

    @media (max-width: 1080px) {
      grid-template-columns: 1fr;
    }
  }

  /* retrato impresso, colado na parede da sala de controle */
  .stats-portrait {
    position: sticky;
    top: 120px;
    display: block;
    padding: 12px 12px 14px;
    background: var(--dark-navy);
    border: 1px solid var(--lightest-navy);
    border-radius: 6px;
    box-shadow: 0 24px 44px -18px rgba(10, 4, 8, 0.8);
    transform: rotate(1.4deg);
    transition: var(--transition);
    text-decoration: none;

    &:before {
      content: '';
      position: absolute;
      top: -9px;
      left: 50%;
      transform: translateX(-50%) rotate(-2deg);
      width: 64px;
      height: 18px;
      background: rgba(237, 224, 204, 0.14);
      border-left: 1px dashed rgba(237, 224, 204, 0.25);
      border-right: 1px dashed rgba(237, 224, 204, 0.25);
    }

    &:hover,
    &:focus-visible {
      transform: rotate(0deg) translateY(-4px);
      border-color: var(--green);

      .portrait-caption span {
        color: var(--green);
      }
    }

    img {
      display: block;
      width: 100%;
      border-radius: 4px;
    }

    @media (max-width: 1080px) {
      display: none;
    }
  }

  .portrait-caption {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-top: 12px;
    padding: 0 2px;
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    letter-spacing: 0.16em;
    text-transform: uppercase;

    span {
      color: var(--light-slate);
      transition: var(--transition);
    }
  }

  .subtitle {
    margin-top: 10px;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-sm);
  }

  footer {
    margin: 60px 0 20px;
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    letter-spacing: 0.08em;

    .dot {
      display: inline-block;
      width: 7px;
      height: 7px;
      margin-right: 8px;
      border-radius: 50%;
      background: var(--green);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.3;
      }
    }
  }
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 18px;
`;

const StyledTile = styled.div`
  position: relative;
  padding: 24px 22px 20px;
  background: var(--dark-navy);
  border: 1px solid var(--lightest-navy);
  border-radius: 6px;
  box-shadow: 0 14px 28px -12px rgba(20, 8, 12, 0.75);

  /* fita adesiva segurando o cartão */
  &:before {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%) rotate(${({ $tilt }) => $tilt || '-2deg'});
    width: 54px;
    height: 16px;
    background: rgba(237, 224, 204, 0.14);
    border-left: 1px dashed rgba(237, 224, 204, 0.25);
    border-right: 1px dashed rgba(237, 224, 204, 0.25);
  }

  .value {
    color: var(--lightest-slate);
    font-size: clamp(34px, 5vw, 46px);
    font-weight: 800;
    line-height: 1;

    span {
      color: var(--green);
    }
  }

  .label {
    margin-top: 8px;
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  &.wide {
    grid-column: 1 / -1;

    @media (min-width: 700px) {
      grid-column: span 2;
    }
  }

  /* odômetro retrô do contador de visitas */
  .odometer {
    font-family: var(--font-mono);
    font-size: clamp(34px, 5vw, 46px);
    font-weight: 700;
    letter-spacing: 0.12em;
    line-height: 1;

    .zero {
      color: var(--lightest-navy);
    }

    .digit {
      color: var(--green);
    }
  }
`;

const StyledLangs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;

  .lang {
    display: grid;
    grid-template-columns: 110px 1fr 40px;
    align-items: center;
    gap: 12px;
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
    color: var(--light-slate);
  }

  .bar {
    height: 8px;
    background: var(--navy);
    border-radius: 4px;
    overflow: hidden;
  }

  .fill {
    height: 100%;
    background: var(--green);
    border-radius: 4px;
    transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .pct {
    text-align: right;
    color: var(--slate);
    font-size: var(--fz-xxs);
  }
`;

/* número que sobe até o valor real, como um placar */
const CountUp = ({ value, suffix }) => {
  const [display, setDisplay] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || value <= 0) {
      setDisplay(value);
      return undefined;
    }
    let raf;
    const start = performance.now();
    const duration = 900;
    const tick = now => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * value));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, prefersReducedMotion]);

  return (
    <span className="value">
      {display}
      <span>{suffix || '.'}</span>
    </span>
  );
};

CountUp.propTypes = {
  value: PropTypes.number.isRequired,
  suffix: PropTypes.string,
};

/* 000042 — zeros à esquerda apagados, dígitos de verdade em neon */
const Odometer = ({ value }) => {
  const padded = String(Math.max(0, value)).padStart(6, '0');
  const firstDigit = padded.search(/[1-9]/);
  return (
    <span className="odometer" aria-label={String(value)}>
      {padded.split('').map((char, i) => (
        <span key={i} className={firstDigit !== -1 && i >= firstDigit ? 'digit' : 'zero'}>
          {char}
        </span>
      ))}
    </span>
  );
};

Odometer.propTypes = {
  value: PropTypes.number.isRequired,
};

const StatsPage = ({ location }) => {
  const [stats, setStats] = useState(null);
  const [visits, setVisits] = useState(null);
  const [failed, setFailed] = useState(false);
  const revealHeader = useRef(null);
  const revealGrid = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { t, lang } = useLang();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    sr.reveal(revealHeader.current, srConfig());
    sr.reveal(revealGrid.current, srConfig(150));
  }, []);

  useEffect(() => {
    try {
      const cached = window.sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { at, data } = JSON.parse(cached);
        if (Date.now() - at < CACHE_TTL) {
          setStats(data);
          return;
        }
      }
    } catch (e) {
      /* storage indisponível, segue pro fetch */
    }

    const headers = { Accept: 'application/vnd.github+json' };
    Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USER}`, { headers }).then(r =>
        r.ok ? r.json() : null,
      ),
      fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&type=owner`, {
        headers,
      }).then(r => (r.ok ? r.json() : null)),
      fetch(
        `https://api.github.com/search/issues?q=type:pr+author:${GITHUB_USER}+-user:${GITHUB_USER}&per_page=1`,
        { headers },
      ).then(r => (r.ok ? r.json() : null)),
    ])
      .then(([user, repos, prSearch]) => {
        if (!user || !repos) {
          setFailed(true);
          return;
        }
        const own = repos.filter(repo => !repo.fork);
        const stars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
        const langCounts = {};
        own.forEach(repo => {
          if (repo.language) {
            langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
          }
        });
        const languages = Object.entries(langCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({ name, pct: Math.round((count / own.length) * 100) }));
        const lastPush = own
          .map(repo => repo.pushed_at)
          .sort()
          .pop();

        const data = {
          stars,
          followers: user.followers,
          repos: own.length,
          prs: prSearch ? prSearch.total_count : 0,
          languages,
          lastPush,
        };
        setStats(data);
        try {
          window.sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
        } catch (e) {
          /* sem storage, sem cache */
        }
      })
      .catch(() => setFailed(true));
  }, []);

  useEffect(() => {
    fetchVisitStats()
      .then(data => {
        if (data && typeof data.total === 'number') {
          setVisits(data);
        }
      })
      .catch(() => {
        /* contador fora do ar: a página segue só com o GitHub */
      });
  }, []);

  const visitorNumber = visits ? getVisitorNumber() || visits.total : null;

  const lastPushLabel = iso => {
    if (!iso) {
      return '—';
    }
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if (days <= 0) {
      return t.stats.today;
    }
    if (days === 1) {
      return t.stats.yesterday;
    }
    return t.stats.daysAgo.replace('{n}', days);
  };

  return (
    <Layout location={location}>
      <Helmet title={t.stats.pageTitle} />

      <StyledMain>
        <header ref={revealHeader}>
          <h1 className="big-heading">{t.stats.title}</h1>
          <p className="subtitle">{t.stats.subtitle}</p>
        </header>

        <div className="stats-layout" ref={revealGrid}>
          <div>
            {failed && <p className="subtitle">{t.stats.error}</p>}

            {visits && (
            <StyledGrid style={{ marginBottom: 18 }}>
              <StyledTile className="wide" $tilt="-1deg">
                <Odometer value={visitorNumber} />
                <div className="label">{t.stats.visitorNo}</div>
              </StyledTile>
              <StyledTile $tilt="2deg">
                <CountUp value={visits.today} />
                <div className="label">{t.stats.visitsToday}</div>
              </StyledTile>
              <StyledTile $tilt="-1.5deg">
                <CountUp value={visits.week} />
                <div className="label">{t.stats.visitsWeek}</div>
              </StyledTile>
            </StyledGrid>
          )}

          {stats && (
            <StyledGrid>
              <StyledTile $tilt="-2deg">
                <CountUp value={stats.prs} />
                <div className="label">{t.stats.prs}</div>
              </StyledTile>
              <StyledTile $tilt="1.5deg">
                <CountUp value={stats.repos} />
                <div className="label">{t.stats.repos}</div>
              </StyledTile>
              <StyledTile $tilt="-1deg">
                <CountUp value={stats.followers} />
                <div className="label">{t.stats.followers}</div>
              </StyledTile>
              {stats.stars > 0 && (
                <StyledTile $tilt="2deg">
                  <CountUp value={stats.stars} suffix="★" />
                  <div className="label">{t.stats.stars}</div>
                </StyledTile>
              )}

              <StyledTile className="wide" $tilt="-1.5deg">
                <div className="label" style={{ marginTop: 0 }}>
                  {t.stats.languages}
                </div>
                <StyledLangs>
                  {stats.languages.map(langItem => (
                    <div className="lang" key={langItem.name}>
                      <span>{langItem.name}</span>
                      <div className="bar">
                        <div className="fill" style={{ width: `${langItem.pct}%` }} />
                      </div>
                      <span className="pct">{langItem.pct}%</span>
                    </div>
                  ))}
                </StyledLangs>
              </StyledTile>

              <StyledTile className="wide" $tilt="1deg">
                <span className="value" style={{ fontSize: 'clamp(24px, 3vw, 32px)' }}>
                  {lastPushLabel(stats.lastPush)}
                  <span>.</span>
                </span>
                <div className="label">{t.stats.lastPush}</div>
              </StyledTile>
            </StyledGrid>
          )}
          </div>

          <aside>
            <a
              className="stats-portrait"
              href="https://github.com/MatheusMartinho"
              target="_blank"
              rel="noreferrer">
              <img src={StatsPortrait} alt="Retrato de Matheus Moura Martinho" />
              <span className="portrait-caption">
                matheus moura martinho
                <span>são paulo · br</span>
              </span>
            </a>
          </aside>
        </div>

        <footer>
          <span className="dot" aria-hidden="true" />
          {t.stats.live}
          {' · '}
          <Link to="/" className="inline-link">
            {t.stats.back}
          </Link>
        </footer>
      </StyledMain>
    </Layout>
  );
};

StatsPage.propTypes = {
  location: PropTypes.object.isRequired,
};

export default StatsPage;
