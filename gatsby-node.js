/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const path = require('path');

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  createTypes(`
    type FramePhoto {
      src: File @fileByRelativePath
      imagekit_id: String
      caption: String
      caption_en: String
    }

    type MarkdownRemarkFrontmatter {
      slug: String
      location_en: String
      period: String
      period_en: String
      intro_en: String
      cover_imagekit_id: String
      spotify_playlist: String
      photos: [FramePhoto]
    }
  `);
};

exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions;

  const resumeTemplate = path.resolve(`src/templates/resume.js`);
  createPage({
    path: '/resume',
    component: resumeTemplate,
    context: {},
  });

  const photoStoryTemplate = path.resolve(`src/templates/photo-story.js`);
  const result = await graphql(`
    {
      allMarkdownRemark(filter: { fileAbsolutePath: { regex: "/content/frames/" } }) {
        edges {
          node {
            frontmatter {
              slug
            }
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild('Erro carregando capítulos de Frames', result.errors);
    return;
  }

  result.data.allMarkdownRemark.edges.forEach(({ node }) => {
    const { slug } = node.frontmatter;
    if (!slug) return;
    createPage({
      path: `/frames/${slug}`,
      component: photoStoryTemplate,
      context: { slug },
    });
  });
};

// https://www.gatsbyjs.org/docs/node-apis/#onCreateWebpackConfig
exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  // https://www.gatsbyjs.org/docs/debugging-html-builds/#fixing-third-party-modules
  if (stage === 'build-html' || stage === 'develop-html') {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /scrollreveal/,
            use: loaders.null(),
          },
          {
            test: /animejs/,
            use: loaders.null(),
          },
          {
            test: /miniraf/,
            use: loaders.null(),
          },
        ],
      },
    });
  }

  actions.setWebpackConfig({
    resolve: {
      alias: {
        '@components': path.resolve(__dirname, 'src/components'),
        '@config': path.resolve(__dirname, 'src/config'),
        '@fonts': path.resolve(__dirname, 'src/fonts'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@i18n': path.resolve(__dirname, 'src/i18n'),
        '@images': path.resolve(__dirname, 'src/images'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        '@utils': path.resolve(__dirname, 'src/utils'),
      },
    },
  });
};
