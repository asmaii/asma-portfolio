# Asma Hammami Portfolio

Editorial portfolio built with Tailwind CSS 3, Webpack 5 and GSAP ScrollTrigger. The design palette is warm ivory, ink, slate blue and muted rose; no green palette is used.

## Requirements
- Node.js 18.18+ (Node 20 LTS recommended)
- npm 9+

## Install and develop
```bash
npm install
npm run dev
```
Webpack serves the development site at http://localhost:8080.

## Production build
```bash
npm run build
```
The deployable site is written to `dist/`. Preview it with `npm run preview`.

## Project structure
- `src/index.html` — page markup (Webpack injects compiled assets automatically)
- `src/main.js` — entry point
- `src/main.css` — Tailwind directives and font import
- `src/styles.css` — portfolio styles and responsive layout
- `src/script.js` — navigation, pagination and GSAP interactions
- `img/` — images, logos and favicons copied into `dist/img/`

Do not add manual `main.js` or `main.css` script/link tags to `src/index.html`; HtmlWebpackPlugin injects the bundle. GSAP is installed from npm and bundled locally (no CDN dependency).


## Clean install / Tailwind compatibility

This project pins Tailwind CSS to v3.4.17 because its CSS entry uses the v3 `@tailwind` directives and PostCSS plugin. If you previously installed a different Tailwind major version, close the dev server and run the following in PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install
npm run dev
```

The production Webpack configuration splits vendor code and the runtime into separate chunks. The original large PNG portrait is excluded from the built output because responsive WebP variants are already used by the page.
