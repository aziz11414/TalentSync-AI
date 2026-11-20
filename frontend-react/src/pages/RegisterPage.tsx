import { useState } from "react";
import type { FormEvent } from "react";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

type Props = {
  onAuthSuccess: (user: { id: number; name: string; email: string }) => void;
  goToLogin: () => void;
  goToLanding?: () => void;
};

export default function RegisterPage({ onAuthSuccess, goToLogin, goToLanding }: Props) {
  const { t, locale } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/register", form);

      localStorage.setItem("auth_token", response.data.token);
      onAuthSuccess(response.data.user);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || (locale === "fr" ? "Erreur lors de l'inscription." : "Registration error.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h1 style={{ margin: 0 }}>{t("auth.register_title")}</h1>
          <LanguageSwitcher />
        </div>

        <p>{t("auth.register_subtitle")}</p>

        <form onSubmit={handleSubmit} className="candidate-form">
          <div className="form-group">
            <label>{t("auth.name")}</label>
            <input
              type="text"
              placeholder={t("auth.name_placeholder")}
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

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

          <div className="form-group">
            <label>{t("auth.password_confirm")}</label>
            <input
              type="password"
              placeholder={t("auth.password_confirm_placeholder")}
              value={form.password_confirmation}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  password_confirmation: e.target.value,
                }))
              }
            />
          </div>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? t("auth.registering") : t("auth.register_title")}
          </button>
        </form>

        {error && <div className="alert alert-error">{error}</div>}

        <p className="auth-switch">
          {t("auth.has_account")}{" "}
          <button type="button" className="auth-link" onClick={goToLogin}>
            {t("auth.login_link")}
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
