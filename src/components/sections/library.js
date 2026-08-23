import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import styled, { keyframes } from 'styled-components';
import sr from '@utils/sr';
import { srConfig, socialMedia } from '@config';
import { usePrefersReducedMotion } from '@hooks';
import { useLang } from '@i18n/LanguageContext';
import BookStack3D, { thickness } from './book-stack-3d';
import BookDetail from './book-detail';

const IK_BASE = 'https://ik.imagekit.io/vyubbj0pxl';

// Distance (px) from the top of the viewport where the virtual camera sits.
// Books further down the viewport are seen more from above, revealing their cover.
const CAMERA_TOP = 100;

const STATUS_RANK = { reading: 0, want: 1, read: 2 };

const SPINE_PALETTE = [
  ['#d8c58f', '#2d2b6a'],
  ['#3a4f63', '#e8dcc3'],
  ['#b84a3a', '#f4e6cf'],
  ['#1f5c4a', '#e8dcc3'],
  ['#e4d9c5', '#2a151e'],
  ['#5a3d7a', '#efe4d2'],
];

const coverSrc = (fm, width = 600) => {
  if (fm.cover_imagekit_id) {
    return `${IK_BASE}/tr:f-auto,q-85,w-${width}/${fm.cover_imagekit_id.replace(/^\/+/, '')}`;
  }
  if (fm.cover_url) {
    return fm.cover_url;
  }
  if (fm.isbn) {
    return `https://covers.openlibrary.org/b/isbn/${fm.isbn}-L.jpg`;
  }
  return null;
};

const hideBrokenImage = e => {
  e.currentTarget.style.display = 'none';
};

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 var(--green-tint); }
  70% { box-shadow: 0 0 0 8px rgba(202, 244, 56, 0); }
  100% { box-shadow: 0 0 0 0 rgba(202, 244, 56, 0); }
`;

const StyledLibrarySection = styled.section`
  max-width: 1000px;

  .library-intro {
    max-width: 560px;
    margin: -10px 0 0;
    color: var(--light-slate);
    font-size: var(--fz-lg);
  }

  .library-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 60px;
    align-items: start;
    margin-top: 50px;

    /* single column: the cover of the first book projects upwards, so leave room under the panel */
    @media (max-width: 900px) {
      grid-template-columns: 1fr;
      gap: 84px;
    }
  }

  .library-cta {
    display: flex;
    justify-content: center;
    margin-top: 70px;

    @media (max-width: 768px) {
      margin-top: 50px;
    }
  }

  .cta-button {
    ${({ theme }) => theme.mixins.bigButton};
  }
`;

const StyledStack = styled.div`
  --stack-w: 640px; /* overwritten by JS with the real width */
  --d: calc(var(--stack-w) * 0.64); /* book depth (cover short side) */
  --cam-y: 0px; /* camera position, updated on scroll */
  --h-scale: 1;
  --gap: 64px;

  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  padding: 40px 0 10px;
  perspective: 1800px;
  perspective-origin: 50% var(--cam-y);
  /* siblings must share one 3D context so a spine hides the cover of the book below it */
  transform-style: preserve-3d;

  @media (max-width: 480px) {
    --h-scale: 0.78;
    --gap: 44px;
  }
`;

// Fine paper/cloth grain, layered over spine and cover so flat colours read as material.
const GRAIN =
  'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxODAnIGhlaWdodD0nMTgwJz48ZmlsdGVyIGlkPSduJz48ZmVUdXJidWxlbmNlIHR5cGU9J2ZyYWN0YWxOb2lzZScgYmFzZUZyZXF1ZW5jeT0nMC45JyBudW1PY3RhdmVzPScyJyBzdGl0Y2hUaWxlcz0nc3RpdGNoJy8+PGZlQ29sb3JNYXRyaXggdmFsdWVzPScwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwLjIyIDAnLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWx0ZXI9J3VybCgjbiknLz48L3N2Zz4=)';

// Small "publisher" monogram at the end of every spine.
const SpineMark = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10.4" stroke="currentColor" strokeWidth="1.3" />
    <text
      x="12"
      y="16.3"
      textAnchor="middle"
      fontFamily="Newsreader, Georgia, serif"
      fontSize="12.5"
      fontWeight="500"
      fill="currentColor">
      M
    </text>
  </svg>
);

const StyledBook = styled.div`
  --h: 60px;
  --spine: #d8c58f;
  --spine-text: #2d2b6a;

  position: relative;
  height: calc(var(--h) * var(--h-scale));
  transform-style: preserve-3d;
  transform: translateZ(0);
  transition: transform 0.5s var(--easing);
  cursor: pointer;
  outline: none;

  &:hover,
  &:focus-visible,
  &.is-active {
    transform: translateZ(36px);
  }

  &:focus-visible .face-spine {
    outline: 2px solid var(--green);
    outline-offset: 3px;
  }

  .face {
    position: absolute;
    left: 0;
    width: 100%;
    backface-visibility: hidden;
    /* smooths the jagged edges Chrome leaves on 3D-transformed planes */
    outline: 1px solid transparent;
  }

  /* ---- spine (front) ---- */
  .face-spine {
    top: 0;
    left: 2px;
    right: 2px;
    width: auto;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 0 4%;
    color: var(--spine-text);
    background: linear-gradient(
        90deg,
        rgba(0, 0, 0, 0.2) 0%,
        rgba(0, 0, 0, 0) 5%,
        rgba(0, 0, 0, 0) 95%,
        rgba(0, 0, 0, 0.2) 100%
      ),
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.24) 0%,
        rgba(255, 255, 255, 0.06) 18%,
        rgba(255, 255, 255, 0) 45%,
        rgba(0, 0, 0, 0.08) 78%,
        rgba(0, 0, 0, 0.3) 100%
      ),
      var(--spine);
    /* board edge highlight, hinge groove, bottom edge and the shadow it throws down */
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 3px 0 rgba(0, 0, 0, 0.1),
      inset 0 -1px 0 rgba(0, 0, 0, 0.5), 0 34px 44px -20px rgba(0, 0, 0, 0.8);
    overflow: hidden;

    &:before {
      content: '';
      position: absolute;
      inset: 0;
      background: ${GRAIN},
        repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.035) 0 1px, transparent 1px 3px),
        repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.035) 0 1px, transparent 1px 3px);
      mix-blend-mode: overlay;
      pointer-events: none;
    }
  }

  .spine-author {
    flex: 0 1 auto;
    max-width: 26%;
    font-family: var(--font-sans);
    font-size: 10.5px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: 0.9;

    @media (max-width: 640px) {
      display: none;
    }
  }

  .spine-title {
    flex: 1 1 auto;
    min-width: 0;
    text-align: center;
    font-family: var(--font-serif);
    font-size: clamp(15px, 2.7vw, 23px);
    font-weight: 500;
    letter-spacing: -0.005em;
    line-height: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .spine-year {
    flex: 0 0 auto;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    opacity: 0.75;

    @media (max-width: 640px) {
      display: none;
    }
  }

  .spine-mark {
    flex: 0 0 auto;
    width: 19px;
    height: 19px;
    opacity: 0.8;

    /* the global "svg { fill: currentColor }" would fill the ring */
    svg {
      width: 100%;
      height: 100%;
      fill: none;
    }

    text {
      fill: currentColor;
    }
  }

  .spine-badge {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 7px;
    border: 1px solid currentColor;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;

    &:before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--green);
    }

    @media (max-width: 480px) {
      padding: 4px;
      font-size: 0;
      gap: 0;
    }
  }

  /* ---- cover (top), lying flat and receding into the screen ---- */
  .face-top {
    top: calc(-1 * var(--d));
    height: var(--d);
    transform-origin: 50% 100%;
    transform: rotateX(90deg);
    background: var(--spine);
    overflow: hidden;

    img {
      position: absolute;
      top: 50%;
      left: 50%;
      width: var(--d);
      height: var(--stack-w);
      object-fit: cover;
      transform: translate(-50%, -50%) rotate(-90deg);
    }

    /* ambient occlusion towards the far edge + grain + bright board edge at the front */
    &:after {
      content: '';
      position: absolute;
      inset: 0;
      background: ${GRAIN},
        linear-gradient(
          180deg,
          rgba(20, 8, 12, 0.75) 0%,
          rgba(20, 8, 12, 0.25) 45%,
          rgba(20, 8, 12, 0.08) 100%
        );
      box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.55), inset 0 -3px 0 rgba(0, 0, 0, 0.12);
      pointer-events: none;
    }
  }

  .face-bottom {
    bottom: calc(-1 * var(--d));
    height: var(--d);
    transform-origin: 50% 0;
    transform: rotateX(-90deg);
    background: #1a0c11;
  }
`;

const StyledPanel = styled.aside`
  position: sticky;
  top: 110px;

  @media (max-width: 900px) {
    position: static;
    order: -1;
  }

  .panel-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 22px;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    letter-spacing: 0.12em;
    text-transform: uppercase;

    &.is-reading:before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--green);
      animation: ${pulse} 2s infinite;
    }
  }

  .panel-body {
    @media (max-width: 900px) {
      display: grid;
      grid-template-columns: 110px minmax(0, 1fr);
      gap: 24px;
      align-items: start;
    }
  }

  .panel-cover {
    width: 130px;
    aspect-ratio: 2 / 3;
    border-radius: 3px;
    overflow: hidden;
    background: var(--spine);
    ${({ theme }) => theme.mixins.boxShadow};

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    @media (max-width: 900px) {
      width: 110px;
    }
  }

  .panel-title {
    margin: 22px 0 4px;
    color: var(--lightest-slate);
    font-size: var(--fz-xxl);
    line-height: 1.2;

    @media (max-width: 900px) {
      margin-top: 0;
    }
  }

  .panel-author {
    margin: 0;
    color: var(--light-slate);
    font-size: var(--fz-md);
  }

  .panel-meta {
    margin-top: 12px;
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    letter-spacing: 0.04em;
  }

  .panel-progress {
    margin-top: 18px;

    .bar {
      height: 4px;
      border-radius: 999px;
      background: var(--lightest-navy);
      overflow: hidden;
    }

    .fill {
      height: 100%;
      background: var(--green);
      transition: width 0.6s var(--easing);
    }

    .pct {
      display: block;
      margin-top: 8px;
      color: var(--green);
      font-family: var(--font-mono);
      font-size: var(--fz-xxs);
    }
  }

  .panel-note {
    margin-top: 18px;
    color: var(--light-slate);
    font-size: var(--fz-sm);
    line-height: 1.6;

    p {
      margin: 0 0 10px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .panel-open {
    ${({ theme }) => theme.mixins.smallButton};
    display: inline-block;
    margin-top: 22px;
  }

  .panel-link {
    ${({ theme }) => theme.mixins.inlineLink};
    display: inline-block;
    margin-top: 16px;
    margin-left: 18px;
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
  }
`;

const Library = () => {
  const data = useStaticQuery(graphql`
    {
      library: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/library/" } }
        sort: { fields: [frontmatter___order], order: ASC }
      ) {
        edges {
          node {
            id
            html
            frontmatter {
              title
              author
              year
              status
              progress
              pages
              isbn
              cover_url
              cover_imagekit_id
              spine
              spine_text
              url
              note_en
            }
          }
        }
      }
    }
  `);

  const { t, lang } = useLang();
  const prefersReducedMotion = usePrefersReducedMotion();
  const revealTitle = useRef(null);
  const revealIntro = useRef(null);
  const revealGrid = useRef(null);
  const revealCta = useRef(null);
  const stackRef = useRef(null);

  // Reading first, then the queue, then everything already read; `order` breaks ties.
  const books = useMemo(
    () =>
      data.library.edges
        .map(({ node }, i) => {
          const fm = node.frontmatter;
          const [paletteSpine, paletteText] = SPINE_PALETTE[i % SPINE_PALETTE.length];
          return {
            id: node.id,
            html: node.html,
            ...fm,
            status: fm.status || 'read',
            spine: fm.spine || paletteSpine,
            spineText: fm.spine_text || paletteText,
            cover: coverSrc(fm),
            coverLarge: coverSrc(fm, 1400),
          };
        })
        .sort((a, b) => (STATUS_RANK[a.status] ?? 3) - (STATUS_RANK[b.status] ?? 3)),
    [data],
  );

  const [active, setActive] = useState(0);
  // null = still detecting, false = no WebGL -> CSS fallback stack
  const [webgl, setWebgl] = useState(null);
  const [open, setOpen] = useState(null); // index of the book in the detail view
  const current = books[active] || books[0];

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    sr.reveal(revealTitle.current, srConfig());
    sr.reveal(revealIntro.current, srConfig(100));
    sr.reveal(revealGrid.current, srConfig(200));
    sr.reveal(revealCta.current, srConfig(300));
  }, []);

  // Keeps --stack-w in sync with the real width (needed for translateZ maths)
  // and moves the perspective origin so it tracks a fixed point on the viewport.
  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) {
      return undefined;
    }

    const setWidth = () => stack.style.setProperty('--stack-w', `${stack.clientWidth}px`);
    setWidth();

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(setWidth) : null;
    if (ro) {
      ro.observe(stack);
    } else {
      window.addEventListener('resize', setWidth);
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const { top, height } = stack.getBoundingClientRect();
      const camY = Math.min(Math.max(CAMERA_TOP - top, -120), height * 0.6);
      stack.style.setProperty('--cam-y', `${Math.round(camY)}px`);
    };
    const request = () => {
      if (!raf) {
        raf = requestAnimationFrame(update);
      }
    };

    if (!prefersReducedMotion) {
      update();
      window.addEventListener('scroll', request, { passive: true });
      window.addEventListener('resize', request);
    }

    return () => {
      cancelAnimationFrame(raf);
      if (ro) {
        ro.disconnect();
      } else {
        window.removeEventListener('resize', setWidth);
      }
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    };
  }, [prefersReducedMotion, webgl]);

  if (!books.length) {
    return null;
  }

  const skoob = socialMedia.find(s => s.name === 'Skoob');
  const statusLabel = book => t.library.status[book.status] || t.library.status.read;
  const note = book => (lang === 'en' && book.note_en ? `<p>${book.note_en}</p>` : book.html);

  return (
    <StyledLibrarySection id="library">
      <h2 className="numbered-heading" ref={revealTitle}>
        {t.library.title}
      </h2>
      <p className="library-intro" ref={revealIntro}>
        {t.library.intro}
      </p>

      <div className="library-grid" ref={revealGrid}>
        {webgl === false ? (
          <StyledStack ref={stackRef}>
            {books.map((book, i) => (
              <StyledBook
                key={book.id}
                role="button"
                tabIndex={0}
                aria-pressed={active === i}
                aria-label={`${book.title} — ${book.author}`}
                className={active === i ? 'is-active' : ''}
                style={{
                  '--h': `${thickness(book.pages)}px`,
                  '--spine': book.spine,
                  '--spine-text': book.spineText,
                }}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setOpen(i)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setOpen(i);
                  }
                }}>
                <div className="face face-top">
                  {book.coverLarge && (
                    <img src={book.coverLarge} alt="" loading="lazy" onError={hideBrokenImage} />
                  )}
                </div>
                <div className="face face-spine">
                  <span className="spine-author">{book.author}</span>
                  <span className="spine-title">{book.title}</span>
                  {book.status === 'reading' ? (
                    <span className="spine-badge">{t.library.status.reading}</span>
                  ) : (
                    book.year && <span className="spine-year">{book.year}</span>
                  )}
                  <span className="spine-mark" aria-hidden="true">
                    <SpineMark />
                  </span>
                </div>
                <div className="face face-bottom" />
              </StyledBook>
            ))}
          </StyledStack>
        ) : (
          <BookStack3D
            books={books}
            active={active}
            onSelect={setActive}
            onOpen={i => {
              setActive(i);
              setOpen(i);
            }}
            readingLabel={t.library.status.reading}
            reducedMotion={prefersReducedMotion}
            onUnsupported={() => setWebgl(false)}
          />
        )}

        <StyledPanel aria-live="polite">
          <div className={`panel-label ${current.status === 'reading' ? 'is-reading' : ''}`}>
            {statusLabel(current)}
          </div>
          <div className="panel-body">
            <div className="panel-cover" style={{ '--spine': current.spine }}>
              {current.cover && (
                <img src={current.cover} alt={current.title} onError={hideBrokenImage} />
              )}
            </div>
            <div>
              <h3 className="panel-title">{current.title}</h3>
              <p className="panel-author">{current.author}</p>
              {current.status === 'reading' && Number.isFinite(current.progress) ? (
                <div className="panel-progress">
                  <div className="bar">
                    <div className="fill" style={{ width: `${current.progress}%` }} />
                  </div>
                  <span className="pct">{t.library.progress.replace('{n}', current.progress)}</span>
                </div>
              ) : (
                (current.year || current.pages) && (
                  <div className="panel-meta">
                    {[current.year, current.pages && `${current.pages} ${t.library.pages}`]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                )
              )}
              {note(current) && (
                <div className="panel-note" dangerouslySetInnerHTML={{ __html: note(current) }} />
              )}
              <button type="button" className="panel-open" onClick={() => setOpen(active)}>
                {t.library.open} →
              </button>
              {current.url && (
                <a
                  className="panel-link"
                  href={current.url}
                  target="_blank"
                  rel="noopener noreferrer">
                  {t.library.link} ↗
                </a>
              )}
            </div>
          </div>
        </StyledPanel>
      </div>

      {open !== null && books[open] && (
        <BookDetail
          book={books[open]}
          labels={t.library}
          noteHtml={note(books[open])}
          blurb={(note(books[open]) || '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()}
          site="matheusmartinho.dev"
          skoobUrl={skoob ? skoob.url : null}
          reducedMotion={prefersReducedMotion}
          onClose={() => setOpen(null)}
        />
      )}

      {skoob && (
        <div className="library-cta" ref={revealCta}>
          <a className="cta-button" href={skoob.url} target="_blank" rel="noopener noreferrer">
            {t.library.cta}
          </a>
        </div>
      )}
    </StyledLibrarySection>
  );
};

export default Library;
