# Slice & Co : optimisation et domaine

Le site reste en HTML/CSS/JavaScript statique, servi par Cloudflare Workers Static Assets. Les quatre pages fournissent leur contenu complet dans le HTML ; aucune application React ni API n'est nécessaire pour ce site vitrine.

## Modifier et vérifier le projet

Node.js 22 ou supérieur, aucune dépendance à installer :

```sh
npm run build
npm test
npm run check
npm run dev
```

La prévisualisation est accessible sur `http://127.0.0.1:4173`. Les chemins publics sont `/`, `/menu`, `/offres` et `/contact`. Les anciennes adresses `.html` restent prises en charge par Cloudflare et redirigent vers ces chemins.

`site.config.mjs` centralise les métadonnées, les coordonnées, les horaires habituels et la FAQ. Les fichiers HTML de `public/` conservent le contenu et le design. `npm run build` met à jour leurs blocs SEO, la FAQ, les actions mobiles, `sitemap.xml`, `robots.txt` et `404.html`. Relancer cette commande après une modification de la configuration. Les fichiers générés sont versionnés : la configuration Cloudflare actuelle peut garder sa commande de build vide et `npx wrangler deploy` comme commande de déploiement.

Le visuel de partage est `public/assets/share-cover.png` (1200 × 630). Sa composition HTML est conservée dans `scripts/share-cover.html` : ouvrir son contenu dans un navigateur à cette taille, avec les assets servis par la prévisualisation, pour en refaire une capture après une modification de marque.

Les transitions entre pages utilisent les [View Transitions natives](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document). La navigation classique reste disponible sur les navigateurs qui ne les prennent pas en charge. Le réglage de réduction des animations de l'appareil est respecté. La pizza du hero peut changer au clic, au toucher, avec Entrée ou Espace, en plus du défilement automatique ; le délai automatique repart après un changement manuel. Au clavier, le défilement attend que le focus quitte la pizza. Avec la réduction des animations, seul le changement manuel instantané reste actif. La FAQ fonctionne sans JavaScript. Le plan Google Maps est chargé à la demande ; le lien d'itinéraire reste disponible sans JavaScript. Le statut ouvert/fermé correspond aux horaires habituels dans le fuseau Europe/Paris, y compris les services qui se terminent après minuit ; il ne connaît pas les fermetures exceptionnelles.

## Connecter sliceandco.fr

Le domaine final prévu est `https://sliceandco.fr`. Tant qu'il affiche l'ancien site, les balises canonical et le sitemap de cette version désignent l'adresse Workers actuellement publiée. Ne pas les basculer avant de connecter le domaine au nouveau site.

Le code AUTH_INFO fourni par GoDaddy permet de changer de bureau d'enregistrement. Il n'est nécessaire ni pour le code du site, ni pour le DNS Cloudflare. Le saisir uniquement dans l'interface du nouveau registrar si un transfert est souhaité. Le `.fr` ne figure pas dans la [liste actuelle des extensions Cloudflare Registrar](https://www.cloudflare.com/tld-policies/), vérifiée le 3 octobre 2026. Le domaine peut rester chez GoDaddy ou être transféré chez un registrar accrédité pour les `.fr`, tout en utilisant Cloudflare pour le DNS et le site. Voir les [instructions de l'Afnic](https://www.afnic.fr/noms-de-domaine/tout-savoir/gerer-son-nom-de-domaine/).

1. Ajouter `sliceandco.fr` comme domaine/zone dans le même compte Cloudflare que le Worker `slice-and-co`.
2. Vérifier les enregistrements DNS importés avant de changer les serveurs de noms. Conserver en particulier les MX et les TXT de messagerie s'ils existent, ainsi que les sous-domaines utilisés. Le site actuel utilise WordPress : conserver sa sauvegarde et les données nécessaires à la migration.
3. Chez le registrar, remplacer les serveurs de noms par les deux valeurs attribuées à cette zone par Cloudflare. Si DNSSEC est déjà activé, suivre la procédure Cloudflare de migration DNSSEC avant cette modification. Attendre que la zone soit active.
4. Dans Cloudflare : **Workers & Pages → slice-and-co → Settings → Domains & Routes → Add → Custom Domain**, ajouter `sliceandco.fr`. Cloudflare crée les enregistrements du domaine personnalisé et son certificat. Un CNAME existant sur ce nom doit être résolu avant cet ajout. Voir la [documentation des domaines personnalisés Workers](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).
5. Prévoir la redirection permanente de `www.sliceandco.fr` vers `https://sliceandco.fr`, en conservant le chemin et la query string. Cloudflare exige un enregistrement DNS proxifié pour le nom `www` afin d'appliquer sa règle de redirection ; suivre la section « Redirect between www and root domain » de la même documentation.
6. Vérifier que `https://sliceandco.fr/`, `/menu`, `/offres` et `/contact` servent ce projet, avec HTTPS valide. Modifier `site.origin` dans `site.config.mjs` en `https://sliceandco.fr`, puis exécuter build, tests et check, committer et publier les fichiers générés. `targetOrigin` indique le domaine prévu ; il ne connecte pas le DNS automatiquement.
7. Vérifier les canonical, le sitemap et les liens de partage après déploiement. Les canonical de l'adresse Workers désigneront alors aussi le domaine de marque ; si le Worker reste accessible, ces annotations évitent de lui donner une seconde adresse canonique.

Pour une génération ponctuelle, `SITE_ORIGIN` peut remplacer `site.origin`. Pour la production, enregistrer le domaine définitif dans la configuration pour que chaque build reste cohérent.

## Référencement après la connexion du domaine

Les quatre pages ont un titre et une description distincts, une URL canonique, un visuel Open Graph et des données structurées Restaurant (adresse, téléphone, menu et horaires). Les pages internes disposent d'un fil d'Ariane. La FAQ affiche les réponses réellement utilisées dans les données structurées ; les résultats enrichis FAQ de Google sont réservés à certaines catégories de sites, donc leur affichage n'est pas promis pour une pizzeria.

Ajouter et vérifier la propriété Domaine `sliceandco.fr` dans Google Search Console, puis envoyer `https://sliceandco.fr/sitemap.xml`. Vérifier les quatre pages avec l'inspection d'URL et le test de résultats enrichis. Garder cohérents le nom, l'adresse, le téléphone et les horaires sur le site et la fiche Google Business Profile. Actualiser l'adresse du site sur la fiche et sur Instagram après la bascule.

Avant de remplacer l'ancien WordPress, inventorier les URL existantes depuis son sitemap et Search Console. Rediriger chaque ancienne page utile vers la page qui lui correspond, avec une redirection permanente ; les contenus supprimés sans équivalent peuvent répondre 404. Ne pas rediriger toutes les anciennes URL vers l'accueil. Voir les [consignes Google pour une migration d'URL](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes).

Le code facilite l'exploration et clarifie l'établissement ; il ne garantit ni une position ni une indexation immédiate. La visibilité locale dépend aussi du domaine final, de la fiche d'établissement, des avis authentiques et du contenu. Référence : [SEO Starter Guide de Google](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).

Les prochains ajouts utiles nécessitent des informations réelles : mentions légales de la société, photos de la pizzeria et avis clients vérifiés. Si un suivi des commandes ou des clics est souhaité, choisir l'outil de mesure et son cadre de consentement avant d'ajouter des traceurs.
