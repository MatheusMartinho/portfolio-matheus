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
import Turntable from '@components/ui/turntable';

const StyledJobsSection = styled.section`
  /* mais larga que as outras seções: a lista de eras come 340px antes do
     painel começar */
  max-width: 1160px;

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

    // Reserva só o suficiente para o painel mais curto; os mais altos crescem
    @media (min-width: 700px) {
      min-height: 340px;
    }
  }
`;

const StyledEraList = styled.div`
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  width: 340px;
  flex-shrink: 0;
  border-top: 1px solid var(--lightest-navy);

  @media (max-width: 700px) {
    width: 100%;
    margin-bottom: 34px;
  }
`;

const StyledEraRow = styled.button`
  position: relative;
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

  /* Ornamento da era: cada entrada pode trazer um decor.png na própria pasta.
     Ele abraça a linha inteira, atrás do texto, e desaparece nas bordas para
     não invadir a linha vizinha (que pode ter o ornamento dela). */
  .era-decor {
    position: absolute;
    left: -18px;
    /* img posicionada ignora o esticar entre left e right, então a largura vem
       da linha mais uma folga de cada lado */
    width: calc(100% + 36px);
    height: auto;
    max-width: none;
    /* a lenha corre no meio do PNG, então centralizar na vertical alinha ela
       com o miolo da linha e deixa as folhas subirem por cima do rótulo */
    bottom: 50%;
    transform: translateY(50%) ${({ $flip }) => ($flip ? 'scaleX(-1)' : '')};
    z-index: 0;
    pointer-events: none;
    /* GlobalStyle borra img[alt=""]; este filter substitui aquele */
    /* recuado de propósito, mas sem matar a cor: dessaturar demais fazia o
       vermelho do maple virar a mesma mancha marrom do fundo vinho */
    filter: saturate(0.88) brightness(0.8) contrast(1.02)
      drop-shadow(0 8px 12px rgba(6, 2, 5, 0.5));
    opacity: ${({ isActive }) => (isActive ? 0.55 : 0.28)};
    transition: opacity 0.45s var(--easing), filter 0.45s var(--easing);
    /* as pontas somem antes de encostar na linha de cima e de baixo */
    -webkit-mask-image: linear-gradient(
        to bottom,
        transparent,
        #000 32%,
        #000 68%,
        transparent
      ),
      linear-gradient(to right, transparent, #000 10%, #000 90%, transparent);
    -webkit-mask-composite: source-in;
    mask-image: linear-gradient(
        to bottom,
        transparent,
        #000 32%,
        #000 68%,
        transparent
      ),
      linear-gradient(to right, transparent, #000 10%, #000 90%, transparent);
    mask-composite: intersect;
  }

  &:hover .era-decor,
  &:focus-visible .era-decor {
    opacity: 0.68;
  }

  .era-index,
  .era-place,
  .era-years {
    position: relative;
    z-index: 1;
    /* halo escuro só nas linhas ornamentadas: garante contraste do texto
       independente do PNG que for largado na pasta */
    text-shadow: ${({ $hasDecor }) =>
    $hasDecor ? '0 0 10px rgba(45, 22, 32, 0.95), 0 1px 3px rgba(6, 2, 5, 0.9)' : 'none'};
  }

  @media (max-width: 700px) {
    .era-decor {
      display: none;
    }
  }
`;

const StyledTabPanels = styled.div`
  position: relative;
  width: 100%;
  margin-top: 4px;
`;

const StyledTabPanel = styled.div`
  position: relative;
  width: 100%;
  height: auto;
  padding: 10px 0 0;

  .page-grid {
    display: grid;
    grid-template-columns: 1fr 230px;
    gap: 36px;
    align-items: start;

    /* entradas sem imagem usam a largura toda em vez de deixar a coluna vazia */
    &.solo {
      grid-template-columns: 1fr;
    }

    /* peças deitadas continuam ao lado do texto, numa coluna bem maior que a
       padrão de 230px */
    &.wide-media {
      grid-template-columns: minmax(320px, 1fr) 400px;
      gap: 28px;
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
    hyphens: none;
    overflow-wrap: normal;
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

  /* Logo do Greenpeace: os outros artefatos entram em preto e branco, mas aqui
     o verde da folhagem É a marca, então ele fica só um pouco contido e abre
     no hover. */
  .era-media--logo .media-frame img {
    /* cor natural da folhagem; só o drop-shadow separa do fundo */
    filter: brightness(1.02) drop-shadow(0 14px 24px rgba(6, 2, 5, 0.55));
  }

  .era-media--logo:hover .media-frame img {
    filter: brightness(1.14) drop-shadow(0 16px 28px rgba(6, 2, 5, 0.6));
    transform: scale(1.03);
  }

  .era-media--logo .media-frame {
    /* o PNG já tem folga transparente em volta; padding extra afastaria demais */
    padding: 0;
  }

  /* a vitrola é componente, não foto: sem moldura e sem o véu verde */
  .era-media--deck {
    border: none;
  }

  /* a peça avança para a margem da página, que está vazia à direita da seção.
     Só em telas largas, onde há folga antes da trilha de e-mail. */
  @media (min-width: 1280px) {
    .era-media--bleed {
      width: calc(100% + 56px);
    }
  }
`;

const cityFromLocation = location => (location || '').split(',')[0].trim().toUpperCase();

const Jobs = () => {
  const data = useStaticQuery(graphql`
    query {
      jobs: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/jobs/" } }
        sort: { fields: [frontmatter___date], order: ASC }
      ) {
        edges {
          node {
            frontmatter {
              title
              title_en
              company
              location
              era_label
              decor {
                publicURL
              }
              decor_flip
              media_variant
              media_wide
              media_component
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

  // abre na era mais recente: é o conteúdo que mais vende, e não obriga
  // ninguém a clicar até o fim da lista pra chegar nele
  const [activeTabId, setActiveTabId] = useState(jobsData.length - 1);
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
              const { location, range, era_label, decor, decor_flip } = node.frontmatter;
              return (
                <StyledEraRow
                  key={i}
                  isActive={activeTabId === i}
                  $flip={Boolean(decor_flip)}
                  $hasDecor={Boolean(decor?.publicURL)}
                  onClick={() => setActiveTabId(i)}
                  ref={el => (tabs.current[i] = el)}
                  id={`tab-${i}`}
                  role="tab"
                  tabIndex={activeTabId === i ? '0' : '-1'}
                  aria-selected={activeTabId === i ? true : false}
                  aria-controls={`panel-${i}`}>
                  <span className="era-index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="era-place">{era_label || cityFromLocation(location)}</span>
                  <span className="era-years">{range}</span>
                  {decor?.publicURL && (
                    <img
                      className="era-decor"
                      src={decor.publicURL}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                    />
                  )}
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
                location,
                range,
                bullets_en,
                visual_caption,
                visual_caption_en,
                polaroid_imagekit_id,
                cover,
                media_variant,
                media_wide,
                media_component,
              } = frontmatter;
              const displayTitle = lang === 'en' && title_en ? title_en : title;
              const displayCompany = company;
              const showEnBullets = lang === 'en' && bullets_en && bullets_en.length > 0;
              const caption =
                lang === 'en' && visual_caption_en ? visual_caption_en : visual_caption;
              const artifactImage = cover ? getImage(cover) : null;
              const isTurntable = media_component === 'turntable';
              const hasMedia = Boolean(polaroid_imagekit_id || artifactImage || isTurntable);

              return (
                <CSSTransition key={i} in={activeTabId === i} timeout={250} classNames="fade">
                  <StyledTabPanel
                    id={`panel-${i}`}
                    role="tabpanel"
                    tabIndex={activeTabId === i ? '0' : '-1'}
                    aria-labelledby={`tab-${i}`}
                    aria-hidden={activeTabId !== i}
                    hidden={activeTabId !== i}>
                    <div
                      className={`page-grid${hasMedia ? '' : ' solo'}${
                        media_wide ? ' wide-media' : ''
                      }`}>
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

                      {isTurntable && (
                        <div className="era-media era-media--deck">
                          <Turntable hint={caption} />
                          {caption && <span className="media-caption">{caption}</span>}
                        </div>
                      )}

                      {hasMedia && !isTurntable && (
                        <div
                          className={`era-media${
                            polaroid_imagekit_id ? '' : ' era-media--artifact'
                          }${media_variant === 'logo' ? ' era-media--logo' : ''}${
                            media_wide ? ' era-media--bleed' : ''
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
