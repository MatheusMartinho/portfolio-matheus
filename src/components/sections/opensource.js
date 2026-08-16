import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';
import { useLang } from '@i18n/LanguageContext';

const GITHUB_USER = 'MatheusMartinho';
const CACHE_KEY = 'gh-opensource-prs-v1';
const CACHE_TTL = 60 * 60 * 1000; // 1h
const MAX_ROWS = 8;
const SEARCH_URL = `https://api.github.com/search/issues?q=type:pr+author:${GITHUB_USER}+-user:${GITHUB_USER}&sort=updated&order=desc&per_page=30`;
const ALL_PRS_URL = `https://github.com/search?q=type:pr+author:${GITHUB_USER}+-user:${GITHUB_USER}&s=updated&o=desc`;

const MONTHS = {
  pt: ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'],
  en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
};

const StyledOpenSourceSection = styled.section`
  max-width: 800px;

  .os-intro {
    margin: -10px 0 30px;
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: var(--fz-sm);
  }

  .os-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 14px 44px;
    margin: 0 0 34px;
  }

  .os-stat {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .value {
      color: var(--lightest-slate);
      font-size: clamp(26px, 4vw, 34px);
      font-weight: 700;
      line-height: 1;

      span {
        color: var(--green);
      }
    }

    .label {
      color: var(--slate);
      font-family: var(--font-mono);
      font-size: var(--fz-xxs);
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
  }

  .os-ledger {
    ${({ theme }) => theme.mixins.resetList};
  }

  .os-row {
    display: block;

    a {
      display: grid;
      grid-template-columns: 64px 38px 1fr auto;
      align-items: center;
      gap: 18px;
      padding: 15px 4px;
      border-bottom: 1.5px dashed var(--lightest-navy);
      text-decoration: none;
      transition: var(--transition);

      &:hover,
      &:focus-visible {
        background: rgba(202, 244, 56, 0.045);
        transform: translateX(4px);

        .os-title {
          color: var(--green);
        }

        .os-logo {
          filter: none;
          border-color: var(--green);
        }
      }
    }

    &:first-of-type a {
      border-top: 1.5px dashed var(--lightest-navy);
    }

    @media (max-width: 600px) {
      a {
        grid-template-columns: 38px 1fr auto;
        grid-template-areas:
          'logo meta stamp'
          'logo body stamp';
        row-gap: 4px;
      }
      .os-logo {
        grid-area: logo;
      }
      .os-date {
        grid-area: meta;
      }
      .os-main {
        grid-area: body;
      }
      .os-stamp {
        grid-area: stamp;
      }
    }
  }

  /* logo da org, colado como figurinha: sem cor até o hover */
  .os-logo {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    object-fit: cover;
    border: 1px solid var(--lightest-navy);
    background: var(--dark-navy);
    filter: grayscale(100%) contrast(1.05);
    transition: var(--transition);
  }

  .os-date {
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    letter-spacing: 0.08em;
    white-space: nowrap;
  }

  .os-repo {
    display: block;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
    margin-bottom: 3px;
  }

  .os-title {
    color: var(--lightest-slate);
    font-size: var(--fz-md);
    line-height: 1.35;
    transition: var(--transition);
  }

  /* carimbo: torto de propósito, como tinta no papel */
  .os-stamp {
    justify-self: end;
    padding: 5px 10px;
    border: 1.5px solid var(--green);
    border-radius: 3px;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.2em;
    white-space: nowrap;
    transform: rotate(-2.5deg);

    &.merged {
      background: var(--green);
      color: var(--ink);
    }
  }

  .os-footer {
    margin-top: 28px;
    font-family: var(--font-mono);
    font-size: var(--fz-sm);
  }
`;

const OpenSource = () => {
  const [prs, setPrs] = useState(null);
  const revealTitle = useRef(null);
  const revealBody = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { t, lang } = useLang();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    sr.reveal(revealTitle.current, srConfig());
    sr.reveal(revealBody.current, srConfig(100));
  }, []);

  useEffect(() => {
    const hydrate = list => setPrs(list);

    try {
      const cached = window.sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { at, list } = JSON.parse(cached);
        if (Date.now() - at < CACHE_TTL) {
          hydrate(list);
          return;
        }
      }
    } catch (e) {
      /* storage indisponível, segue pro fetch */
    }

    fetch(SEARCH_URL, { headers: { Accept: 'application/vnd.github+json' } })
      .then(res => (res.ok ? res.json() : null))
      .then(json => {
        if (!json) {
          hydrate([]);
          return;
        }
        const list = (json.items || [])
          .map(item => {
            const merged = Boolean(item.pull_request && item.pull_request.merged_at);
            return {
              id: item.id,
              repo: item.repository_url.split('/').slice(-2).join('/'),
              title: item.title,
              url: item.html_url,
              createdAt: item.created_at,
              status: merged ? 'merged' : item.state,
            };
          })
          /* PR fechado sem merge não conta história boa nem ruim: fica de fora */
          .filter(pr => pr.status !== 'closed');
        hydrate(list);
        try {
          window.sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), list }));
        } catch (e) {
          /* sem storage, sem cache */
        }
      })
      .catch(() => hydrate([]));
  }, []);

  const list = prs || [];
  const mergedCount = list.filter(pr => pr.status === 'merged').length;
  const openCount = list.filter(pr => pr.status === 'open').length;
  const projectCount = new Set(list.map(pr => pr.repo)).size;

  const formatDate = iso => {
    const d = new Date(iso);
    const month = MONTHS[lang === 'en' ? 'en' : 'pt'][d.getMonth()];
    return lang === 'en' ? `${month} ${d.getDate()}` : `${d.getDate()} ${month}`;
  };

  const pad = n => String(n).padStart(2, '0');

  return (
    <StyledOpenSourceSection id="opensource">
      <h2 className="numbered-heading" ref={revealTitle}>
        {t.openSource.title}
      </h2>

      <div ref={revealBody}>
        <p className="os-intro">{t.openSource.intro}</p>

        {list.length > 0 && (
          <div className="os-stats">
            <div className="os-stat">
              <span className="value">
                {pad(openCount)}
                <span>.</span>
              </span>
              <span className="label">{t.openSource.statsPrs}</span>
            </div>
            <div className="os-stat">
              <span className="value">
                {pad(mergedCount)}
                <span>.</span>
              </span>
              <span className="label">{t.openSource.statsMerged}</span>
            </div>
            <div className="os-stat">
              <span className="value">
                {pad(projectCount)}
                <span>.</span>
              </span>
              <span className="label">{t.openSource.statsProjects}</span>
            </div>
          </div>
        )}

        <ul className="os-ledger">
          {list.slice(0, MAX_ROWS).map(pr => (
            <li className="os-row" key={pr.id}>
              <a href={pr.url} target="_blank" rel="noreferrer">
                <span className="os-date">{formatDate(pr.createdAt)}</span>
                <img
                  className="os-logo"
                  src={`https://github.com/${pr.repo.split('/')[0]}.png?size=80`}
                  alt={pr.repo.split('/')[0]}
                  aria-hidden="true"
                  loading="lazy"
                  onError={e => {
                    e.currentTarget.style.visibility = 'hidden';
                  }}
                />
                <span className="os-main">
                  <span className="os-repo">{pr.repo}</span>
                  <span className="os-title">{pr.title}</span>
                </span>
                <span className={`os-stamp ${pr.status}`}>
                  {pr.status === 'merged' ? t.openSource.stampMerged : t.openSource.stampOpen}
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p className="os-footer">
          <a className="inline-link" href={ALL_PRS_URL} target="_blank" rel="noreferrer">
            {t.openSource.viewAll} ↗
          </a>
        </p>
      </div>
    </StyledOpenSourceSection>
  );
};

export default OpenSource;
