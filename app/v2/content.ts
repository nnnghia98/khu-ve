export type Destination = {
  id: string;
  name: string;
  label?: string;
  image: string;
  alt: string;
  categories: string[];
  price: number;
  packages: number;
  featured?: boolean;
};

export const destinations: Destination[] = [
  {
    id: 'da-nang',
    name: 'Da Nang',
    image: 'da-nang-bridge.webp',
    alt: 'The Golden Bridge in the hills of Da Nang, Vietnam',
    categories: ['best', 'city'],
    price: 1500,
    packages: 20,
    featured: true,
  },
  {
    id: 'hoi-an',
    name: 'Hoi An',
    image: 'hoi-an.webp',
    alt: 'A traditional wooden boat on the river in Hoi An, Vietnam',
    categories: ['best', 'city', 'seasonal'],
    price: 1800,
    packages: 20,
  },
  {
    id: 'ha-long',
    name: 'Ha Long Bay',
    image: 'ha-long-islets.webp',
    alt: 'Limestone islands in Ha Long Bay, Vietnam',
    categories: ['best', 'seasonal'],
    price: 1400,
    packages: 20,
  },
  {
    id: 'sa-pa',
    name: 'Sa Pa',
    image: 'sa-pa-terraces.webp',
    alt: 'Rice terraces and mountains in Sa Pa, Vietnam',
    categories: ['nature', 'seasonal'],
    price: 2600,
    packages: 20,
  },
];
export const extraDestinations: Destination[] = destinations.map(
  (destination, index) => ({
    ...destination,
    id: `${destination.id}-extra`,
    label: [
      'Da Nang Coast',
      'Hoi An Heritage',
      'Ha Long Bay Cruise',
      'Sa Pa Escape',
    ][index],
    price: [1100, 2100, 1700, 3200][index],
    packages: [12, 16, 24, 9][index],
    featured: false,
  }),
);
export const categories = [
  ['all', 'All'],
  ['best', 'Best Seller'],
  ['nature', 'Nature'],
  ['city', 'City'],
  ['seasonal', 'Seasonal'],
] as const;
export const gallery = [
  { image: 'hue.webp', alt: 'An ornate imperial gate in Hue, Vietnam' },
  {
    image: 'sa-pa-trek.webp',
    alt: 'A hiker on a green mountain trail in Sa Pa, Vietnam',
  },
  {
    image: 'hoi-an.webp',
    alt: 'A boat journey along the river in Hoi An, Vietnam',
  },
  {
    image: 'da-nang-beach.webp',
    alt: 'A basket boat on My Khe Beach in Da Nang, Vietnam',
  },
  {
    image: 'ha-long.webp',
    alt: 'A rowboat beneath a limestone arch in Ha Long Bay, Vietnam',
  },
];
export const articles = [
  {
    title: '10 Must-See Places in Vietnam',
    image: 'ninh-binh.webp',
    alt: 'Limestone mountains and rowboats in Ninh Binh, Vietnam',
    copy: 'A practical route through coastal views, old towns, local food, and calm coves for a first trip to Vietnam.',
  },
  {
    title: 'Our Beginner’s Guide to Hiking in Sa Pa',
    image: 'sa-pa-trek.webp',
    alt: 'A hiking trail through the mountains of Sa Pa, Vietnam',
    copy: 'Start with a short marked trail, check the weather, carry water, and leave extra time for the views.',
  },
  {
    title: 'Solo Travel in Hanoi: A Journey of Your Own',
    image: 'hanoi.webp',
    alt: 'Turtle Tower reflected in Hoan Kiem Lake in Hanoi, Vietnam',
    copy: 'A few simple habits make a solo journey easier: plan your first night, share your route, and leave room for change.',
  },
];
export const places = [
  'Da Nang — a central coast city with beaches, bridges, and nearby hills.',
  'Hoi An — a preserved old town with lanterns, riverside streets, and local food.',
  'Ha Long Bay — a seascape of limestone islands and calm water in the north.',
  'Hanoi — a lively capital with historic lanes, lakes, and neighborhood cafes.',
  'Hue — a former imperial city with citadel walls and riverside gardens.',
  'Ninh Binh — limestone peaks, rice fields, and waterways south of Hanoi.',
  'Sa Pa — a mountain town with terraced valleys and village trails.',
  'Phong Nha — a national park known for caves, forest, and karst landscapes.',
  'Da Lat — a cool highland city with pine trees, gardens, and waterfalls.',
  'Phu Quoc — an island destination with beaches, forest, and quiet coastal roads.',
];
