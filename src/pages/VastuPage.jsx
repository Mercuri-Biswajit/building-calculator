import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { SITE } from "../config/constants";

import VastuRoomPlanner from "../components/vastu/VastuRoomPlanner";
import VastuStudy from "../components/vastu/VastuStudy";
import { VastuHeroSection } from "../components/hero/VastuHeroSection";

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

        {/* ── Hero Section (same as Calculator page) ── */}
        <VastuHeroSection mainTab={mainTab} onTabChange={setMainTab} />

        {/* ── Room Planner Panel ── */}
        {mainTab === "planner" && (
          <section className="vastu-main-content">
            <div className="container">
              {isLoading ? (
                <div className="vastu-skeleton">
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