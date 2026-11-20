import { useState } from "react";
import type { FormEvent } from "react";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

type Props = {
  onAuthSuccess: (user: { id: number; name: string; email: string }) => void;
  goToRegister: () => void;
  goToLanding?: () => void;
};

export default function LoginPage({ onAuthSuccess, goToRegister, goToLanding }: Props) {
  const { t, locale } = useLanguage();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleQuickDemo = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.post("/login", {
        email: "demo@talentsync.ai",
        password: "password",
      });
      localStorage.setItem("auth_token", response.data.token);
      onAuthSuccess(response.data.user);
    } catch (err: any) {
      setError(err?.response?.data?.message || (locale === "fr" ? "Erreur de connexion démo." : "Demo login error."));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/login", form);

      localStorage.setItem("auth_token", response.data.token);
      onAuthSuccess(response.data.user);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || (locale === "fr" ? "Erreur lors de la connexion." : "Login error.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h1 style={{ margin: 0 }}>{t("auth.login_title")}</h1>
          <LanguageSwitcher />
        </div>

        <p>{t("auth.login_subtitle")}</p>

        <form onSubmit={handleSubmit} className="candidate-form">
          <div className="form-group">
            <label>{t("auth.email")}</label>
            <input
              type="email"
              placeholder={t("auth.email_placeholder")}
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <div className="form-group">
            <label>{t("auth.password")}</label>
            <input
              type="password"
              placeholder={t("auth.password_placeholder")}
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
            />
          </div>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? t("auth.logging_in") : t("common.login")}
          </button>
        </form>

        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
          <button
            type="button"
            className="secondary-button"
            onClick={handleQuickDemo}
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", fontWeight: 600 }}
          >
            {t("auth.demo_btn")}
          </button>
        </div>

        <p className="auth-switch">
          {t("auth.no_account")}{" "}
          <button type="button" className="auth-link" onClick={goToRegister}>
            {t("auth.register_link")}
          </button>
        </p>

        {goToLanding && (
          <p className="auth-switch" style={{ marginTop: "8px" }}>
            <button type="button" className="auth-link" onClick={goToLanding} style={{ fontSize: "12.5px" }}>
              {t("auth.back_home")}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
