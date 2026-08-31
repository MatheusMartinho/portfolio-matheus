// Minimal GLB reader: returns the glTF JSON, the BIN chunk and an accessor
// reader. Only what build-book-glb.js needs — no glTF extensions.
const fs = require('fs');

const CT = {
  5120: [Int8Array, 1],
  5121: [Uint8Array, 1],
  5122: [Int16Array, 2],
  5123: [Uint16Array, 2],
  5125: [Uint32Array, 4],
  5126: [Float32Array, 4],
};
const NC = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };

module.exports = file => {
  const b = fs.readFileSync(file);
  if (b.toString('utf8', 0, 4) !== 'glTF') {
    throw new Error(`${file} is not a GLB`);
  }
  let off = 12;
  let json = null;
  let bin = null;
  while (off < b.length) {
    const len = b.readUInt32LE(off);
    const type = b.toString('utf8', off + 4, off + 8);
    if (type.startsWith('JSON')) {
      json = JSON.parse(b.toString('utf8', off + 8, off + 8 + len));
    } else {
      bin = b.slice(off + 8, off + 8 + len);
    }
    off += 8 + len;
  }

  const acc = i => {
    const a = json.accessors[i];
    const bv = json.bufferViews[a.bufferView];
    const [TA, sz] = CT[a.componentType];
    const n = NC[a.type];
    const start = (bv.byteOffset || 0) + (a.byteOffset || 0);
    if (bv.byteStride && bv.byteStride !== sz * n) {
      const out = new TA(a.count * n);
      const dv = new DataView(bin.buffer, bin.byteOffset);
      const get = TA === Float32Array ? 'getFloat32' : `getUint${sz * 8}`;
      for (let k = 0; k < a.count; k += 1) {
        for (let c = 0; c < n; c += 1) {
          out[k * n + c] = dv[get](start + k * bv.byteStride + c * sz, true);
        }
      }
      return { arr: out, n };
    }
    const from = bin.byteOffset + start;
    return { arr: new TA(bin.buffer.slice(from, from + a.count * n * sz)), n };
  };

  return { json, bin, acc };
};
