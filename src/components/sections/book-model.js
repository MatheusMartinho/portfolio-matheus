// Loads the scanned book model once and hands the stack everything it needs to
// dress it up per title: the geometry (already carved into front / spine / back
// / pages material groups by scripts/build-book-glb.js), the shared normal and
// occlusion-roughness maps baked from the original 4K render, and the UV
// transform that drops a flat cover or spine canvas onto the right panel of the
// unwrapped dust jacket.

import { BOOK_EXTENT, BOOK_GROUPS, BOOK_UV } from './book-glb-layout';

export { BOOK_EXTENT, BOOK_GROUPS };

const MODEL_URL = '/models/book.glb';

// index into the material array a mesh must pass to THREE.Mesh, in group order
export const SLOT = BOOK_GROUPS.reduce((acc, g, i) => ({ ...acc, [g.name]: i }), {});

let pending = null;

// Shared across every book in the stack — the geometry never changes, only the
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
        // the render's own colours — only the page-block islands of the atlas
        // are still sampled, the jacket panels get repainted per book
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

// The jacket is unwrapped into one atlas, so each panel is a sub-rectangle of
// UV space with its own orientation. These build the texture matrix that maps a
// panel's rectangle back onto a full 0..1 canvas, keeping the same reading
// direction the flat-box version had: the cover art quarter-turned to face the
// camera, the spine running along the length of the book.
const PANEL_MATRIX = {
  front: ({ u0, u1, v0, v1 }) => {
    const du = u1 - u0;
    const dv = v1 - v0;
    return [-1 / du, 0, 1 + u0 / du, 0, 1 / dv, -v0 / dv];
  },
  spine: ({ u0, u1, v0, v1 }) => {
    const du = u1 - u0;
    const dv = v1 - v0;
    return [0, -1 / dv, 1 + v0 / dv, 1 / du, 0, -u0 / du];
  },
};

export const mapToPanel = (THREE, tex, panel) => {
  const [a, b, c, d, e, f] = PANEL_MATRIX[panel](BOOK_UV[panel]);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.matrixAutoUpdate = false;
  tex.matrix.set(a, b, c, d, e, f, 0, 0, 1);
  return tex;
};
