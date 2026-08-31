// Loads the scanned book model once and hands the stack and the detail view
// everything they need to dress it up per title: the geometry (already carved
// into front / spine / back / pages material groups by
// scripts/build-book-glb.js), the shared normal and occlusion-roughness maps
// baked from the original 4K render, and the UV transform that drops a flat
// cover or spine canvas onto the right panel of the unwrapped dust jacket.

import { BOOK_EXTENT, BOOK_GROUPS, BOOK_UV } from './book-glb-layout';

export { BOOK_EXTENT, BOOK_GROUPS };

const MODEL_URL = '/models/book.glb';

// index into the material array a mesh must pass to THREE.Mesh, in group order
export const SLOT = BOOK_GROUPS.reduce((acc, g, i) => ({ ...acc, [g.name]: i }), {});

let pending = null;

// Shared across every book on the page — the geometry never changes, only the
// materials hung off its four groups do.
export const loadBookModel = () => {
  if (!pending) {
    pending = (async () => {
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const gltf = await new GLTFLoader().loadAsync(MODEL_URL);
      let mesh = null;
      gltf.scene.traverse(o => {
        if (o.isMesh && !mesh) {
          mesh = o;
        }
      });
      if (!mesh) {
        throw new Error('book.glb has no mesh');
      }
      const { geometry, material } = mesh;
      geometry.clearGroups();
      BOOK_GROUPS.forEach((g, i) => geometry.addGroup(g.start, g.count, i));
      return {
        geometry,
        normalMap: material.normalMap,
        // one packed image: occlusion in R, roughness in G, metalness in B
        ormMap: material.roughnessMap || material.metalnessMap || material.aoMap,
        // the render's own colours. The jacket panels get repainted per book,
        // so what survives is the page block: its cut sheet edges
        baseMap: material.map,
      };
    })();
    // a failed fetch shouldn't poison later mounts
    pending.catch(() => {
      pending = null;
    });
  }
  return pending;
};

// The jacket is unwrapped into one atlas, so each panel is a sub-rectangle of UV
// space with its own orientation. These build the texture matrix that maps a
// panel's rectangle back onto a full 0..1 canvas — and which way is "up" depends
// on how the book is posed, so each pose gets its own set.
//
// Each entry returns the first two rows of the matrix, [a b c, d e f], meaning
//   s = a*u + b*v + c        (where s, t index the canvas)
//   t = d*u + e*v + f
const PANEL_MATRIX = {
  // the stack lies the book down and looks at its spine, so the cover art needs
  // the same quarter-turn the flat-box version applied to its top face
  flat: {
    front: (u0, du, v0, dv) => [-1 / du, 0, 1 + u0 / du, 0, 1 / dv, -v0 / dv],
    spine: (u0, du, v0, dv) => [0, -1 / dv, 1 + v0 / dv, 1 / du, 0, -u0 / du],
  },
  // the detail view stands the book up facing the camera: both covers read
  // straight, and the spine runs top to bottom down the left edge
  upright: {
    front: (u0, du, v0, dv) => [1 / du, 0, -u0 / du, 0, 1 / dv, -v0 / dv],
    back: (u0, du, v0, dv) => [1 / du, 0, -u0 / du, 0, 1 / dv, -v0 / dv],
    spine: (u0, du, v0, dv) => [0, -1 / dv, 1 + v0 / dv, 1 / du, 0, -u0 / du],
  },
};

export const mapToPanel = (THREE, tex, panel, pose = 'flat') => {
  const { u0, u1, v0, v1 } = BOOK_UV[panel];
  const [a, b, c, d, e, f] = PANEL_MATRIX[pose][panel](u0, u1 - u0, v0, v1 - v0);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.matrixAutoUpdate = false;
  tex.matrix.set(a, b, c, d, e, f, 0, 0, 1);
  return tex;
};
