import React, { useEffect, useRef } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import styled from 'styled-components';
import sr from '@utils/sr';
import { srConfig } from '@config';
import { Icon } from '@components/icons';
import Iphone from '@components/ui/iphone';
import Browser from '@components/ui/browser';
import { usePrefersReducedMotion } from '@hooks';
import { useLang } from '@i18n/LanguageContext';

const StyledProjectsGrid = styled.ul`
  ${({ theme }) => theme.mixins.resetList};

  a {
    position: relative;
    z-index: 1;
  }
`;

const StyledProject = styled.li`
  position: relative;
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(12, 1fr);
  align-items: center;

  @media (max-width: 768px) {
    ${({ theme }) => theme.mixins.boxShadow};
  }

  &:not(:last-of-type) {
    margin-bottom: 100px;

    @media (max-width: 768px) {
      margin-bottom: 70px;
    }

    @media (max-width: 480px) {
      margin-bottom: 30px;
    }
  }

  &:nth-of-type(odd) {
    .project-content {
      grid-column: 7 / -1;
      text-align: right;

      @media (max-width: 1080px) {
        grid-column: 5 / -1;
      }
      @media (max-width: 768px) {
        grid-column: 1 / -1;
        padding: 40px 40px 30px;
        text-align: left;
      }
      @media (max-width: 480px) {
        padding: 25px 25px 20px;
      }
    }
    .project-tech-list {
      justify-content: flex-end;

      @media (max-width: 768px) {
        justify-content: flex-start;
      }

      li {
        margin: 0 0 5px 20px;

        @media (max-width: 768px) {
          margin: 0 10px 5px 0;
        }
      }
    }
    .project-links {
      justify-content: flex-end;
      margin-left: 0;
      margin-right: -10px;

      @media (max-width: 768px) {
        justify-content: flex-start;
        margin-left: -10px;
        margin-right: 0;
      }
    }
    .project-image {
      grid-column: 1 / 8;

      @media (max-width: 768px) {
        grid-column: 1 / -1;
      }
    }
  }

  .project-content {
    position: relative;
    grid-column: 1 / 7;
    grid-row: 1 / -1;

    @media (max-width: 1080px) {
      grid-column: 1 / 9;
    }

    @media (max-width: 768px) {
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 100%;
      grid-column: 1 / -1;
      padding: 40px 40px 30px;
      z-index: 5;
    }

    @media (max-width: 480px) {
      padding: 30px 25px 20px;
    }
  }

  .project-overline {
    margin: 10px 0;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
    font-weight: 400;
  }

  .project-title {
    color: var(--lightest-slate);
    font-size: clamp(24px, 5vw, 28px);

    @media (min-width: 768px) {
      margin: 0 0 20px;
    }

    @media (max-width: 768px) {
      color: var(--white);

      a {
        position: static;

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
  }

  /* solid statement card, black-on-green */
  .project-description {
    position: relative;
    z-index: 2;
    padding: 0;
    background: var(--green);
    border-radius: 6px;
    color: var(--ink);
    font-size: var(--fz-md);
    text-align: left;
    box-shadow: 8px 8px 0 0 rgba(10, 4, 8, 0.55);
    transition: var(--transition);

    &:hover {
      transform: translate(-2px, -2px);
      box-shadow: 12px 12px 0 0 rgba(10, 4, 8, 0.6);
    }

    a {
      display: inline-block;
      color: var(--ink);
      font-weight: 600;
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    strong {
      color: var(--ink);
      font-weight: 600;
    }
  }

  .case-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 11px 18px;
    border-bottom: 1.5px solid rgba(23, 10, 16, 0.3);
    color: var(--ink);
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.22em;
    white-space: nowrap;
  }

  .case-star {
    letter-spacing: 0;
  }

  .case-body {
    padding: 17px 18px 19px;
    line-height: 1.45;

    p {
      margin: 0;
    }
  }

  @media (max-width: 480px) {
    .case-head {
      padding: 9px 14px;
      letter-spacing: 0.14em;
    }

    .case-body {
      padding: 14px 14px 16px;
    }
  }

  .project-tech-list {
    display: flex;
    flex-wrap: wrap;
    position: relative;
    z-index: 2;
    margin: 25px 0 10px;
    padding: 0;
    list-style: none;

    li {
      margin: 0 20px 5px 0;
      color: var(--light-slate);
      font-family: var(--font-mono);
      font-size: var(--fz-xs);
      white-space: nowrap;
    }

    @media (max-width: 768px) {
      margin: 10px 0;

      li {
        margin: 0 10px 5px 0;
        color: var(--lightest-slate);
      }
    }
  }

  .project-store-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;

    @media (max-width: 768px) {
      justify-content: flex-start !important;
    }
  }

  .store-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border: 1px solid var(--lightest-navy);
    border-radius: 999px;
    background: var(--light-navy);
    color: var(--lightest-slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
    line-height: 1;
    white-space: nowrap;
    transition: var(--transition);
    text-decoration: none !important;

    svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }

    &:hover {
      border-color: var(--green);
      color: var(--green);
      transform: translateY(-2px);
    }
  }

  .store-note {
    margin: 10px 0 0;
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    line-height: 1.4;
  }

  &:nth-of-type(odd) {
    .project-store-badges {
      justify-content: flex-end;
    }
    .store-note {
      text-align: right;
    }
  }

  .project-links {
    display: flex;
    align-items: center;
    position: relative;
    margin-top: 10px;
    margin-left: -10px;
    color: var(--lightest-slate);

    a {
      ${({ theme }) => theme.mixins.flexCenter};
      padding: 10px;

      &.external {
        svg {
          width: 22px;
          height: 22px;
          margin-top: -4px;
        }
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }

    .cta {
      ${({ theme }) => theme.mixins.smallButton};
      margin: 10px;
    }
  }

  .project-image {
    ${({ theme }) => theme.mixins.boxShadow};
    grid-column: 6 / -1;
    grid-row: 1 / -1;
    position: relative;
    z-index: 1;

    @media (max-width: 768px) {
      grid-column: 1 / -1;
      height: 100%;
      opacity: 0.25;
    }

    a {
      width: 100%;
      height: 100%;
      background-color: var(--green);
      border-radius: var(--border-radius);
      vertical-align: middle;

      &:hover,
      &:focus {
        background: transparent;
        outline: 0;

        &:before,
        .img {
          background: transparent;
          filter: none;
        }
      }

      &:before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 3;
        transition: var(--transition);
        background-color: var(--navy);
        mix-blend-mode: screen;
      }
    }

    .img {
      border-radius: var(--border-radius);
      mix-blend-mode: multiply;
      filter: grayscale(100%) contrast(1) brightness(90%);

      @media (max-width: 768px) {
        object-fit: cover;
        width: auto;
        height: 100%;
        filter: grayscale(100%) contrast(1) brightness(50%);
      }
    }
  }

  .project-image--iphone {
    ${({ theme }) => theme.mixins.resetList};
    box-shadow: none !important;
    background: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: default;
    user-select: none;
    grid-column: 6 / -1;
    grid-row: 1 / -1;

    @media (max-width: 768px) {
      grid-column: 1 / -1;
    }
  }

  .project-image--browser {
    ${({ theme }) => theme.mixins.resetList};
    box-shadow: none !important;
    background: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: default;
    user-select: none;
    grid-column: 6 / -1;
    grid-row: 1 / -1;

    img,
    .gatsby-image-wrapper {
      filter: none !important;
      mix-blend-mode: normal !important;
    }

    @media (max-width: 768px) {
      grid-column: 1 / -1;
      opacity: 0.25;
    }
  }

  /* ambient glow behind the mockups, tinted per project */
  .project-image--iphone,
  .project-image--browser {
    &:before {
      content: '';
      position: absolute;
      inset: 4% 8%;
      z-index: 0;
      border-radius: 50%;
      background: radial-gradient(
        closest-side,
        var(--glow-color, rgba(197, 220, 104, 0.16)),
        transparent 72%
      );
      filter: blur(34px);
      pointer-events: none;
    }

    > * {
      position: relative;
      z-index: 1;
    }
  }

  .glow-stadium {
    --glow-color: rgba(197, 220, 104, 0.17);
  }

  .glow-cinema {
    --glow-color: rgba(232, 96, 96, 0.15);
  }

  .glow-tag {
    --glow-color: rgba(232, 180, 106, 0.15);
  }
`;

const TICKET_VARIANTS = {
  'The Pitch': 'stadium',
  CINELOG: 'cinema',
  ECCO: 'tag',
};

const Featured = () => {
  const data = useStaticQuery(graphql`
    {
      featured: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/featured/" } }
        sort: { fields: [frontmatter___date], order: ASC }
      ) {
        edges {
          node {
            frontmatter {
              title
              cover {
                childImageSharp {
                  gatsbyImageData(width: 700, placeholder: BLURRED, formats: [AUTO, WEBP, AVIF])
                }
              }
              screens {
                childImageSharp {
                  gatsbyImageData(width: 700, placeholder: BLURRED, formats: [AUTO, WEBP, AVIF])
                }
              }
              mockup
              tech
              github
              external
              ios
              android
              description_en
            }
            html
          }
        }
      }
    }
  `);

  const featuredProjects = data.featured.edges.filter(({ node }) => node);
  const revealTitle = useRef(null);
  const revealProjects = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { t, lang } = useLang();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealTitle.current, srConfig());
    revealProjects.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 100)));
  }, []);

  return (
    <section id="projects">
      <h2 className="numbered-heading" ref={revealTitle}>
        {t.featured.title}
      </h2>

      <StyledProjectsGrid>
        {featuredProjects &&
          featuredProjects.map(({ node }, i) => {
            const { frontmatter, html } = node;
            const {
              external,
              title,
              tech,
              github,
              cover,
              screens,
              mockup,
              ios,
              android,
              description_en,
            } = frontmatter;
            const image = getImage(cover);
            const screenImages = (screens || []).map(s => getImage(s)).filter(Boolean);
            const shouldUseIphoneMockup = mockup === 'iphone';
            const variant = TICKET_VARIANTS[title] || 'stadium';
            const caseNumber = `${t.featured.caseLabel} ${String(i + 1).padStart(2, '0')}`;

            return (
              <StyledProject key={i} ref={el => (revealProjects.current[i] = el)}>
                <div className="project-content">
                  <div>
                    <p className="project-overline">{t.featured.overline}</p>

                    <h3 className="project-title">
                      <a href={external}>{title}</a>
                    </h3>

                    <div className="project-description">
                      <div className="case-head">
                        <span>{caseNumber}</span>
                        <span className="case-star" aria-hidden="true">
                          ★
                        </span>
                      </div>
                      {lang === 'en' && description_en ? (
                        <div className="case-body">
                          <p>{description_en}</p>
                        </div>
                      ) : (
                        <div className="case-body" dangerouslySetInnerHTML={{ __html: html }} />
                      )}
                    </div>

                    {tech.length && (
                      <ul className="project-tech-list">
                        {tech.map((tech, i) => (
                          <li key={i}>{tech}</li>
                        ))}
                      </ul>
                    )}

                    {(ios || android) && (
                      <div className="project-store-badges">
                        {ios && (
                          <a
                            className="store-badge"
                            href={ios}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Baixar na App Store">
                            <Icon name="AppStore" />
                            <span>{t.featured.ios}</span>
                          </a>
                        )}
                        {android && (
                          <a
                            className="store-badge"
                            href={android}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Baixar no Google Play">
                            <Icon name="PlayStore" />
                            <span>{t.featured.android}</span>
                          </a>
                        )}
                      </div>
                    )}

                    <div className="project-links">
                      {github && (
                        <a href={github} aria-label="GitHub Link">
                          <Icon name="GitHub" />
                        </a>
                      )}
                      {external && (
                        <a href={external} aria-label="External Link" className="external">
                          <Icon name="External" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {shouldUseIphoneMockup ? (
                  <div className={`project-image project-image--iphone glow-${variant}`}>
                    <Iphone
                      image={image}
                      images={screenImages.length > 0 ? screenImages : undefined}
                      alt={title}
                    />
                  </div>
                ) : mockup === 'browser' ? (
                  <div className={`project-image project-image--browser glow-${variant}`}>
                    <Browser
                      image={image}
                      images={screenImages.length > 0 ? screenImages : undefined}
                      alt={title}
                      url={external}
                    />
                  </div>
                ) : (
                  <div className="project-image">
                    <a href={external ? external : github ? github : '#'}>
                      <GatsbyImage image={image} alt={title} className="img" />
                    </a>
                  </div>
                )}
              </StyledProject>
            );
          })}
      </StyledProjectsGrid>
    </section>
  );
};

export default Featured;
