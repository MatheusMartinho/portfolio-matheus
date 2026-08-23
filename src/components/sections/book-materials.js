// Shared drawing + material helpers for the 3D books (stack and detail view).
// Everything is in CSS-pixel world units; textures are painted on canvases so
// the type stays crisp at any zoom. Each painted surface has two versions:
// the colour map and a height map (same layout, white = raised) that drives
// the bump so type, foil and edges read as embossed cloth.

const TEX_W = 2048;
const CLOTH_TILE = 256; // px of the procedural weave tile
const CLOTH_SPAN = 110; // world px one weave tile covers

// Spine thickness in px, derived from page count so the stack has some rhythm.
export const thickness = pages => Math.round(Math.min(92, Math.max(46, 36 + (pages || 320) / 12)));

// ---------- cover images ----------
const coverCache = new Map();

// Loads a cover as a texture (cached per url + rotation, so the stack's rotated
// top face and the detail view's upright cover don't fight over one object).
export const loadCoverTexture = (THREE, url, maxAniso, rotation, onLoad) => {
  const key = `${url}|${rotation}`;
  const cached = coverCache.get(key);
  if (cached) {
    onLoad(cached);
    return;
  }
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');
  loader.load(
    url,
    tex => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAniso;
      tex.center.set(0.5, 0.5);
      tex.rotation = rotation;
      tex.needsUpdate = true;
      coverCache.set(key, tex);
      onLoad(tex);
    },
    undefined,
    () => {},
  );
};

// ---------- grain + cloth ----------
let noiseCanvas = null;
let clothCanvas = null;

const getNoise = () => {
  if (noiseCanvas) {
    return noiseCanvas;
  }
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + Math.round((Math.random() * 2 - 1) * 42);
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  noiseCanvas = c;
  return c;
};

const drawGrain = (ctx, w, h, scale, alpha) => {
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = alpha;
  ctx.scale(scale, scale);
  ctx.fillStyle = ctx.createPattern(getNoise(), 'repeat');
  ctx.fillRect(0, 0, w / scale, h / scale);
  ctx.restore();
};

const getClothCanvas = () => {
  if (clothCanvas) {
    return clothCanvas;
  }
  const size = CLOTH_TILE;
  const pitch = 3;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#7a7a7a';
  ctx.fillRect(0, 0, size, size);
  // warp threads
  for (let x = 0; x < size; x += pitch) {
    const v = 150 + Math.round(Math.random() * 60);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(x, 0, pitch - 1, size);
  }
  // weft threads, woven over
  ctx.globalAlpha = 0.6;
  for (let y = 0; y < size; y += pitch) {
    const v = 140 + Math.round(Math.random() * 80);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(0, y, size, pitch - 1);
  }
  ctx.globalAlpha = 1;
  // slubs
  for (let i = 0; i < 160; i += 1) {
    ctx.fillStyle = `rgba(0,0,0,${0.1 + Math.random() * 0.15})`;
    ctx.fillRect(
      Math.random() * size,
      Math.random() * size,
      1 + Math.random() * 3,
      1 + Math.random() * 2,
    );
  }
  clothCanvas = c;
  return c;
};

// Paints the weave into a height-map canvas at the right pitch for a face
// that is `worldW` px wide (s = canvas px per world px).
const drawClothInto = (ctx, cw, ch, s, alpha = 0.55) => {
  const k = (CLOTH_SPAN / CLOTH_TILE) * s;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.scale(k, k);
  ctx.fillStyle = ctx.createPattern(getClothCanvas(), 'repeat');
  ctx.fillRect(0, 0, cw / k, ch / k);
  ctx.restore();
};

// Soft fall-off at every edge of a height map -> reads as a rounded board edge.
const drawEdgeBevel = (ctx, cw, ch, px) => {
  const sides = [
    [0, 0, px, 0],
    [cw, 0, cw - px, 0],
    [0, 0, 0, px],
    [0, ch, 0, ch - px],
  ];
  sides.forEach(([x0, y0, x1, y1]) => {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, 'rgba(0,0,0,0.9)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, cw, ch);
  });
};

// Cloth as a standalone bump for plain faces (board edges).
export const clothTexture = (THREE, w, h) => {
  const tex = new THREE.CanvasTexture(getClothCanvas());
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(w / CLOTH_SPAN, h / CLOTH_SPAN);
  tex.anisotropy = 8;
  return tex;
};

// Book cloth: physical material with sheen so the fabric catches light at grazing angles.
export const fabricMaterial = (THREE, opts = {}) =>
  new THREE.MeshPhysicalMaterial({
    roughness: 0.84,
    metalness: 0,
    sheen: 0.06,
    sheenRoughness: 0.85,
    sheenColor: new THREE.Color(0xa8977f),
    envMapIntensity: 0.14,
    bumpScale: 1.4,
    ...opts,
  });

export const clothMaterial = (THREE, color, w, h, extra = {}) =>
  fabricMaterial(THREE, { color, bumpMap: clothTexture(THREE, w, h), ...extra });

// Page edges: one tile holds ~21 sheet lines and covers PAGES_SPAN world px.
// `axis` says which UV axis the sheets stack along — on a box face that must be
// the axis mapped to the book's thickness, or the cut looks like a solid slab.
const PAGES_SPAN = 51;

export const pagesTexture = (THREE, thick, axis = 'v') => {
  const across = axis === 'u'; // sheets stack along u -> lines run vertically
  const c = document.createElement('canvas');
  c.width = across ? 64 : 8;
  c.height = across ? 8 : 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#efe6d3';
  ctx.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 64; i += 3) {
    ctx.fillStyle = i % 2 ? 'rgba(90,74,52,0.5)' : 'rgba(60,48,32,0.72)';
    if (across) {
      ctx.fillRect(i, 0, 1, c.height);
    } else {
      ctx.fillRect(0, i, c.width, 1);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  const n = thick / PAGES_SPAN;
  tex.repeat.set(across ? n : 1, across ? 1 : n);
  // 1px sheet lines are barely minified here; mipmaps would blur them to a
  // solid slab, so filter linearly instead
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = 8;
  return tex;
};

// Soft studio reflections so cloth and glossy covers react to the light.
export const makeEnvironment = async (THREE, renderer) => {
  const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  return env;
};

// Height map for a cover image: the art itself (foil-like relief) + weave + bevelled edges.
const coverHeightCache = new Map();
export const coverHeightTexture = (THREE, image, key) => {
  if (coverHeightCache.has(key)) {
    return coverHeightCache.get(key);
  }
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = Math.round((1024 * image.height) / image.width);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.drawImage(image, 0, 0, c.width, c.height);
  ctx.restore();
  drawClothInto(ctx, c.width, c.height, 1024 / 370, 0.4);
  drawEdgeBevel(ctx, c.width, c.height, 14);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  coverHeightCache.set(key, tex);
  return tex;
};

// ---------- text helpers ----------
const measureTracked = (ctx, text, spacing) => {
  const chars = [...text];
  return chars.reduce((sum, c) => sum + ctx.measureText(c).width, 0) + spacing * (chars.length - 1);
};

const drawTracked = (ctx, text, x, y, spacing) => {
  let cx = x;
  [...text].forEach((c, i, arr) => {
    ctx.fillText(c, cx, y);
    cx += ctx.measureText(c).width + (i < arr.length - 1 ? spacing : 0);
  });
};

const truncate = (ctx, text, spacing, max) => {
  if (measureTracked(ctx, text, spacing) <= max) {
    return text;
  }
  let t = text;
  while (t.length > 1 && measureTracked(ctx, `${t}…`, spacing) > max) {
    t = t.slice(0, -1).trimEnd();
  }
  return `${t}…`;
};

const wrapText = (ctx, text, maxW) => {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  words.forEach(w => {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  });
  if (line) {
    lines.push(line);
  }
  return lines;
};

// ---------- spine ----------
// mode 'color' paints the real spine; mode 'height' paints the same layout as a
// height map (grey cloth, white raised type/marks, bevelled edges).
export const drawSpine = (book, W, H, readingLabel, mode = 'color') => {
  const height = mode === 'height';
  const c = document.createElement('canvas');
  const s = TEX_W / W; // css px -> texture px
  c.width = TEX_W;
  c.height = Math.round(H * s);
  const ctx = c.getContext('2d');
  const { width: cw, height: ch } = c;

  if (height) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, cw, ch);
    drawClothInto(ctx, cw, ch, s);
  } else {
    ctx.fillStyle = book.spine;
    ctx.fillRect(0, 0, cw, ch);

    const v = ctx.createLinearGradient(0, 0, 0, ch);
    v.addColorStop(0, 'rgba(255,255,255,0.18)');
    v.addColorStop(0.18, 'rgba(255,255,255,0.05)');
    v.addColorStop(0.45, 'rgba(255,255,255,0)');
    v.addColorStop(0.78, 'rgba(0,0,0,0.06)');
    v.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, cw, ch);

    const hz = ctx.createLinearGradient(0, 0, cw, 0);
    hz.addColorStop(0, 'rgba(0,0,0,0.18)');
    hz.addColorStop(0.05, 'rgba(0,0,0,0)');
    hz.addColorStop(0.95, 'rgba(0,0,0,0)');
    hz.addColorStop(1, 'rgba(0,0,0,0.18)');
    ctx.fillStyle = hz;
    ctx.fillRect(0, 0, cw, ch);

    drawGrain(ctx, cw, ch, s * 0.55, 0.35);

    // board edge, hinge groove, bottom edge
    const px = Math.max(1, Math.round(s));
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(0, 0, cw, px);
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(0, px, cw, px * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, ch - px, cw, px);
  }

  // ---- type ----
  const color = height ? '#ffffff' : book.spineText;
  const accent = height ? '#ffffff' : '#caf438';
  const padX = W * 0.04 * s;
  const gap = 16 * s;
  const midY = ch / 2;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  // monogram, right end
  const r = 9.5 * s;
  const markX = cw - padX - r;
  ctx.save();
  ctx.globalAlpha = height ? 1 : 0.8;
  ctx.lineWidth = 1.3 * s;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(markX, midY, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = `500 ${12.5 * s}px Newsreader, Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillText('M', markX, midY + 0.6 * s);
  ctx.restore();
  ctx.textAlign = 'left';

  let rightEdge = markX - r - gap;

  if (book.status === 'reading') {
    // pill badge with a green dot
    ctx.font = `${9 * s}px "SF Mono", "Fira Code", Menlo, monospace`;
    const label = readingLabel.toUpperCase();
    const sp = 0.08 * 9 * s;
    const tw = measureTracked(ctx, label, sp);
    const dot = 6 * s;
    const pw = tw + dot + 6 * s + 14 * s;
    const ph = 17 * s;
    const bx = rightEdge - pw;
    ctx.save();
    ctx.lineWidth = 1 * s;
    ctx.strokeStyle = color;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(bx, midY - ph / 2, pw, ph, ph / 2);
    } else {
      ctx.arc(bx + ph / 2, midY, ph / 2, Math.PI / 2, -Math.PI / 2);
      ctx.arc(bx + pw - ph / 2, midY, ph / 2, -Math.PI / 2, Math.PI / 2);
      ctx.closePath();
    }
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(bx + 7 * s + dot / 2, midY, dot / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    drawTracked(ctx, label, bx + 7 * s + dot + 6 * s, midY + 0.5 * s, sp);
    ctx.restore();
    rightEdge = bx - gap;
  } else if (book.year && W >= 560) {
    ctx.font = `${11 * s}px "SF Mono", "Fira Code", Menlo, monospace`;
    const sp = 0.08 * 11 * s;
    const tw = measureTracked(ctx, String(book.year), sp);
    ctx.save();
    ctx.globalAlpha = height ? 1 : 0.75;
    drawTracked(ctx, String(book.year), rightEdge - tw, midY + 0.5 * s, sp);
    ctx.restore();
    rightEdge -= tw + gap;
  }

  let leftEdge = padX;
  if (book.author && W >= 560) {
    ctx.font = `500 ${10.5 * s}px Sora, "Calibre", sans-serif`;
    const sp = 0.14 * 10.5 * s;
    const label = truncate(ctx, book.author.toUpperCase(), sp, W * 0.26 * s);
    ctx.save();
    ctx.globalAlpha = height ? 1 : 0.9;
    drawTracked(ctx, label, leftEdge, midY + 0.5 * s, sp);
    ctx.restore();
    leftEdge += measureTracked(ctx, label, sp) + gap;
  }

  // title, centred in what's left, shrinking to fit
  const avail = rightEdge - leftEdge;
  let size = W < 480 ? 15 : 23;
  ctx.font = `500 ${size * s}px Newsreader, Georgia, serif`;
  while (ctx.measureText(book.title).width > avail && size > 13) {
    size -= 0.5;
    ctx.font = `500 ${size * s}px Newsreader, Georgia, serif`;
  }
  let title = book.title;
  if (ctx.measureText(title).width > avail) {
    title = truncate(ctx, title, 0, avail);
  }
  ctx.textAlign = 'center';
  ctx.fillText(title, leftEdge + avail / 2, midY + 1 * s);

  if (height) {
    drawEdgeBevel(ctx, cw, ch, Math.round(2.5 * s));
  }

  return c;
};

// ---------- back cover ----------
const hashDigits = str => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
  }
  return `978${String(h).padStart(10, '0')}`.slice(0, 13);
};

// EAN-13 style bars so the label reads as a real barcode.
const EAN_L = [
  '0001101',
  '0011001',
  '0010011',
  '0111101',
  '0100011',
  '0110001',
  '0101111',
  '0111011',
  '0110111',
  '0001011',
];

// Relative luminance of a #rrggbb colour (sRGB, good enough for picking ink).
const luminance = hex => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) {
    return 0.5;
  }
  const n = parseInt(m[1], 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
};

export const drawBack = (book, W, H, blurb, site, mode = 'color') => {
  const height = mode === 'height';
  const c = document.createElement('canvas');
  const s = 1024 / W;
  c.width = 1024;
  c.height = Math.round(H * s);
  const ctx = c.getContext('2d');
  const { width: cw, height: ch } = c;

  if (height) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, cw, ch);
    drawClothInto(ctx, cw, ch, s);
  } else {
    ctx.fillStyle = book.spine;
    ctx.fillRect(0, 0, cw, ch);
    const g = ctx.createLinearGradient(0, 0, cw, ch);
    g.addColorStop(0, 'rgba(255,255,255,0.08)');
    g.addColorStop(1, 'rgba(0,0,0,0.14)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, cw, ch);
    drawGrain(ctx, cw, ch, s * 0.55, 0.35);
  }

  // sheen + env reflections are additive and lift dark pixels, so the blurb needs
  // more contrast than the spine's own ink to stay readable on a pale cloth
  const pale = luminance(book.spine) > 0.45;
  const color = height ? '#ffffff' : pale ? '#241017' : book.spineText;
  const m = W * 0.09 * s;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  if (blurb) {
    const size = 17.5 * s;
    ctx.font = `500 ${size}px Newsreader, Georgia, serif`;
    const lines = wrapText(ctx, blurb, cw - m * 2).slice(0, 10);
    let y = m + size;
    lines.forEach(l => {
      ctx.fillText(l, m, y);
      y += size * 1.45;
    });
  }

  // monogram + site, bottom left
  const r = 11 * s;
  const cy = ch - m - r;
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1.3 * s;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(m + r, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = `500 ${14 * s}px Newsreader, Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('M', m + r, cy + 0.6 * s);
  ctx.restore();
  if (site) {
    ctx.save();
    ctx.globalAlpha = height ? 1 : 0.9;
    ctx.font = `${9 * s}px "SF Mono", "Fira Code", Menlo, monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    drawTracked(ctx, site.toUpperCase(), m + r * 2 + 10 * s, cy, 0.12 * 8 * s);
    ctx.restore();
  }

  // barcode label, bottom right (a raised sticker on the height map)
  const bw = 120 * s;
  const bh = 62 * s;
  const bx = cw - m - bw;
  const by = ch - m - bh;
  ctx.fillStyle = height ? '#c8c8c8' : '#f4efe6';
  ctx.fillRect(bx, by, bw, bh);
  const isbn = (book.isbn || '').replace(/\D/g, '');
  const digits = (isbn.length >= 12 ? isbn : hashDigits(book.title)).padEnd(13, '0');
  ctx.fillStyle = height ? '#8a8a8a' : '#1a1a1a';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `${7 * s}px "SF Mono", "Fira Code", Menlo, monospace`;
  ctx.fillText(isbn ? `ISBN ${isbn}` : 'ISBN', bx + 8 * s, by + 12 * s);
  const bits = `101${digits
    .slice(0, 6)
    .split('')
    .map(d => EAN_L[+d])
    .join('')}01010${digits
    .slice(6, 12)
    .split('')
    .map(d => EAN_L[+d])
    .join('')}101`;
  const unit = (bw - 16 * s) / bits.length;
  const top = by + 17 * s;
  const hgt = bh - 28 * s;
  let x = bx + 8 * s;
  [...bits].forEach(b => {
    if (b === '1') {
      ctx.fillRect(x, top, unit * 1.05, hgt);
    }
    x += unit;
  });
  ctx.font = `${7.5 * s}px "SF Mono", "Fira Code", Menlo, monospace`;
  ctx.fillText(digits, bx + 8 * s, by + bh - 4 * s);

  if (height) {
    drawEdgeBevel(ctx, cw, ch, Math.round(2.5 * s));
  }

  return c;
};
