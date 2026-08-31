import React from 'react';
import { Link } from 'gatsby';
import styled from 'styled-components';
import { Icon } from '@components/icons';
import { socialMedia } from '@config';

const StyledFooter = styled.footer`
  ${({ theme }) => theme.mixins.flexCenter};
  flex-direction: column;
  height: auto;
  min-height: 70px;
  padding: 15px;
  text-align: center;
`;

const StyledSocialLinks = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
    width: 100%;
    max-width: 270px;
    margin: 0 auto 10px;
    color: var(--light-slate);
  }

  ul {
    ${({ theme }) => theme.mixins.flexBetween};
    padding: 0;
    margin: 0;
    list-style: none;

    a {
      padding: 10px;
      svg {
        width: 20px;
        height: 20px;
      }
    }
  }
`;

const StyledCredit = styled.div`
  color: var(--light-slate);
  font-family: var(--font-mono);
  font-size: var(--fz-xxs);
  line-height: 1;

  a {
    padding: 10px;
  }

  .github-stats {
    margin-top: 10px;

    & > span {
      display: inline-flex;
      align-items: center;
      margin: 0 7px;
    }
    svg {
      display: inline-block;
      margin-right: 5px;
      width: 14px;
      height: 14px;
    }
  }

  /* CC BY asks for the credit to be visible wherever the work is published */
  .asset-credit {
    margin-top: 8px;
    opacity: 0.65;
    line-height: 1.6;

    a {
      padding: 0;
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 2px;
    }
  }
`;

const Footer = () => {
  return (
    <StyledFooter>
      <StyledSocialLinks>
        <ul>
          {socialMedia &&
            socialMedia.map(({ name, url }, i) => (
              <li key={i}>
                <a href={url} aria-label={name}>
                  <Icon name={name} />
                </a>
              </li>
            ))}
        </ul>
      </StyledSocialLinks>

      <StyledCredit tabindex="-1">
        <a href="https://github.com/MatheusMartinho/portfolio-matheus">
          <div>Designed & Built by Matheus Moura Martinho</div>
        </a>
        <div>
          <Link to="/stats">/stats ↗</Link>
        </div>
        <div className="asset-credit">
          Livro 3D{' '}
          <a href="https://sketchfab.com/3d-models/coffee-table-books-8aa681cf122c4ada832a78b7dc891d45">
            Coffee Table Books
          </a>{' '}
          por DeezVertz · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
        </div>
      </StyledCredit>
    </StyledFooter>
  );
};

export default Footer;
