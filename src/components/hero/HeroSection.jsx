// src/components/HeroSection.jsx
// Redesigned: Light theme · Plus Jakarta Sans · Navy + Orange
// Drop-in replacement — same props: { mainTab, onTabChange }

import "../../styles/components/_herosection.css";

const TABS = [
  {
    id: "costing",
    emoji: "💰",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    label: "Estimate Costing",
    sub: "Full building cost breakdown",
    color: "#E8630A",
  },
  {
    id: "structural",
    emoji: "🏗️",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    label: "Structural Design",
    sub: "Beam & column IS 456:2000",
    color: "#0A7EA4",
  },
  {
    id: "brick",
    emoji: "🧱",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="7" width="20" height="5" rx="1" />
        <rect x="2" y="14" width="9" height="5" rx="1" />
        <rect x="13" y="14" width="9" height="5" rx="1" />
      </svg>
    ),
    label: "Brick Masonry",
    sub: "Quantity & mortar calculator",
    color: "#B45309",
  },
  {
    id: "paint",
    emoji: "🎨",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 13.5V20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6.5" />
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 7v6.5M22 7v6.5" />
      </svg>
    ),
    label: "Paint Estimator",
    sub: "Area-based paint quantity",
    color: "#7C3AED",
  },
];

const FEATURES = [
  { icon: "✓", text: "IS 456:2000 Compliant" },
  { icon: "✓", text: "Indian Material Rates" },
  { icon: "✓", text: "Free & Instant Results" },
];

export function HeroSection({ mainTab, onTabChange }) {
  const activeTab = TABS.find((t) => t.id === mainTab) || TABS[0];

  return (
    <section className="hs-root">
      {/* ── Top bar ── */}
      <div className="hs-topbar">
        <div className="hs-topbar-inner container">
          <span className="hs-topbar-badge">
            <span className="hs-topbar-dot" />
            Professional Tools
          </span>
          <span className="hs-topbar-sep" />
          {FEATURES.map((f) => (
            <span key={f.text} className="hs-topbar-feat">
              <span className="hs-topbar-check">{f.icon}</span>
              {f.text}
            </span>
          ))}
        </div>
      </div>

      {/* ── Hero body ── */}
      <div className="hs-body">
        {/* Blueprint dot grid */}
        <div className="hs-bg-grid" aria-hidden="true" />
        {/* Orange glow top-right */}
        <div className="hs-bg-glow" aria-hidden="true" />

        <div className="container hs-body-inner">
          {/* Left: headline + description */}
          <div className="hs-headline">
            <div className="hs-eyebrow">
              <span className="hs-eyebrow-icon">{activeTab.emoji}</span>
              Construction Calculator Suite
            </div>
            <h1 className="hs-title">
              Smart Tools for
              <br />
              <span className="hs-title-accent">Civil Engineers</span>
            </h1>
            <p className="hs-desc">
              IS 456:2000 compliant calculators for cost estimation, structural
              design, brick masonry, and paint quantity — built for Indian
              construction professionals.
            </p>
            <div className="hs-pills">
              <span className="hs-pill hs-pill--navy">4 Calculators</span>
              <span className="hs-pill hs-pill--orange">IS 456:2000</span>
              <span className="hs-pill hs-pill--green">Free Forever</span>
            </div>
          </div>

          {/* Right: Stats + feature grid */}
          <div className="hs-stats-block">
            {/* Top row — 2 big stats */}
            <div className="hs-stats-row">
              <div className="hs-stat-box hs-stat-box--orange">
                <span className="hs-stat-icon">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </span>
                <strong className="hs-stat-num">4+</strong>
                <span className="hs-stat-label">Calculator Tools</span>
              </div>
              <div className="hs-stat-box hs-stat-box--navy">
                <span className="hs-stat-icon">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                <strong className="hs-stat-num">IS 456</strong>
                <span className="hs-stat-label">:2000 Compliant</span>
              </div>
            </div>

            {/* Feature list */}
            <div className="hs-feat-list">
              {[
                {
                  icon: (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  ),
                  title: "Beam & Column Design",
                  desc: "RCC member design per IS 456",
                },
                {
                  icon: (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="7" width="20" height="5" rx="1" />
                      <rect x="2" y="14" width="9" height="5" rx="1" />
                      <rect x="13" y="14" width="9" height="5" rx="1" />
                    </svg>
                  ),
                  title: "Brick Masonry",
                  desc: "Bricks, mortar & quantity estimate",
                },
                {
                  icon: (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  ),
                  title: "Full Building Cost",
                  desc: "Labour, material & BOQ breakdown",
                },
                // {
                //   icon: (
                //     <svg
                //       width="16"
                //       height="16"
                //       viewBox="0 0 24 24"
                //       fill="none"
                //       stroke="currentColor"
                //       strokeWidth="2"
                //       strokeLinecap="round"
                //       strokeLinejoin="round"
                //     >
                //       <circle cx="12" cy="12" r="10" />
                //       <polyline points="12 6 12 12 16 14" />
                //     </svg>
                //   ),
                //   title: "Project Timeline",
                //   desc: "Phase-wise schedule estimation",
                // },
              ].map((f) => (
                <div key={f.title} className="hs-feat-item">
                  <span className="hs-feat-icon">{f.icon}</span>
                  <div className="hs-feat-text">
                    <strong>{f.title}</strong>
                    <span>{f.desc}</span>
                  </div>
                  <span className="hs-feat-arrow">›</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab strip ── */}
      <div className="hs-tabs-wrap">
        <div className="container">
          <div className="hs-tabs">
            {TABS.map((tab, i) => {
              const active = mainTab === tab.id;
              return (
                <button
                  key={tab.id}
                  className={`hs-tab${active ? " hs-tab--active" : ""}`}
                  onClick={() => onTabChange(tab.id)}
                  style={{
                    "--tab-color": tab.color,
                    animationDelay: `${i * 60}ms`,
                  }}
                >
                  <span className="hs-tab-num">0{i + 1}</span>
                  <span className="hs-tab-icon-wrap">{tab.icon}</span>
                  <span className="hs-tab-body">
                    <strong className="hs-tab-label">{tab.label}</strong>
                    <em className="hs-tab-sub">{tab.sub}</em>
                  </span>
                  {active && <span className="hs-tab-active-bar" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
