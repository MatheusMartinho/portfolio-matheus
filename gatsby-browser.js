/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

import { trackVisit } from './src/utils/visits';

export const onRouteUpdate = ({ location }) => {
  trackVisit(location.pathname);
};
