import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';
import { useLang } from '@i18n/LanguageContext';

const GITHUB_USER = 'MatheusMartinho';
const CACHE_KEY = 'gh-opensource-prs-v1';
const CACHE_TTL = 60 * 60 * 1000; // 1h
const MAX_FOLDERS = 8;
const SEARCH_URL = `https://api.github.com/search/issues?q=type:pr+author:${GITHUB_USER}+-user:${GITHUB_USER}&sort=updated&order=desc&per_page=30`;
const ALL_PRS_URL = `https://github.com/search?q=type:pr+author:${GITHUB_USER}+-user:${GITHUB_USER}&s=updated&o=desc`;

const MONTHS = {
  pt: ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'],
  en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
};

// Folder stack palette, top to bottom, and where each tab sits along the edge.
const PAPERS = [
  '#4a5d3f',
  '#c2b59b',
  '#f3e9d8',
  '#b7cddc',
  '#a6b58b',
  '#e0b24c',
  '#e0904a',
  '#b35a2d',
];

const GRAIN =
  'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNTYnIGhlaWdodD0nMjU2Jz48ZmlsdGVyIGlkPSdmJyB4PScwJyB5PScwJyB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJz48ZmVUdXJidWxlbmNlIHR5cGU9J2ZyYWN0YWxOb2lzZScgYmFzZUZyZXF1ZW5jeT0nMC45JyBudW1PY3RhdmVzPSczJyBzZWVkPSc1JyByZXN1bHQ9J2ZpbmUwJy8+PGZlQ29sb3JNYXRyaXggaW49J2ZpbmUwJyB0eXBlPSdzYXR1cmF0ZScgdmFsdWVzPScwJyByZXN1bHQ9J2ZpbmUxJy8+PGZlQ29tcG9uZW50VHJhbnNmZXIgaW49J2ZpbmUxJyByZXN1bHQ9J2ZpbmUnPjxmZUZ1bmNSIHR5cGU9J2xpbmVhcicgc2xvcGU9JzAuOScgaW50ZXJjZXB0PScwLjI1Jy8+PGZlRnVuY0cgdHlwZT0nbGluZWFyJyBzbG9wZT0nMC45JyBpbnRlcmNlcHQ9JzAuMjUnLz48ZmVGdW5jQiB0eXBlPSdsaW5lYXInIHNsb3BlPScwLjknIGludGVyY2VwdD0nMC4yNScvPjwvZmVDb21wb25lbnRUcmFuc2Zlcj48ZmVUdXJidWxlbmNlIHR5cGU9J2ZyYWN0YWxOb2lzZScgYmFzZUZyZXF1ZW5jeT0nMC41NScgbnVtT2N0YXZlcz0nMScgc2VlZD0nOScgcmVzdWx0PSdzcDAnLz48ZmVDb2xvck1hdHJpeCBpbj0nc3AwJyB0eXBlPSdzYXR1cmF0ZScgdmFsdWVzPScwJyByZXN1bHQ9J3NwMScvPjxmZUNvbXBvbmVudFRyYW5zZmVyIGluPSdzcDEnIHJlc3VsdD0nc3BlY2tzJz48ZmVGdW5jUiB0eXBlPSd0YWJsZScgdGFibGVWYWx1ZXM9JzEgMSAxIDEgMSAxIDEgMSAxIDAuMzUnLz48ZmVGdW5jRyB0eXBlPSd0YWJsZScgdGFibGVWYWx1ZXM9JzEgMSAxIDEgMSAxIDEgMSAxIDAuMzUnLz48ZmVGdW5jQiB0eXBlPSd0YWJsZScgdGFibGVWYWx1ZXM9JzEgMSAxIDEgMSAxIDEgMSAxIDAuMzUnLz48L2ZlQ29tcG9uZW50VHJhbnNmZXI+PGZlQmxlbmQgaW49J2ZpbmUnIGluMj0nc3BlY2tzJyBtb2RlPSdtdWx0aXBseScgcmVzdWx0PSdvdXQnLz48ZmVDb21wb25lbnRUcmFuc2ZlciBpbj0nb3V0Jz48ZmVGdW5jQSB0eXBlPSd0YWJsZScgdGFibGVWYWx1ZXM9JzEgMScvPjwvZmVDb21wb25lbnRUcmFuc2Zlcj48L2ZpbHRlcj48cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWx0ZXI9J3VybCgjZiknLz48L3N2Zz4=)';

// Relative luminance of a #rrggbb colour, to pick dark or light ink for the paper.
const luminance = hex => {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
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
    margin: 0 0 40px;
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

  .os-folders {
    position: relative;
    padding-top: 34px; /* room for the first tab */
    max-width: 640px;
  }

  .os-footer {
    margin-top: 36px;
    font-family: var(--font-mono);
    font-size: var(--fz-sm);
  }
`;

const StyledFolder = styled.div`
  --paper: #c2b59b;
  --ink: #2b1d14;
  --rule: rgba(0, 0, 0, 0.22);

  position: relative;
  z-index: var(--z, 1);
  border-radius: 6px 6px 4px 4px;
  background: var(--paper);
  color: var(--ink);
  /* the folder in front throws a soft shadow up onto the one behind it */
  box-shadow: 0 -14px 26px -12px rgba(20, 8, 12, 0.55), 0 2px 0 rgba(0, 0, 0, 0.08);
  transition: transform 0.25s var(--easing);

  /* kraft paper: fine even grain with sparse dark specks, multiplied into the colour;
     a faint second pass, offset, keeps the tile from reading as a repeat */
  &:before,
  &:after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: ${GRAIN};
    background-size: 256px 256px;
    pointer-events: none;
    mix-blend-mode: multiply;
  }
  &:before {
    opacity: 0.6;
  }
  &:after {
    opacity: 0.18;
    background-position: 113px 71px;
  }

  &:last-of-type .folder-toggle {
    min-height: 150px;
  }

  &:hover .folder-tab,
  &.is-open .folder-tab {
    transform: translateY(-3px);
  }

  /* ---- tab + the visible strip of paper, together the clickable header ---- */
  .folder-toggle,
  .folder-content {
    position: relative;
    z-index: 1;
  }

  .folder-toggle {
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    width: 100%;
    min-height: 66px;
    padding: 12px 22px 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;

    &:focus-visible {
      outline: none;

      .folder-tab {
        box-shadow: 0 0 0 2px var(--green);
      }
    }
  }

  /* tabs alternate sides down the stack, like a real drawer */
  .folder-tab {
    position: absolute;
    top: -30px;
    left: 5%;
    right: auto;
    display: flex;
    align-items: center;
    gap: 10px;
    height: 32px;
    max-width: 58%;
    padding: 0 18px;
    border-radius: 10px 10px 0 0;
    background: var(--paper);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    white-space: nowrap;
    background-image: ${GRAIN};
    background-size: 256px 256px;
    background-blend-mode: multiply;
    transition: transform 0.25s var(--easing);

    /* concave shoulders where the tab meets the folder edge */
    &:before,
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      width: 12px;
      height: 12px;
    }
    &:before {
      left: -12px;
      background: radial-gradient(circle at 0 0, transparent 12px, var(--paper) 12.5px);
    }
    &:after {
      right: -12px;
      background: radial-gradient(circle at 100% 0, transparent 12px, var(--paper) 12.5px);
    }

    .tab-label {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tab-count {
      flex-shrink: 0;
      opacity: 0.7;
      font-weight: 400;
    }

    /* narrow screens: hug the edge and allow more of the repo name */
    @media (max-width: 600px) {
      left: 3%;
      max-width: 80%;
      padding: 0 12px;
      font-size: 10px;
      letter-spacing: 0.08em;
    }
  }

  &.tab-right .folder-tab {
    left: auto;
    right: 5%;

    @media (max-width: 600px) {
      left: auto;
      right: 3%;
    }
  }

  .folder-peek {
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    letter-spacing: 0.08em;
    opacity: 0.65;
  }

  /* ---- contents, revealed by growing a grid row ---- */
  .folder-content {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.4s var(--easing);

    & > div {
      overflow: hidden;
    }
  }

  &.is-open .folder-content {
    grid-template-rows: 1fr;
  }

  .folder-inner {
    padding: 4px 22px 30px;
  }

  .folder-head {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--rule);

    img {
      width: 28px;
      height: 28px;
      border-radius: 7px;
      object-fit: cover;
      filter: grayscale(100%) contrast(1.05);
      opacity: 0.9;
    }

    a {
      color: inherit;
      font-family: var(--font-mono);
      font-size: var(--fz-xs);
      text-decoration: underline;
      text-decoration-color: var(--rule);
      text-underline-offset: 3px;

      &:hover,
      &:focus-visible {
        text-decoration-color: currentColor;
      }
    }

    .folder-meta {
      margin-left: auto;
      font-family: var(--font-mono);
      font-size: var(--fz-xxs);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.7;
      white-space: nowrap;
    }

    @media (max-width: 600px) {
      flex-wrap: wrap;

      .folder-meta {
        flex-basis: 100%;
        margin-left: 0;
      }
    }
  }

  .pr-list {
    ${({ theme }) => theme.mixins.resetList};
  }

  .pr-row a {
    display: grid;
    grid-template-columns: 56px 1fr auto;
    align-items: center;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px dashed var(--rule);
    color: inherit;
    text-decoration: none;
    transition: var(--transition);

    &:hover,
    &:focus-visible {
      transform: translateX(4px);

      .pr-title {
        text-decoration: underline;
        text-underline-offset: 3px;
      }
    }

    @media (max-width: 600px) {
      grid-template-columns: 1fr auto;
      grid-template-areas:
        'date stamp'
        'title stamp';
      row-gap: 3px;

      .pr-date {
        grid-area: date;
      }
      .pr-title {
        grid-area: title;
      }
      .pr-stamp {
        grid-area: stamp;
      }
    }
  }

  .pr-date {
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    letter-spacing: 0.08em;
    opacity: 0.7;
    white-space: nowrap;
  }

  .pr-title {
    font-size: var(--fz-md);
    line-height: 1.35;
  }

  /* stamp: ink on paper, a touch crooked */
  .pr-stamp {
    justify-self: end;
    padding: 4px 9px;
    border: 1.5px solid currentColor;
    border-radius: 3px;
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.2em;
    white-space: nowrap;
    transform: rotate(-2.5deg);

    &.merged {
      background: var(--ink);
      color: var(--paper);
    }
  }
`;

const OpenSource = () => {
  const [prs, setPrs] = useState(null);
  const [openRepo, setOpenRepo] = useState(null);
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

  // one folder per repository, most recently touched first
  const folders = [];
  list.forEach(pr => {
    let folder = folders.find(f => f.repo === pr.repo);
    if (!folder) {
      folder = { repo: pr.repo, prs: [] };
      folders.push(folder);
    }
    folder.prs.push(pr);
  });
  const shown = folders.slice(0, MAX_FOLDERS);

  // first folder starts open so the section has something to read on arrival
  const activeRepo = openRepo === null && shown.length ? shown[0].repo : openRepo;

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
                {pad(folders.length)}
                <span>.</span>
              </span>
              <span className="label">{t.openSource.statsProjects}</span>
            </div>
          </div>
        )}

        <div className="os-folders">
          {shown.map((folder, i) => {
            const paper = PAPERS[i % PAPERS.length];
            const dark = luminance(paper) < 0.35;
            const isOpen = activeRepo === folder.repo;
            const owner = folder.repo.split('/')[0];
            const merged = folder.prs.filter(pr => pr.status === 'merged').length;
            const panelId = `os-folder-${i}`;

            return (
              <StyledFolder
                key={folder.repo}
                className={[isOpen ? 'is-open' : '', i % 2 ? 'tab-right' : ''].join(' ').trim()}
                style={{
                  '--paper': paper,
                  '--ink': dark ? '#f4ecdc' : '#2b1d14',
                  '--rule': dark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.22)',
                  '--z': i + 1,
                }}>
                <button
                  type="button"
                  className="folder-toggle"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenRepo(isOpen ? '' : folder.repo)}>
                  <span className="folder-tab">
                    <span className="tab-label">{folder.repo}</span>
                    <span className="tab-count">{pad(folder.prs.length)}</span>
                  </span>
                  {!isOpen && (
                    <span className="folder-peek">
                      {folder.prs.length} {t.openSource.prs} · {merged} merged
                    </span>
                  )}
                </button>

                <div className="folder-content" id={panelId}>
                  <div>
                    <div className="folder-inner">
                      <div className="folder-head">
                        <img
                          src={`https://github.com/${owner}.png?size=80`}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                          onError={e => {
                            e.currentTarget.style.visibility = 'hidden';
                          }}
                        />
                        <a
                          href={`https://github.com/${folder.repo}`}
                          target="_blank"
                          rel="noreferrer">
                          {folder.repo} ↗
                        </a>
                        <span className="folder-meta">
                          {merged} merged · {folder.prs.length - merged}{' '}
                          {t.openSource.stampOpen.toLowerCase()}
                        </span>
                      </div>

                      <ul className="pr-list">
                        {folder.prs.map(pr => (
                          <li className="pr-row" key={pr.id}>
                            <a href={pr.url} target="_blank" rel="noreferrer">
                              <span className="pr-date">{formatDate(pr.createdAt)}</span>
                              <span className="pr-title">{pr.title}</span>
                              <span className={`pr-stamp ${pr.status}`}>
                                {pr.status === 'merged'
                                  ? t.openSource.stampMerged
                                  : t.openSource.stampOpen}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </StyledFolder>
            );
          })}
        </div>

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
