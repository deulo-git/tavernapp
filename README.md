# TavernApp

PWA per a iPad en horitzontal que mostra al personal del restaurant la carta de **Menjar**, **Begudes** i
**Informació**, amb al·lèrgens, fotos, mode "Mostra al client" i traducció automàtica a ES/EN/FR.

- Sense login ni configuració: les tres tablets veuen el mateix. Graella de colors per categoria.
- Mode edició protegit amb PIN, amb botons per afegir, modificar, ordenar i eliminar (amb "Desfer").
- Sincronització en temps real entre tablets i funcionament sense connexió (Firebase Firestore).
- Traducció automàtica amb DeepL Free a través d'un Cloudflare Worker.

Stack: React 19 · TypeScript · Vite 8 · vite-plugin-pwa · Firebase · Cloudflare Workers · Vitest.

👉 Instal·lació, publicació i guia d'ús: [docs/INSTALLACIO.md](docs/INSTALLACIO.md)

```bash
npm install
```

```bash
npm run dev
```
