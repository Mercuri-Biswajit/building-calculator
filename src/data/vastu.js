// ─── src/data/vastu.js ───────────────────────────────────────────────────────
// Full data file for VastuPage. Place at: src/data/vastu.js

// ── 1. vastuPrinciples ──────────────────────────────────────────────────────
// Shape: { icon, title, description, points[] }
export const vastuPrinciples = [
  {
    icon: "🧭",
    title: "Directional Alignment",
    description:
      "Vastu Shastra divides space into eight cardinal and ordinal directions, each governed by a specific deity and element. Proper alignment with these directions harmonises the flow of energy throughout the home.",
    points: [
      "North — ruled by Kubera, governs wealth and prosperity",
      "Northeast (Ishanya) — most sacred corner, ideal for prayer",
      "East — ruled by Indra, governs health and new beginnings",
      "Southeast — ruled by Agni (Fire), governs energy and vitality",
      "South — ruled by Yama, governs fame and stability",
      "Southwest — ruled by Nirrti, governs strength and relationships",
      "West — ruled by Varuna, governs gains and success",
      "Northwest — ruled by Vayu (Wind), governs change and travel",
    ],
  },
  {
    icon: "🌍",
    title: "Five Elements (Pancha Bhuta)",
    description:
      "All of creation is composed of five fundamental elements — Earth, Water, Fire, Air, and Space. Vastu aims to balance these elements within the built environment to support health, happiness, and prosperity.",
    points: [
      "Earth (Prithvi) — stability, patience; represented by Southwest",
      "Water (Jal) — flow, emotions; represented by Northeast and North",
      "Fire (Agni) — energy, transformation; represented by Southeast",
      "Air (Vayu) — movement, freshness; represented by Northwest and East",
      "Space (Akasha) — expansion, consciousness; represented by the centre",
    ],
  },
  {
    icon: "⬜",
    title: "Brahmasthan — Sacred Centre",
    description:
      "The centre of any home or plot is called the Brahmasthan, the seat of Brahma (creator). This zone must be kept open, clean, and free of heavy structures to allow energy to radiate outward to all corners.",
    points: [
      "Never place toilets, staircases, or heavy pillars at the centre",
      "Ideal as an open courtyard or light-well in traditional homes",
      "Keep clutter-free to allow free energy circulation",
      "A skylight or open-to-sky space amplifies the Brahmasthan's power",
    ],
  },
  {
    icon: "🔲",
    title: "Plot Shape & Proportions",
    description:
      "The shape and ratio of a plot directly impact the well-being of its occupants. Regular geometric shapes allow balanced energy distribution, while irregular plots create energy imbalances that require remedies.",
    points: [
      "Square plot — most auspicious, equal energy in all directions",
      "Rectangle (length:width ≤ 1:2) — suitable and common",
      "North or East extensions — generally beneficial",
      "Southwest extensions — highly inauspicious, needs strong remedies",
      "Avoid triangular, circular, or L-shaped plots",
    ],
  },
  {
    icon: "🪟",
    title: "Natural Light & Ventilation",
    description:
      "Vastu places great importance on the entry of sunlight and fresh air. Morning sunlight from the east is considered most beneficial, purifying spaces and boosting health and vitality.",
    points: [
      "Maximise windows on North and East-facing walls",
      "Ensure cross-ventilation in all rooms",
      "Keep Northeast corner of home bright and well-ventilated",
      "Avoid dark, enclosed spaces — especially in the Northeast",
      "Skylights and ventilators enhance positive prana (life force)",
    ],
  },
  {
    icon: "🌿",
    title: "Nature & Greenery",
    description:
      "Plants, water bodies, and natural materials connect a home to the earth's energy. Strategic placement of greenery amplifies positive vibrations and purifies the atmosphere.",
    points: [
      "Tulsi (holy basil) in the Northeast — most auspicious",
      "Banana and coconut trees are highly auspicious in the East",
      "Avoid thorny plants (except roses) inside the home",
      "Water features (fountains) are ideal in North or Northeast",
      "Avoid cactus and bonsai — they stunt growth energy",
    ],
  },
];

// ── 2. vastuRooms ─────────────────────────────────────────────────────────────
// Shape: { icon, name, idealDirection, description, dos[], donts[], additionalTips[] }
export const vastuRooms = [
  {
    icon: "🚪",
    name: "Main Entrance",
    idealDirection: "North, Northeast, East",
    description:
      "The main entrance is the primary gateway for energy to enter your home. Its placement, size, and condition directly influence the prosperity and well-being of all occupants.",
    dos: [
      "Place entrance on North, Northeast, or East wall",
      "Ensure the door opens inward and clockwise",
      "Keep the entrance well-lit, clean, and welcoming",
      "Use auspicious symbols like Om or Swastika on the door",
      "Place a nameplate on the right side of the door",
    ],
    donts: [
      "Never place the entrance in the Southwest",
      "Avoid broken bells, squeaky hinges, or peeling paint",
      "Do not obstruct the entrance with shoe racks or clutter",
      "Avoid placing mirrors directly facing the main door",
      "Do not have a toilet directly visible from the entrance",
    ],
    additionalTips: [
      "A threshold (doorstep) at the entrance brings positive energy",
      "Rangoli or a welcome mat enhances positive vibrations",
      "Fresh flowers or potted plants beside the door are auspicious",
    ],
  },
  {
    icon: "🛋️",
    name: "Living Room",
    idealDirection: "North, Northeast, East",
    description:
      "The living room is the social heart of the home. Vastu recommends placement in the North or East to attract positive energy, prosperity, and harmonious relationships.",
    dos: [
      "Place heavy furniture (sofa sets) in West or Southwest",
      "Keep the Northeast corner of the living room light and open",
      "Use light, soothing colours like off-white, cream, or light green",
      "Place TV and electronics in the Southeast corner",
      "Ensure the room is well-lit with natural light",
    ],
    donts: [
      "Avoid placing the sofa against the North or East wall",
      "Do not hang negative or violent artwork",
      "Avoid dark, heavy colours on walls",
      "Do not keep broken or non-functional items",
      "Avoid clutter under sofas and in corners",
    ],
    additionalTips: [
      "A water fountain in the North corner attracts wealth",
      "Fresh flowers on the centre table invigorate the space",
      "Family photos on the Southwest wall strengthen relationships",
    ],
  },
  {
    icon: "🛏️",
    name: "Master Bedroom",
    idealDirection: "Southwest",
    description:
      "The Southwest is the zone of earth energy — stable, grounded, and authoritative. The master bedroom here gives the head of household strength, stability, and restful sleep.",
    dos: [
      "Place the bed with the head pointing South or West",
      "Position the bed against the South or West wall",
      "Use warm, earthy colours — beige, brown, or terracotta",
      "Keep the Southwest corner heavy (almirahs, wardrobes)",
      "Ensure the master bedroom is in the Southwest quadrant",
    ],
    donts: [
      "Never sleep with head pointing North — disturbs sleep",
      "Do not place mirrors directly facing the bed",
      "Avoid placing TV directly opposite the bed",
      "Do not keep a water body or aquarium in the bedroom",
      "Avoid sleeping under a beam — causes mental pressure",
    ],
    additionalTips: [
      "Rose quartz crystals near the bed promote love and harmony",
      "Lavender tones are calming and Vastu-compatible",
      "Avoid keeping work-related items in the master bedroom",
    ],
  },
  {
    icon: "🍳",
    name: "Kitchen",
    idealDirection: "Southeast",
    description:
      "The kitchen represents the fire element and should be placed in the Southeast — the zone of Agni. Proper kitchen Vastu ensures good health, nourishment, and prosperity for the family.",
    dos: [
      "Place the cooking platform (stove) in the Southeast",
      "Cook facing East for maximum health benefits",
      "Store grains and provisions in the Southwest or West",
      "Place the water source (sink) in the Northeast or North",
      "Keep the kitchen clean, bright, and well-ventilated",
    ],
    donts: [
      "Never place the kitchen directly above or below the pooja room",
      "Avoid placing the kitchen in the Northeast (water-fire conflict)",
      "Do not face South while cooking — causes stress",
      "Avoid keeping stale food or waste bins in the Northeast",
      "Never share a wall between the kitchen and toilet",
    ],
    additionalTips: [
      "Yellow or orange kitchen walls enhance appetite and energy",
      "Keep the refrigerator in the Southwest or West",
      "A window in the East wall allows morning sunlight",
    ],
  },
  {
    icon: "🪔",
    name: "Pooja Room",
    idealDirection: "Northeast",
    description:
      "The Northeast (Ishanya) is the most sacred corner of any home, brimming with divine energy. The pooja room here creates a powerful spiritual sanctuary that benefits all occupants.",
    dos: [
      "Place the pooja room in the Northeast corner",
      "Face East or North while performing puja",
      "Keep idols and photos at eye level or slightly above",
      "Use white, light yellow, or cream colours",
      "Ensure the room is always clean and fragrant",
    ],
    donts: [
      "Never place the pooja room in the bedroom or toilet",
      "Avoid placing it directly below a staircase or toilet",
      "Do not keep broken or chipped idols",
      "Avoid storing non-religious items in the pooja space",
      "Never place pooja room in the South or Southwest",
    ],
    additionalTips: [
      "A copper vessel filled with water enhances divine energy",
      "Natural camphor, incense, and lamps purify the atmosphere",
      "Keep idols facing West so the worshipper faces East",
    ],
  },
  {
    icon: "🍽️",
    name: "Dining Room",
    idealDirection: "West, East",
    description:
      "The dining room should be placed where it supports nourishment and togetherness. West is ideal as it represents completion and satisfaction, while East brings health benefits.",
    dos: [
      "Place the dining table in the West or East of the home",
      "Seat the head of household facing East while dining",
      "Use light, cheerful colours — yellow, green, or orange",
      "Keep the dining area clean, clutter-free, and well-lit",
      "Place a bowl of fresh fruits on the dining table",
    ],
    donts: [
      "Avoid dining in front of a mirror (doubles negativity)",
      "Do not place the dining table in the centre of the room",
      "Avoid keeping the dining room adjacent to a toilet",
      "Do not use dark or dull colours in the dining area",
      "Avoid placing the dining area in the Northeast",
    ],
    additionalTips: [
      "Oval or square tables are preferred over irregular shapes",
      "Artwork depicting food, harvest, or abundance is auspicious",
      "Ensure the dining room is separate from the kitchen",
    ],
  },
  {
    icon: "🚿",
    name: "Bathroom / Toilet",
    idealDirection: "Northwest, West",
    description:
      "Bathrooms are associated with the water element and waste removal. Northwest (air) and West placements allow negative energy to be expelled efficiently without affecting positive zones.",
    dos: [
      "Place toilets in the Northwest or West zone",
      "Keep the toilet seat covered when not in use",
      "Ensure good ventilation and natural light if possible",
      "Use light, neutral colours — white, light grey, or cream",
      "Keep the bathroom spotlessly clean at all times",
    ],
    donts: [
      "Never place a toilet in the Northeast — severe Vastu defect",
      "Avoid placing toilets adjacent to the kitchen or pooja room",
      "Do not keep the bathroom door open at all times",
      "Avoid leaking taps or drains — signifies wealth drain",
      "Never place a toilet directly above the pooja room",
    ],
    additionalTips: [
      "Sea salt in a small bowl absorbs negative energy",
      "A camphor ball in the bathroom purifies the atmosphere",
      "Exhaust fans in the South or West wall are ideal",
    ],
  },
  {
    icon: "📚",
    name: "Study / Home Office",
    idealDirection: "West, Northeast",
    description:
      "The study room benefits from stable, focused energy. West supports concentration and intellectual achievement, while Northeast enhances wisdom, clarity, and learning.",
    dos: [
      "Place the study table facing East or North",
      "Sit with a solid wall behind you for support and stability",
      "Keep books and shelves on the East or North walls",
      "Use green or light blue colours to enhance focus",
      "Place a Saraswati or Ganesha idol in the Northeast corner",
    ],
    donts: [
      "Avoid sitting with your back to the door",
      "Do not face South while studying — reduces concentration",
      "Avoid keeping broken stationery or non-functional items",
      "Do not place the study room in the Southwest",
      "Avoid cluttered desks — impedes clear thinking",
    ],
    additionalTips: [
      "A pyramid or crystal on the desk enhances mental clarity",
      "Plants like money plant or bamboo attract positive study energy",
      "Adequate lighting reduces eye strain and fatigue",
    ],
  },
];

// ── 3. vastuDirections ────────────────────────────────────────────────────────
// Shape: { icon, name, deity, element, description, bestFor[], colors[{name,code}], benefits[], avoid[] }
export const vastuDirections = [
  {
    icon: "⬆️",
    name: "North",
    deity: "Kubera (God of Wealth)",
    element: "Water",
    description:
      "North is the direction of wealth, prosperity, and career opportunities. Governed by Kubera, it is highly auspicious for the main entrance and living spaces. Keeping this zone open and unobstructed allows wealth energy to flow freely.",
    bestFor: [
      "Main entrance and main door",
      "Living room and drawing room",
      "Home office and study",
      "Water features and aquariums",
      "Open verandahs and gardens",
    ],
    colors: [
      { name: "Green", code: "#4CAF50" },
      { name: "Pista Green", code: "#93C572" },
      { name: "Light Blue", code: "#87CEEB" },
      { name: "White", code: "#F5F5F5" },
    ],
    benefits: [
      "Attracts wealth, prosperity, and financial growth",
      "Enhances career opportunities and promotions",
      "Promotes positive social interactions",
      "Supports mental clarity and decision-making",
    ],
    avoid: [
      "Heavy construction or high boundary walls",
      "Toilets or septic tanks",
      "Kitchen or fire-related activities",
      "Clutter or storage of heavy items",
    ],
  },
  {
    icon: "↗️",
    name: "Northeast",
    deity: "Ishanya (Lord Shiva / Divine Creator)",
    element: "Water + Space",
    description:
      "The Northeast (Ishanya) corner is considered the most auspicious zone in Vastu Shastra. It is the meeting point of the divine North and East energies, making it ideal for spiritual practices and inviting blessings into the home.",
    bestFor: [
      "Pooja room and meditation space",
      "Open courtyards and light wells",
      "Study rooms and children's learning spaces",
      "Water features — ponds, fountains",
      "Main entrance (most auspicious placement)",
    ],
    colors: [
      { name: "White", code: "#FFFFFF" },
      { name: "Cream", code: "#FFFDD0" },
      { name: "Light Yellow", code: "#FFFFE0" },
      { name: "Sky Blue", code: "#87CEEB" },
    ],
    benefits: [
      "Invites divine blessings and spiritual energy",
      "Enhances wisdom, knowledge, and clarity of thought",
      "Promotes peace, harmony, and positive vibrations",
      "Supports health and overall well-being",
    ],
    avoid: [
      "Toilets — most severe Vastu defect",
      "Kitchen or fire elements",
      "Heavy construction, storerooms, or septic tanks",
      "Cutting or truncating this corner",
    ],
  },
  {
    icon: "➡️",
    name: "East",
    deity: "Indra (King of Gods)",
    element: "Air",
    description:
      "East is the direction of the rising sun and is associated with health, new beginnings, and positive energy. Governed by Indra, it is ideal for spaces that benefit from morning sunlight and fresh prana (life force).",
    bestFor: [
      "Main entrance and primary windows",
      "Living room and family spaces",
      "Children's bedroom and study",
      "Dining room for morning meals",
      "Balconies and open terraces",
    ],
    colors: [
      { name: "White", code: "#FFFFFF" },
      { name: "Light Blue", code: "#ADD8E6" },
      { name: "Cream", code: "#FFFDD0" },
      { name: "Silver", code: "#C0C0C0" },
    ],
    benefits: [
      "Promotes good health, vitality, and immunity",
      "Brings new opportunities and fresh beginnings",
      "Enhances positive social relationships",
      "Morning sunlight purifies and energises the space",
    ],
    avoid: [
      "Tall trees or structures blocking morning sunlight",
      "Toilets or garbage areas",
      "Heavy permanent structures close to the boundary",
      "Solid walls without any openings",
    ],
  },
  {
    icon: "↘️",
    name: "Southeast",
    deity: "Agni (God of Fire)",
    element: "Fire",
    description:
      "Southeast is the fire zone, governed by Agni. It represents energy, transformation, and vitality. The kitchen naturally belongs here to harness fire energy productively. Imbalance in this zone can cause health issues and financial loss.",
    bestFor: [
      "Kitchen — ideal placement",
      "Electrical equipment and switchboards",
      "Generator rooms and fire-related spaces",
      "Hot water heaters and geysers",
      "Garage (secondary option)",
    ],
    colors: [
      { name: "Orange", code: "#FF7043" },
      { name: "Red", code: "#E53935" },
      { name: "Coral", code: "#FF6B6B" },
      { name: "Yellow", code: "#FDD835" },
    ],
    benefits: [
      "Amplifies energy, confidence, and enthusiasm",
      "Supports digestion and physical health",
      "Enhances fame and recognition",
      "Promotes financial activity and business success",
    ],
    avoid: [
      "Overhead water tanks — fire-water conflict",
      "Pooja room or meditation space",
      "Master bedroom — causes aggression and restlessness",
      "Swimming pools or water bodies",
    ],
  },
  {
    icon: "⬇️",
    name: "South",
    deity: "Yama (God of Death & Justice)",
    element: "Earth",
    description:
      "South is often misunderstood as inauspicious but is actually the zone of fame, recognition, and stability. Governed by Yama, it represents earthly solidity. Heavy structures here provide stability and protection.",
    bestFor: [
      "Master bedroom (secondary option)",
      "Heavy storage and storerooms",
      "Solid boundary walls",
      "Staircase placement",
      "Garage and utility spaces",
    ],
    colors: [
      { name: "Red", code: "#D32F2F" },
      { name: "Pink", code: "#F06292" },
      { name: "Orange", code: "#FF5722" },
      { name: "Yellow", code: "#FFC107" },
    ],
    benefits: [
      "Provides stability, grounding, and protection",
      "Enhances fame, recognition, and social status",
      "Supports strength and courage",
      "Protects occupants from external negativity",
    ],
    avoid: [
      "Main entrance on the South wall",
      "Open spaces, gardens, or low structures",
      "Water features or water bodies",
      "Children's bedrooms",
    ],
  },
  {
    icon: "↙️",
    name: "Southwest",
    deity: "Nirrti (Goddess of Dissolution)",
    element: "Earth",
    description:
      "Southwest is the zone of earth's maximum weight and stability. It governs relationships, health of the head of household, and overall family strength. This corner must always be heavy, closed, and never cut or truncated.",
    bestFor: [
      "Master bedroom — most ideal placement",
      "Heavy wardrobes and almirahs",
      "Strong boundary walls and gates",
      "Main storeroom",
      "Senior family members' rooms",
    ],
    colors: [
      { name: "Peach", code: "#FFCBA4" },
      { name: "Mud Brown", code: "#8B4513" },
      { name: "Yellow", code: "#FFD700" },
      { name: "Sandy Beige", code: "#F5DEB3" },
    ],
    benefits: [
      "Stabilises relationships and promotes marital harmony",
      "Strengthens the authority of the head of household",
      "Ensures longevity and good health of residents",
      "Provides grounding and long-term stability",
    ],
    avoid: [
      "Open spaces, gardens, or low-height structures",
      "Main entrance — severely inauspicious",
      "Pooja room or meditation space",
      "Water bodies or swimming pools",
    ],
  },
  {
    icon: "⬅️",
    name: "West",
    deity: "Varuna (God of Water & Cosmic Order)",
    element: "Water",
    description:
      "West is the direction of gains, profits, and completion. Governed by Varuna, it supports academic achievement, material success, and the fruits of one's labour. Bedrooms and dining rooms here enjoy prosperity and satisfaction.",
    bestFor: [
      "Children's bedroom and study room",
      "Dining room and eating area",
      "Bathroom and toilets (acceptable zone)",
      "Guest bedroom",
      "Home gym or recreation room",
    ],
    colors: [
      { name: "Blue", code: "#1565C0" },
      { name: "Grey", code: "#9E9E9E" },
      { name: "White", code: "#FAFAFA" },
      { name: "Silver", code: "#B0BEC5" },
    ],
    benefits: [
      "Promotes gains, profits, and material rewards",
      "Enhances fame and academic achievement",
      "Supports creative pursuits and artistic success",
      "Brings satisfaction and a sense of completion",
    ],
    avoid: [
      "Main entrance as primary door",
      "Pooja room",
      "Kitchen (creates water-fire imbalance in this zone)",
      "Open low boundary — this side needs height",
    ],
  },
  {
    icon: "↖️",
    name: "Northwest",
    deity: "Vayu (God of Wind)",
    element: "Air",
    description:
      "Northwest is governed by Vayu, the wind god, representing movement, change, and communication. This direction is suitable for spaces that benefit from constant activity and social interaction — like guest rooms or toilets.",
    bestFor: [
      "Guest bedroom — guests come and go like the wind",
      "Bathroom and toilets",
      "Garage and parking",
      "Storage rooms",
      "Balconies and open spaces",
    ],
    colors: [
      { name: "White", code: "#FFFFFF" },
      { name: "Light Grey", code: "#ECEFF1" },
      { name: "Cream", code: "#FFF8E1" },
      { name: "Silver", code: "#CFD8DC" },
    ],
    benefits: [
      "Facilitates travel, movement, and change",
      "Supports communication and networking",
      "Helps with short-term projects and activities",
      "Promotes social connectivity",
    ],
    avoid: [
      "Master bedroom — causes restlessness and instability",
      "Pooja room",
      "Main entrance (secondary concern)",
      "Permanent heavy structures",
    ],
  },
];

// ── 4. vastuColors ────────────────────────────────────────────────────────────
// Shape: { name, primary, shades[], element, energy, bestFor[], effects }
export const vastuColors = [
  {
    name: "White & Cream",
    primary: "#F5F5DC",
    shades: ["#FFFFFF", "#FFFFF0", "#FFFDD0", "#FAF0E6", "#FFF8DC"],
    element: "Space (Akasha)",
    energy: "Purity, clarity, and expansion of consciousness",
    bestFor: [
      "Pooja room and meditation space",
      "Living room for a sense of spaciousness",
      "Northeast and North-facing rooms",
      "Ceilings throughout the home",
    ],
    effects:
      "White and cream tones invite purity, peace, and mental clarity. They expand the feeling of space and allow other positive energies to manifest without interference. Ideal for sacred spaces and rooms meant for reflection.",
  },
  {
    name: "Yellow & Gold",
    primary: "#FFD700",
    shades: ["#FFFFE0", "#FFFACD", "#FFD700", "#FFC107", "#FFB300"],
    element: "Earth (Prithvi)",
    energy: "Optimism, prosperity, and intellectual stimulation",
    bestFor: [
      "Study room and home office",
      "Kitchen — enhances appetite and warmth",
      "Living room and entrance hallway",
      "Northeast zone for divine energy",
    ],
    effects:
      "Yellow stimulates intellect, optimism, and creativity. Gold tones attract prosperity and abundance. In Vastu, yellow is associated with knowledge and learning, making it excellent for study spaces and areas where decision-making takes place.",
  },
  {
    name: "Green",
    primary: "#4CAF50",
    shades: ["#E8F5E9", "#A5D6A7", "#4CAF50", "#388E3C", "#93C572"],
    element: "Air (Vayu) & Nature",
    energy: "Growth, harmony, healing, and renewal",
    bestFor: [
      "Bedroom — promotes restful sleep",
      "Living room for a calming atmosphere",
      "North-facing rooms",
      "Study room for focus and growth",
    ],
    effects:
      "Green represents nature, growth, and healing. It is one of the most universally Vastu-compatible colours, suitable for almost any room. It reduces stress, promotes harmony, and creates a sense of balance and renewal.",
  },
  {
    name: "Blue",
    primary: "#2196F3",
    shades: ["#E3F2FD", "#90CAF9", "#42A5F5", "#1565C0", "#0D47A1"],
    element: "Water (Jal)",
    energy: "Calm, communication, and spiritual depth",
    bestFor: [
      "Bathroom and toilets",
      "West-facing rooms",
      "Children's bedroom for calm energy",
      "Living room accent walls",
    ],
    effects:
      "Blue invokes calm, clarity, and communication. Light blues are soothing and ideal for bedrooms and bathrooms. Deeper blues carry spiritual significance. In Vastu, blue is associated with water and supports emotional flow and mental peace.",
  },
  {
    name: "Orange & Saffron",
    primary: "#FF5722",
    shades: ["#FBE9E7", "#FFAB91", "#FF7043", "#E64A19", "#FF9800"],
    element: "Fire (Agni)",
    energy: "Enthusiasm, warmth, creativity, and social energy",
    bestFor: [
      "Living room for social vibrancy",
      "Dining room — stimulates appetite",
      "Southeast zone (fire direction)",
      "Gym or workout space",
    ],
    effects:
      "Orange and saffron tones radiate warmth, enthusiasm, and positive energy. Saffron holds deep spiritual significance in Indian culture and is associated with purity and courage. These colours stimulate conversation, appetite, and creative thinking.",
  },
  {
    name: "Pink & Rose",
    primary: "#E91E63",
    shades: ["#FCE4EC", "#F48FB1", "#EC407A", "#C2185B", "#FFCDD2"],
    element: "Earth & Fire (combined)",
    energy: "Love, compassion, romance, and emotional warmth",
    bestFor: [
      "Bedroom for couples — promotes romance",
      "Children's room for a nurturing atmosphere",
      "Southwest zone (relationship direction)",
      "Nursery and baby rooms",
    ],
    effects:
      "Pink is the colour of love, compassion, and tenderness. It is highly suitable for master bedrooms and couple spaces as it promotes emotional bonding and harmony. Light pink is calming while deeper rose tones are more energising.",
  },
  {
    name: "Red",
    primary: "#F44336",
    shades: ["#FFEBEE", "#EF9A9A", "#EF5350", "#C62828", "#B71C1C"],
    element: "Fire (Agni)",
    energy: "Power, passion, courage, and high vitality",
    bestFor: [
      "Southeast zone — kitchen and fire spaces",
      "Dining room accents",
      "South-facing walls in limited quantities",
      "Entrance area as a welcoming accent",
    ],
    effects:
      "Red is a powerful, high-energy colour that stimulates action, passion, and courage. In Vastu, it must be used sparingly — as accents rather than dominant wall colours — to avoid overstimulation and aggression. Best used in the fire zone (Southeast).",
  },
  {
    name: "Brown & Earthy Tones",
    primary: "#795548",
    shades: ["#EFEBE9", "#BCAAA4", "#8D6E63", "#5D4037", "#F5DEB3"],
    element: "Earth (Prithvi)",
    energy: "Stability, grounding, reliability, and comfort",
    bestFor: [
      "Master bedroom for stability",
      "Southwest zone furniture and décor",
      "Living room for a grounded atmosphere",
      "Wooden flooring and furniture throughout",
    ],
    effects:
      "Brown and earthy tones represent the earth element — stable, reliable, and nurturing. They create a sense of groundedness and security. Ideal for the Southwest zone and master bedroom, these colours support longevity and family stability.",
  },
];

// ── 5. vastuRemedies ──────────────────────────────────────────────────────────
// Shape: { icon, problem, solutions[], note? }
export const vastuRemedies = [
  {
    icon: "🚽",
    problem: "Toilet in the Northeast (Ishanya)",
    solutions: [
      "Place a small mirror on the inside of the toilet door facing outward",
      "Keep a bowl of sea salt in the toilet — replace every month",
      "Hang a Vastu pyramid or crystal on the toilet ceiling",
      "Keep the toilet lid closed at all times when not in use",
      "Paint the toilet walls white or light cream to reduce negative energy",
      "Place camphor balls in the corners — replace when they dissolve",
    ],
    note: "This is one of the most severe Vastu defects. While structural correction is best, these remedies significantly reduce the negative impact.",
  },
  {
    icon: "🔪",
    problem: "Truncated or Cut Corner (Missing Zone)",
    solutions: [
      "Place a large mirror on the wall adjacent to the cut corner",
      "Use bright lighting to energise the missing zone",
      "Place a Vastu yantra specific to the missing direction",
      "Use plants or a tall sculpture to fill the visual gap",
      "Hang a crystal prism near the missing corner to redirect energy",
    ],
    note: "A missing Northeast corner is most serious. A missing Southwest is also highly inauspicious. Address these first.",
  },
  {
    icon: "🍳",
    problem: "Kitchen in the Northeast or North",
    solutions: [
      "Place a red pyramid or triangular symbol in the kitchen",
      "Use red or orange coloured accessories in the kitchen",
      "Place a Agni yantra on the kitchen wall",
      "Install an exhaust fan in the Southeast wall of the kitchen",
      "Keep a bowl of water in the Northeast corner of the kitchen",
    ],
    note: "The Northeast is a water zone — having fire here creates elemental conflict. Structural relocation is the ideal fix.",
  },
  {
    icon: "🛏️",
    problem: "Bedroom in the Northeast",
    solutions: [
      "Use very light colours — white, cream, or light blue",
      "Place a heavy almirah or wardrobe in the Southwest corner",
      "Avoid placing the bed directly on the floor — use a solid bed frame",
      "Keep the Northeast corner of the room open and clutter-free",
      "Place a salt lamp or crystal in the room to harmonise energy",
    ],
    note: "Northeast bedrooms can cause financial instability and health issues for residents. If structural change is not possible, use these remedies consistently.",
  },
  {
    icon: "🪜",
    problem: "Staircase in the Northeast",
    solutions: [
      "Paint the staircase walls in light, uplifting colours",
      "Place a large mirror at the base of the stairs facing outward",
      "Hang a crystal chandelier or wind chimes at the staircase",
      "Keep the area below the staircase clean and open",
      "Place a Vastu pyramid under the first step",
    ],
    note: "A staircase in the Northeast suppresses the divine energy of this sacred zone. South or West placement is ideal.",
  },
  {
    icon: "🌑",
    problem: "Dark or Poorly Lit Spaces",
    solutions: [
      "Install bright, warm LED lights in all dark corners",
      "Use mirrors to reflect light into darker areas",
      "Place salt lamps or crystal lamps in dim corners",
      "Use light, reflective paint colours on walls and ceilings",
      "Add skylights or sun tunnels where possible",
    ],
    note: "Darkness accumulates stagnant energy and negative vibrations. Well-lit homes are essential in Vastu for positive energy flow.",
  },
  {
    icon: "💧",
    problem: "Leaking Taps and Drains",
    solutions: [
      "Repair all leaking taps, pipes, and drains immediately",
      "Replace dripping faucets — every drop signifies wealth drain",
      "Ensure all drains have covers when not in use",
      "Check and repair hidden pipe leaks in walls",
      "Place a Vastu yantra near persistent leak areas after repair",
    ],
    note: "In Vastu, water represents wealth. Any leakage signifies uncontrolled loss of prosperity. This is one of the most important practical remedies.",
  },
  {
    icon: "🪞",
    problem: "Mirror Facing the Bed",
    solutions: [
      "Cover the mirror with a curtain or cloth at night",
      "Relocate the mirror to a side wall where it doesn't face the bed",
      "Use a wardrobe with an internal mirror instead of a wall mirror",
      "Place the mirror on the North or East wall of the bedroom",
      "Ensure no mirror is directly opposite or above the bed",
    ],
    note: "A mirror facing the bed is believed to cause restless sleep, health issues, and relationship discord in Vastu. Address this promptly.",
  },
  {
    icon: "⬛",
    problem: "Clutter and Disorganisation",
    solutions: [
      "Declutter all rooms — especially the Northeast and centre",
      "Dispose of broken, unused, or non-functional items",
      "Organise storage in the South, West, or Southwest zones",
      "Keep pathways and passages clear and unobstructed",
      "Perform a regular deep clean with salt water to energise spaces",
    ],
    note: "Clutter is the single biggest Vastu defect that most homes suffer from. It blocks energy flow, suppresses prosperity, and causes mental fog.",
  },
];

// ── 6. vastuDosAndDonts ───────────────────────────────────────────────────────
// Shape: { dos[], donts[] }
export const vastuDosAndDonts = {
  dos: [
    "Keep the main entrance clean, well-lit, and welcoming at all times",
    "Place the Tulsi plant in the Northeast for divine blessings",
    "Ensure all rooms have adequate natural light and cross-ventilation",
    "Keep the Brahmasthan (centre of home) open and clutter-free",
    "Use earthy, warm colours in the Southwest and master bedroom",
    "Place heavy furniture and storage in the South, West, or Southwest",
    "Repair leaking taps, drains, and broken fixtures immediately",
    "Sleep with head pointing South or West for deep, restful sleep",
    "Keep the kitchen clean and the gas stove in the Southeast",
    "Place a water fountain or aquarium in the North or Northeast",
    "Use fresh flowers, plants, and natural elements to energise spaces",
    "Keep all clocks working — stopped clocks stagnate energy",
    "Ensure the toilet seat is always kept closed when not in use",
    "Use a welcome mat and positive symbols at the main entrance",
    "Perform regular cleaning with salt water to clear negative energy",
  ],
  donts: [
    "Never place a toilet or septic tank in the Northeast",
    "Avoid sleeping with your head pointing North — disturbs sleep",
    "Do not keep broken, chipped, or non-functional items in the home",
    "Avoid cactus and thorny plants inside the house",
    "Never block the Northeast corner with heavy furniture or storage",
    "Do not hang negative, violent, or sad artwork in living spaces",
    "Avoid placing mirrors directly facing the bed",
    "Never keep a shoe rack near the main entrance — move it aside",
    "Do not place the kitchen directly above or below the pooja room",
    "Avoid dark, dull colours on walls — especially in North and East zones",
    "Never leave dead plants or dried flowers in the home",
    "Avoid keeping clutter under beds — it disturbs sleep energy",
    "Do not place a water body in the Southeast (fire-water conflict)",
    "Never cut or truncate the Northeast corner of a plot or room",
    "Avoid cooking while facing South — causes stress and health issues",
  ],
};
