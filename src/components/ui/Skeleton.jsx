// ═══════════════════════════════════════════════════════════════════════════
// src/components/ui/Skeleton.jsx
// Reusable skeleton shimmer components for all pages
// ═══════════════════════════════════════════════════════════════════════════

import "./Skeleton.css";

// ── Base shimmer block ───────────────────────────────────────────────────
export function SkeletonBlock({
  width = "100%",
  height = "1rem",
  borderRadius = "4px",
  style = {},
}) {
  return (
    <div
      className="skeleton-block"
      style={{ width, height, borderRadius, ...style }}
      aria-hidden="true"
    />
  );
}

// ── Project Card Skeleton ────────────────────────────────────────────────
export function ProjectCardSkeleton() {
  return (
    <div className="skeleton-project-card" aria-hidden="true">
      {/* Image area */}
      <div className="skeleton-project-image" />
      {/* Body */}
      <div className="skeleton-project-body">
        <div className="skeleton-project-meta">
          <SkeletonBlock width="60px" height="0.75rem" borderRadius="12px" />
          <SkeletonBlock width="24px" height="24px" borderRadius="50%" />
        </div>
        <SkeletonBlock
          width="80%"
          height="1.25rem"
          borderRadius="4px"
          style={{ marginBottom: "0.5rem" }}
        />
        <SkeletonBlock
          width="100%"
          height="0.85rem"
          borderRadius="4px"
          style={{ marginBottom: "0.35rem" }}
        />
        <SkeletonBlock
          width="70%"
          height="0.85rem"
          borderRadius="4px"
          style={{ marginBottom: "1.5rem" }}
        />
        {/* Footer info grid */}
        <div className="skeleton-project-footer">
          <div className="skeleton-project-info">
            <SkeletonBlock width="50px" height="0.7rem" borderRadius="3px" />
            <SkeletonBlock width="80px" height="0.85rem" borderRadius="3px" />
          </div>
          <div className="skeleton-project-info">
            <SkeletonBlock width="60px" height="0.7rem" borderRadius="3px" />
            <SkeletonBlock width="70px" height="0.85rem" borderRadius="3px" />
          </div>
          <div className="skeleton-project-info">
            <SkeletonBlock width="55px" height="0.7rem" borderRadius="3px" />
            <SkeletonBlock width="75px" height="0.85rem" borderRadius="3px" />
          </div>
          <div className="skeleton-project-info">
            <SkeletonBlock width="50px" height="0.7rem" borderRadius="3px" />
            <SkeletonBlock width="65px" height="0.85rem" borderRadius="3px" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Skill Card Skeleton ──────────────────────────────────────────────────
export function SkillCardSkeleton() {
  return (
    <div className="skeleton-skill-card" aria-hidden="true">
      {/* Watermark ghost */}
      <div className="skeleton-skill-watermark" />
      {/* Header: icon + name */}
      <div className="skeleton-skill-header">
        <SkeletonBlock width="48px" height="48px" borderRadius="10px" />
        <SkeletonBlock width="140px" height="1rem" borderRadius="4px" />
      </div>
      {/* Rule */}
      <SkeletonBlock
        width="100%"
        height="1px"
        borderRadius="1px"
        style={{ margin: "0.75rem 0 1rem" }}
      />
      {/* Skill items */}
      <div className="skeleton-skill-items">
        {[90, 75, 85, 65].map((w, i) => (
          <div key={i} className="skeleton-skill-item">
            <SkeletonBlock width="5px" height="5px" borderRadius="50%" />
            <SkeletonBlock width={`${w}%`} height="0.8rem" borderRadius="3px" />
          </div>
        ))}
      </div>
      {/* Foot bar */}
      <SkeletonBlock
        width="40px"
        height="3px"
        borderRadius="2px"
        style={{ marginTop: "1.25rem" }}
      />
    </div>
  );
}

// ── About Page — Skills grid skeleton ───────────────────────────────────
export function AboutSkillSkeleton() {
  return (
    <div className="skeleton-about-skill" aria-hidden="true">
      <SkeletonBlock width="40px" height="40px" borderRadius="8px" />
      <div className="skeleton-about-skill-text">
        <SkeletonBlock
          width="120px"
          height="0.9rem"
          borderRadius="3px"
          style={{ marginBottom: "0.4rem" }}
        />
        <SkeletonBlock width="80px" height="0.75rem" borderRadius="3px" />
      </div>
    </div>
  );
}

// ── About Page — Education timeline item skeleton ────────────────────────
export function EducationItemSkeleton() {
  return (
    <div className="skeleton-education-item" aria-hidden="true">
      <div className="skeleton-edu-dot" />
      <div className="skeleton-edu-content">
        <SkeletonBlock
          width="60%"
          height="1rem"
          borderRadius="4px"
          style={{ marginBottom: "0.5rem" }}
        />
        <SkeletonBlock
          width="40%"
          height="0.8rem"
          borderRadius="3px"
          style={{ marginBottom: "0.4rem" }}
        />
        <SkeletonBlock width="80%" height="0.75rem" borderRadius="3px" />
      </div>
    </div>
  );
}

// ── Calculator Page — Tab skeleton ───────────────────────────────────────
export function CalcTabSkeleton() {
  return (
    <div className="skeleton-calc-tab" aria-hidden="true">
      {/* Tab buttons row */}
      <div className="skeleton-calc-tabs-row">
        {[100, 120, 90, 110, 95, 105, 88, 115].map((w, i) => (
          <SkeletonBlock
            key={i}
            width={`${w}px`}
            height="40px"
            borderRadius="8px"
          />
        ))}
      </div>
      {/* Content area */}
      <div className="skeleton-calc-content">
        <div className="skeleton-calc-inputs">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-calc-input-group">
              <SkeletonBlock
                width="120px"
                height="0.85rem"
                borderRadius="3px"
                style={{ marginBottom: "0.5rem" }}
              />
              <SkeletonBlock width="100%" height="48px" borderRadius="8px" />
            </div>
          ))}
        </div>
        <SkeletonBlock
          width="200px"
          height="48px"
          borderRadius="30px"
          style={{ margin: "2rem auto 0" }}
        />
      </div>
    </div>
  );
}

// ── Hero skeleton (light placeholder before hero image loads) ────────────
export function HeroSkeleton() {
  return (
    <div className="skeleton-hero" aria-hidden="true">
      <div className="skeleton-hero-content">
        <SkeletonBlock
          width="240px"
          height="0.9rem"
          borderRadius="4px"
          style={{ marginBottom: "1rem" }}
        />
        <SkeletonBlock
          width="60%"
          height="3.5rem"
          borderRadius="6px"
          style={{ marginBottom: "0.75rem" }}
        />
        <SkeletonBlock
          width="45%"
          height="3.5rem"
          borderRadius="6px"
          style={{ marginBottom: "1.5rem" }}
        />
        <SkeletonBlock
          width="90%"
          height="0.9rem"
          borderRadius="3px"
          style={{ marginBottom: "0.4rem" }}
        />
        <SkeletonBlock
          width="75%"
          height="0.9rem"
          borderRadius="3px"
          style={{ marginBottom: "0.4rem" }}
        />
        <SkeletonBlock
          width="80%"
          height="0.9rem"
          borderRadius="3px"
          style={{ marginBottom: "2rem" }}
        />
        <div className="skeleton-hero-btns">
          <SkeletonBlock width="160px" height="52px" borderRadius="30px" />
          <SkeletonBlock width="180px" height="52px" borderRadius="30px" />
        </div>
      </div>
      <div className="skeleton-hero-image" />
    </div>
  );
}
