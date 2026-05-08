import React from 'react';
import PropTypes from 'prop-types';

const IK_BASE = 'https://ik.imagekit.io/vyubbj0pxl';

const buildSrc = (id, transforms) => {
  const path = id.replace(/^\/+/, '');
  const tr = transforms ? `tr:${transforms}/` : '';
  return `${IK_BASE}/${tr}${path}`;
};

const IkImage = ({
  id,
  alt,
  width,
  aspectRatio,
  className,
  loading = 'lazy',
  decoding = 'async',
  sizes = '(max-width: 768px) 100vw, 1400px',
  widths = [400, 800, 1200, 1600, 2000],
  style,
}) => {
  if (!id) return null;

  const baseTransforms = ['f-auto', 'q-80'];
  if (aspectRatio) {
    const [w, h] = aspectRatio.split(':').map(Number);
    if (w && h) baseTransforms.push(`ar-${w}-${h}`, 'c-maintain_ratio');
  }

  const src = buildSrc(id, [...baseTransforms, `w-${width || 1400}`].join(','));
  const srcSet = widths
    .map(w => `${buildSrc(id, [...baseTransforms, `w-${w}`].join(','))} ${w}w`)
    .join(', ');

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      style={style}
    />
  );
};

IkImage.propTypes = {
  id: PropTypes.string.isRequired,
  alt: PropTypes.string,
  width: PropTypes.number,
  aspectRatio: PropTypes.string,
  className: PropTypes.string,
  loading: PropTypes.oneOf(['lazy', 'eager']),
  decoding: PropTypes.oneOf(['sync', 'async', 'auto']),
  sizes: PropTypes.string,
  widths: PropTypes.arrayOf(PropTypes.number),
  style: PropTypes.object,
};

export default IkImage;
