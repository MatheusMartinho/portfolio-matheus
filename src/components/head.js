import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useLocation } from '@reach/router';
import { useStaticQuery, graphql } from 'gatsby';

// https://www.gatsbyjs.com/docs/add-seo-component/

const Head = ({ title, description, image }) => {
  const { pathname } = useLocation();

  const {
    site,
    appleTouchIcon,
    faviconSvg,
    faviconIco,
    faviconPng,
    icon192,
    icon512,
    webManifest,
  } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            defaultTitle: title
            defaultDescription: description
            siteUrl
            defaultImage: image
            twitterUsername
          }
        }
        appleTouchIcon: file(relativePath: { eq: "favicon/apple-touch-icon.png" }) {
          publicURL
        }
        faviconSvg: file(relativePath: { eq: "favicon/favicon.svg" }) {
          publicURL
        }
        faviconIco: file(relativePath: { eq: "favicon/favicon.ico" }) {
          publicURL
        }
        faviconPng: file(relativePath: { eq: "favicon/favicon-96x96.png" }) {
          publicURL
        }
        icon192: file(relativePath: { eq: "favicon/web-app-manifest-192x192.png" }) {
          publicURL
        }
        icon512: file(relativePath: { eq: "favicon/web-app-manifest-512x512.png" }) {
          publicURL
        }
        webManifest: file(relativePath: { eq: "favicon/site.webmanifest" }) {
          publicURL
        }
      }
    `,
  );

  const { defaultTitle, defaultDescription, siteUrl, defaultImage, twitterUsername } =
    site.siteMetadata;

  const seo = {
    title: title || defaultTitle,
    description: description || defaultDescription,
    image: `${siteUrl}${image || defaultImage}`,
    url: `${siteUrl}${pathname}`,
  };

  return (
    <Helmet title={title} defaultTitle={seo.title} titleTemplate={`%s | ${defaultTitle}`}>
      <html lang="en" />

      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />

      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={twitterUsername} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      <meta name="google-site-verification" content="DCl7VAf9tcz6eD9gb67NfkNnJ1PKRNcg8qQiwpbx9Lk" />

      {appleTouchIcon?.publicURL && (
        <link rel="apple-touch-icon" sizes="180x180" href={appleTouchIcon.publicURL} />
      )}
      {faviconSvg?.publicURL && (
        <link rel="icon" type="image/svg+xml" href={faviconSvg.publicURL} />
      )}
      {faviconPng?.publicURL && (
        <link rel="icon" type="image/png" sizes="96x96" href={faviconPng.publicURL} />
      )}
      {icon192?.publicURL && (
        <link rel="icon" type="image/png" sizes="192x192" href={icon192.publicURL} />
      )}
      {icon512?.publicURL && (
        <link rel="icon" type="image/png" sizes="512x512" href={icon512.publicURL} />
      )}
      {faviconIco?.publicURL && <link rel="shortcut icon" href={faviconIco.publicURL} />}
      {webManifest?.publicURL && <link rel="manifest" href={webManifest.publicURL} />}
    </Helmet>
  );
};

export default Head;

Head.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
};

Head.defaultProps = {
  title: null,
  description: null,
  image: null,
};
