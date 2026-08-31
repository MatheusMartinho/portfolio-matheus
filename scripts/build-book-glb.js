// Builds the slim, web-sized book GLB from the Sketchfab "coffee table books"
// download, plus the constants the runtime needs.
//
//  * both meshes in the source are the same geometry -> keep one
//  * drop TEXCOORD_1..4 (nothing samples them)
//  * 4096 textures -> 1024 jpeg
//  * positions recentred, so the runtime only rotates + scales into the layout box
//  * indices reordered into 4 contiguous groups (front / spine / back / pages)
//    so each surface of the jacket can take its own material
//
// The source .glb is not in the repo (27 MB); see static/models/CREDITS.md for
// where it comes from and under what licence.
/* eslint-disable no-console -- build script, its output is the point */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const prettier = require('prettier');
const prettierConfig = require('../prettier.config.js');

const [
  SRC,
  OUT_GLB = 'static/models/book.glb',
  OUT_JS = 'src/components/sections/book-glb-layout.js',
] = process.argv.slice(2);
if (!SRC) {
  console.error('usage: node scripts/build-book-glb.js <source.glb> [out.glb] [out-layout.js]');
  process.exit(1);
}

const { json, bin, acc } = require('./_glb-decode.js')(SRC);

const SRC_MESH = 0;
const TEX = 1024;
// the page block never faces the camera in the stack, so its half of the atlas
// doesn't need the resolution the jacket's relief does
const TEX_BASE = 512;
const V_SPLIT = 0.34; // below: page block islands. above: the unwrapped jacket.
const U_BACK_SPINE = 0.46;
const U_SPINE_FRONT = 0.5398;
const GROUPS = ['front', 'spine', 'back', 'pages'];

const prim = json.meshes[SRC_MESH].primitives[0];
const pos = Float32Array.from(acc(prim.attributes.POSITION).arr);
const nrm = Float32Array.from(acc(prim.attributes.NORMAL).arr);
const tan = Float32Array.from(acc(prim.attributes.TANGENT).arr);
const uv0 = Float32Array.from(acc(prim.attributes.TEXCOORD_0).arr);
const srcIdx = acc(prim.indices).arr;

const bb = [
  [Infinity, -Infinity],
  [Infinity, -Infinity],
  [Infinity, -Infinity],
];
for (let i = 0; i < pos.length; i += 3) {
  for (let c = 0; c < 3; c += 1) {
    bb[c][0] = Math.min(bb[c][0], pos[i + c]);
    bb[c][1] = Math.max(bb[c][1], pos[i + c]);
  }
}
const extent = bb.map(([a, b]) => b - a);
for (let i = 0; i < pos.length; i += 3) {
  for (let c = 0; c < 3; c += 1) {
    pos[i + c] -= (bb[c][0] + bb[c][1]) / 2;
  }
}

// ---- group the triangles by where they land in the atlas ----
const tris = srcIdx.length / 3;
const buckets = { front: [], spine: [], back: [], pages: [] };
const rects = {};
for (let t = 0; t < tris; t += 1) {
  let u = 0;
  let v = 0;
  for (let k = 0; k < 3; k += 1) {
    u += uv0[srcIdx[t * 3 + k] * 2];
    v += uv0[srcIdx[t * 3 + k] * 2 + 1];
  }
  u /= 3;
  v /= 3;
  const g =
    v < V_SPLIT ? 'pages' : u < U_BACK_SPINE ? 'back' : u < U_SPINE_FRONT ? 'spine' : 'front';
  buckets[g].push(t);
  if (g === 'pages') {
    continue;
  }
  const r = (rects[g] = rects[g] || { u: [9, -9], v: [9, -9] });
  for (let k = 0; k < 3; k += 1) {
    const i = srcIdx[t * 3 + k];
    r.u[0] = Math.min(r.u[0], uv0[i * 2]);
    r.u[1] = Math.max(r.u[1], uv0[i * 2]);
    r.v[0] = Math.min(r.v[0], uv0[i * 2 + 1]);
    r.v[1] = Math.max(r.v[1], uv0[i * 2 + 1]);
  }
}
const order = [];
const ranges = [];
GROUPS.forEach(g => {
  ranges.push({ name: g, start: order.length * 3, count: buckets[g].length * 3 });
  buckets[g].forEach(t => order.push(t));
});
const idxArr = pos.length / 3 > 65535 ? new Uint32Array(tris * 3) : new Uint16Array(tris * 3);
order.forEach((t, n) => {
  idxArr[n * 3] = srcIdx[t * 3];
  idxArr[n * 3 + 1] = srcIdx[t * 3 + 1];
  idxArr[n * 3 + 2] = srcIdx[t * 3 + 2];
});
ranges.forEach(r =>
  console.log(`  group ${r.name.padEnd(6)} ${String(r.count / 3).padStart(4)} tris`),
);
GROUPS.slice(0, 3).forEach(g =>
  console.log(
    `  rect  ${g.padEnd(6)} u=[${rects[g].u.map(n => n.toFixed(4))}] v=[${rects[g].v.map(n =>
      n.toFixed(4),
    )}]`,
  ),
);

(async () => {
  const jpg = (buf, q, size = TEX) =>
    sharp(buf).resize(size, size, { fit: 'fill' }).jpeg({ quality: q, mozjpeg: true }).toBuffer();
  const view = i => {
    const bv = json.bufferViews[json.images[i].bufferView];
    return bin.slice(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
  };
  const images = [
    await jpg(view(0), 84, TEX_BASE), // base colour — only the page-block islands get sampled
    await jpg(view(1), 88), // occlusion(R) + roughness(G) + metalness(B)
    await jpg(view(2), 94), // normal — needs the extra bits
  ];
  images.forEach((b, i) => console.log(`  image ${i}: ${(b.length / 1024).toFixed(0)} KB`));

  const chunks = [];
  let offset = 0;
  const bufferViews = [];
  const bvi = (data, extra = {}) => {
    const buf = Buffer.from(
      data.buffer || data,
      data.byteOffset || 0,
      data.byteLength || data.length,
    );
    while (offset % 4) {
      chunks.push(Buffer.alloc(1));
      offset += 1;
    }
    bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: buf.length, ...extra });
    chunks.push(buf);
    offset += buf.length;
    return bufferViews.length - 1;
  };
  const aPos = bvi(pos, { target: 34962 });
  const aNrm = bvi(nrm, { target: 34962 });
  const aTan = bvi(tan, { target: 34962 });
  const aUv = bvi(uv0, { target: 34962 });
  const aIdx = bvi(idxArr, { target: 34963 });
  const imgViews = images.map(b => bvi(b));

  const gltf = {
    // the source is CC-BY: keep its credit travelling with the asset
    asset: {
      version: '2.0',
      generator: 'portfolio-matheus slim-book',
      extras: json.asset.extras,
    },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: 'Book' }],
    meshes: [
      {
        name: 'Book',
        primitives: [
          {
            attributes: { POSITION: 0, NORMAL: 1, TANGENT: 2, TEXCOORD_0: 3 },
            indices: 4,
            material: 0,
          },
        ],
      },
    ],
    accessors: [
      {
        bufferView: aPos,
        componentType: 5126,
        count: pos.length / 3,
        type: 'VEC3',
        min: extent.map(e => -e / 2),
        max: extent.map(e => e / 2),
      },
      { bufferView: aNrm, componentType: 5126, count: nrm.length / 3, type: 'VEC3' },
      { bufferView: aTan, componentType: 5126, count: tan.length / 4, type: 'VEC4' },
      { bufferView: aUv, componentType: 5126, count: uv0.length / 2, type: 'VEC2' },
      {
        bufferView: aIdx,
        componentType: idxArr.BYTES_PER_ELEMENT === 4 ? 5125 : 5123,
        count: idxArr.length,
        type: 'SCALAR',
      },
    ],
    materials: [
      {
        name: 'Book',
        doubleSided: true,
        normalTexture: { index: 2 },
        occlusionTexture: { index: 1 },
        pbrMetallicRoughness: {
          baseColorTexture: { index: 0 },
          metallicFactor: 0,
          roughnessFactor: 1,
          metallicRoughnessTexture: { index: 1 },
        },
      },
    ],
    textures: images.map((_, i) => ({ sampler: 0, source: i })),
    images: imgViews.map(v => ({ bufferView: v, mimeType: 'image/jpeg' })),
    samplers: [{ magFilter: 9729, minFilter: 9987, wrapS: 33071, wrapT: 33071 }],
    bufferViews,
    buffers: [{ byteLength: 0 }],
  };

  const binChunk = Buffer.concat(chunks);
  const binPadded = Buffer.concat([binChunk, Buffer.alloc((4 - (binChunk.length % 4)) % 4)]);
  gltf.buffers[0].byteLength = binPadded.length;
  const raw = Buffer.from(JSON.stringify(gltf), 'utf8');
  const jsonChunk =
    raw.length % 4 ? Buffer.concat([raw, Buffer.alloc(4 - (raw.length % 4), 0x20)]) : raw;

  const head = Buffer.alloc(12);
  head.write('glTF', 0);
  head.writeUInt32LE(2, 4);
  head.writeUInt32LE(12 + 8 + jsonChunk.length + 8 + binPadded.length, 8);
  const ch = (len, type) => {
    const b = Buffer.alloc(8);
    b.writeUInt32LE(len, 0);
    b.write(type, 4);
    return b;
  };
  fs.mkdirSync(path.dirname(OUT_GLB), { recursive: true });
  fs.writeFileSync(
    OUT_GLB,
    Buffer.concat([
      head,
      ch(jsonChunk.length, 'JSON'),
      jsonChunk,
      ch(binPadded.length, 'BIN\0'),
      binPadded,
    ]),
  );
  console.log('wrote', OUT_GLB, `${(fs.statSync(OUT_GLB).size / 1024).toFixed(0)} KB`);

  const n = x => Number(x.toFixed(4));
  const groupsJs = ranges
    .map(r => `  { name: '${r.name}', start: ${r.start}, count: ${r.count} },`)
    .join('\n');
  const uvJs = GROUPS.slice(0, 3)
    .map(g => {
      const r = rects[g];
      const parts = [
        `u0: ${n(r.u[0])}`,
        `u1: ${n(r.u[1])}`,
        `v0: ${n(r.v[0])}`,
        `v1: ${n(r.v[1])}`,
      ];
      return `  ${g}: { ${parts.join(', ')} },`;
    })
    .join('\n');

  const layout = [
    '// GENERATED by scripts/build-book-glb.js — do not edit by hand.',
    '// Layout constants for /models/book.glb: the size of the model itself, the index',
    '// ranges of each material group, and where each panel of the dust jacket lives in',
    '// the UV atlas (so a per-book cover / spine canvas can be mapped onto it).',
    '',
    `export const BOOK_EXTENT = { x: ${n(extent[0])}, y: ${n(extent[1])}, z: ${n(extent[2])} };`,
    '',
    'export const BOOK_GROUPS = [',
    groupsJs,
    '];',
    '',
    'export const BOOK_UV = {',
    uvJs,
    '};',
    '',
  ].join('\n');
  fs.writeFileSync(OUT_JS, prettier.format(layout, { ...prettierConfig, parser: 'babel' }));
  console.log('wrote', OUT_JS);
})();
