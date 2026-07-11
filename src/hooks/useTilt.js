import { useRef, useEffect } from 'react';

// Sets CSS custom properties (--tilt-x, --tilt-y, --sheen-x, --sheen-y) on the
// referenced element while the cursor moves over it, so styled-components can
// build 3D-tilt / holographic-sheen effects without re-rendering React.
const useTilt = ({ max = 6, disabled = false } = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || disabled) {
      return undefined;
    }

    const handleMove = e => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      el.style.setProperty('--tilt-x', `${((0.5 - py) * max * 2).toFixed(2)}deg`);
      el.style.setProperty('--tilt-y', `${((px - 0.5) * max * 2).toFixed(2)}deg`);
      el.style.setProperty('--sheen-x', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--sheen-y', `${(py * 100).toFixed(1)}%`);
    };

    const handleLeave = () => {
      el.style.setProperty('--tilt-x', '0deg');
      el.style.setProperty('--tilt-y', '0deg');
    };

    el.addEventListener('mousemove', handleMove, { passive: true });
    el.addEventListener('mouseleave', handleLeave, { passive: true });

    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [max, disabled]);

  return ref;
};

export default useTilt;
