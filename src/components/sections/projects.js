import React, { useState, useEffect, useRef } from 'react';
import { Link, useStaticQuery, graphql } from 'gatsby';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { Icon } from '@components/icons';
import { usePrefersReducedMotion } from '@hooks';
import { useLang } from '@i18n/LanguageContext';

const StyledProjectsSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;

  h2 {
    font-size: clamp(24px, 5vw, var(--fz-heading));
  }

  .archive-link {
    font-family: var(--font-mono);
    font-size: var(--fz-sm);
    &:after {
      bottom: 0.1em;
    }
  }

  .projects-grid {
    ${({ theme }) => theme.mixins.resetList};
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-gap: 28px 20px;
    position: relative;
    margin-top: 50px;

    @media (max-width: 1080px) {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
  }

  .more-button {
    ${({ theme }) => theme.mixins.button};
    margin: 80px auto 0;
  }
`;

const StyledProject = styled.li`
  position: relative;
  cursor: default;

  a {
    position: relative;
    z-index: 1;
  }

  .folder {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  /* the sheet peeking out of the folder pocket */
  .paper {
    position: relative;
    z-index: 1;
    flex-grow: 1;
    margin: 0 10px -30px;
    padding: 22px 20px 52px;
    background: var(--green);
    color: var(--ink);
    border-radius: 4px 4px 0 0;
    box-shadow: 0 -2px 16px -6px rgba(20, 8, 12, 0.35);
    transition: transform 0.3s var(--easing);
    will-change: transform;
  }

  @media (prefers-reduced-motion: no-preference) {
    &:hover .paper,
    &:focus-within .paper {
      transform: translateY(-12px) rotate(-1.2deg);
    }
  }

  .project-title {
    margin: 0 0 10px;
    color: var(--ink);
    font-size: var(--fz-xl);
    line-height: 1.25;

    a {
      position: static;
      color: inherit;

      &:hover,
      &:focus-visible {
        text-decoration: underline;
        text-underline-offset: 3px;
      }

      &:before {
        content: '';
        display: block;
        position: absolute;
        z-index: 0;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
      }
    }
  }

  .project-description {
    color: rgba(23, 10, 16, 0.82);
    font-size: 15px;
    line-height: 1.45;

    p {
      margin: 0;
    }

    a {
      color: var(--ink);
      font-weight: 600;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }

  /* the folder pocket holding the sheet */
  .pocket {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 18px 18px 14px;
    background: var(--dark-navy);
    color: var(--lightest-slate);
    border: 1px solid var(--lightest-navy);
    border-radius: 6px;
    box-shadow: 0 14px 28px -12px rgba(20, 8, 12, 0.75);
    transition: var(--transition);

    /* folder tab */
    &:before {
      content: '';
      position: absolute;
      top: -14px;
      left: 14px;
      width: 96px;
      height: 14px;
      background: var(--dark-navy);
      border: 1px solid var(--lightest-navy);
      border-bottom: none;
      border-radius: 6px 6px 0 0;
    }
  }

  &:hover .pocket,
  &:focus-within .pocket {
    box-shadow: 0 20px 34px -14px rgba(20, 8, 12, 0.85);
  }

  .pocket-tab {
    position: absolute;
    top: -12px;
    left: 24px;
    z-index: 3;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .pocket-row {
    ${({ theme }) => theme.mixins.flexBetween};
    align-items: flex-end;
    gap: 12px;
  }

  .project-tech-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    padding: 0;
    margin: 0;
    list-style: none;

    li {
      color: var(--light-slate);
      font-family: var(--font-mono);
      font-size: var(--fz-xxs);
      line-height: 1.6;
      white-space: nowrap;
    }
  }

  .project-links {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    margin-right: -7px;
    color: var(--lightest-slate);

    a {
      ${({ theme }) => theme.mixins.flexCenter};
      padding: 5px 7px;

      &:hover,
      &:focus-visible {
        color: var(--green);
      }

      &.external {
        svg {
          width: 21px;
          height: 21px;
          margin-top: -4px;
        }
      }

      svg {
        width: 19px;
        height: 19px;
      }
    }
  }
`;

const Projects = () => {
  const data = useStaticQuery(graphql`
    query {
      projects: allMarkdownRemark(
        filter: {
          fileAbsolutePath: { regex: "/content/projects/" }
          frontmatter: { showInProjects: { ne: false } }
        }
        sort: { fields: [frontmatter___date], order: DESC }
      ) {
        edges {
          node {
            frontmatter {
              title
              tech
              github
              external
              description_en
            }
            html
          }
        }
      }
    }
  `);

  const [showMore, setShowMore] = useState(false);
  const revealTitle = useRef(null);
  const revealArchiveLink = useRef(null);
  const revealProjects = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { t, lang } = useLang();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealTitle.current, srConfig());
    sr.reveal(revealArchiveLink.current, srConfig());
    revealProjects.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 100)));
  }, []);

  const GRID_LIMIT = 6;
  const projects = data.projects.edges.filter(({ node }) => node);
  const firstSix = projects.slice(0, GRID_LIMIT);
  const projectsToShow = showMore ? projects : firstSix;

  const projectInner = (node, i) => {
    const { frontmatter, html } = node;
    const { github, external, title, tech, description_en } = frontmatter;

    return (
      <div className="folder">
        <div className="paper">
          <h3 className="project-title">
            <a href={external} target="_blank" rel="noreferrer">
              {title}
            </a>
          </h3>

          {lang === 'en' && description_en ? (
            <div className="project-description">
              <p>{description_en}</p>
            </div>
          ) : (
            <div className="project-description" dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </div>

        <div className="pocket">
          <span className="pocket-tab">{`CASE_${String(i + 1).padStart(2, '0')}`}</span>
          <div className="pocket-row">
            {tech && (
              <ul className="project-tech-list">
                {tech.map((techItem, j) => (
                  <li key={j}>{techItem}</li>
                ))}
              </ul>
            )}
            <div className="project-links">
              {github && (
                <a href={github} aria-label="GitHub Link" target="_blank" rel="noreferrer">
                  <Icon name="GitHub" />
                </a>
              )}
              {external && (
                <a
                  href={external}
                  aria-label="External Link"
                  className="external"
                  target="_blank"
                  rel="noreferrer">
                  <Icon name="External" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <StyledProjectsSection>
      <h2 ref={revealTitle}>{t.otherProjects.title}</h2>

      <Link className="inline-link archive-link" to="/archive" ref={revealArchiveLink}>
        {t.otherProjects.archive}
      </Link>

      <ul className="projects-grid">
        {prefersReducedMotion ? (
          <>
            {projectsToShow &&
              projectsToShow.map(({ node }, i) => (
                <StyledProject key={i}>{projectInner(node, i)}</StyledProject>
              ))}
          </>
        ) : (
          <TransitionGroup component={null}>
            {projectsToShow &&
              projectsToShow.map(({ node }, i) => (
                <CSSTransition
                  key={i}
                  classNames="fadeup"
                  timeout={i >= GRID_LIMIT ? (i - GRID_LIMIT) * 300 : 300}
                  exit={false}>
                  <StyledProject
                    key={i}
                    ref={el => (revealProjects.current[i] = el)}
                    style={{
                      transitionDelay: `${i >= GRID_LIMIT ? (i - GRID_LIMIT) * 100 : 0}ms`,
                    }}>
                    {projectInner(node, i)}
                  </StyledProject>
                </CSSTransition>
              ))}
          </TransitionGroup>
        )}
      </ul>

      <button className="more-button" onClick={() => setShowMore(!showMore)}>
        {showMore ? t.otherProjects.showLess : t.otherProjects.showMore}
      </button>
    </StyledProjectsSection>
  );
};

export default Projects;
