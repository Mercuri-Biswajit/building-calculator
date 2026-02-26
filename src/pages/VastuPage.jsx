import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { SITE } from "../config/constants";

import VastuRoomPlanner from "../components/vastu/VastuRoomPlanner";
import VastuStudy from "../components/vastu/VastuStudy";

import "../styles/pages/_vastupage.css";

import { useSkeleton } from "../hooks/useSkeleton";
import { SkeletonBlock } from "../components/ui/Skeleton";

export default function VastuPage() {
  const [mainTab, setMainTab] = useState("planner"); // "planner" | "study"
  const { isLoading } = useSkeleton(700);

  useEffect(() => {
    if (window.AOS) window.AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <>
      <Helmet>
        <title>{SITE.seo.vastu.title}</title>
        <meta name="description" content={SITE.seo.vastu.description} />
        <link rel="canonical" href={SITE.seo.vastu.canonical} />
      </Helmet>
      <div className="vastu-page">
        {/* ── Hero Section ── */}
        <section className="vastu-hero">
          <div className="vastu-hero-bg">
            <div className="animated-shape shape-1" />
            <div className="animated-shape shape-2" />
            <div className="animated-shape shape-3" />
            <div className="animated-grid" />
          </div>
          <div className="container">
            <div className="vastu-hero-content" data-aos="fade-up">
              <span className="vastu-hero-label">वास्तु शास्त्र</span>
              <h1 className="vastu-hero-title">Vastu Shastra Guide</h1>
              <p className="vastu-hero-description">
                Ancient Indian science of architecture and design for harmonious
                living spaces. Create balance between nature's five elements and
                enhance positive energy in your home.
              </p>
            </div>
          </div>
        </section>

        {/* ── Primary Feature Tabs ── */}
        <section className="vastu-feature-tabs-section">
          <div className="container">
            <div className="vastu-feature-tabs">
              <button
                className={`vastu-feature-tab ${mainTab === "planner" ? "active" : ""}`}
                onClick={() => setMainTab("planner")}
              >
                <span className="vft-icon">🏗️</span>
                <span className="vft-label">Room Planner</span>
                <span className="vft-desc">
                  Generate a Vastu layout from your plot specs
                </span>
              </button>

              <button
                className={`vastu-feature-tab ${mainTab === "study" ? "active" : ""}`}
                onClick={() => setMainTab("study")}
              >
                <span className="vft-icon">📖</span>
                <span className="vft-label">Vastu Study</span>
                <span className="vft-desc">
                  Principles, directions, colors & remedies
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ── Room Planner Panel ── */}
        {mainTab === "planner" && (
          <section className="vastu-main-content">
            <div className="container">
              {isLoading ? (
                <div className="vastu-skeleton">
                  {/* Input card skeleton */}
                  <div className="vastu-skeleton-card">
                    <SkeletonBlock
                      width="180px"
                      height="1.1rem"
                      borderRadius="4px"
                      style={{ marginBottom: "2rem" }}
                    />
                    <div className="vastu-skeleton-inputs">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="vastu-skeleton-input-group">
                          <SkeletonBlock
                            width="120px"
                            height="0.8rem"
                            borderRadius="3px"
                            style={{ marginBottom: "0.5rem" }}
                          />
                          <SkeletonBlock
                            width="100%"
                            height="46px"
                            borderRadius="8px"
                          />
                        </div>
                      ))}
                    </div>
                    <SkeletonBlock
                      width="160px"
                      height="46px"
                      borderRadius="30px"
                      style={{ margin: "2rem auto 0", display: "block" }}
                    />
                  </div>
                  {/* Layout preview skeleton */}
                  <div className="vastu-skeleton-layout">
                    <SkeletonBlock
                      width="100%"
                      height="360px"
                      borderRadius="12px"
                    />
                  </div>
                </div>
              ) : (
                <VastuRoomPlanner />
              )}
            </div>
          </section>
        )}

        {/* ── Vastu Study Panel ── */}
        {mainTab === "study" &&
          (isLoading ? (
            <section className="vastu-main-content">
              <div className="container">
                <div className="vastu-skeleton-study">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="vastu-skeleton-study-card">
                      <SkeletonBlock
                        width="48px"
                        height="48px"
                        borderRadius="50%"
                        style={{ marginBottom: "1rem" }}
                      />
                      <SkeletonBlock
                        width="60%"
                        height="1rem"
                        borderRadius="4px"
                        style={{ marginBottom: "0.75rem" }}
                      />
                      <SkeletonBlock
                        width="100%"
                        height="0.8rem"
                        borderRadius="3px"
                        style={{ marginBottom: "0.4rem" }}
                      />
                      <SkeletonBlock
                        width="85%"
                        height="0.8rem"
                        borderRadius="3px"
                        style={{ marginBottom: "0.4rem" }}
                      />
                      <SkeletonBlock
                        width="90%"
                        height="0.8rem"
                        borderRadius="3px"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <VastuStudy />
          ))}
      </div>
    </>
  );
}
