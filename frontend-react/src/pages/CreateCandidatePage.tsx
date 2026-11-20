import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";
import { translateSummary, translateRole, translateLanguageName, translateLevelString } from "../utils/translateSummary";

type AiResult = {
  skills?: string[];
  summary?: string;
  soft_skills?: string[];
  languages?: string[];
  experience_level?: string;
  years_of_experience_estimate?: number;
  recommended_roles?: string[];
};

type Candidate = {
  id: number;
  full_name: string;
  email?: string;
  phone?: string;
  summary?: string;
  cv_path?: string;
};

type ValidationErrors = Record<string, string[]>;

export default function CreateCandidatePage() {
  const { t, locale } = useLanguage();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "+216",
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phone") {
      let cleaned = value.replace(/[^\d+]/g, "");

      if (!cleaned.startsWith("+216")) {
        cleaned = "+216";
      }

      const rest = cleaned.replace("+216", "").replace(/\D/g, "").slice(0, 8);

      setForm((prev) => ({
        ...prev,
        phone: `+216${rest}`,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const resetForm = () => {
    setForm({
      full_name: "",
      email: "",
      phone: "+216",
    });
    setFile(null);
    setValidationErrors({});
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setValidationErrors({});

      if (!file) {
        setError(locale === "fr" ? "Veuillez sélectionner un fichier CV." : "Please select a resume file.");
        return;
      }

      const formData = new FormData();
      formData.append("full_name", form.full_name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("cv", file);

      const response = await api.post("/candidates", formData);

      setCandidate(response.data.candidate);
      setAiResult(response.data.ai_result);
      resetForm();
    } catch (err: any) {
      if (err?.response?.status === 422) {
        setValidationErrors(err.response.data.errors || {});
        setError(err.response.data.message || (locale === "fr" ? "Erreur de validation." : "Validation error."));
      } else {
        setError(
          err?.response?.data?.message ||
            (locale === "fr" ? "Une erreur est survenue lors de la création du candidat." : "An error occurred while creating candidate.")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (field: string) => validationErrors[field]?.[0];

  return (
    <div className="page-shell">
      <div className="app-layout">
        <section className="hero-panel">
          <span className="hero-badge">Recruitment AI Assistant</span>

          <h2 className="hero-title">{t("create_candidate.title")}</h2>

          <p className="hero-description">
            {t("create_candidate.subtitle")}
          </p>

          <div className="hero-features">
            <div className="feature-card">{locale === "fr" ? "Analyse rapide du CV" : "Instant resume parsing"}</div>
            <div className="feature-card">
              {locale === "fr" ? "Extraction automatique des compétences" : "Automated skill extraction"}
            </div>
            <div className="feature-card">{locale === "fr" ? "Scoring XAI déterministe" : "Deterministic XAI scoring"}</div>
          </div>
        </section>

        <section className="form-card">
          <div className="card-header">
            <h2>{t("create_candidate.title")}</h2>
            <p>
              {locale === "fr"
                ? "Importez un CV au format .txt, .pdf ou .docx."
                : "Upload a resume in .txt, .pdf, or .docx format."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="candidate-form">
            <div className="form-group">
              <label>{t("create_candidate.fullname")}</label>
              <input
                name="full_name"
                placeholder={locale === "fr" ? "Ex : Mohamed Amine Ben Salah" : "E.g.: Mohamed Amine Ben Salah"}
                value={form.full_name}
                onChange={handleChange}
              />
              {getFieldError("full_name") && (
                <span className="field-error">{getFieldError("full_name")}</span>
              )}
            </div>

            <div className="form-group">
              <label>{t("create_candidate.email")}</label>
              <input
                name="email"
                type="email"
                placeholder="Ex : mohamed.bensalah@gmail.com"
                value={form.email}
                onChange={handleChange}
              />
              {getFieldError("email") && (
                <span className="field-error">{getFieldError("email")}</span>
              )}
            </div>

            <div className="form-group">
              <label>{t("create_candidate.phone")}</label>
              <input
                name="phone"
                placeholder="+21612345678"
                value={form.phone}
                onChange={handleChange}
              />
              {getFieldError("phone") && (
                <span className="field-error">{getFieldError("phone")}</span>
              )}
            </div>

            <div className="form-group">
              <label>{t("create_candidate.cv_file")}</label>
              <div className="file-input-wrapper">
                <input
                  id="cv-file-upload-input"
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden-file-input"
                />
                <label htmlFor="cv-file-upload-input" className="file-browse-btn">
                  {locale === "fr" ? "Choisir un fichier" : "Choose file"}
                </label>
                <span className="file-status-label">
                  {file ? file.name : (locale === "fr" ? "Aucun fichier choisi" : "No file chosen")}
                </span>
              </div>
              {getFieldError("cv") && (
                <span className="field-error">{getFieldError("cv")}</span>
              )}
            </div>

            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? (locale === "fr" ? "Création en cours..." : "Processing...") : t("create_candidate.submit")}
            </button>
          </form>

          {error && <div className="alert alert-error">{error}</div>}

          {candidate && (
            <div className="result-card">
              <h3>{locale === "fr" ? "Candidat créé" : "Candidate created"}</h3>

              <div className="result-grid">
                <div>
                  <span className="result-label">ID</span>
                  <p>#{candidate.id}</p>
                </div>
                <div>
                  <span className="result-label">{t("create_candidate.fullname")}</span>
                  <p>{candidate.full_name}</p>
                </div>
                <div>
                  <span className="result-label">{t("create_candidate.email")}</span>
                  <p>{candidate.email || "-"}</p>
                </div>
                <div>
                  <span className="result-label">{t("create_candidate.phone")}</span>
                  <p>{candidate.phone || "-"}</p>
                </div>
              </div>

              <div className="result-block">
                <span className="result-label">{locale === "fr" ? "Résumé enregistré" : "Saved summary"}</span>
                <p>{translateSummary(candidate.summary, locale) || "-"}</p>
              </div>
            </div>
          )}

          {aiResult && (
            <div className="result-card">
              <h3>{locale === "fr" ? "Analyse IA" : "AI Analysis"}</h3>

              <div className="result-block">
                <span className="result-label">{t("create_candidate.summary")}</span>
                <p>{translateSummary(aiResult.summary, locale) || "-"}</p>
              </div>

              <div className="result-block">
                <span className="result-label">{t("create_candidate.extracted_skills")}</span>
                {aiResult.skills && aiResult.skills.length > 0 ? (
                  <div className="skills-list">
                    {aiResult.skills.map((skill) => (
                      <span key={skill} className="skill-chip">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>{locale === "fr" ? "Aucune compétence détectée." : "No skills detected."}</p>
                )}
              </div>

              {aiResult.soft_skills && aiResult.soft_skills.length > 0 && (
                <div className="result-block">
                  <span className="result-label">{t("create_candidate.soft_skills")}</span>
                  <div className="skills-list">
                    {aiResult.soft_skills.map((skill) => (
                      <span key={skill} className="skill-chip">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {aiResult.languages && aiResult.languages.length > 0 && (
                <div className="result-block">
                  <span className="result-label">{t("create_candidate.languages")}</span>
                  <div className="skills-list">
                    {aiResult.languages.map((language) => (
                      <span key={translateLanguageName(language, locale)} className="skill-chip">
                        {translateLanguageName(language, locale)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="result-block">
                <span className="result-label">{t("create_candidate.estimated_level")}</span>
                <p>
                  {translateLevelString(aiResult.experience_level || "-", locale)}
                  {typeof aiResult.years_of_experience_estimate === "number"
                    ? ` (${aiResult.years_of_experience_estimate} ${t("candidates.years_exp")})`
                    : ""}
                </p>
              </div>

              {aiResult.recommended_roles &&
                aiResult.recommended_roles.length > 0 && (
                  <div className="result-block">
                    <span className="result-label">{t("create_candidate.recommended_roles")}</span>
                    <div className="skills-list">
                      {aiResult.recommended_roles.map((role) => (
                        <span key={translateRole(role, locale)} className="skill-chip">
                          {translateRole(role, locale)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
