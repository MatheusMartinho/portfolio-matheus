import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const DEFAULT_SLUGS = [
  'typescript',
  'javascript',
  'dart',
  'java',
  'react',
  'flutter',
  'android',
  'html5',
  'css3',
  'nodedotjs',
  'express',
  'nextdotjs',
  'prisma',
  'amazonaws',
  'postgresql',
  'firebase',
  'nginx',
  'vercel',
  'testinglibrary',
  'jest',
  'cypress',
  'docker',
  'git',
  'jira',
  'github',
  'gitlab',
  'visualstudiocode',
  'androidstudio',
  'sonarqube',
  'figma',
];

const easeOutCubic = t => 1 - (1 - t) ** 3;

const createIconUrls = slugs => slugs.map(slug => `https://cdn.simpleicons.org/${slug}`);

const useIsBrowser = () => typeof window !== 'undefined';

const buildFibonacciSphere = count => {
  if (!count) {
    return [];
  }

  const result = [];
  const offset = 2 / count;
  const increment = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    const y = i * offset - 1 + offset / 2;
    const r = Math.sqrt(1 - y * y);
    const phi = i * increment;

    const x = Math.cos(phi) * r;
    const z = Math.sin(phi) * r;

    result.push({
      id: i,
      x: x * 100,
      y: y * 100,
      z: z * 100,
      scale: 1,
      opacity: 1,
    });
  }

  return result;
};

const useIconCanvases = (imageUrls, iconInset = 0) => {
  const iconCanvasesRef = useRef([]);
  const imagesLoadedRef = useRef([]);
  const isBrowser = useIsBrowser();

  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    if (!imageUrls?.length) {
      iconCanvasesRef.current = [];
      imagesLoadedRef.current = [];
      return;
    }

    imagesLoadedRef.current = new Array(imageUrls.length).fill(false);

    const inset = Math.min(Math.max(iconInset, 0), 0.4);

    const canvases = imageUrls.map((url, index) => {
      const offscreen = document.createElement('canvas');
      offscreen.width = 64;
      offscreen.height = 64;
      const ctx = offscreen.getContext('2d');
      if (!ctx) {
        return offscreen;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        ctx.clearRect(0, 0, offscreen.width, offscreen.height);
        ctx.save();
        ctx.beginPath();
        ctx.arc(32, 32, 30, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        const pad = offscreen.width * inset;
        ctx.drawImage(img, pad, pad, offscreen.width - pad * 2, offscreen.height - pad * 2);
        ctx.restore();
        imagesLoadedRef.current[index] = true;
      };
      img.onerror = () => {
        imagesLoadedRef.current[index] = false;
      };

      return offscreen;
    });

    iconCanvasesRef.current = canvases;
  }, [iconInset, imageUrls, isBrowser]);

  return { iconCanvasesRef, imagesLoadedRef };
};

export const IconCloud = ({
  slugs = DEFAULT_SLUGS,
  size = 360,
  rotationSpeed = 0.5,
  iconScale = 1,
  iconInset = 0.18,
}) => {
  const isBrowser = useIsBrowser();
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const positionsRef = useRef([]);
  const rotationRef = useRef({ x: 0, y: 0 });
  const [iconPositions, setIconPositions] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [targetRotation, setTargetRotation] = useState(null);

  const imageUrls = useMemo(() => createIconUrls(slugs), [slugs]);
  const { iconCanvasesRef, imagesLoadedRef } = useIconCanvases(imageUrls, iconInset);

  useEffect(() => {
    positionsRef.current = iconPositions;
  }, [iconPositions]);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    const newPositions = buildFibonacciSphere(imageUrls.length);
    setIconPositions(newPositions);
  }, [imageUrls.length, isBrowser]);

  const handleMouseDown = event => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !canvasRef.current) {
      return;
    }

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    positionsRef.current.forEach(icon => {
      const cosX = Math.cos(rotationRef.current.x);
      const sinX = Math.sin(rotationRef.current.x);
      const cosY = Math.cos(rotationRef.current.y);
      const sinY = Math.sin(rotationRef.current.y);

      const rotatedX = icon.x * cosY - icon.z * sinY;
      const rotatedZ = icon.x * sinY + icon.z * cosY;
      const rotatedY = icon.y * cosX + rotatedZ * sinX;

      const screenX = canvasRef.current.width / 2 + rotatedX;
      const screenY = canvasRef.current.height / 2 + rotatedY;
      const scale = (rotatedZ + 200) / 300;
      const radius = 24 * scale;
      const dx = x - screenX;
      const dy = y - screenY;

      if (dx * dx + dy * dy < radius * radius) {
        const targetX = -Math.atan2(icon.y, Math.sqrt(icon.x * icon.x + icon.z * icon.z));
        const targetY = Math.atan2(icon.x, icon.z);
        const currentX = rotationRef.current.x;
        const currentY = rotationRef.current.y;
        const distance = Math.hypot(targetX - currentX, targetY - currentY);
        const duration = Math.min(2000, Math.max(800, distance * 1000));

        setTargetRotation({
          x: targetX,
          y: targetY,
          startX: currentX,
          startY: currentY,
          distance,
          startTime: performance.now(),
          duration,
        });
      }
    });

    setIsDragging(true);
    setLastMousePos({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = event => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    }

    if (isDragging) {
      const deltaX = event.clientX - lastMousePos.x;
      const deltaY = event.clientY - lastMousePos.y;

      rotationRef.current = {
        x: rotationRef.current.x + deltaY * 0.002,
        y: rotationRef.current.y + deltaX * 0.002,
      };

      setLastMousePos({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isBrowser) {
      return undefined;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      return undefined;
    }

    const resizeCanvas = () => {
      const scale = window.devicePixelRatio || 1;
      canvas.width = size * scale;
      canvas.height = size * scale;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.scale(scale, scale);
    };

    resizeCanvas();

    const handleResize = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
      const dx = mousePos.x - centerX / (window.devicePixelRatio || 1);
      const dy = mousePos.y - centerY / (window.devicePixelRatio || 1);
      const distance = Math.sqrt(dx * dx + dy * dy);
      const baseSpeed = 0.003;
      const dynamicSpeed = (distance / maxDistance) * 0.01;
      const speed = (baseSpeed + dynamicSpeed) * rotationSpeed;

      if (targetRotation) {
        const elapsed = performance.now() - targetRotation.startTime;
        const progress = Math.min(1, elapsed / targetRotation.duration);
        const eased = easeOutCubic(progress);
        rotationRef.current = {
          x: targetRotation.startX + (targetRotation.x - targetRotation.startX) * eased,
          y: targetRotation.startY + (targetRotation.y - targetRotation.startY) * eased,
        };
        if (progress >= 1) {
          setTargetRotation(null);
        }
      } else if (!isDragging) {
        rotationRef.current = {
          x: rotationRef.current.x + (dy / canvas.height) * speed,
          y: rotationRef.current.y + (dx / canvas.width) * speed,
        };
      }

      positionsRef.current.forEach((icon, index) => {
        const cosX = Math.cos(rotationRef.current.x);
        const sinX = Math.sin(rotationRef.current.x);
        const cosY = Math.cos(rotationRef.current.y);
        const sinY = Math.sin(rotationRef.current.y);

        const rotatedX = icon.x * cosY - icon.z * sinY;
        const rotatedZ = icon.x * sinY + icon.z * cosY;
        const rotatedY = icon.y * cosX + rotatedZ * sinX;

        const screenX = canvas.width / 2 / (window.devicePixelRatio || 1) + rotatedX;
        const screenY = canvas.height / 2 / (window.devicePixelRatio || 1) + rotatedY;
        const scale = (rotatedZ + 200) / 300;
        const opacity = Math.max(0.2, Math.min(1, (rotatedZ + 150) / 200));

        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.scale(scale, scale);
        ctx.globalAlpha = opacity;

        const iconCanvas = iconCanvasesRef.current[index];
        const drawSize = 64 * iconScale;

        if (iconCanvas && imagesLoadedRef.current[index]) {
          ctx.drawImage(iconCanvas, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, 24 * iconScale, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(100, 255, 218, 0.8)';
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    iconCanvasesRef,
    imagesLoadedRef,
    iconScale,
    isBrowser,
    isDragging,
    mousePos,
    size,
    targetRotation,
  ]);

  if (!isBrowser) {
    return <div style={{ width: size, height: size }} />;
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      role="img"
      aria-label="Interactive 3D icon cloud"
      style={{
        borderRadius: '999px',
        cursor: isDragging ? 'grabbing' : 'grab',
        maxWidth: '100%',
      }}
    />
  );
};

export default IconCloud;

IconCloud.propTypes = {
  slugs: PropTypes.arrayOf(PropTypes.string),
  size: PropTypes.number,
  rotationSpeed: PropTypes.number,
  iconScale: PropTypes.number,
  iconInset: PropTypes.number,
};
