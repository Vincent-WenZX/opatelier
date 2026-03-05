const products = [
  {
    id: 'dark-brown-oxford',
    slug: 'dark-brown-oxford',
    name: 'Dark Brown Oxford',
    subtitle: 'Cap-Toe Oxford',
    price: 489,
    material: 'Italian Calf Leather · Hand-Stitched',
    category: 'men',
    type: 'shoes',
    sizes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'],
    images: {
      product: { src: '/images/shot.jpeg', fit: 'contain', position: 'center', bg: '#FDFEFD' },
      lifestyle: { src: '/images/life_shot.jpeg', fit: 'cover', position: 'center top', bg: '#F2F2F2' },
    },
    description:
      'Rich dark brown Italian calf leather with a hand-burnished patina finish. Features a classic cap-toe silhouette with meticulous hand-stitched detailing along the vamp, creating a distinctive texture that sets these apart from ordinary oxfords.',
    details: {
      'Size & Fit': [
        'True to size — we recommend ordering your usual size',
        'Standard width (D)',
        'Leather sole with rubber heel tap',
        'Blake-stitched construction for a sleeker profile',
        'Heel height: 25mm',
      ],
      'Details & Care': [
        'Premium Italian calf leather upper',
        'Hand-burnished patina finish',
        'Hand-stitched decorative seaming',
        'Leather lining and insole',
        'Use shoe trees after each wear',
        'Apply leather conditioner monthly',
      ],
      'Delivery & Returns': [
        'Complimentary delivery in 3–5 business days',
        'Express delivery available (1–2 business days)',
        'Free returns within 30 days',
        'Items must be unworn with original packaging',
      ],
    },
  },
  {
    id: 'charcoal-wool-trousers',
    slug: 'charcoal-wool-trousers',
    name: 'Charcoal Wool Trousers',
    subtitle: 'Flat-Front Trousers',
    price: 395,
    material: 'Super 120s Wool · Slim Fit',
    category: 'men',
    type: 'suits',
    placeholder: true,
    sizes: ['28', '30', '32', '34', '36', '38', '40'],
    images: {
      product: { src: '/images/shot.jpeg', fit: 'contain', position: 'center', bg: '#F5F5F5' },
      lifestyle: { src: '/images/life_shot.jpeg', fit: 'cover', position: 'center', bg: '#EEEDEB' },
    },
    description:
      'Impeccably tailored flat-front trousers in charcoal Super 120s wool. Features a medium rise, slim-through-thigh silhouette, and unfinished hem for a bespoke length.',
    details: {
      'Size & Fit': [
        'Slim fit — tapered through the leg',
        'Medium rise',
        'Unfinished hem for custom tailoring',
        'Hook-and-bar closure with zip fly',
      ],
      'Details & Care': [
        'Super 120s pure wool',
        'French bearers for a smooth front',
        'Side slant pockets, two rear welt pockets',
        'Dry clean only',
      ],
      'Delivery & Returns': [
        'Complimentary delivery in 3–5 business days',
        'Express delivery available (1–2 business days)',
        'Free returns within 30 days',
        'Items must be unworn with original tags attached',
      ],
    },
  },
  {
    id: 'cognac-penny-loafer',
    slug: 'cognac-penny-loafer',
    name: 'Cognac Penny Loafer',
    subtitle: 'Unlined Penny Loafer',
    price: 425,
    material: 'Horween Shell Cordovan · Unlined',
    category: 'men',
    type: 'shoes',
    placeholder: true,
    sizes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'],
    images: {
      product: { src: '/images/shot.jpeg', fit: 'contain', position: 'center', bg: '#FAF8F5' },
      lifestyle: { src: '/images/life_shot.jpeg', fit: 'cover', position: 'center', bg: '#F0EDE8' },
    },
    description:
      'A warm cognac penny loafer crafted from Horween shell cordovan. The unlined construction offers unparalleled flexibility, while the hand-sewn moccasin toe provides enduring sophistication.',
    details: {
      'Size & Fit': [
        'Runs slightly large — consider half size down',
        'D width',
        'Leather sole with rubber heel',
        'Unlined for maximum comfort',
      ],
      'Details & Care': [
        'Horween shell cordovan upper',
        'Hand-sewn moccasin construction',
        'Leather outsole',
        'Brush regularly with horsehair brush',
        'Apply shell cordovan cream sparingly',
      ],
      'Delivery & Returns': [
        'Complimentary delivery in 3–5 business days',
        'Express delivery available (1–2 business days)',
        'Free returns within 30 days',
        'Items must be unworn with original packaging',
      ],
    },
  },
  {
    id: 'ivory-dress-shirt',
    slug: 'ivory-dress-shirt',
    name: 'Ivory Dress Shirt',
    subtitle: 'Spread Collar Dress Shirt',
    price: 245,
    material: 'Sea Island Cotton · Mother-of-Pearl Buttons',
    category: 'men',
    type: 'shirts',
    placeholder: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      product: { src: '/images/shot.jpeg', fit: 'contain', position: 'center', bg: '#FEFEFE' },
      lifestyle: { src: '/images/life_shot.jpeg', fit: 'cover', position: 'top center', bg: '#F3F2F0' },
    },
    description:
      'An exquisite ivory dress shirt woven from long-staple Sea Island cotton. Features a sophisticated spread collar, French cuffs, and mother-of-pearl buttons — the foundation of refined formal attire.',
    details: {
      'Size & Fit': [
        'Regular fit',
        'Spread collar',
        'French cuffs',
        'Available in 15"–17.5" neck sizes',
      ],
      'Details & Care': [
        'Sea Island cotton (200s two-ply)',
        'Mother-of-pearl buttons',
        'Single-needle stitching throughout',
        'Machine wash cold, hang dry',
        'Iron on medium heat',
      ],
      'Delivery & Returns': [
        'Complimentary delivery in 3–5 business days',
        'Express delivery available (1–2 business days)',
        'Free returns within 30 days',
        'Items must be unworn with original packaging',
      ],
    },
  },
  {
    id: 'black-cap-toe-oxford',
    slug: 'black-cap-toe-oxford',
    name: 'Black Cap-Toe Oxford',
    subtitle: 'Formal Cap-Toe Oxford',
    price: 565,
    material: 'Museum Calf · Goodyear Welted',
    category: 'men',
    type: 'shoes',
    placeholder: true,
    sizes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'],
    images: {
      product: { src: '/images/shot.jpeg', fit: 'contain', position: 'center', bg: '#FAFAFA' },
      lifestyle: { src: '/images/life_shot.jpeg', fit: 'cover', position: 'center top', bg: '#E8E6E3' },
    },
    description:
      'The quintessential formal shoe. Crafted from museum-quality calf leather with a deep, lustrous black finish. Goodyear welted construction ensures lasting durability and the ability to be resoled.',
    details: {
      'Size & Fit': [
        'True to size',
        'E width available on request',
        'Goodyear welted leather sole',
        'Heel height: 25mm',
      ],
      'Details & Care': [
        'Museum calf leather upper',
        'Full leather lining',
        'Oak bark–tanned sole',
        'Steel heel reinforcement',
        'Polish with matching cream polish',
      ],
      'Delivery & Returns': [
        'Complimentary delivery in 3–5 business days',
        'Express delivery available (1–2 business days)',
        'Free returns within 30 days',
        'Items must be unworn with original packaging',
      ],
    },
  },
];

export default products;
