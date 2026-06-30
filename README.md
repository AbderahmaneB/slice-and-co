# Slice & Co Pizza — site

Site vitrine statique (HTML/CSS/JS) de Slice & Co Pizza, Paris 15ᵉ.

## Déploiement Cloudflare Pages

Site **statique pur** : les fichiers sont à la racine du dépôt, aucune compilation requise.

Réglages à indiquer dans Cloudflare Pages (Workers & Pages → Create → Pages → Connect to Git) :

| Réglage | Valeur |
|---|---|
| Framework preset | **None** |
| Build command | *(vide)* |
| Build output directory | **/** *(racine)* |

Pages publiées : `index.html`, `menu.html`, `offres.html`, `contact.html`.

## Aperçu local

```bash
npx serve .
# ou
python -m http.server 8080
```
