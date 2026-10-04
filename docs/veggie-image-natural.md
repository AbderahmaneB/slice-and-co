# Veggie Supreme — remplacement du 4 octobre 2026

Le visuel `veggie-supreme-clean` présentait des ingrédients trop régulièrement espacés et un aspect artificiel. Les premiers essais de remplacement accentuaient trop les petites textures. Le visuel retenu utilise une disposition moins régulière, une lumière diffuse et des légumes partiellement superposés.

- Source actuelle : `public/assets/img/pizzas/veggie-supreme-natural.png`, 1254 × 1254, alpha transparent.
- WebP : 320, 480, 800 et 1254 px, qualité 95 %, sans agrandissement ni filtre de netteté ajouté. Alpha des exports identique au PNG redimensionné.
- Intégration : carte, carrousel d'accueil, sources des animations et export vidéo V3.2. Nouvelles adresses de fichiers et version du script pour invalider les anciens caches.
- L'archive PNG proposée au téléchargement contient la nouvelle image sous le nom `pizzas/veggie-supreme.png`.
- Les anciens PNG et les MP4 déjà exportés restent des archives. Ils ne constituent pas la version courante.

Visuel généré avec l'outil intégré **imagegen**, puis détouré avec le même outil. Ce n'est pas une photographie d'un produit réellement servi. Une texture de cuisson reste visible à la résolution native ; aucun dégrainage logiciel n'a été appliqué.

## Consigne de création retenue

Photograph for a pizzeria menu, taken on a real camera. One whole normal vegetarian pizza on a plain light grey studio background, directly overhead. The pizza is well made but ordinary and handmade, not a gourmet styling exercise. Golden soft bread rim, smoothly melted mozzarella, tomato base, a modest amount of thin cooked mushrooms, irregular short red and yellow roasted pepper strips, red onion, small black olive slices and a few small basil leaves. Toppings nestled into the cheese with uneven gaps and occasional overlaps. Soft diffused window light from a huge source, very low contrast, matte natural bread surface and broad smooth creamy areas of cheese. Smooth clean photographic rendition like a food photograph for a printed restaurant menu: no grain, no added texture, no HDR, no artificial sharpening. Restrained colours. The image must have visibly calm, smooth surfaces at full size, with only the larger physical shapes and natural cooking marks resolved. Not crispy, not glossy, not dotted or sandy. Complete round pizza with irregular rim, centred with 5 percent margin. Square composition. No plates, no props, no writing. This is a new photograph, do not reproduce earlier pizza images.

## Consigne du détourage retenu

Remove ONLY the light grey background and exterior shadow from this exact photo, leaving transparent alpha. Keep the pizza pixels and its soft photographic surface appearance unchanged. In particular preserve the matte softly lit crust and smooth creamy cheese. Do NOT add sharpening, saturation, texture, embossed wavy lines or glossy highlights. This is precision background extraction, not generation of a new pizza. The subtle natural photographic softness of the input must remain. Entire pizza on transparent square canvas.

## Vérifications

`npm run build` et `npm run check` passent. Vérification navigateur de la carte et du changement manuel vers la Veggie sur un écran de 1440 px et un mobile de 390 px : source attendue chargée, aucune ressource locale en erreur, aucune erreur JavaScript. Captures et rapport dans `output/veggie-review/`.
