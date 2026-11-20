import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  UsersIcon,
  BriefcaseIcon,
  TargetIcon,
  SparklesIcon,
  PlusIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "../components/Icons";
import { TechStackBadges } from "../components/TechStackBadges";
import { useLanguage } from "../context/LanguageContext";

type DashboardStats = {
  total_candidates: number;
  total_jobs: number;
  open_jobs: number;
  candidates_by_status: {
    nouveau: number;
    en_revue: number;
    entretien: number;
    retenu: number;
    rejete: number;
  };
  avg_score: number;
  top_score: number;
  total_evaluations: number;
  recent_candidates: Array<{
    id: number;
    full_name: string;
    email?: string;
    status?: string;
    created_at: string;
  }>;
  recent_jobs: Array<{
    id: number;
    title: string;
    status: string;
    created_at: string;
  }>;
};

interface DashboardPageProps {
  goToTab: (tab: "create" | "candidates" | "jobs") => void;
  anonymousMode?: boolean;
}

const statusClasses: Record<string, string> = {
  nouveau: "status-pill-nouveau",
  en_revue: "status-pill-revue",
  entretien: "status-pill-entretien",
  retenu: "status-pill-retenu",
  rejete: "status-pill-rejete",
};

export default function DashboardPage({ goToTab, anonymousMode = false }: DashboardPageProps) {
  const { t, locale } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getStatusLabel = (key: string): string => {
    return t(`status.${key}`, key);
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get<DashboardStats>("/dashboard/stats");
      setStats(response.data);
    } catch {
      setError(t("dashboard.error_loading"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="list-page">
          <div className="entity-card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ color: "var(--text-muted)" }}>{t("dashboard.loading_data")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="page-shell">
        <div className="list-page">
          <div className="entity-card" style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ color: "var(--danger)", marginBottom: "16px" }}>{error || t("common.error_occurred")}</p>
            <button type="button" className="secondary-button" onClick={fetchStats}>
              {t("common.retry")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="list-page dashboard-layout">
        <div className="list-header" style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--primary)",
                  display: "inline-block",
                  marginBottom: "4px",
                }}
              >
                {t("dashboard.platform_tag")}
              </span>
              <h1>{t("dashboard.title")}</h1>
              <p style={{ fontSize: "16px", color: "var(--text-secondary)", marginTop: "4px" }}>
                {t("dashboard.hero_quote")}
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-pill)",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <CheckCircleIcon width="16" height="16" style={{ color: "var(--success)" }} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                {t("dashboard.ai_engine_active")}
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-stats-grid">
          <div
            className="dashboard-stat-card"
            onClick={() => goToTab("candidates")}
            style={{ cursor: "pointer" }}
            title={t("dashboard.manage_candidates")}
          >
            <div className="stat-icon-box" style={{ background: "rgba(79, 70, 229, 0.12)", color: "var(--primary)" }}>
              <UsersIcon width="24" height="24" />
            </div>
            <div className="stat-info">
              <span className="stat-label">{t("dashboard.total_cv_received")}</span>
              <span className="stat-value">{stats.total_candidates}</span>
            </div>
          </div>

          <div
            className="dashboard-stat-card"
            onClick={() => goToTab("jobs")}
            style={{ cursor: "pointer" }}
            title={t("dashboard.active_jobs")}
          >
            <div className="stat-icon-box" style={{ background: "rgba(6, 182, 212, 0.14)", color: "#0891b2" }}>
              <BriefcaseIcon width="24" height="24" />
            </div>
            <div className="stat-info">
              <span className="stat-label">{t("dashboard.active_jobs")}</span>
              <span className="stat-value">
                {stats.open_jobs} <small>/ {stats.total_jobs}</small>
              </span>
            </div>
          </div>

          <div
            className="dashboard-stat-card"
            onClick={() => goToTab("candidates")}
            style={{ cursor: "pointer" }}
            title={t("dashboard.retained_candidates")}
          >
            <div className="stat-icon-box" style={{ background: "rgba(16, 185, 129, 0.12)", color: "var(--success)" }}>
              <TargetIcon width="24" height="24" />
            </div>
            <div className="stat-info">
              <span className="stat-label">{t("dashboard.retained_candidates")}</span>
              <span className="stat-value">
                {stats.candidates_by_status?.retenu || 0}{" "}
                <small style={{ fontSize: "12px", color: "var(--success)", fontWeight: 600 }}>
                  ({stats.total_candidates ? Math.round(((stats.candidates_by_status?.retenu || 0) / stats.total_candidates) * 100) : 0}%)
                </small>
              </span>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon-box" style={{ background: "rgba(124, 58, 237, 0.12)", color: "var(--secondary)" }}>
              <SparklesIcon width="24" height="24" />
            </div>
            <div className="stat-info">
              <span className="stat-label">{t("dashboard.top_match")}</span>
              <span className="stat-value">
                {stats.top_score || 0}% <small style={{ fontSize: "12px", color: "var(--text-muted)" }}>{t("dashboard.avg_match")} {stats.avg_score || 0}%</small>
              </span>
            </div>
          </div>
        </div>

        <div className="entity-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <div>
              <h2>{t("dashboard.pipeline_title")}</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
                {t("dashboard.pipeline_subtitle")}
              </p>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={() => goToTab("candidates")}
            >
              {t("dashboard.manage_candidates")} <ArrowRightIcon width="14" height="14" />
            </button>
          </div>

          <div className="pipeline-grid">
            {Object.entries(stats.candidates_by_status).map(([key, count]) => {
              const label = getStatusLabel(key);
              const pillClass = statusClasses[key] || "status-pill-nouveau";
              const pct = stats.total_candidates > 0 ? Math.round((count / stats.total_candidates) * 100) : 0;
              return (
                <div key={key} className="pipeline-row">
                  <div className="pipeline-info">
                    <span className={`status-pill ${pillClass}`}>{label}</span>
                    <span className="pipeline-count">
                      <strong>{count}</strong> ({pct}%)
                    </span>
                  </div>
                  <div className="pipeline-track">
                    <div className={`pipeline-fill fill-${key}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="dashboard-cta-banner">
          <div className="dashboard-cta-text">
            <h4>{t("dashboard.quick_actions")}</h4>
            <p>{t("dashboard.pipeline_subtitle")}</p>
          </div>
          <div className="dashboard-cta-actions">
            <button
              type="button"
              className="primary-button compact-button"
              onClick={() => goToTab("create")}
            >
              <PlusIcon width="16" height="16" /> {t("common.tab_create")}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => goToTab("jobs")}
            >
              <PlusIcon width="16" height="16" /> {t("jobs.create_tab")}
            </button>
          </div>
        </div>

        <div className="two-columns">
          <div className="entity-card">
            <div className="card-header">
              <h2>{t("dashboard.recent_candidates")}</h2>
              <p>{t("candidates.subtitle")}</p>
            </div>

            {stats.recent_candidates.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "14px", textAlign: "center", padding: "24px 0" }}>
                {t("dashboard.no_candidates_yet")}
              </p>
            ) : (
              <div className="dashboard-mini-list">
                {stats.recent_candidates.map((c) => {
                  const sLabel = getStatusLabel(c.status || "nouveau");
                  const sClass = statusClasses[c.status || "nouveau"] || statusClasses.nouveau;
                  const displayName = anonymousMode ? (locale === "fr" ? `Candidat #C${c.id}` : `Candidate #C${c.id}`) : c.full_name;
                  const displayEmail = anonymousMode ? "•••••••@anonyme.fr" : (c.email || "-");

                  return (
                    <div key={c.id} className="dashboard-mini-item">
                      <div>
                        <div className="mini-title">{displayName}</div>
                        <div className="mini-sub">{displayEmail}</div>
                      </div>
                      <span className={`status-pill ${sClass}`}>{sLabel}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="entity-card">
            <div className="card-header">
              <h2>{t("dashboard.recent_jobs")}</h2>
              <p>{t("jobs.subtitle")}</p>
            </div>

            {stats.recent_jobs.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "14px", textAlign: "center", padding: "24px 0" }}>
                {t("dashboard.no_jobs_yet")}
              </p>
            ) : (
              <div className="dashboard-mini-list">
                {stats.recent_jobs.map((j) => (
                  <div key={j.id} className="dashboard-mini-item">
                    <div>
                      <div className="mini-title">{j.title}</div>
                      <div className="mini-sub">
                        {new Date(j.created_at).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US")}
                      </div>
                    </div>
                    <span
                      className={`status-pill ${
                        j.status === "open" ? "status-pill-retenu" : "status-pill-rejete"
                      }`}
                    >
                      {j.status === "open" ? t("common.open") : t("common.closed")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <TechStackBadges />
      </div>
    </div>
  );
}
