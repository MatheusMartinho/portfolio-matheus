import React, { useState, useEffect, useRef } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import { srConfig } from '@config';
import { KEY_CODES } from '@utils';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';
import { useLang } from '@i18n/LanguageContext';
import IkImage from '@components/ui/ik-image';

const StyledJobsSection = styled.section`
  max-width: 940px;

  .journey-note {
    margin: -20px 0 34px;
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
  }

  .inner {
    display: flex;
    gap: 40px;

    @media (max-width: 700px) {
      display: block;
    }

    // Prevent container from jumping
    @media (min-width: 700px) {
      min-height: 420px;
    }
  }
`;

const StyledEraList = styled.div`
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  width: 300px;
  flex-shrink: 0;
  border-top: 1px solid var(--lightest-navy);

  @media (max-width: 700px) {
    width: 100%;
    margin-bottom: 34px;
  }
`;

const StyledEraRow = styled.button`
  display: grid;
  grid-template-columns: 44px 1fr auto;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 17px 4px 16px 0;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--lightest-navy);
  color: ${({ isActive }) => (isActive ? 'var(--lightest-slate)' : 'var(--slate)')};
  font-family: var(--font-mono);
  text-align: left;
  cursor: pointer;
  transition: var(--transition);

  &:hover,
  &:focus-visible {
    color: var(--lightest-slate);
    background: rgba(202, 244, 56, 0.04);
  }

  &:focus-visible {
    outline: 2px solid var(--green);
    outline-offset: -2px;
  }

  .era-index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 24px;
    font-size: var(--fz-xxs);
    font-weight: 600;
    letter-spacing: 0.06em;
    color: ${({ isActive }) => (isActive ? 'var(--ink)' : 'var(--slate)')};
    background: ${({ isActive }) => (isActive ? 'var(--green)' : 'transparent')};
    border: 1px solid ${({ isActive }) => (isActive ? 'var(--green)' : 'var(--lightest-navy)')};
    transition: var(--transition);
  }

  .era-place {
    font-size: var(--fz-sm);
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .era-years {
    font-size: 10px;
    letter-spacing: 0.12em;
    color: ${({ isActive }) => (isActive ? 'var(--green)' : 'var(--slate)')};
    white-space: nowrap;
  }
`;

const StyledTabPanels = styled.div`
  position: relative;
  width: 100%;
  margin-top: 4px;
`;

const StyledTabPanel = styled.div`
  width: 100%;
  height: auto;
  padding: 10px 0 0;

  .page-grid {
    display: grid;
    grid-template-columns: 1fr 230px;
    gap: 36px;
    align-items: start;

    &.solo {
      grid-template-columns: 1fr;
    }

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }

  ul {
    padding: 0;
    margin: 0;
    list-style: none;
    font-size: var(--fz-md);

    li {
      position: relative;
      padding-left: 26px;
      margin-bottom: 12px;

      &:before {
        content: '';
        position: absolute;
        left: 0;
        top: 0.55em;
        width: 8px;
        height: 8px;
        background: var(--green);
      }
    }
  }

  h3 {
    margin-bottom: 4px;
    font-size: var(--fz-xxl);
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--lightest-slate);

    .company {
      color: var(--green);
    }
  }

  .range {
    margin-bottom: 26px;
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .era-media {
    position: relative;
    width: 100%;

    .media-frame {
      position: relative;
      border: 1px solid var(--lightest-navy);
      overflow: hidden;

      img {
        display: block;
        width: 100%;
        filter: grayscale(100%) contrast(1.05);
        transition: filter 0.35s var(--easing), transform 0.35s var(--easing);
      }

      .gatsby-image-wrapper {
        display: block;
        background: transparent !important;
      }

      &:after {
        content: '';
        position: absolute;
        inset: 0;
        background: var(--green);
        mix-blend-mode: multiply;
        opacity: 0.25;
        transition: var(--transition);
        pointer-events: none;
      }
    }

    &:hover .media-frame {
      img {
        filter: grayscale(0%) contrast(1);
        transform: scale(1.02);
      }

      &:after {
        opacity: 0;
      }
    }

    .media-caption {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 10px;
      color: var(--slate);
      font-family: var(--font-mono);
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;

      &:before {
        content: '';
        flex-shrink: 0;
        width: 7px;
        height: 7px;
        background: var(--green);
      }
    }
  }

  .era-media--artifact .media-frame {
    border: none;

    &:after {
      display: none;
    }

    img {
      filter: grayscale(100%) contrast(1.05) drop-shadow(0 14px 22px rgba(0, 0, 0, 0.5));
    }
  }

  .era-media--artifact:hover .media-frame img {
    filter: grayscale(0%) drop-shadow(0 14px 22px rgba(0, 0, 0, 0.5));
  }
`;

const cityFromLocation = location => (location || '').split(',')[0].trim().toUpperCase();

const Jobs = () => {
  const data = useStaticQuery(graphql`
    query {
      jobs: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/jobs/" } }
        sort: { fields: [frontmatter___date], order: DESC }
      ) {
        edges {
          node {
            frontmatter {
              title
              title_en
              company
              company_en
              location
              range
              url
              bullets_en
              visual_caption
              visual_caption_en
              polaroid_imagekit_id
              cover {
                childImageSharp {
                  gatsbyImageData(
                    width: 700
                    placeholder: BLURRED
                    formats: [AUTO, WEBP, AVIF]
                  )
                }
              }
            }
            html
          }
        }
      }
    }
  `);

  const jobsData = data.jobs.edges;

  const [activeTabId, setActiveTabId] = useState(0);
  const [tabFocus, setTabFocus] = useState(null);
  const tabs = useRef([]);
  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { t, lang } = useLang();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealContainer.current, srConfig());
  }, []);

  const focusTab = () => {
    if (tabs.current[tabFocus]) {
      tabs.current[tabFocus].focus();
      return;
    }
    // If we're at the end, go to the start
    if (tabFocus >= tabs.current.length) {
      setTabFocus(0);
    }
    // If we're at the start, move to the end
    if (tabFocus < 0) {
      setTabFocus(tabs.current.length - 1);
    }
  };

  // Only re-run the effect if tabFocus changes
  useEffect(() => focusTab(), [tabFocus]);

  // Focus on tabs when using up/down (or left/right) arrow keys
  const onKeyDown = e => {
    switch (e.key) {
      case KEY_CODES.ARROW_UP:
      case KEY_CODES.ARROW_LEFT: {
        e.preventDefault();
        setTabFocus(tabFocus - 1);
        break;
      }

      case KEY_CODES.ARROW_DOWN:
      case KEY_CODES.ARROW_RIGHT: {
        e.preventDefault();
        setTabFocus(tabFocus + 1);
        break;
      }

      default: {
        break;
      }
    }
  };

  return (
    <StyledJobsSection id="jobs" ref={revealContainer}>
      <h2 className="numbered-heading">{t.jobs.title}</h2>
      <p className="journey-note">{t.jobs.note}</p>

      <div className="inner">
        <StyledEraList role="tablist" aria-label="Job tabs" onKeyDown={e => onKeyDown(e)}>
          {jobsData &&
            jobsData.map(({ node }, i) => {
              const { location, range } = node.frontmatter;
              return (
                <StyledEraRow
                  key={i}
                  isActive={activeTabId === i}
                  onClick={() => setActiveTabId(i)}
                  ref={el => (tabs.current[i] = el)}
                  id={`tab-${i}`}
                  role="tab"
                  tabIndex={activeTabId === i ? '0' : '-1'}
                  aria-selected={activeTabId === i ? true : false}
                  aria-controls={`panel-${i}`}>
                  <span className="era-index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="era-place">{cityFromLocation(location)}</span>
                  <span className="era-years">{range}</span>
                </StyledEraRow>
              );
            })}
        </StyledEraList>

        <StyledTabPanels>
          {jobsData &&
            jobsData.map(({ node }, i) => {
              const { frontmatter, html } = node;
              const {
                title,
                title_en,
                url,
                company,
                company_en,
                location,
                range,
                bullets_en,
                visual_caption,
                visual_caption_en,
                polaroid_imagekit_id,
                cover,
              } = frontmatter;
              const displayTitle = lang === 'en' && title_en ? title_en : title;
              const displayCompany = lang === 'en' && company_en ? company_en : company;
              const showEnBullets = lang === 'en' && bullets_en && bullets_en.length > 0;
              const caption =
                lang === 'en' && visual_caption_en ? visual_caption_en : visual_caption;
              const artifactImage = cover ? getImage(cover) : null;
              const hasMedia = Boolean(polaroid_imagekit_id || artifactImage);

              return (
                <CSSTransition key={i} in={activeTabId === i} timeout={250} classNames="fade">
                  <StyledTabPanel
                    id={`panel-${i}`}
                    role="tabpanel"
                    tabIndex={activeTabId === i ? '0' : '-1'}
                    aria-labelledby={`tab-${i}`}
                    aria-hidden={activeTabId !== i}
                    hidden={activeTabId !== i}>
                    <div className={`page-grid${hasMedia ? '' : ' solo'}`}>
                      <div className="page-text">
                        <h3>
                          <span>{displayTitle}</span>
                          {displayCompany && displayCompany !== displayTitle && (
                            <span className="company">
                              &nbsp;@&nbsp;
                              {url ? (
                                <a href={url} className="inline-link">
                                  {displayCompany}
                                </a>
                              ) : (
                                displayCompany
                              )}
                            </span>
                          )}
                        </h3>

                        <p className="range">
                          {range} · {location}
                        </p>

                        {showEnBullets ? (
                          <ul>
                            {bullets_en.map((b, j) => (
                              <li key={j}>{b}</li>
                            ))}
                          </ul>
                        ) : (
                          <div dangerouslySetInnerHTML={{ __html: html }} />
                        )}
                      </div>

                      {hasMedia && (
                        <div
                          className={`era-media${
                            polaroid_imagekit_id ? '' : ' era-media--artifact'
                          }`}>
                          <div className="media-frame">
                            {polaroid_imagekit_id ? (
                              <IkImage
                                id={polaroid_imagekit_id}
                                alt={displayCompany || displayTitle}
                                width={480}
                                aspectRatio="4:5"
                                widths={[300, 480, 700]}
                                sizes="230px"
                              />
                            ) : (
                              <GatsbyImage image={artifactImage} alt={displayCompany || ''} />
                            )}
                          </div>
                          {caption && <span className="media-caption">{caption}</span>}
                        </div>
                      )}
                    </div>
                  </StyledTabPanel>
                </CSSTransition>
              );
            })}
        </StyledTabPanels>
      </div>
    </StyledJobsSection>
  );
};

export default Jobs;
