const listVoyages = [
    { 
      id: 1,
      destination: 'Rome',
      pays: 'Italie',
      prix: 200,
      devise: '€',
      image: 'https://tse4.mm.bing.net/th?id=OIP.7NKDf_Tn-_On1IPUB8chKAHaES&pid=Api',
      titre: 'Voyage de rêve à Rome',
      description: 'Visiter les quatre basiliques majeures de Rome. Jouer au gladiateur dans le Colisée. S’extasier devant les chefs-d’œuvre du Caravage. Prendre le thé au milieu des sculptures dans l’étonnant atelier de Canova et de Tadolini. Respirer une bonne dose de chlorophylle dans l’immense parc de la villa Borghèse. Jeter une pièce dans la fontaine de Trevi. Partir en goguette nocturne dans le coin branché et festif du Testaccio. Visiter l’un des plus petits États souverains au monde, le Vatican. Recréer le monde dans la chapelle Sixtine. Sillonner en scooter le quartier branché de la Garbatella…'
    },
    { 
      id: 2,
      destination: 'Barcelone',
      pays: 'Espagne',
      prix: 100,
      devise: '€',
      image: 'https://tse1.mm.bing.net/th?id=OIP.HJiidRLnJwfOPs1kf1qowAAAAA&pid=Api',
      titre: 'Voyage de rêve à Barcelone',
      description: 'Déambuler tranquillement dans le quartier historique du Barri Gòtic, entre ruelles et placettes. Tourner et retourner dans le marché de la Boquería. Se payer le luxe d’une petite brasse dans la Méditerranée. Prendre un grand bol d’air et de fantaisie dans le park Güell. S’offrir une folle nuit de fiesta dans les boîtes hyper branchées de la ville. Partir sur les traces d’architectes magnifiquement allumés. S’offrir une soirée « poissons et fruits de mer » dans le quartier de la Barceloneta, ancien quartier de pêcheurs....'
    },
    { 
      id: 3,
      destination: 'New-York',
      pays: 'USA',
      prix: 600,
      devise: '€',
      image: 'https://tse3.mm.bing.net/th?id=OIP.jod9KEHWmeEjXbZIKeq7JQAAAA&pid=Api',
      titre: 'Voyage de rêve à New-York',
      description: 'Visiter le musée d\'Ellis Island. Se balader le long de la High Line, ancienne voie ferrée reconvertie en jardin suspendu. Prendre un bain de foule à Times Square. Monter sur la terrasse du Metropolitan Museum et s\'offrir une incroyable vue sur Central Park. Boire un cocktail sur un rooftop bar, avec une vue plongeante sur la forêt de gratte-ciel. Assister à une messe à Harlem. Écumer les bars et petites adresses branchées de Williamsburg, le repaire des hipsters, à Brooklyn'
    },
    { 
      id: 4,
      destination: 'Québec',
      pays: 'Canada',
      prix: 500,
      devise: '€',
      image: 'https://tse3.mm.bing.net/th?id=OIP.mxp3sHNw3xujOY_s6GW4wQAAAA&pid=Api',
      titre: 'Voyage de rêve au Québec',
      description: 'Québec est très différente de Montréal : la capitale provinciale a gardé un côté "vieille Europe" qui séduit les touristes en quête d\'authenticité. Dans les rues du Vieux Québec, vous vous croirez dans une ville de province, digne d\'un film de cape et d\'épée. Fondée en 1608, Québec, dominée par l\'imposante silhouette du Château Frontenac, est classée au Patrimoine mondial de l\'Unesco. La vue depuis la terrasse Dufferin sur le Saint-Laurent est magnifique. Bref, Québec est une ville moyenne de 600 000 hab. bien tranquille et bien charmante.'
    },
    { 
      id: 5,
      destination: 'Londres',
      pays: 'UK',
      prix: 150,
      devise: '€',
      image: 'https://tse3.mm.bing.net/th?id=OIP.YZnqBjaOepzx7fQITnbmzgAAAA&pid=Api',
      titre: 'Voyage de rêve à Londres',
      description: 'Affronter les momies au British Museum. Démarrer un session shopping sur Oxford Street. Traverser le Millenium Bridge. Se balader sur les quais de la Tamise. Arpenter le quartier de Southwark, symbole du renouveau de Londres. Se rouler dans les jonquilles de Hyde Park. Entamer un pub crawl. Tenter de mettre un nom sur les chefs-d’œuvre de la National Gallery. Assister à une comédie musicale dans le quartier de Soho…'
    },
    { 
      id: 6,
      destination: 'Séville',
      pays: 'Espagne',
      prix: 140,
      devise: '€',
      image: 'https://tse4.mm.bing.net/th?id=OIP.OWKeFkE4qpjabCDdf1ZlzgAAAA&pid=Api',
      titre: 'Séville',
      description: 'Voyage de rêve à Séville'
    },
    { 
      id: 7,
      destination: 'Porto',
      pays: 'Portugal',
      prix: 100,
      devise: '€',
      image: 'https://tse4.mm.bing.net/th?id=OIP.YTv6em7ObqV3__rUGFhlEwAAAA&pid=Api',
      titre: 'Porto',
      description: 'Sur la praça da Liberdade, au bas du quartier de l’hôtel de ville, on est vraiment au cœur de l’animation. De là, on monte jusqu’à l’église dos Clérigos, exemple remarquable du style baroque portugais. Pour avoir une vue plongeante sur la ville, grimper au sommet de la tour dressée au-dessus de cet édifice comme une flèche. Puis visiter la librairie Lello e Irmão, une des plus belles d’Europe, avec son bel escalier intérieur à double rampe. De Clérigos, direction la gare de São Bento pour y admirer son hall intérieur couvert de céramiques portugaises bleues (azulejos). Continuer vers la cathédrale (Sé), massive et robuste, située au sommet d’une autre colline. Là aussi, vue remarquable sur la partie basse de la ville.'
    },  
    { 
      id: 8,
      destination: 'Lisbonne',
      pays: 'Portugal',
      prix: 110,
      devise: '€',
      image: 'https://tse1.mm.bing.net/th?id=OIP.SOkaIz4W1BETJH_WeuVcDQAAAA&pid=Api',
      titre: 'Lisbonne',
      description: 'Grimper dans le mythique tram n°28 et remonter le temps en même temps que les ruelles en pente. Manger un poisson grillé dans une tasca, au fin fond de l’Alfama, en attendant l’heure du fado. Survoler par beau temps le parc des Nations à bord de la télécabine. Faire une balade à vélo près du Tage. S’offrir deux pastéis de nata encore tièdes et saupoudrées de cannelle à la célèbre pâtisserie de Belém. Savourer Lisbonne côté plage et pousser jusqu’à Estoril ou Cascais. S’offrir une nuit paisible dans une quinta de rêve, dans la serra de Sintra. Randonner dans la serra da Arrábida'
    },         
  ];

module.exports = listVoyages;