module.exports = {
  email: 'matmouramartinho@gmail.com',

  socialMedia: [
    {
      name: 'GitHub',
      url: 'https://github.com/MatheusMartinho',
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/matmoura/?hl=en',
    },
    {
      name: 'X',
      url: 'https://x.com/matmoura232?s=21',
    },
    {
      name: 'Linkedin',
      url: 'https://br.linkedin.com/in/matheus-moura-martinho-8630091b3',
    },
    {
      name: 'Skoob',
      url: 'https://skoob.com.br/profile/9686948-matmoura',
    },
  ],

  navLinks: [
    {
      name: 'Sobre',
      url: '/#about',
    },
    {
      name: 'Experiência',
      url: '/#jobs',
    },
    {
      name: 'Trabalho',
      url: '/#projects',
    },
    {
      name: 'Contato',
      url: '/#contact',
    },
  ],

  colors: {
    green: '#64ffda',
    navy: '#0a192f',
    darkNavy: '#020c1b',
  },

  srConfig: (delay = 200, viewFactor = 0.25) => ({
    origin: 'bottom',
    distance: '20px',
    duration: 500,
    delay,
    rotate: { x: 0, y: 0, z: 0 },
    opacity: 0,
    scale: 1,
    easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    mobile: true,
    reset: false,
    useDelay: 'always',
    viewFactor,
    viewOffset: { top: 0, right: 0, bottom: 0, left: 0 },
  }),
};
