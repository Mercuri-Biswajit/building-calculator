# 🏗️ Civil Engineering Calculator & Estimator

> **Er. Biswajit Deb Barman** — Civil Engineer & Structural Designer, Raiganj, West Bengal
> 
> A professional-grade web application for civil engineers, contractors, and homeowners in North Bengal — featuring structural design calculators, BOQ generators, project estimators, and Vastu room planners.

---

## 🌐 Live Demo

**[engineer-biswajit.netlify.app](https://engineer-biswajit.netlify.app/)**

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Pages & Tools](#-pages--tools)
- [Calculation Standards](#-calculation-standards)
- [Rate Database](#-rate-database)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [Contact](#-contact)

---

## ✨ Features

### 🔢 Calculators (5 Tabs)
| Tab | What it does |
|-----|-------------|
| **Costing** | Full building cost estimate — materials, labour, BOQ, timeline, BBS |
| **Structural** | IS 456:2000 beam, column, and slab design with steel scheduling |
| **Brick Masonry** | Wall area, brick count, mortar, foundation brickwork |
| **Paint Estimator** | Paint quantity, can breakdown, brand comparison, labour days |
| **BOQ** | Itemised Bill of Quantities with floor-wise breakdown |

### 📐 Project Estimator (10 Project Types)
- 🏠 Full Building (multi-storey RCC)
- 🏗️ RCC Footing / Foundation
- 🔲 RCC Column
- ━ RCC Beam
- ▬ RCC Slab
- 📏 Strip Foundation
- 🟦 Raft Foundation
- 🪜 RCC Staircase
- 🧱 Brick Masonry Wall
- 🪨 Retaining Wall

### 🧭 Vastu Room Planner
- Interactive 3×3 compass-based floor planner
- Vastu Study: Principles, Directions, Colors, Remedies
- Room placement scoring with recommendations

### 🎨 Design & UX
- Professional navy + orange design system
- Skeleton loading animations
- Fully responsive (mobile-first)
- Print-ready layouts
- Sticky tab navigation

---

## 🛠️ Tech Stack

```
React 18          — UI framework
React Router v6   — Client-side routing
React Helmet      — SEO meta tags
CSS Variables     — Design token system
AOS               — Scroll animations
Netlify           — Hosting & deployment
```

**No backend. No database. Pure frontend.**

All calculations run client-side using standard engineering formulas.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── boq/              # BOQ Calculator Tab
│   ├── brick/            # Brick Masonry Tab
│   ├── costing/          # Costing Input + Results panels
│   ├── hero/             # HeroSection & VastuHeroSection
│   ├── paint/            # Paint Estimator Tab
│   ├── structural/       # Beam, Column, Slab design tabs
│   ├── ui/               # Skeleton loader components
│   └── vastu/            # VastuRoomPlanner & VastuStudy
│
├── config/
│   └── constants.js      # Site metadata, SEO, AOS config
│
├── hooks/
│   ├── useBeamDesign.js      # IS 456 beam design logic
│   ├── useBrickMasonry.js    # Brickwork quantity calculator
│   ├── useCalculator.js      # Main building calculator hook
│   ├── useColumnDesign.js    # IS 456 column design logic
│   ├── useCostingInputs.js   # Building costing form state
│   ├── usePaintEstimator.js  # Paint quantity calculator
│   ├── useProjectEstimator.js # 10-type project estimator
│   ├── useSkeleton.js        # Loading state controller
│   └── useSlabDesign.js      # IS 456 slab design logic
│
├── pages/
│   ├── CalculatorPage.jsx      # Main calculator (5 tabs)
│   ├── ProjectEstimatorPage.jsx # Dashboard with sidebar
│   └── VastuPage.jsx           # Vastu planner + study
│
├── styles/
│   ├── base/
│   │   ├── _reset.css
│   │   ├── _typography.css
│   │   └── _variables.css      # Design tokens (single source of truth)
│   ├── components/
│   │   ├── _animations.css
│   │   └── _buttons.css
│   └── pages/
│       ├── _calculator.css
│       ├── _design-calculator.css
│       ├── _boq-calculator.css
│       ├── _project-estimator.css
│       └── _vastupage.css
│
└── utils/
    └── calculator/
        ├── core.js           # calcBuilding, calcSlab
        └── rates/
            └── standard.js   # WB PWD SOR 2023-24 rates
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16
- npm >= 7

### Installation

```bash
# Clone the repository
git clone https://github.com/Mercuri-Biswajit/building-calculator.git

# Navigate to project folder
cd building-calculator

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

### Deploy (Netlify)

The project is configured for Netlify auto-deployment. Push to `main` branch triggers a build automatically.

---

## 📄 Pages & Tools

### `/` — Calculator Page

The main tool. Five tabs accessible via sticky navigation:

**Costing Tab**
- Input: plot dimensions, floors, floor height, building type, soil condition, finish grade
- Output: material breakdown, BBS (Bar Bending Schedule), BOQ, project timeline, structure design
- Supports custom material rates (cement, steel, sand, aggregate)

**Structural Design Tab**
- Slab: one-way / two-way IS 456:2000, bar options (6–16mm), deflection check
- Beam: flexural design, shear design, bar scheduling
- Column: biaxial bending, slenderness check, tie spacing
- Auto-populate from costing results or slab outputs

**Brick Masonry Tab**
- Input: building dimensions, floors, wall thickness (4.5", 9", 13.5"), doors, windows
- Output: net wall area, brick count (with wastage), cement bags, sand (cft), labour days
- Optional: foundation brickwork calculation

**Paint Estimator Tab**
- Types: interior emulsion, exterior weather coat, primer, ceiling
- Accounts for surface condition (new / repaint / rough)
- Output: litres required, can breakdown (1L / 4L / 10L / 20L), painter-days, cost estimate

**BOQ Tab**
- Floor-wise Bill of Quantities
- Searchable, filterable table
- Printable format with signature blocks

### `/estimator` — Project Estimator Dashboard

Professional sidebar dashboard with:
- 10 project type calculators
- Estimate history (session-based)
- Material rates reference (WB PWD SOR 2023-24)
- Print & clear actions

### `/vastu` — Vastu Room Planner

Two tabs:
- **Planner**: Enter plot dimensions + facing direction → interactive 9-zone floor grid with Vastu scores
- **Study**: Principles, room directions, colors, remedies, general do's & don'ts

---

## 📐 Calculation Standards

| Element | Standard Used |
|---------|--------------|
| RCC Slab Design | IS 456:2000 (Limit State Method) |
| Beam Design | IS 456:2000 — flexure + shear |
| Column Design | IS 456:2000 — biaxial bending, slenderness |
| Bar Bending | IS 2502 |
| Brick Masonry | IS 1905, IS 1077 |
| Span/Depth Ratio | IS 456 Table 26 |
| Two-Way Slab Coefficients | IS 456 Table 27 |
| Concrete Grades | M15 / M20 / M25 / M30 |
| Steel Grades | Fe415 / Fe500 / Fe500D |

---

## 💰 Rate Database

All rates are based on **WB PWD SOR 2023-24** (West Bengal Public Works Department Schedule of Rates), applicable to Raiganj and North Bengal region.

| Item | Rate |
|------|------|
| Earthwork Excavation | ₹140 / cum |
| PCC 1:4:8 | ₹5,400 / cum |
| RCC M20 Slab | ₹10,600 / cum |
| RCC M20 Column | ₹12,400 / cum |
| RCC M20 Beam | ₹11,600 / cum |
| Brick Masonry 230mm | ₹5,400 / cum |
| Cement Plaster (Internal) | ₹270 / sqm |
| Painting (Internal) | ₹195 / sqm |
| Electrical Wiring | ₹165 / sqft |
| Plumbing & Sanitary | ₹140 / sqft |
| Cement OPC 43 | ₹380 / bag |
| Steel Fe415 TMT | ₹68 / kg |

> Rates are periodically reviewed. For current market rates in your area, always verify with local suppliers.

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve this project:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add: your feature description"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

### Ideas for Contribution
- [ ] PDF export for estimates
- [ ] Pakistan city rate database (Lahore, Karachi, Islamabad)
- [ ] Contractor margin analyzer
- [ ] Material rate tracker with inflation history
- [ ] Offline PWA support

---

## 📞 Contact

**Er. Biswajit Deb Barman**  
Civil Engineer & Structural Designer

📍 Chanditala, Raiganj, Uttar Dinajpur, West Bengal – 733134  
📧 [biswajitdebbarman.civil@gmail.com](mailto:biswajitdebbarman.civil@gmail.com)  
📱 +91-7602120054  
🔗 [LinkedIn](https://www.linkedin.com/in/biswajit-deb-barman/)  
📸 [Instagram](https://www.instagram.com/biswajit.deb.barman/)  

**Service Areas:** Raiganj · Dalkhola · Islampur · Itahar · Chopra · Kaliaganj · Hemtabad

---

## 📜 License

This project is the personal portfolio and tool of **Er. Biswajit Deb Barman**.  
All rights reserved. Please do not redistribute without permission.

---

<p align="center">
  Built with ❤️ by Er. Biswajit Deb Barman · Raiganj, West Bengal
</p>