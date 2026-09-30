# Slice & Co Pizza — site

Site vitrine statique (HTML/CSS/JS) de Slice & Co Pizza, Paris 15ᵉ.

## Déploiement Cloudflare Pages

Site **statique pur** : les fichiers du site sont dans `public/`, aucune compilation requise. `wrangler.jsonc` utilise également ce dossier pour les assets Cloudflare Workers.

Réglages à indiquer dans Cloudflare Pages (Workers & Pages → Create → Pages → Connect to Git) :

| Réglage | Valeur |
|---|---|
| Framework preset | **None** |
| Build command | *(vide)* |
| Build output directory | **public** |

Pages publiées : `index.html`, `menu.html`, `offres.html`, `contact.html`.

## Aperçu local

```bash
npx serve public
# ou
python -m http.server 8080 --directory public
```

## Images et présentation

Les 23 photos de pizzas sont dans `public/assets/img/pizzas/`. Les variantes WebP du sous-dossier `web/` sont utilisées pour alléger les pages ; les PNG sont conservés. `node scripts/optimize-pizzas.mjs` régénère les variantes (Node 22+ et Chrome/Edge installés).

La présentation d'origine et ses polices Anton, Oswald, Pacifico et Inter sont conservées. Les polices sont servies localement ; licences et provenance dans `public/assets/fonts/`.

L'introduction ne joue qu'à la première arrivée dans une session d'onglet (`sessionStorage`, clé `sco_intro_seen`). Elle reste masquée lors des changements de page, au rechargement, sans JavaScript et lorsque le mouvement réduit est demandé.

Le bouton « Animations » permet de mettre les mouvements en pause. Le choix est conservé entre les pages (`localStorage`, clé `sco_motion_paused`) ; la préférence de mouvement réduit de l'appareil est respectée. Les états de survol, de focus clavier et de contraste élevé sont définis dans `public/assets/interactions.css`.
