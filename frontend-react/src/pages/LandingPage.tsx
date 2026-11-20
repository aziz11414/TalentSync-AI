import { TalentSyncLogo } from "../components/Logo";
import {
  BriefcaseIcon,
  TargetIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ScaleIcon,
  ArrowRightIcon,
} from "../components/Icons";
import { TechStackBadges } from "../components/TechStackBadges";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";

interface LandingPageProps {
  onStartDemo: () => void;
  goToLogin: () => void;
  goToRegister: () => void;
}

export default function LandingPage({
  onStartDemo,
  goToLogin,
  goToRegister,
}: LandingPageProps) {
  const { t } = useLanguage();

  return (
    <div className="landing-root">
      <header className="landing-nav">
        <div className="landing-nav-container">
          <div className="landing-brand">
            <TalentSyncLogo size={36} />
            <div>
              <span className="landing-brand-title">{t("common.brand_title")}</span>
              <span className="landing-brand-badge">{t("common.brand_badge")}</span>
            </div>
          </div>

          <nav className="landing-links">
            <a href="#piliers">{t("landing.features")}</a>
            <a href="#fonctionnement">{t("landing.how_it_works")}</a>
            <a href="#chiffres">{t("landing.metrics")}</a>
            <a href="#stack">{t("landing.stack")}</a>
          </nav>

          <div className="landing-actions">
            <LanguageSwitcher />
            <button type="button" className="landing-btn-secondary" onClick={goToLogin}>
              {t("landing.login")}
            </button>
            <button type="button" className="landing-btn-primary" onClick={onStartDemo}>
              {t("landing.demo")}
            </button>
          </div>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-container">
          <div className="landing-badge-pill">
            <SparklesIcon width="14" height="14" />
            <span>{t("landing.hero_badge")}</span>
          </div>

          <h1 className="landing-title">
            {t("landing.hero_title_prefix")}<span className="text-gradient">{t("landing.hero_title_highlight")}</span>
          </h1>

          <p className="landing-subtitle">
            {t("landing.hero_subtitle")}
          </p>

          <div className="landing-hero-cta">
            <button type="button" className="landing-btn-large-primary" onClick={onStartDemo}>
              {t("landing.hero_cta_demo")} <ArrowRightIcon width="16" height="16" />
            </button>
            <button type="button" className="landing-btn-large-secondary" onClick={goToRegister}>
              {t("landing.hero_cta_register")}
            </button>
          </div>

          <div className="landing-mockup-card">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <div className="mockup-title">{t("landing.mockup_title")}</div>
              <div className="mockup-tag">{t("landing.mockup_tag")}</div>
            </div>

            <div className="mockup-body">
              <div className="mockup-stats-row">
                <div className="mockup-stat">
                  <span className="mockup-stat-val">12</span>
                  <span className="mockup-stat-lbl">{t("landing.mockup_cv")}</span>
                </div>
                <div className="mockup-stat">
                  <span className="mockup-stat-val">3</span>
                  <span className="mockup-stat-lbl">{t("landing.mockup_jobs")}</span>
                </div>
                <div className="mockup-stat">
                  <span className="mockup-stat-val text-emerald">89.5%</span>
                  <span className="mockup-stat-lbl">{t("landing.mockup_top_match")}</span>
                </div>
                <div className="mockup-stat">
                  <span className="mockup-stat-val text-primary">~18h</span>
                  <span className="mockup-stat-lbl">{t("landing.mockup_saved")}</span>
                </div>
              </div>

              <div className="mockup-preview-item">
                <div className="mockup-candidate-info">
                  <span className="mockup-avatar">AM</span>
                  <div>
                    <strong>Amira Mejri &bull; Senior Lead Full Stack</strong>
                    <p>Compétences : React, Laravel, TypeScript, REST API, Docker</p>
                  </div>
                </div>
                <div className="mockup-score-badge">89.5% Top Match</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="chiffres" className="landing-stats-section">
        <div className="landing-container">
          <div className="landing-metrics-grid">
            <div className="metric-box">
              <span className="metric-number">{t("landing.metric_1_num")}</span>
              <span className="metric-desc">{t("landing.metric_1_desc")}</span>
            </div>
            <div className="metric-box">
              <span className="metric-number">{t("landing.metric_2_num")}</span>
              <span className="metric-desc">{t("landing.metric_2_desc")}</span>
            </div>
            <div className="metric-box">
              <span className="metric-number">{t("landing.metric_3_num")}</span>
              <span className="metric-desc">{t("landing.metric_3_desc")}</span>
            </div>
            <div className="metric-box">
              <span className="metric-number">{t("landing.metric_4_num")}</span>
              <span className="metric-desc">{t("landing.metric_4_desc")}</span>
            </div>
          </div>
        </div>
      </section>

      <section id="piliers" className="landing-features-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="section-pill">{t("landing.pillars_badge")}</span>
            <h2>{t("landing.pillars_title")}</h2>
            <p>{t("landing.pillars_subtitle")}</p>
          </div>

          <div className="pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon bg-indigo">
                <SparklesIcon width="24" height="24" />
              </div>
              <h3>{t("landing.p1_title")}</h3>
              <p>{t("landing.p1_desc")}</p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon bg-cyan">
                <TargetIcon width="24" height="24" />
              </div>
              <h3>{t("landing.p2_title")}</h3>
              <p>{t("landing.p2_desc")}</p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon bg-emerald">
                <ShieldCheckIcon width="24" height="24" />
              </div>
              <h3>{t("landing.p3_title")}</h3>
              <p>{t("landing.p3_desc")}</p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon bg-violet">
                <ScaleIcon width="24" height="24" />
              </div>
              <h3>{t("landing.p4_title")}</h3>
              <p>{t("landing.p4_desc")}</p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon bg-amber">
                <BriefcaseIcon width="24" height="24" />
              </div>
              <h3>{t("landing.p5_title")}</h3>
              <p>{t("landing.p5_desc")}</p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon bg-rose">
                <CheckCircleIcon width="24" height="24" />
              </div>
              <h3>{t("landing.p6_title")}</h3>
              <p>{t("landing.p6_desc")}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="fonctionnement" className="landing-workflow-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="section-pill">{t("landing.workflow_badge")}</span>
            <h2>{t("landing.workflow_title")}</h2>
            <p>{t("landing.workflow_subtitle")}</p>
          </div>

          <div className="workflow-steps-grid">
            <div className="workflow-step">
              <div className="step-number">01</div>
              <h4>{t("landing.w1_title")}</h4>
              <p>{t("landing.w1_desc")}</p>
            </div>

            <div className="workflow-step">
              <div className="step-number">02</div>
              <h4>{t("landing.w2_title")}</h4>
              <p>{t("landing.w2_desc")}</p>
            </div>

            <div className="workflow-step">
              <div className="step-number">03</div>
              <h4>{t("landing.w3_title")}</h4>
              <p>{t("landing.w3_desc")}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="stack" className="landing-tech-section">
        <div className="landing-container">
          <TechStackBadges />
        </div>
      </section>

      <section className="landing-cta-banner">
        <div className="landing-container">
          <div className="cta-card">
            <h2>{t("landing.ready_title")}</h2>
            <p>{t("landing.ready_desc")}</p>
            <button type="button" className="landing-btn-large-primary" onClick={onStartDemo}>
              {t("landing.ready_btn")}
            </button>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container footer-content">
          <div className="footer-brand">
            <TalentSyncLogo size={28} />
            <span>{t("landing.footer_copy")}</span>
          </div>
          <p className="footer-credits">
            {t("landing.footer_credits")}
          </p>
        </div>
      </footer>
    </div>
  );
}
