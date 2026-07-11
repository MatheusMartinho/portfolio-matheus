import { css } from 'styled-components';

const variables = css`
  :root {
    --dark-navy: #2a151e;
    --navy: #40222d;
    --light-navy: #553244;
    --lightest-navy: #6c4859;
    --navy-shadow: rgba(20, 8, 12, 0.6);
    --dark-slate: #4f5e64;
    --slate: #70848c;
    --light-slate: #b1a392;
    --lightest-slate: #d9c8b4;
    --white: #ede0cc;
    --green: #caf438;
    --green-tint: rgba(202, 244, 56, 0.12);
    --ink: #170a10;
    --pink: #f57dff;
    --blue: #57cbff;

    --font-sans: 'Sora', 'Calibre', 'Inter', 'San Francisco', 'SF Pro Text', -apple-system,
      system-ui, sans-serif;
    --font-mono: 'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace;

    --fz-xxs: 12px;
    --fz-xs: 13px;
    --fz-sm: 14px;
    --fz-md: 16px;
    --fz-lg: 17px;
    --fz-xl: 19px;
    --fz-xxl: 21px;
    --fz-heading: 32px;

    --border-radius: 4px;
    --nav-height: 100px;
    --nav-scroll-height: 70px;

    --tab-height: 42px;
    --tab-width: 110px;

    --easing: cubic-bezier(0.645, 0.045, 0.355, 1);
    --transition: all 0.25s cubic-bezier(0.645, 0.045, 0.355, 1);

    --hamburger-width: 30px;

    --ham-before: top 0.1s ease-in 0.25s, opacity 0.1s ease-in;
    --ham-before-active: top 0.1s ease-out, opacity 0.1s ease-out 0.12s;
    --ham-after: bottom 0.1s ease-in 0.25s, transform 0.22s cubic-bezier(0.55, 0.055, 0.675, 0.19);
    --ham-after-active: bottom 0.1s ease-out,
      transform 0.22s cubic-bezier(0.215, 0.61, 0.355, 1) 0.12s;
  }
`;

export default variables;
