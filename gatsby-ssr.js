/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/ssr-apis/
 */

import React from 'react';

export const onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    <link key="gf-preconnect-1" rel="preconnect" href="https://fonts.googleapis.com" />,
    <link
      key="gf-preconnect-2"
      rel="preconnect"
      href="https://fonts.gstatic.com"
      crossOrigin="anonymous"
    />,
    <link
      key="gf-sora"
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap"
    />,
  ]);
};
