import React, { useEffect, useRef } from 'react';
import { Link, graphql } from 'gatsby';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { Layout } from '@components';
import { usePrefersReducedMotion } from '@hooks';
import { useLang } from '@i18n/LanguageContext';
import IkImage from '@components/ui/ik-image';

const StyledHeader = styled.header`
  margin-bottom: 80px;

  .subtitle {
    margin-top: 20px;
    max-width: 640px;
    color: var(--light-slate);
    font-family: var(--font-mono);
    font-size: var(--fz-md);
    line-height: 1.6;

    @media (max-width: 768px) {
      font-size: var(--fz-sm);
    }
  }
`;

const StyledGrid = styled.ul`
  ${({ theme }) => theme.mixins.resetList};
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  grid-gap: 32px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    grid-gap: 24px;
  }
`;

const StyledChapter = styled.li`
  ${({ theme }) => theme.mixins.boxShadow};
  position: relative;
  border-radius: var(--border-radius);
  background: var(--light-navy);
  overflow: hidden;
  transition: var(--transition);

  &:hover,
  &:focus-within {
    transform: translateY(-6px);

    .chapter-cover {
      transform: scale(1.04);
    }

    .chapter-title {
      color: var(--green);
    }
  }

  .chapter-link {
    display: block;
    text-decoration: none;
    color: inherit;
  }

  .chapter-media {
    position: relative;
    width: 100%;
    aspect-ratio: 3 / 2;
    overflow: hidden;
    background: linear-gradient(
      160deg,
      var(--light-navy) 0%,
      var(--dark-navy) 100%
    );
  }

  .chapter-cover {
    width: 100%;
    height: 100%;
    transition: transform 600ms var(--easing);

    img {
      object-fit: cover !important;
      width: 100%;
      height: 100%;
    }
  }

  .chapter-soon {
    position: absolute;
    top: 16px;
    right: 16px;
    padding: 5px 10px;
    border: 1px solid var(--green);
    border-radius: 999px;
    background: rgba(20, 8, 12, 0.55);
    color: var(--green);
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .chapter-body {
    padding: 24px 26px 28px;
  }

  .chapter-period {
    display: block;
    margin-bottom: 8px;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .chapter-title {
    margin: 0 0 6px;
    color: var(--lightest-slate);
    font-size: var(--fz-xxl);
    font-weight: 600;
    line-height: 1.25;
    transition: var(--transition);
  }

  .chapter-location {
    display: block;
    margin-bottom: 14px;
    color: var(--light-slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
  }

  .chapter-intro {
    color: var(--light-slate);
    font-size: var(--fz-md);
    line-height: 1.55;

    p {
      margin: 0;
    }
  }
`;

const FramesPage = ({ location, data }) => {
  const chapters = data.frames.edges.map(({ node }) => node);
  const revealHeader = useRef(null);
  const revealChapters = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { t, lang } = useLang();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    sr.reveal(revealHeader.current, srConfig());
    revealChapters.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 100)));
  }, []);

  return (
    <Layout location={location}>
      <Helmet title="Frames · Matheus Martinho" />

      <main>
        <StyledHeader ref={revealHeader}>
          <h1 className="big-heading">{t.frames.pageTitle}</h1>
          <p className="subtitle">{t.frames.pageSubtitle}</p>
        </StyledHeader>

        <StyledGrid>
          {chapters.map((node, i) => {
            const { frontmatter, html } = node;
            const {
              slug,
              title,
              title_en,
              location: chapterLocation,
              location_en,
              period,
              period_en,
              cover,
              cover_imagekit_id,
              intro_en,
            } = frontmatter;
            const image = cover ? getImage(cover) : null;
            const displayTitle = lang === 'en' && title_en ? title_en : title;
            const displayLocation =
              lang === 'en' && location_en ? location_en : chapterLocation;
            const displayPeriod = lang === 'en' && period_en ? period_en : period;

            return (
              <StyledChapter key={slug} ref={el => (revealChapters.current[i] = el)}>
                <Link to={`/frames/${slug}`} className="chapter-link" aria-label={displayTitle}>
                  <div className="chapter-media">
                    {cover_imagekit_id ? (
                      <div className="chapter-cover">
                        <IkImage
                          id={cover_imagekit_id}
                          alt={displayTitle}
                          width={800}
                          aspectRatio="3:2"
                          widths={[400, 600, 800, 1200]}
                          sizes="(max-width: 480px) 100vw, 360px"
                        />
                      </div>
                    ) : image ? (
                      <GatsbyImage
                        image={image}
                        alt={displayTitle}
                        className="chapter-cover"
                      />
                    ) : (
                      <span className="chapter-soon">{t.frames.soon}</span>
                    )}
                  </div>
                  <div className="chapter-body">
                    {displayPeriod && (
                      <span className="chapter-period">{displayPeriod}</span>
                    )}
                    <h2 className="chapter-title">{displayTitle}</h2>
                    {displayLocation && (
                      <span className="chapter-location">{displayLocation}</span>
                    )}
                    {lang === 'en' && intro_en ? (
                      <div className="chapter-intro">
                        <p>{intro_en}</p>
                      </div>
                    ) : (
                      <div
                        className="chapter-intro"
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    )}
                  </div>
                </Link>
              </StyledChapter>
            );
          })}
        </StyledGrid>
      </main>
    </Layout>
  );
};

FramesPage.propTypes = {
  location: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
};

export default FramesPage;

export const pageQuery = graphql`
  {
    frames: allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/content/frames/" } }
      sort: { fields: [frontmatter___order], order: ASC }
    ) {
      edges {
        node {
          html
          frontmatter {
            slug
            title
            title_en
            location
            location_en
            period
            period_en
            intro_en
            cover_imagekit_id
            cover {
              childImageSharp {
                gatsbyImageData(
                  width: 800
                  aspectRatio: 1.5
                  placeholder: BLURRED
                  formats: [AUTO, WEBP, AVIF]
                )
              }
            }
          }
        }
      }
    }
  }
`;
