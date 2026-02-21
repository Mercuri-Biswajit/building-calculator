// ===========================
// GLOBAL CONSTANTS
// Single source of truth for all
// configuration values & magic numbers
// ===========================

// ===========================
// SITE METADATA
// ===========================

export const SITE = {
  name: "Er. Biswajit Deb Barman",
  title: "Civil Engineer & Structural Designer – Raiganj, West Bengal",
  tagline: "Serving Raiganj, Uttar Dinajpur & North Bengal",
  email: "biswajitdebbarman.civil@gmail.com",
  phone: "+91-7602120054",
  location: "Chanditala, Raiganj, Uttar Dinajpur, West Bengal – 733134",
  linkedin: "https://www.linkedin.com/in/biswajit-deb-barman/",
  instagram: "https://www.instagram.com/biswajit.deb.barman/",
  url: "https://engineer-biswajit.netlify.app/",

  // Areas served — used in Footer and About
  serviceAreas: [
    "Raiganj",
    "Dalkhola",
    "Islampur",
    "Itahar",
    "Chopra",
    "Kaliaganj",
    "Hemtabad",
  ],

  // Per-page SEO — used with <Helmet> in each page
  seo: {
    home: {
      title: "Civil Engineer in Raiganj | Er. Biswajit Deb Barman",
      description:
        "Top civil engineer in Raiganj, Uttar Dinajpur, WB. Expert in structural design, BOQ, cost estimation & building planning services.",
      canonical: "https://engineer-biswajit.netlify.app/",
    },
    projects: {
      title: "Projects | Civil Engineering Works in Raiganj & North Bengal",
      description:
        "Portfolio of residential and commercial engineering projects by Er. Biswajit Deb Barman, Raiganj, Uttar Dinajpur, West Bengal.",
      canonical: "https://engineer-biswajit.netlify.app/projects",
    },
    about: {
      title: "About Er. Biswajit Deb Barman | Civil Engineer – Raiganj",
      description:
        "Civil engineer from Raiganj specializing in IS 456:2000 structural design, WB PWD cost estimation, and building planning.",
      canonical: "https://engineer-biswajit.netlify.app/about",
    },
    calculators: {
      title:
        "Free Construction Calculator – Raiganj | RCC, BOQ, Cost Estimator",
      description:
        "Free online construction cost calculator based on WB PWD SOR 2023–24. RCC slab, beam, column design, BOQ, paint estimator. Built by Er. Biswajit, Raiganj.",
      canonical: "https://engineer-biswajit.netlify.app/calculators",
    },
    vastu: {
      title: "Vastu Shastra Room Planner | Er. Biswajit Deb Barman – Raiganj",
      description:
        "Free Vastu room planner and Vastu study by civil engineer in Raiganj, West Bengal. Plan your home layout according to Vastu principles.",
      canonical: "https://engineer-biswajit.netlify.app/vastu",
    },
  },
};

// ===========================
// ANIMATION
// ===========================

export const AOS_CONFIG = {
  duration: 800,
  easing: "ease-out-cubic",
  once: true,
  offset: 100,
  delay: 50,
};

// ===========================
// NAVBAR
// ===========================

export const NAVBAR = {
  scrollThreshold: 100, // px before navbar changes style
};
