import { Award, Star, Trophy } from 'lucide-react';

export type Trip = {
  name: string;
  image: string;
  imageAlt: string;
  description: string;
  days: string;
  route: string[];
};
export const trips: Trip[] = [
  {
    name: 'Hoi An',
    image: 'hoi-an.jpg',
    imageAlt:
      'Colorful boats and yellow heritage houses along the river in Hoi An, Vietnam',
    description:
      'Wander through lantern-lit streets, discover old houses, and slow down by the river. Hoi An brings living heritage and local flavors together.',
    days: '3 days',
    route: [
      'Ancient Town · Old houses and the Japanese Covered Bridge',
      'Tra Que · Village gardens and a local cooking experience',
      'An Bang Beach · Sea breezes and a quiet afternoon',
    ],
  },
  {
    name: 'Da Nang',
    image: 'da-nang.jpg',
    imageAlt: 'The long coastline and beachfront skyline of Da Nang, Vietnam',
    description:
      'From My Khe Beach to Son Tra Peninsula, Da Nang pairs coastal days with mountain views. Discover Marble Mountains and evenings by the Han River.',
    days: '4 days',
    route: [
      'My Khe Beach · Morning waves and fresh seafood',
      'Son Tra Peninsula · Coastal views and Linh Ung Pagoda',
      'Marble Mountains · Stone paths, caves, and pagodas',
      'Han River · Riverside walks and Dragon Bridge',
    ],
  },
  {
    name: 'Ha Long',
    image: 'ha-long.jpg',
    imageAlt:
      'Boats surrounded by limestone islands in the green waters of Ha Long Bay, Vietnam',
    description:
      'Sail between limestone islands and sheltered bays. Ha Long is a place for unhurried mornings, cave visits, and views across calm green water.',
    days: '3 days',
    route: [
      'Ha Long Bay · Cruise among limestone islands',
      'Sung Sot Cave · Rock formations and wide bay views',
      'Ti Top Island · Beach time and a hillside viewpoint',
    ],
  },
];
export const paradise: Trip = {
  name: 'Phu Quoc Island Escape',
  image: 'phu-quoc.jpg',
  imageAlt:
    'White sand, palm trees, and clear water at Sao Beach in Phu Quoc, Vietnam',
  description:
    'Trade busy days for the soft sand of Sao Beach, island sunsets, and fresh seafood. This 5-day Phu Quoc escape leaves plenty of time to slow down.',
  days: '5 days',
  route: [
    'Days 1–2 · Settle in and unwind on Sao Beach',
    'Day 3 · Explore the southern islands with a local guide',
    'Day 4 · Duong Dong market and a Long Beach sunset',
    'Day 5 · A relaxed island morning before heading home',
  ],
};
export const culture: Trip = {
  name: 'Hoi An & Hue Heritage',
  image: 'hoi-an.jpg',
  imageAlt:
    'Traditional riverside boats and heritage architecture in Hoi An, Vietnam',
  description:
    'Follow the stories of central Vietnam, from Hoi An’s lantern streets to Hue’s Imperial City. Share local food, meet craftspeople, and explore at your own pace.',
  days: '6 days',
  route: [
    'Hoi An · Ancient Town walks and a local market visit',
    'Tra Que · Village gardens and a cooking experience',
    'Hue · Imperial City courtyards and royal heritage',
    'Perfume River · Riverside views and Thien Mu Pagoda',
  ],
};
export const reviews = [
  {
    name: 'Sarah Johnson',
    country: 'Hanoi, Vietnam',
    image: 'sarah.webp',
    text: 'Our Hoi An trip had the right mix of exploring and slowing down. We wandered through the Ancient Town, visited a local market, and watched the lanterns light up by the river. The guides made each day feel personal, with time to enjoy the small things.',
  },
  {
    name: 'James Wilson',
    country: 'Ho Chi Minh City, Vietnam',
    image: 'angus.webp',
    text: 'Da Nang was everything we hoped for. We started our mornings at My Khe Beach, explored Marble Mountains, and took in the views from Son Tra Peninsula. Each day had a good balance of discovery and rest. We came home with wonderful memories.',
  },
  {
    name: 'Emily Chen',
    country: 'Can Tho, Vietnam',
    image: 'sarah.webp',
    text: 'From limestone islands to quiet corners of the bay, our Ha Long trip felt special from start to finish. We loved the slow mornings on the water and the chance to explore with a local guide. A lovely way to see more of Vietnam.',
  },
];
export const awards = [
  {
    name: 'Travel + Leisure',
    detail: 'World’s Best Tour Operator 2022',
    country: 'Vietnam',
    icon: Star,
  },
  {
    name: 'World Travel Award',
    detail: 'Best Travel Agency 2023',
    country: 'Vietnam',
    icon: Trophy,
  },
  {
    name: 'TripAdvisor',
    detail: 'Certificate of Excellence 2021',
    country: 'Vietnam',
    icon: Award,
  },
];
export const faqs = [
  [
    'What type of travel packages does KHUVÉ offer?',
    'Explore Vietnam with city breaks, heritage journeys, coastal escapes, and mountain adventures. From Da Nang and Hoi An to Ha Long, Hue, and Phu Quoc, our suggested itineraries make room for your interests and pace.',
  ],
  [
    'How do I book a trip with KHUVÉ?',
    'Explore our destinations and select Book Now to view a suggested itinerary. You can save your trip plan while you decide. Online booking and live availability are not connected in this preview.',
  ],
  [
    'What is the payment process for KHUVÉ?',
    'Your final itinerary, price, and payment schedule are confirmed before any payment is due. This preview does not collect payments or card details.',
  ],
  [
    'How to cancel my booking in KHUVÉ?',
    'Cancellation terms depend on your confirmed package and travel providers. Check the terms in your booking confirmation and contact your travel advisor before making changes.',
  ],
];
export const articles = [
  {
    title: 'A Slow Day in Hoi An’s Ancient Town',
    image: 'hoi-an.jpg',
    imageAlt: 'Lanterns, yellow houses, and colorful boats in Hoi An, Vietnam',
    category: 'Travel',
    body: [
      'Start with a morning walk through Hoi An’s Ancient Town. Look for the Japanese Covered Bridge, old merchant houses, and the yellow facades along the small streets.',
      'Pause for a local lunch, browse the market, and take time to watch the boats along the river. A visit to Tra Que village adds a different view of everyday life near Hoi An.',
      'Return to the riverside as the lanterns light up. Keep your evening open for a slow walk, a small cafe, and a meal shared with friends.',
    ],
  },
  {
    title: 'A Beginner’s Guide to Walking in Sa Pa',
    image: 'sa-pa.jpg',
    imageAlt: 'Green rice terraces across the hills of Sa Pa, Vietnam',
    category: 'Guide',
    body: [
      'Begin with a gentle walk through the Muong Hoa Valley near Sa Pa. A local guide can help you choose a route around Lao Chai or Ta Van that suits your pace.',
      'Check the weather and path conditions before leaving. Wear shoes with good grip, carry water and a light rain layer, and allow extra time when paths are wet.',
      'Stay on the paths, ask before taking portraits, and respect the homes and fields you pass. Leave space for a quiet break and views over the rice terraces.',
    ],
  },
  {
    title: 'Solo Travel: Find Your Own Pace in Hanoi',
    image: 'hanoi.jpg',
    imageAlt:
      'Turtle Tower on a green island in Hoan Kiem Lake, Hanoi, Vietnam',
    category: 'Inspiration',
    body: [
      'Start your Hanoi visit with a walk around Hoan Kiem Lake. The Old Quarter is close by, with small shops, cafes, and streets that reward a little curiosity.',
      'Join a local food walk when you want company, or spend a slow afternoon at the Temple of Literature. Plan a few stops and leave room for a cafe break.',
      'Share your plans with someone you trust and keep your accommodation details handy. You do not need to see everything in one day. Let Hanoi unfold at your own pace.',
    ],
  },
];

export const storyPhotos = [
  [
    'hoi-an.jpg',
    'Traditional boats and heritage houses in Hoi An, Vietnam',
    'Find living heritage in Hoi An',
  ],
  [
    'phu-quoc.jpg',
    'Palm trees and white sand at Sao Beach in Phu Quoc, Vietnam',
    'Slow down on Phu Quoc',
  ],
  [
    'da-nang.jpg',
    'Da Nang’s coastline and beachfront skyline in Vietnam',
    'Follow the coast in Da Nang',
  ],
  [
    'ha-long.jpg',
    'Limestone islands rising from Ha Long Bay, Vietnam',
    'Sail between the islands of Ha Long',
  ],
];
