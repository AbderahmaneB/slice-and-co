# Images des pizzas : versions propres

Trois nouvelles images réalisées avec l’outil `imagegen` le 3 octobre 2026 pour remplacer les visuels les plus granuleux. Les ingrédients restent ceux des recettes ; leur disposition change. Les PNG originaux sont conservés.

| Pizza | PNG transparent utilisé | Résolution native |
| --- | --- | --- |
| Buffalo Spicy Chicken | `public/assets/img/pizzas/buffalo-spicy-chicken-hq.png` | 1254 × 1254 |
| Full Cheesy | `public/assets/img/pizzas/full-cheesy-hq.png` | 1254 × 1254 |
| Veggie Supreme | `public/assets/img/pizzas/veggie-supreme-hq.png` | 1254 × 1254 |

Les WebP dans `public/assets/img/pizzas/web/` sont exportés en 320, 480, 800 et 1254 px à une qualité de 0,95. Le script ne dépasse jamais la résolution native. Le suffixe `-hq` distingue les nouvelles images, sans promettre une résolution supérieure aux originaux.

## Reproduire les exports

```powershell
node scripts/optimize-pizzas.mjs buffalo-spicy-chicken-hq.png full-cheesy-hq.png veggie-supreme-hq.png
```

Sur ce poste Windows, le lancement de Chromium nécessite l’option explicite suivante, réservée à cet export local de fichiers de confiance :

```powershell
$env:BROWSER_NO_SANDBOX = '1'
node scripts/optimize-pizzas.mjs buffalo-spicy-chicken-hq.png full-cheesy-hq.png veggie-supreme-hq.png
```

Le rapport `output/pizza-optimization-report.json` indique les dimensions, poids, SHA256 des sources et vérifications de transparence. Les exports ont été vérifiés sans modification des PNG et sans changement de leur canal alpha.

## Consignes exactes de génération retenues

Génération de nouvelles images sans image de référence, avec `transparent_background: true`. La résolution réellement obtenue a été vérifiée après génération : 1254 × 1254 pour chacune, y compris lorsque la consigne demandait davantage.

### Buffalo Spicy Chicken

A clean real-camera food photograph for a French pizzeria website: one whole Buffalo Spicy Chicken pizza seen directly from above, completely isolated as a transparent cutout. Square 2048 x 2048 composition, the complete pizza fits with a narrow transparent margin. A naturally irregular handmade thin pizza, golden-brown baked rim with a few small authentic scorch blisters, modest tomato sauce and melted mozzarella. Sparse, believable toppings: about 10 small irregular pieces of spicy roasted chicken, a few softened red onion arcs, about 8 red and green roasted bell pepper strips, 4 jalapeño rounds. Informal uneven scattering, never concentric circles or symmetry; plenty of visible cheese and sauce between toppings. Photograph as honest contemporary restaurant food photography, soft broad daylight, restrained warm color, a little imperfect and handmade. Cheese is softly melted and mostly matte, sauce has natural soft surfaces, chicken looks cooked and tender. The surface must be photographically smooth at large viewing sizes, without synthetic grain, sandy pixels, etched lines or worm-like painted microtexture. No illustration, no CGI, no plastic gloss, no HDR, no crunchy oversharpening, no dramatic saturation, no overstuffing, no tiny repetitive invented surface details. No garnish other than the specified ingredients. No plate, no props, no shadow halo, no colored background, no lettering. Transparent background with a clean natural pizza edge.

### Full Cheesy

A clean real-camera food photograph for a French pizzeria website: one whole pizza seen directly from above, completely isolated as a transparent cutout. Square composition at 1254 x 1254 or higher native detail; the complete pizza fits with a narrow transparent margin. A naturally irregular handmade thin pizza, golden-brown baked rim with a few small authentic scorch blisters. Honest contemporary restaurant food photography, soft broad daylight, restrained warm color, a little imperfect and handmade. The melted cheese is softly melted and mostly matte with restrained soft highlights. All food surfaces have natural, softly resolved detail that stays clean at large display size. No synthetic grain, sandy pixels, etched lines or worm-like painted microtexture. No illustration, no CGI, no plastic gloss, no HDR, no crunchy oversharpening, no dramatic saturation, no overstuffing, no tiny repetitive invented surface details. No symmetric or concentric arrangement. No plate, props, shadow halo, colored background, lettering or logos. Clean transparent cutout with natural pizza edge. The pizza is Full Cheesy: a thin crème fraîche base, melted mozzarella, a few irregular patches of blue-green gorgonzola and modest yellow-orange cheddar. Plenty of naturally creamy ivory melted cheese, a few lightly browned cheese blisters. The base cheese reads as actual softly melted cheese, not granules, grated flakes or an oily coating. Keep the four cheeses visually plausible and restrained. Do NOT add herbs, vegetables, meat or any other toppings.

### Veggie Supreme

A clean real-camera food photograph for a French pizzeria website: one whole pizza seen directly from above, completely isolated as a transparent cutout. Square composition at 1254 x 1254 or higher native detail; the complete pizza fits with a narrow transparent margin. A naturally irregular handmade thin pizza, golden-brown baked rim with a few small authentic scorch blisters. Honest contemporary restaurant food photography, soft broad daylight, restrained warm color, a little imperfect and handmade. The melted cheese is softly melted and mostly matte with restrained soft highlights. All food surfaces have natural, softly resolved detail that stays clean at large display size. No synthetic grain, sandy pixels, etched lines or worm-like painted microtexture. No illustration, no CGI, no plastic gloss, no HDR, no crunchy oversharpening, no dramatic saturation, no overstuffing, no tiny repetitive invented surface details. No symmetric or concentric arrangement. No plate, props, shadow halo, colored background, lettering or logos. Clean transparent cutout with natural pizza edge. The pizza is Veggie Supreme: a modest tomato sauce base and melted mozzarella, about 7 roasted colored pepper strips, about 7 thin baked mushroom slices, a few soft red onion arcs, about 6 black olive rings and 4 small wilted basil leaves. Sparse, believable, irregular scattering with generous visible cheese and tomato sauce between the vegetables. Actual softened baked mushrooms and peppers, basil lightly wilted. No decorative shredded herbs, no extra vegetables, no meat, no additional toppings.
