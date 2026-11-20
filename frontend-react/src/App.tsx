import { useEffect, useState } from "react";
import api from "./api/axios";
import DashboardPage from "./pages/DashboardPage";
import CreateCandidatePage from "./pages/CreateCandidatePage";
import CandidatesPage from "./pages/CandidatesPage";
import JobsPage from "./pages/JobsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LandingPage from "./pages/LandingPage";
import { TalentSyncLogo } from "./components/Logo";
import { ShieldCheckIcon } from "./components/Icons";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { useLanguage } from "./context/LanguageContext";


type Tab = "dashboard" | "create" | "candidates" | "jobs";
type AuthMode = "landing" | "login" | "register";

type User = {
  id: number;
  name: string;
  email: string;
};

function App() {
  const { t, locale } = useLanguage();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [authMode, setAuthMode] = useState<AuthMode>("landing");
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [anonymousMode, setAnonymousMode] = useState(false);


  useEffect(() => {
    api.defaults.headers.common["X-Anonymous-Mode"] = anonymousMode ? "1" : "0";
  }, [anonymousMode]);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        const response = await api.get("/me");
        setUser(response.data);
      } catch {
        localStorage.removeItem("auth_token");
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkUser();
  }, []);

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setTab("dashboard");
  };

  const handleDemoLogin = async () => {
    try {
      const res = await api.post("/login", {
        email: "demo@talentsync.ai",
        password: "password",
      });
      localStorage.setItem("auth_token", res.data.token);
      setUser(res.data.user);
      setTab("dashboard");
    } catch {
      setAuthMode("login");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch {
    } finally {
      localStorage.removeItem("auth_token");
      setUser(null);
      setAuthMode("landing");
      setTab("dashboard");
    }
  };

  if (checkingAuth) {
    return <div className="loading-screen">{t("common.loading")}</div>;
  }

  if (!user) {
    if (authMode === "landing") {
      return (
        <LandingPage
          onStartDemo={handleDemoLogin}
          goToLogin={() => setAuthMode("login")}
          goToRegister={() => setAuthMode("register")}
        />
      );
    }

    if (authMode === "login") {
      return (
        <LoginPage
          onAuthSuccess={handleAuthSuccess}
          goToRegister={() => setAuthMode("register")}
          goToLanding={() => setAuthMode("landing")}
        />
      );
    }

    return (
      <RegisterPage
        onAuthSuccess={handleAuthSuccess}
        goToLogin={() => setAuthMode("login")}
        goToLanding={() => setAuthMode("landing")}
      />
    );
  }

  return (
    <div className="app-root">
      <header className="topbar">
        <div className="topbar-brand">
          <TalentSyncLogo size={36} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1>{t("common.brand_title")}</h1>
              <span className="brand-badge">{t("common.brand_badge")}</span>
            </div>
            <p className="topbar-slogan">
              {t("common.slogan")} &bull; {t("common.welcome")}, {locale === "en" && user.name === "Recruteur TalentSync" ? "TalentSync Recruiter" : user.name}
            </p>
          </div>
        </div>

        <div className="topbar-right">
          <LanguageSwitcher />

          <button
            type="button"
            className={`anti-bias-toggle ${anonymousMode ? "active" : ""}`}
            onClick={() => setAnonymousMode(!anonymousMode)}
            title={t("common.anti_bias_tooltip")}
          >
            <ShieldCheckIcon width="16" height="16" />
            <span>{anonymousMode ? t("common.anti_bias_active") : t("common.anti_bias_mode")}</span>
          </button>

          <nav className="top-nav">
            <button
              type="button"
              className={tab === "dashboard" ? "nav-tab nav-tab-active" : "nav-tab"}
              onClick={() => setTab("dashboard")}
            >
              {t("common.tab_dashboard")}
            </button>

            <button
              type="button"
              className={tab === "create" ? "nav-tab nav-tab-active" : "nav-tab"}
              onClick={() => setTab("create")}
            >
              {t("common.tab_create")}
            </button>

            <button
              type="button"
              className={
                tab === "candidates" ? "nav-tab nav-tab-active" : "nav-tab"
              }
              onClick={() => setTab("candidates")}
            >
              {t("common.tab_candidates")}
            </button>

            <button
              type="button"
              className={tab === "jobs" ? "nav-tab nav-tab-active" : "nav-tab"}
              onClick={() => setTab("jobs")}
            >
              {t("common.tab_jobs")}
            </button>
          </nav>

          <button type="button" className="logout-button" onClick={handleLogout}>
            {t("common.logout")}
          </button>
        </div>
      </header>

      <main>
        {tab === "dashboard" && (
          <DashboardPage
            goToTab={(targetTab) => setTab(targetTab)}
            anonymousMode={anonymousMode}
          />
        )}
        {tab === "create" && <CreateCandidatePage />}
        {tab === "candidates" && <CandidatesPage anonymousMode={anonymousMode} />}
        {tab === "jobs" && <JobsPage anonymousMode={anonymousMode} />}
      </main>
    </div>
  );
}

export default App;