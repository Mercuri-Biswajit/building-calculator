# 🏗️ Civil Engineering Calculator & Estimator

> **Er. Biswajit Deb Barman** — Civil Engineer & Structural Designer, Raiganj, West Bengal
> 
> A professional-grade, hyper-optimized web application for civil engineers, contractors, and homeowners. Features detailed structural design calculators, BOQ generators, project estimators, interactive blueprints, and a robust client-saving dashboard.

![Verified Home Screen with No Errors](/C:/Users/Bisu9/.gemini/antigravity/brain/7c2ee62e-e791-4d79-a607-90b46b4ec936/initial_load_check_1773289544322.png)

---

## 🌐 Live Demo & Deployment

**[engineer-biswajit.netlify.app](https://engineer-biswajit.netlify.app/)**
*The project is configured for Netlify auto-deployment. Pushing to the `main` branch triggers a production build automatically.*

---

## 📋 Table of Contents

- [Core Features](#-core-features)
- [New Additions & Capabilities](#-new-additions--capabilities)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
- [Calculation Standards](#-calculation-standards)
- [Rate Database](#-rate-database)
- [Contributing](#-contributing)
- [Contact](#-contact)

---

## ✨ Core Features

### 🔢 Calculators (4 Main Integrations)
| Module | Capabilities |
|--------|-------------|
| **Costing & Estimation** | Full building cost estimate — materials, labour, timeline, and Bar Bending Schedule. Supports customizable local material rates (cement, steel, sand, aggregate). |
| **Structural Design** | Analyzes and generates IS 456:2000 compliant designs for beams, columns, and slabs with steel/tie scheduling. |
| **Brick Masonry** | Computes wall area, precise brick count (accounting for wastage), mortar requirements (cement & sand), and labor days. |
| **Paint Estimator** | Calculates interior/exterior paint requirements including primer and ceiling coats based on surface conditions. Outputs required cans (1L/4L/10L/20L) and painter-days. |

### 🧭 Vastu Room Planner
- Interactive compass-based floor planner.
- Comprehensive local study of Vastu principles: optimal directions, auspicious colors, and structural remedies.
- Real-time room placement scoring algorithms with recommendations.

---

## 🚀 New Additions & Capabilities

This application has recently been heavily upgraded with premium features aimed at professional workflows:

1. **Dashboard & Project Management**
   - Save complex estimates directly to your browser's local storage.
   - A custom **Save Project Modal** captures specific *Client Names*, *Project Locations*, and *Additional Notes*.
   - The Dashboard features an interactive statistics bar tracking your **Total Projects**, **Total Estimated Value**, and **Largest Project Size**.

2. **Interactive Blueprint Rendering**
   - **Live Drawings:** Dynamic SVG-based blueprint rendering for footing, column, beam, and stairs based on input parameters.
   - **Live Blueprint Uploads:** Users can upload their own custom blueprint images to overlay on top of standard designs. (Images are compressed and securely saved in LocalStorage up to ~500kb).
   - **Section Views:** Most structural modules now feature a toggleable "Section A-A View" complementing the standard Plan View for precise detailing.

3. **Performance Optimization**
   - **Route-Level Code Splitting:** `React.lazy()` and `Suspense` selectively load massive modules (like the Calculator and Dashboard) only when needed, drastically reducing initial load times.
   - **Component-Driven CSS:** The stylesheet architecture is strictly broken down into micro-components (`buttons.css`, `_modernpatch.css`, etc.) to prevent global CSS scoping pollution.
   - **Zero Dead Code:** Project is aggressively audited using `npx unimported` for a pristine build pipeline under ~1.2s.

---

## 🛠️ Tech Stack & Architecture

```
React 18          — UI Library
Vite v7           — Blazing fast build tooling
React Router v6   — Client-side routing with lazy loading
React Helmet      — Dynamic SEO meta tag injection
CSS Variables     — Component-scoped Design Tokens (No Tailwind)
Netlify           — Hosting & CI/CD deployment
```

**Zero Backend.**
All calculations, PDF exports, layout logic, and storage logic run cleanly on the client-side utilizing `localStorage`. Maximum privacy, zero latency.

---

## 📁 Project Directory Structure

```text
src/
├── components/          # Reusable and Domain-specific React Components
│   ├── ui/              # (Button, TabBar, Modals, Skeleton Loaders)
│   ├── costings/        # Costing Inputs & Results logic
│   ├── structural/      # Beam, Column, Slab design panels
│   ├── drawings/        # Dynamic SVG Blueprint components
│   ├── layout/          # Global Header, Footer, and Sidebar Layout Grids
│   ├── hero/            # Landing page hero sections
│   ├── ...
│
├── config/              # Global Site Metadata & SEO settings
├── context/             # React Context Providers (UnitContext - Feet/Meters)
├── data/                # Static data arrays used for UI scaffolding
├── hooks/               # Core Mathematical/Engineering processing hooks
├── pages/               # Top-level Route wrappers (lazy loaded)
├── styles/              # Strictly scoped CSS architecture
│   ├── base/            # css resets & typography
│   ├── components/      # button, modal, form CSS
│   ├── layout/          # grid layouts
│   └── index.css        # The singular CSS entry point via Vite
│
└── utils/               # Shared logic
    ├── calculator/      # Pure mathematical engineering equations
    └── storage/         # LocalStorage wrappers & project indexing
```

---

## 🏁 Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/Mercuri-Biswajit/building-calculator.git

# Navigate to project folder
cd building-calculator

# Install dependencies safely
npm install

# Start ultra-fast development server (usually runs on port 3000 or 5173)
npm run dev
```

### Build for Production
```bash
npm run build
```

---

## 📐 Calculation Standards

The mathematics running this application adhere strictly to recognized Indian Standards of Engineering:

| Structural Element | IS Code / Standard Used |
|--------------------|-------------------------|
| **RCC Slab Design** | IS 456:2000 (Limit State Method) |
| **Beam Design** | IS 456:2000 — Flexure + Shear |
| **Column Design** | IS 456:2000 — Biaxial Bending, Slenderness |
| **Bar Bending** | IS 2502 |
| **Brick Masonry** | IS 1905, IS 1077 |
| **Deflection / Span/Depth Ratio** | IS 456 Table 26 |
| **Two-Way Slab Coefficients** | IS 456 Table 27 |
| **Concrete & Steel Grades** | M15 - M30 / Fe415 - Fe500D |

---

## 💰 Rate Database

*(Base Reference: WB PWD SOR 2023-24 applicable to North Bengal / Raiganj region.)*

| Core Item | Sample Standard Rate |
|-----------|----------------------|
| Earthwork Excavation | ₹140 / cum |
| PCC 1:4:8 | ₹5,400 / cum |
| RCC M20 Slab / Beam | ~₹10,600 - ₹11,600 / cum |
| Brick Masonry 230mm | ₹5,400 / cum |
| Cement OPC 43 | ₹380 / bag |
| Steel Fe415 TMT | ₹68 / kg |

> *Note: While defaults are provided, the Calculator allows manual overrides for live local market fluctuations.*

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve this project:

1. **Fork** the repository
2. **Create a feature branch:** `git checkout -b feature/enhanced-pdf-export`
3. **Commit changes:** `git commit -m "Add: detailed PDF export capability"`
4. **Push to branch:** `git push origin feature/enhanced-pdf-export`
5. **Open a Pull Request**

### Current Ideas for Contribution:
- Improved print-to-PDF formatting for formal estimates.
- Adding region-specific material databases (e.g., Delhi, Mumbai, international).
- PWA (Progressive Web App) support for offline usage at remote construction sites.
- Calculating precise Contractor Margins vs Material Cost split.

---

## 📞 Contact

**Er. Biswajit Deb Barman**  
*Civil Engineer & Structural Designer*

📍 Chanditala, Raiganj, Uttar Dinajpur, West Bengal – 733134  
📧 [biswajitdebbarman.civil@gmail.com](mailto:biswajitdebbarman.civil@gmail.com)  
📱 +91-7602120054  
🔗 [LinkedIn Profile](https://www.linkedin.com/in/biswajit-deb-barman/)  
📸 [Instagram Portfolio](https://www.instagram.com/biswajit.deb.barman/)  

**Primary Service Areas:** Raiganj · Dalkhola · Islampur · Itahar · Chopra · Kaliaganj · Hemtabad

---

<p align="center">
  Built with ❤️ by Er. Biswajit Deb Barman · Raiganj, West Bengal
</p>