import React, { useEffect, useRef } from 'react';
import { Link, useStaticQuery, graphql } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import styled from 'styled-components';
import sr from '@utils/sr';
import { srConfig } from '@config';
import { usePrefersReducedMotion } from '@hooks';
import { useLang } from '@i18n/LanguageContext';
import IkImage from '@components/ui/ik-image';

const StyledFramesSection = styled.section`
  max-width: 1100px;

  .frames-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    grid-gap: 24px;
    margin-top: 50px;

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
      grid-gap: 18px;
    }
  }

  .frames-cta {
    display: flex;
    justify-content: center;
    margin-top: 60px;

    @media (max-width: 768px) {
      margin-top: 40px;
    }
  }

  .cta-button {
    ${({ theme }) => theme.mixins.bigButton};
  }
`;

const StyledCard = styled(Link)`
  position: relative;
  display: block;
  aspect-ratio: 4 / 5;
  border-radius: var(--border-radius);
  overflow: hidden;
  background: linear-gradient(
    160deg,
    var(--light-navy) 0%,
    var(--dark-navy) 100%
  );
  ${({ theme }) => theme.mixins.boxShadow};
  text-decoration: none;
  color: inherit;
  transition: var(--transition);

  &:hover,
  &:focus-visible {
    transform: translateY(-6px);
    color: inherit;

    .card-cover {
      transform: scale(1.04);
    }

    .card-title {
      color: var(--green);
    }
  }

  .card-cover {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    transition: transform 600ms var(--easing);

    img {
      object-fit: cover !important;
      width: 100%;
      height: 100%;
    }
  }

  .card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(20, 8, 12, 0) 35%,
      rgba(20, 8, 12, 0.55) 75%,
      rgba(20, 8, 12, 0.85) 100%
    );
    z-index: 1;
  }

  .card-meta {
    position: absolute;
    left: 22px;
    right: 22px;
    bottom: 22px;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .card-title {
    margin: 0;
    color: var(--lightest-slate);
    font-size: var(--fz-xl);
    font-weight: 600;
    line-height: 1.25;
    transition: var(--transition);
  }

  .card-period {
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .card-location {
    color: var(--light-slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    letter-spacing: 0.04em;
  }

  .card-soon {
    position: absolute;
    top: 18px;
    right: 18px;
    z-index: 2;
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
`;

const Frames = () => {
  const data = useStaticQuery(graphql`
    {
      frames: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/frames/" } }
        sort: { fields: [frontmatter___order], order: ASC }
      ) {
        edges {
          node {
            frontmatter {
              slug
              title_en
              location
              location_en
              period
              period_en
              cover_imagekit_id
              cover {
                childImageSharp {
                  gatsbyImageData(
                    width: 600
                    aspectRatio: 0.8
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
  `);

  const chapters = data.frames.edges.map(({ node }) => node);
  const revealTitle = useRef(null);
  const revealCards = useRef([]);
  const revealCta = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { t, lang } = useLang();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    sr.reveal(revealTitle.current, srConfig());
    revealCards.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 100)));
    sr.reveal(revealCta.current, srConfig(200));
  }, []);

  if (!chapters.length) {
    return null;
  }

  const teaserChapters = chapters.slice(0, 4);

  return (
    <StyledFramesSection id="frames">
      <h2 className="numbered-heading" ref={revealTitle}>
        {t.frames.title}
      </h2>

      <div className="frames-grid">
        {teaserChapters.map((node, i) => {
          const {
            slug,
            title,
            title_en,
            location,
            location_en,
            period,
            period_en,
            cover,
            cover_imagekit_id,
          } = node.frontmatter;
          const image = cover ? getImage(cover) : null;
          const displayTitle = lang === 'en' && title_en ? title_en : title;
          const displayLocation = lang === 'en' && location_en ? location_en : location;
          const displayPeriod = lang === 'en' && period_en ? period_en : period;

          return (
            <StyledCard
              key={slug}
              to={`/frames/${slug}`}
              ref={el => (revealCards.current[i] = el)}
              aria-label={displayTitle}>
              {cover_imagekit_id ? (
                <div className="card-cover">
                  <IkImage
                    id={cover_imagekit_id}
                    alt={displayTitle}
                    width={600}
                    aspectRatio="4:5"
                    widths={[400, 600, 800, 1000]}
                    sizes="(max-width: 480px) 100vw, 280px"
                  />
                </div>
              ) : image ? (
                <GatsbyImage image={image} alt={displayTitle} className="card-cover" />
              ) : (
                <span className="card-soon">{t.frames.soon}</span>
              )}
              <div className="card-overlay" />
              <div className="card-meta">
                {displayPeriod && <span className="card-period">{displayPeriod}</span>}
                <h3 className="card-title">{displayTitle}</h3>
                {displayLocation && (
                  <span className="card-location">{displayLocation}</span>
                )}
              </div>
            </StyledCard>
          );
        })}
      </div>

      <div className="frames-cta" ref={revealCta}>
        <Link className="cta-button" to="/frames">
          {t.frames.cta}
        </Link>
      </div>
    </StyledFramesSection>
  );
};

export default Frames;
