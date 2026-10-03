// À remplacer par le domaine de marque une fois connecté à cette version du site.
export const site = {
  origin: 'https://slice-and-co.abderahmane-benomari7.workers.dev',
  targetOrigin: 'https://sliceandco.fr',
  name: 'Slice & Co Pizza',
  telephone: '+33782817250',
  timeZone: 'Europe/Paris',
  address: { streetAddress: '111 rue Olivier de Serres', postalCode: '75015', addressLocality: 'Paris', addressCountry: 'FR' },
  instagram: 'https://www.instagram.com/slice_andco/',
  // Horaires habituels ; les fermetures exceptionnelles ne sont pas représentées.
  weeklyHours: [
    [['11:30', '14:30'], ['18:00', '24:00']],
    [['11:30', '14:30'], ['18:00', '24:00']],
    [['11:30', '14:30'], ['18:00', '24:00']],
    [['11:30', '14:30'], ['18:00', '24:00']],
    [['11:30', '14:30'], ['18:00', '02:00']],
    [['11:30', '14:30'], ['18:00', '02:00']],
    [['18:00', '02:00']]
  ]
};

export const pages = [
  { file: 'index.html', path: '/', label: 'Accueil', title: 'Pizzeria Paris 15 · Slice & Co Pizza | Sur place & livraison', description: 'Découvrez les 23 pizzas Slice & Co à Paris 15 : pâte maison, formats Sénior et Méga, pizzas sucrées. Sur place, à emporter ou en livraison.', type: 'WebPage' },
  { file: 'menu.html', path: '/menu', label: 'La carte', title: 'Carte & prix des pizzas · Slice & Co | Paris 15', description: 'La carte Slice & Co : 23 pizzas classiques, signatures, généreuses et sucrées. Prix Sénior et Méga, suppléments, boissons et desserts à Paris 15.', type: 'CollectionPage' },
  { file: 'offres.html', path: '/offres', label: 'Les offres', title: 'Offres pizza & fidélité · Slice & Co | Paris 15', description: 'Pizza Sénior + boisson dès 9,90€ le midi en semaine, offre du soir et carte fidélité. Retrouvez les conditions des offres Slice & Co à Paris 15.', type: 'WebPage' },
  { file: 'contact.html', path: '/contact', label: 'Contact & accès', title: 'Horaires, téléphone & accès · Slice & Co Pizza | Paris 15', description: 'Slice & Co Pizza : 111 rue Olivier de Serres, Paris 15, près de la Porte de Versailles. Consultez les horaires, appelez au 07 82 81 72 50 et préparez votre visite.', type: 'ContactPage' }
];

export const faq = [
  { question: 'Où trouver Slice & Co à Paris 15 ?', answer: 'Notre pizzeria se trouve au <strong>111 rue Olivier de Serres, 75015 Paris</strong>, à proximité de la Porte de Versailles. Retrouvez le <a href="/contact">plan d’accès et les horaires</a>.' },
  { question: 'Comment commander ma pizza ?', answer: 'Pour une livraison, retrouvez Slice & Co sur <a href="https://www.ubereats.com/fr/store/slice-&amp;-co-pizza/K-sIaop_TqqexoYeDdTACQ" target="_blank" rel="noopener">Uber Eats<span class="sr-only"> (nouvel onglet)</span></a> ou <a href="https://deliveroo.fr/fr/menu/paris/Vaugirard/slice-and-co-111-rue-olivier-de-serres" target="_blank" rel="noopener">Deliveroo<span class="sr-only"> (nouvel onglet)</span></a>. Pour commander à emporter, appelez le <a href="tel:+33782817250">07 82 81 72 50</a>. Vous pouvez aussi venir manger sur place.' },
  { question: 'Quels formats et quels prix choisir ?', answer: 'Les pizzas salées sont proposées en <strong>Sénior ou Méga</strong>, avec un supplément de <strong>4€ pour le Méga</strong>. Les pizzas sucrées sont à <strong>9,90€</strong>. Tous les prix et les ingrédients figurent sur <a href="/menu">la carte</a>.' },
  { question: 'Quelles sont les offres en semaine ?', answer: 'Le midi en semaine : <strong>pizza Sénior + boisson à partir de 9,90€</strong> (+2€ pour Meat Lover, Salmon Lover et Pastrami &amp; Pickles). Le soir en semaine, sur place ou à emporter : <strong>deux pizzas achetées, une offerte</strong>, la moins chère des trois. Consultez <a href="/offres">les offres et leurs conditions</a>.' },
  { question: 'Comment vérifier les allergènes d’une recette ?', answer: 'Appelez la pizzeria au <a href="tel:+33782817250">07 82 81 72 50</a> avant de commander pour vérifier les allergènes et préciser vos besoins.' }
];
