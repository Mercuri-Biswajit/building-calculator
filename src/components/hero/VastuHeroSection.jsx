// src/components/hero/VastuHeroSection.jsx
// Same design as HeroSection — Vastu Shastra content
// Props: { mainTab, onTabChange }

import "../../styles/components/_herosection.css";

const TABS = [
  {
    id: "planner",
    emoji: "🏗️",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    label: "Room Planner",
    sub: "Generate Vastu layout from plot",
    color: "#E8630A",
  },
  {
    id: "study",
    emoji: "📖",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    label: "Vastu Study",
    sub: "Principles, directions & remedies",
    color: "#0A7EA4",
  },
];

const FEATURES = [
  { icon: "✓", text: "Ancient Indian Science" },
  { icon: "✓", text: "8 Directions Covered" },
  { icon: "✓", text: "Free & Instant Results" },
];

export function VastuHeroSection({ mainTab, onTabChange }) {
  const activeTab = TABS.find((t) => t.id === mainTab) || TABS[0];

  return (
    <section className="hs-root">
      {/* ── Top bar ── */}
      <div className="hs-topbar">
        <div className="hs-topbar-inner container">
          <span className="hs-topbar-badge">
            <span className="hs-topbar-dot" />
            वास्तु शास्त्र
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
        <div className="hs-bg-grid" aria-hidden="true" />
        <div className="hs-bg-glow" aria-hidden="true" />

        <div className="container hs-body-inner">
          {/* Left: headline + description */}
          <div className="hs-headline">
            <div className="hs-eyebrow">
              <span className="hs-eyebrow-icon">{activeTab.emoji}</span>
              Vastu Shastra Suite
            </div>
            <h1 className="hs-title">
              Harmony Through
              <br />
              <span className="hs-title-accent">Vastu Shastra</span>
            </h1>
            <p className="hs-desc">
              Ancient Indian science of architecture and design for harmonious
              living spaces. Create balance between nature's five elements and
              enhance positive energy in your home.
            </p>
            <div className="hs-pills">
              <span className="hs-pill hs-pill--navy">2 Tools</span>
              <span className="hs-pill hs-pill--orange">8 Directions</span>
              <span className="hs-pill hs-pill--green">Free Forever</span>
            </div>
          </div>

          {/* Right: Stats + feature grid */}
          <div className="hs-stats-block">
            {/* Top row — 2 big stats */}
            <div className="hs-stats-row">
              <div className="hs-stat-box hs-stat-box--orange">
                <span className="hs-stat-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="2" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                  </svg>
                </span>
                <strong className="hs-stat-num">8</strong>
                <span className="hs-stat-label">Directions</span>
              </div>
              <div className="hs-stat-box hs-stat-box--navy">
                <span className="hs-stat-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                <strong className="hs-stat-num">5</strong>
                <span className="hs-stat-label">Pancha Bhutas</span>
              </div>
            </div>

            {/* Feature list */}
            <div className="hs-feat-list">
              {[
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18M9 21V9" />
                    </svg>
                  ),
                  title: "Room Planner",
                  desc: "Generate Vastu-compliant room layout",
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="2" x2="12" y2="22" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                    </svg>
                  ),
                  title: "Direction Analysis",
                  desc: "8 directions with element mapping",
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                  ),
                  title: "Vastu Remedies",
                  desc: "Colors, plants & correction tips",
                },
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
          <div className="hs-tabs" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
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