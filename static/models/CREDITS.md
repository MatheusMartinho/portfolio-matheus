# 3D assets

## book.glb

The book in the Biblioteca stack is derived from **"Coffee Table Books"** by
**DeezVertz** — https://sketchfab.com/3d-models/coffee-table-books-8aa681cf122c4ada832a78b7dc891d45

Licensed **CC BY 4.0** (http://creativecommons.org/licenses/by/4.0/), which
requires visible attribution wherever the model is published.

What ships here is a derivative, built by `scripts/build-book-glb.js` from the
Sketchfab download (`coffee_table_books.glb`, 27 MB, not committed):

- one of the two identical book meshes, unused UV sets dropped
- geometry recentred and its triangles regrouped into front / spine / back / pages
- textures resized from 4096 to 1024 (512 for the base colour) and re-encoded as JPEG

To rebuild after replacing the source model:

    npm run model:book -- ~/Downloads/coffee_table_books.glb

That rewrites both `static/models/book.glb` and
`src/components/sections/book-glb-layout.js`.
