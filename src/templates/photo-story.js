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
import ChapterSeal from '@images/chapter-seal.png';

const StyledStoryMain = styled.main`
  max-width: 1400px;
  padding: 150px 50px 80px;

  @media (max-width: 768px) {
    padding: 130px 25px 60px;
  }
`;

const StyledBack = styled.div`
  margin-bottom: 30px;

  a {
    ${({ theme }) => theme.mixins.inlineLink};
    font-family: var(--font-mono);
    font-size: var(--fz-sm);
    color: var(--green);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
`;

const StyledHero = styled.header`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--border-radius);
  overflow: hidden;
  background: linear-gradient(
    160deg,
    var(--light-navy) 0%,
    var(--dark-navy) 100%
  );

  @media (max-width: 768px) {
    aspect-ratio: 4 / 5;
  }

  .hero-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;

    img {
      object-fit: cover !important;
      width: 100%;
      height: 100%;
    }
  }

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(20, 8, 12, 0) 30%,
      rgba(20, 8, 12, 0.55) 70%,
      rgba(20, 8, 12, 0.92) 100%
    );
    z-index: 1;
  }

  .hero-meta {
    position: absolute;
    left: 40px;
    right: 40px;
    bottom: 40px;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 10px;

    @media (max-width: 768px) {
      left: 24px;
      right: 24px;
      bottom: 24px;
    }
  }

  .hero-period {
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-sm);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .hero-title {
    margin: 0;
    color: var(--white);
    font-size: clamp(36px, 6vw, 72px);
    font-weight: 600;
    line-height: 1.05;
    letter-spacing: -0.01em;
  }

  .hero-location {
    color: var(--lightest-slate);
    font-family: var(--font-mono);
    font-size: var(--fz-sm);
    letter-spacing: 0.04em;
  }
`;

const StyledIntro = styled.section`
  max-width: 720px;
  margin: 80px auto 80px;
  padding: 0 20px;
  text-align: center;

  p {
    color: var(--light-slate);
    font-size: var(--fz-xl);
    line-height: 1.65;

    @media (max-width: 768px) {
      font-size: var(--fz-lg);
    }
  }

  @media (max-width: 768px) {
    margin: 50px auto 50px;
  }
`;

const StyledGallery = styled.section`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-gap: 24px;
  margin: 0 auto 80px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-gap: 18px;
  }

  figure {
    margin: 0;
    overflow: hidden;
    border-radius: var(--border-radius);
    transition: var(--transition);

    &:hover,
    &:focus-within {
      transform: translateY(-4px);

      .photo {
        transform: scale(1.02);
      }
    }
  }

  /*
    Ritmo editorial: alterna larguras pra criar variação.
    Nth-of-type 1,4,7... -> 4 cols (grande)
    Nth 2,3,5,6,8,9 -> 2 cols (médio)
    Em desktop: cada linha começa com uma grande + duas médias.
  */
  figure:nth-of-type(3n + 1) {
    grid-column: span 4;
  }
  figure:nth-of-type(3n + 2),
  figure:nth-of-type(3n + 3) {
    grid-column: span 2;
  }

  @media (max-width: 768px) {
    figure:nth-of-type(3n + 1),
    figure:nth-of-type(3n + 2),
    figure:nth-of-type(3n + 3) {
      grid-column: 1 / -1;
    }
  }

  .photo-frame {
    position: relative;
    overflow: hidden;
    border-radius: var(--border-radius);
    ${({ theme }) => theme.mixins.boxShadow};
  }

  .photo {
    transition: transform 600ms var(--easing);

    img {
      width: 100%;
      height: auto;
    }
  }

  figcaption {
    margin-top: 10px;
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    letter-spacing: 0.04em;
    line-height: 1.5;
  }
`;

const StyledFooterNav = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding-top: 20px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }

  .nav-link {
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: var(--light-slate);
    text-decoration: none;
    transition: var(--transition);

    &:hover,
    &:focus-visible {
      color: var(--green);

      .nav-arrow svg {
        transform: translateX(4px);
      }
    }
  }

  .nav-link.prev {
    align-items: flex-start;

    @media (max-width: 600px) {
      align-items: flex-start;
    }

    &:hover .nav-arrow svg,
    &:focus-visible .nav-arrow svg {
      transform: translateX(-4px);
    }
  }

  .nav-link.next {
    align-items: flex-end;
    text-align: right;

    @media (max-width: 600px) {
      align-items: flex-start;
      text-align: left;
    }
  }

  .nav-label {
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .nav-arrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: inherit;
    font-size: var(--fz-lg);
    font-weight: 500;
    transition: transform 250ms var(--easing);
  }
`;

const StyledSoundtrack = styled.section`
  max-width: 720px;
  margin: 0 auto 80px;
  padding: 0 20px;

  @media (max-width: 768px) {
    margin: 0 auto 50px;
  }

  .soundtrack-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 18px;
  }

  .soundtrack-label {
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .soundtrack-rule {
    flex: 1;
    height: 1px;
    background: linear-gradient(
      90deg,
      var(--green) 0%,
      var(--lightest-navy) 50%,
      transparent 100%
    );
    opacity: 0.6;
  }

  .soundtrack-frame {
    position: relative;
    border-radius: 14px;
    overflow: hidden;
    box-shadow:
      0 25px 50px -25px rgba(0, 0, 0, 0.7),
      0 12px 25px -12px rgba(20, 8, 12, 0.5);
    background: var(--light-navy);
  }

  iframe {
    display: block;
    width: 100%;
    border: 0;
  }
`;

const StyledClosingSeal = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin: 60px auto 40px;
  padding: 40px 20px 0;
  border-top: 1px solid var(--lightest-navy);
  position: relative;

  &:before {
    content: '✦';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 28px;
    height: 20px;
    background: var(--navy);
    color: var(--green);
    font-size: 14px;
    line-height: 20px;
    text-align: center;
  }

  .seal-mark {
    width: 110px;
    height: auto;
    opacity: 0.85;
    filter: drop-shadow(0 12px 18px rgba(0, 0, 0, 0.55));
    transition: var(--transition);

    &:hover {
      opacity: 1;
      transform: translateY(-2px);
    }
  }

  .seal-label {
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    letter-spacing: 0.32em;
    text-transform: uppercase;
    text-align: center;
  }

  @media (max-width: 600px) {
    margin: 40px auto 30px;

    .seal-mark {
      width: 90px;
    }
  }
`;

const StyledEmpty = styled.div`
  margin: 120px auto;
  max-width: 540px;
  text-align: center;
  color: var(--light-slate);

  h2 {
    color: var(--lightest-slate);
    font-size: clamp(24px, 4vw, 32px);
    margin-bottom: 14px;
  }

  p {
    font-size: var(--fz-lg);
    line-height: 1.55;
  }
`;

const PhotoStoryTemplate = ({ location, data, pageContext }) => {
  const story = data.story;
  const all = data.allStories.edges.map(({ node }) => node.frontmatter);
  const revealHero = useRef(null);
  const revealIntro = useRef(null);
  const revealPhotos = useRef([]);
  const revealFooter = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { t, lang } = useLang();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    if (revealHero.current) sr.reveal(revealHero.current, srConfig());
    if (revealIntro.current) sr.reveal(revealIntro.current, srConfig(150));
    revealPhotos.current.forEach((ref, i) => {
      if (ref) sr.reveal(ref, srConfig(i * 80));
    });
    if (revealFooter.current) sr.reveal(revealFooter.current, srConfig(200));
  }, []);

  if (!story) {
    return (
      <Layout location={location}>
        <Helmet title="Frames" />
        <main>
          <StyledEmpty>
            <h2>{t.frames.notFoundTitle}</h2>
            <p>{t.frames.notFoundBody}</p>
          </StyledEmpty>
        </main>
      </Layout>
    );
  }

  const { html, frontmatter } = story;
  const {
    title,
    title_en,
    location: storyLocation,
    location_en,
    period,
    period_en,
    cover,
    cover_imagekit_id,
    photos,
    intro_en,
    spotify_playlist,
  } = frontmatter;
  const displayTitle = lang === 'en' && title_en ? title_en : title;
  const displayLocation =
    lang === 'en' && location_en ? location_en : storyLocation;
  const displayPeriod = lang === 'en' && period_en ? period_en : period;
  const heroImage = cover ? getImage(cover) : null;
  const photoList = (photos || []).filter(p => p && (p.src || p.imagekit_id));

  const currentIndex = all.findIndex(f => f.slug === pageContext.slug);
  const prev = currentIndex > 0 ? all[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < all.length - 1
    ? all[currentIndex + 1]
    : null;
  const labelFor = (chapter, fallback) =>
    chapter && (lang === 'en' && chapter.title_en ? chapter.title_en : chapter.title || fallback);

  return (
    <Layout location={location}>
      <Helmet title={`${displayTitle} · Frames`} />

      <StyledStoryMain>
        <StyledBack>
          <Link to="/frames">← {t.frames.back}</Link>
        </StyledBack>

        <StyledHero ref={revealHero}>
          {cover_imagekit_id ? (
            <div className="hero-image">
              <IkImage
                id={cover_imagekit_id}
                alt={displayTitle}
                width={1800}
                widths={[600, 1200, 1800, 2400]}
                sizes="100vw"
                loading="eager"
              />
            </div>
          ) : heroImage ? (
            <GatsbyImage image={heroImage} alt={displayTitle} className="hero-image" />
          ) : null}
          <div className="hero-overlay" />
          <div className="hero-meta">
            {displayPeriod && <span className="hero-period">{displayPeriod}</span>}
            <h1 className="hero-title">{displayTitle}</h1>
            {displayLocation && (
              <span className="hero-location">{displayLocation}</span>
            )}
          </div>
        </StyledHero>

        <StyledIntro ref={revealIntro}>
          {lang === 'en' && intro_en ? (
            <p>{intro_en}</p>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </StyledIntro>

        {spotify_playlist && (
          <StyledSoundtrack>
            <div className="soundtrack-header">
              <span className="soundtrack-label">
                ♪ {lang === 'en' ? 'Soundtrack' : 'Trilha sonora'} · {displayTitle}
              </span>
              <span className="soundtrack-rule" />
            </div>
            <div className="soundtrack-frame">
              <iframe
                title={`Spotify playlist · ${displayTitle}`}
                src={`https://open.spotify.com/embed/playlist/${spotify_playlist}?theme=0`}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
          </StyledSoundtrack>
        )}

        {photoList.length > 0 && (
          <StyledGallery>
            {photoList.map((photo, i) => {
              const img = photo.src ? getImage(photo.src) : null;
              const caption =
                lang === 'en' && photo.caption_en ? photo.caption_en : photo.caption;
              if (!img && !photo.imagekit_id) return null;
              return (
                <figure key={i} ref={el => (revealPhotos.current[i] = el)}>
                  <div className="photo-frame">
                    {photo.imagekit_id ? (
                      <IkImage
                        id={photo.imagekit_id}
                        alt={caption || displayTitle}
                        width={1400}
                        widths={[600, 900, 1400, 2000]}
                        sizes="(max-width: 768px) 100vw, 1400px"
                        className="photo"
                      />
                    ) : (
                      <GatsbyImage
                        image={img}
                        alt={caption || displayTitle}
                        className="photo"
                      />
                    )}
                  </div>
                  {caption && <figcaption>{caption}</figcaption>}
                </figure>
              );
            })}
          </StyledGallery>
        )}

        <StyledClosingSeal>
          <img className="seal-mark" src={ChapterSeal} alt="Frames seal" />
          <span className="seal-label">
            {lang === 'en' ? 'End of chapter' : 'Fim do capítulo'}
          </span>
        </StyledClosingSeal>

        <StyledFooterNav ref={revealFooter}>
          {prev ? (
            <Link to={`/frames/${prev.slug}`} className="nav-link prev">
              <span className="nav-label">{t.frames.prev}</span>
              <span className="nav-arrow">← {labelFor(prev)}</span>
            </Link>
          ) : (
            <Link to="/frames" className="nav-link prev">
              <span className="nav-label">{t.frames.back}</span>
              <span className="nav-arrow">← {t.frames.backShort}</span>
            </Link>
          )}

          {next && (
            <Link to={`/frames/${next.slug}`} className="nav-link next">
              <span className="nav-label">{t.frames.next}</span>
              <span className="nav-arrow">{labelFor(next)} →</span>
            </Link>
          )}
        </StyledFooterNav>
      </StyledStoryMain>
    </Layout>
  );
};

PhotoStoryTemplate.propTypes = {
  location: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  pageContext: PropTypes.object.isRequired,
};

export default PhotoStoryTemplate;

export const pageQuery = graphql`
  query PhotoStoryBySlug($slug: String!) {
    story: markdownRemark(
      fileAbsolutePath: { regex: "/content/frames/" }
      frontmatter: { slug: { eq: $slug } }
    ) {
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
        spotify_playlist
        cover {
          childImageSharp {
            gatsbyImageData(
              width: 1800
              placeholder: BLURRED
              formats: [AUTO, WEBP, AVIF]
            )
          }
        }
        photos {
          caption
          caption_en
          imagekit_id
          src {
            childImageSharp {
              gatsbyImageData(
                width: 1400
                placeholder: BLURRED
                formats: [AUTO, WEBP, AVIF]
              )
            }
          }
        }
      }
    }

    allStories: allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/content/frames/" } }
      sort: { fields: [frontmatter___order], order: ASC }
    ) {
      edges {
        node {
          frontmatter {
            slug
            title
            title_en
          }
        }
      }
    }
  }
`;
