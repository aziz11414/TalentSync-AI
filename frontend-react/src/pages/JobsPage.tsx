import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import api from "../api/axios";
import { DownloadIcon, SparklesIcon, CheckCircleIcon, TargetIcon } from "../components/Icons";
import { ScoreGauge } from "../components/ScoreGauge";
import { useLanguage } from "../context/LanguageContext";


type Job = {
  id: number;
  title: string;
  description: string;
  required_skills?: string[];
  status?: string;
};

type RankedCandidate = {
  candidate: {
    id: number;
    full_name: string;
    email?: string;
    phone?: string;
    summary?: string;
  };
  score: number;
  score_breakdown?: {
    skill_points: number;
    experience_points: number;
    keyword_bonus: number;
    missing_penalty: number;
  };
  matched_skills: string[];
  missing_skills: string[];
  notes?: string;
  experience_level?: string;
  years_of_experience_estimate?: number;
};

interface InterviewQuestionItem {
  type: string;
  difficulty: number;
  question: string;
  evaluates: string;
  good_answer: string;
}

interface JobsPageProps {
  anonymousMode?: boolean;
}

const initialForm = {
  title: "",
  description: "",
  required_skills: "",
  status: "open",
};

export default function JobsPage({ anonymousMode = false }: JobsPageProps) {
  const { t, locale } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);

  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [ranking, setRanking] = useState<RankedCandidate[]>([]);
  const [rankingSearch, setRankingSearch] = useState("");
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const [form, setForm] = useState(initialForm);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<number | null>(null);

  const [questionsCandidateId, setQuestionsCandidateId] = useState<number | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsList, setQuestionsList] = useState<InterviewQuestionItem[]>([]);
  const [questionsError, setQuestionsError] = useState("");
  const [questionsFilter, setQuestionsFilter] = useState<string>("all");
  const [copiedQuestionIdx, setCopiedQuestionIdx] = useState<number | null>(null);


  const translateNotes = (note?: string) => {
    if (!note) return "";
    if (locale === "en") {
      if (note.includes("Excellent profil") || note.includes("Excellent match")) return "Excellent match for this position.";
      if (note.includes("Très bon profil") || note.includes("TrÃ¨s bon profil") || note.includes("Very good")) return "Very good match with minor gaps.";
      if (note.includes("compatible")) return "Generally compatible profile, but adjustments may be needed.";
      if (note.includes("peu aligné") || note.includes("peu alignÃ©") || note.includes("Low alignment")) return "Profile has low alignment with job requirements.";
    } else {
      if (note.includes("Excellent match") || note.includes("Excellent profil")) return "Excellent profil pour ce poste.";
      if (note.includes("Very good") || note.includes("Très bon profil") || note.includes("TrÃ¨s bon profil")) return "Très bon profil avec quelques écarts mineurs.";
      if (note.includes("compatible")) return "Profil globalement compatible, mais des ajustements peuvent être nécessaires.";
      if (note.includes("Low alignment") || note.includes("peu aligné") || note.includes("peu alignÃ©")) return "Profil peu aligné avec les exigences du poste.";
    }
    return note;
  };

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) || null,
    [jobs, selectedJobId]
  );

  const filteredRanking = useMemo(() => {
    if (!rankingSearch.trim()) return ranking;
    const term = rankingSearch.toLowerCase();
    return ranking.filter(
      (item) =>
        item.candidate.full_name.toLowerCase().includes(term) ||
        (item.candidate.email && item.candidate.email.toLowerCase().includes(term)) ||
        item.matched_skills.some((s) => s.toLowerCase().includes(term))
    );
  }, [ranking, rankingSearch]);

  const handleExportRankingCsv = () => {
    if (!selectedJob || ranking.length === 0) return;
    const headers = [
      "Rang",
      "Nom",
      "Email",
      "Score (%)",
      "Niveau",
      "Annees Exp.",
      "Competences Matchees",
      "Competences Manquantes",
      "Remarques",
    ];
    const rows = ranking.map((item, idx) => [
      idx + 1,
      `"${(anonymousMode ? (locale === "fr" ? `Candidat #C${item.candidate.id}` : `Candidate #C${item.candidate.id}`) : item.candidate.full_name).replace(/"/g, '""')}"`,
      `"${(anonymousMode ? "anonyme@recrutement.fr" : (item.candidate.email || "")).replace(/"/g, '""')}"`,
      item.score,
      `"${item.experience_level || ""}"`,
      item.years_of_experience_estimate ?? 0,
      `"${item.matched_skills.join(", ")}"`,
      `"${item.missing_skills.join(", ")}"`,
      `"${(item.notes || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `classement_${selectedJob.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      const response = await api.get("/jobs");
      setJobs(response.data);
      if (response.data.length > 0 && !selectedJobId) {
        setSelectedJobId(response.data[0].id);
        fetchRanking(response.data[0].id);
      }
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message || "Impossible de charger les offres."
      );
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchRanking = async (jobId: number) => {
    setLoadingRanking(true);
    setQuestionsCandidateId(null);
    try {
      const response = await api.get(`/jobs/${jobId}/ranking`);
      setRanking(response.data.ranking || []);
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message || "Impossible de charger le ranking."
      );
    } finally {
      setLoadingRanking(false);
    }
  };

  const handleGenerateQuestions = async (item: RankedCandidate) => {
    if (questionsCandidateId === item.candidate.id) {
      setQuestionsCandidateId(null);
      return;
    }

    if (!selectedJob) return;

    setQuestionsCandidateId(item.candidate.id);
    setLoadingQuestions(true);
    setQuestionsList([]);
    setQuestionsError("");
    setQuestionsFilter("all");

    try {
      const res = await api.post("/ai/interview-questions", {
        job_title: selectedJob.title,
        matched_skills: item.matched_skills,
        missing_skills: item.missing_skills,
        experience_level: item.experience_level || "Intermédiaire",
        years_of_experience: item.years_of_experience_estimate ?? null,
        candidate_excerpt: item.candidate.summary || undefined,
        candidate_name: item.candidate.full_name || undefined,
      });

      const rawQuestions = res.data.questions || [];
      const normalized: InterviewQuestionItem[] = rawQuestions.map((q: any) => {
        if (typeof q === "string") {
          return {
            type: "technique",
            difficulty: 3,
            question: q,
            evaluates: "Évaluation générale des compétences techniques",
            good_answer: "Réponse structurée, concrète et illustrée par des réalisations.",
          };
        }
        return {
          type: q.type || "technique",
          difficulty: Number(q.difficulty) || 3,
          question: q.question || "",
          evaluates: q.evaluates || "Évaluation des compétences",
          good_answer: q.good_answer || "Réponse claire et argumentée",
        };
      });

      setQuestionsList(normalized);
    } catch {
      setQuestionsError("Erreur lors de la génération des questions d'entretien.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleCopyQuestion = (idx: number, q: InterviewQuestionItem) => {
    const text = `Question d'entretien #${idx + 1} [${q.type.toUpperCase()} | Difficulté ${q.difficulty}/5]\n\nIntitulé :\n${q.question}\n\n[Ce qu'elle évalue] :\n${q.evaluates}\n\n[Indicateurs de bonne réponse attendue] :\n${q.good_answer}`;
    navigator.clipboard.writeText(text);
    setCopiedQuestionIdx(idx);
    setTimeout(() => setCopiedQuestionIdx(null), 2200);
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingJobId(null);
  };

  const handleCreateOrUpdateJob = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const requiredSkills = form.required_skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    try {
      setSubmitting(true);
      setMessage("");

      if (editingJobId) {
        await api.put(`/jobs/${editingJobId}`, {
          title: form.title,
          description: form.description,
          required_skills: requiredSkills,
          status: form.status,
        });

        setMessage("Offre modifiée avec succès.");
      } else {
        await api.post("/jobs", {
          title: form.title,
          description: form.description,
          required_skills: requiredSkills,
          status: form.status,
        });

        setMessage("Offre créée avec succès.");
      }

      const currentSelected = selectedJobId;
      resetForm();
      await fetchJobs();

      if (currentSelected) {
        await fetchRanking(currentSelected);
      }
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ||
          "Une erreur est survenue lors de l'enregistrement de l’offre."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectJob = async (jobId: number) => {
    setSelectedJobId(jobId);
    await fetchRanking(jobId);
  };

  const handleEditJob = (job: Job) => {
    setEditingJobId(job.id);
    setForm({
      title: job.title,
      description: job.description,
      required_skills: (job.required_skills || []).join(", "),
      status: job.status || "open",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDeleteModal = (job: Job) => {
    setJobToDelete(job);
  };

  const closeDeleteModal = () => {
    setJobToDelete(null);
  };

  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      setDeletingJobId(jobToDelete.id);
      setMessage("");

      await api.delete(`/jobs/${jobToDelete.id}`);

      if (selectedJobId === jobToDelete.id) {
        setSelectedJobId(null);
        setRanking([]);
      }

      if (editingJobId === jobToDelete.id) {
        resetForm();
      }

      closeDeleteModal();
      await fetchJobs();
      setMessage("Offre supprimée avec succès.");
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ||
          "Une erreur est survenue lors de la suppression de l’offre."
      );
    } finally {
      setDeletingJobId(null);
    }
  };

  return (
    <div className="page-shell">
      <div className="list-page">
        <div className="list-header">
          <h1>{t("jobs.title")}</h1>
          <p>{t("jobs.subtitle")}</p>
        </div>

        {message && <div className="alert alert-info">{message}</div>}

        <div className="two-columns">
          <section className="entity-card">
            <h2>{editingJobId ? t("jobs.edit_tab") : t("jobs.create_tab")}</h2>

            <form onSubmit={handleCreateOrUpdateJob} className="candidate-form">
              <div className="form-group">
                <label>{t("jobs.job_title_label")} *</label>
                <input
                  value={form.title}
                  required
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder={locale === "fr" ? "Ex : Développeur Full Stack React / Laravel" : "E.g.: Full Stack Developer React / Laravel"}
                />
              </div>

              <div className="form-group">
                <label>{t("jobs.job_desc_label")} *</label>
                <textarea
                  className="modern-textarea"
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder={locale === "fr" ? "Décrivez les missions, l'équipe et les exigences techniques..." : "Describe missions, team context, and technical expectations..."}
                />
              </div>

              <div className="form-group">
                <label>{t("jobs.skills_required_label")}</label>
                <input
                  value={form.required_skills}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      required_skills: e.target.value,
                    }))
                  }
                  placeholder={locale === "fr" ? "Ex : React, Laravel, TypeScript, Docker" : "E.g.: React, Laravel, TypeScript, Docker"}
                />
              </div>

              <div className="form-group">
                <label>{t("jobs.job_status_label")}</label>
                <select
                  className="filter-select"
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <option value="open">{t("common.open")}</option>
                  <option value="closed">{t("common.closed")}</option>
                </select>
              </div>

              <div className="job-form-actions">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={submitting}
                >
                  {submitting
                    ? t("common.loading")
                    : editingJobId
                    ? t("jobs.update_btn")
                    : t("jobs.save_btn")}
                </button>

                {editingJobId && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={resetForm}
                  >
                    {t("common.cancel")}
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="entity-card">
            <h2>{t("jobs.available_jobs")} ({jobs.length})</h2>

            <div className="jobs-list">
              {loadingJobs && (
                <p className="empty-state">{t("common.loading")}</p>
              )}

              {jobs.map((job) => (
                <div
                  key={job.id}
                  className={
                    job.id === selectedJobId
                      ? "job-item job-item-selected"
                      : "job-item"
                  }
                >
                  <button
                    type="button"
                    className="job-item-clickable"
                    onClick={() => handleSelectJob(job.id)}
                    aria-label={`Sélectionner l'offre ${job.title}`}
                  >
                    <div>
                      <strong>{job.title}</strong>
                      <p className="job-meta">
                        {(job.required_skills || []).join(", ") ||
                          (locale === "fr" ? "Aucune compétence requise" : "No required skills")}
                      </p>
                    </div>
                    <span
                      className={`status-pill ${
                        job.status === "open" ? "status-pill-retenu" : "status-pill-rejete"
                      }`}
                    >
                      {job.status === "open" ? t("common.open") : t("common.closed")}
                    </span>
                  </button>

                  <div className="job-item-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleEditJob(job)}
                    >
                      {t("common.edit")}
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => openDeleteModal(job)}
                      disabled={deletingJobId === job.id}
                    >
                      {deletingJobId === job.id ? "..." : t("common.delete")}
                    </button>
                  </div>
                </div>
              ))}

              {!loadingJobs && jobs.length === 0 && (
                <p className="empty-state">{t("jobs.no_ranking")}</p>
              )}
            </div>
          </section>
        </div>


        <section className="entity-card ranking-section">
          <div className="ranking-header-row">
            <div>
              <h2>{t("jobs.title")}</h2>
              {selectedJob && (
                <p className="job-meta ranking-job-meta">
                  {t("jobs.ranking_title")} : <strong>{selectedJob.title}</strong>
                </p>
              )}
            </div>

            {selectedJob && ranking.length > 0 && (
              <div className="ranking-toolbar">
                <input
                  type="text"
                  placeholder={t("jobs.search_ranking")}
                  value={rankingSearch}
                  onChange={(e) => setRankingSearch(e.target.value)}
                  className="ranking-search-input"
                />
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleExportRankingCsv}
                >
                  <DownloadIcon width="14" height="14" /> {t("jobs.export_csv")}
                </button>
              </div>
            )}
          </div>

          {loadingRanking && (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p className="empty-state">{locale === "fr" ? "Calcul du matching IA en cours..." : "Calculating AI matching..."}</p>
            </div>
          )}

          {!loadingRanking && ranking.length === 0 && (
            <p className="empty-state">
              {t("jobs.select_job_hint")}
            </p>
          )}

          {!loadingRanking && ranking.length > 0 && (
            <div className="ranking-list">
              {filteredRanking.map((item, index) => {
                const displayName = anonymousMode
                  ? (locale === "fr" ? `Candidat #C${item.candidate.id}` : `Candidate #C${item.candidate.id}`)
                  : item.candidate.full_name;
                const displayEmail = anonymousMode
                  ? "•••••••@anonyme.fr"
                  : (item.candidate.email || "-");

                const isQuestionsOpen = questionsCandidateId === item.candidate.id;

                return (
                  <div key={item.candidate.id} className="ranking-card">
                    <div className="ranking-top">
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span className="ranking-badge">#{index + 1}</span>
                          {anonymousMode && (
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                padding: "2px 8px",
                                background: "rgba(79, 70, 229, 0.1)",
                                color: "var(--primary)",
                                borderRadius: "999px",
                              }}
                            >
                              {t("common.anti_bias_mode")}
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "4px 0" }}>
                          {displayName}
                        </h3>
                        <p className="muted-line">{displayEmail}</p>
                      </div>

                      <ScoreGauge score={item.score} size={70} strokeWidth={7} showLabel={true} />
                    </div>

                    <p className="ranking-notes" style={{ margin: "14px 0", fontStyle: "italic" }}>
                      {locale === "fr" ? `« ${translateNotes(item.notes)} »` : `"${translateNotes(item.notes)}"`}
                    </p>

                    {item.score_breakdown && (
                      <div
                        style={{
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-md)",
                          padding: "10px 14px",
                          marginBottom: "14px",
                          display: "flex",
                          gap: "14px",
                          flexWrap: "wrap",
                          fontSize: "12px",
                        }}
                      >
                        <span style={{ fontWeight: 600, color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                          <SparklesIcon width="13" height="13" style={{ color: "var(--primary)" }} /> {t("jobs.score_breakdown_title")} :
                        </span>
                        <span style={{ color: "var(--success)", fontWeight: 600 }}>
                          {t("jobs.skill_pts")} +{item.score_breakdown.skill_points} pts
                        </span>
                        <span style={{ color: "var(--primary)", fontWeight: 600 }}>
                          {t("jobs.exp_pts")} +{item.score_breakdown.experience_points} pts
                        </span>
                        {item.score_breakdown.missing_penalty > 0 && (
                          <span style={{ color: "var(--danger)", fontWeight: 600 }}>
                            {t("jobs.missing_penalty")} -{item.score_breakdown.missing_penalty} pts
                          </span>
                        )}
                      </div>
                    )}

                    <div className="chips-block">
                      <span className="result-label" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <CheckCircleIcon width="14" height="14" style={{ color: "var(--success)" }} />
                        {t("jobs.matched_skills")}
                      </span>
                      <div className="skills-list">
                        {item.matched_skills.length > 0 ? (
                          item.matched_skills.map((skill) => (
                            <span key={skill} className="skill-chip" style={{ background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0" }}>
                              ✓ {skill}
                            </span>
                          ))
                        ) : (
                          <span className="skill-chip">{locale === "fr" ? "Aucune" : "None"}</span>
                        )}
                      </div>
                    </div>

                    <div className="chips-block">
                      <span className="result-label" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ color: "var(--danger)", fontWeight: 800, fontSize: "13px" }}>✕</span>
                        {t("jobs.missing_skills")}
                      </span>
                      <div className="skills-list">
                        {item.missing_skills.length > 0 ? (
                          item.missing_skills.map((skill) => (
                            <span key={skill} className="missing-chip">
                              ✗ {skill}
                            </span>
                          ))
                        ) : (
                          <span className="skill-chip" style={{ color: "var(--success)" }}>
                            {locale === "fr" ? "Toutes les compétences sont couvertes !" : "All skills are covered!"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px", flexWrap: "wrap", gap: "10px" }}>
                      <div className="chips-block" style={{ margin: 0 }}>
                        <span className="result-label">{locale === "fr" ? "Niveau & Expérience" : "Level & Experience"}</span>
                        <p className="card-text" style={{ fontWeight: 600 }}>
                          {item.experience_level || (locale === "fr" ? "Non déterminé" : "Undetermined")}
                          {typeof item.years_of_experience_estimate === "number"
                            ? ` (${item.years_of_experience_estimate} ${t("candidates.years_exp")})`
                            : ""}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => handleGenerateQuestions(item)}
                        style={{
                          background: isQuestionsOpen ? "var(--primary)" : "var(--surface-raised)",
                          color: isQuestionsOpen ? "white" : "var(--primary)",
                          borderColor: "var(--primary)",
                        }}
                      >
                        <SparklesIcon width="14" height="14" />
                        {isQuestionsOpen ? t("jobs.hide_questions_btn") : t("jobs.prep_interview_btn")}
                      </button>
                    </div>

                    {isQuestionsOpen && (
                      <div
                        style={{
                          marginTop: "16px",
                          padding: "20px",
                          background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
                          border: "1.5px solid #c7d2fe",
                          borderRadius: "var(--radius-lg)",
                          boxShadow: "var(--shadow-sm)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <SparklesIcon width="20" height="20" style={{ color: "var(--primary)" }} />
                            <div>
                              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--primary)" }}>
                                {t("jobs.questions_title")} &mdash; {displayName}
                              </h4>
                              <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                                {item.experience_level || "Intermédiaire"} ({item.years_of_experience_estimate ?? 3} {t("candidates.years_exp")}) &bull; {t("jobs.questions_subtitle")}
                              </p>
                            </div>
                          </div>

                          {!loadingQuestions && questionsList.length > 0 && (
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                              {[
                                { id: "all", label: `${t("jobs.tab_all_q")} (${questionsList.length})` },
                                { id: "technique", label: t("jobs.tab_tech_q") },
                                { id: "scenario", label: t("jobs.tab_archi_q") },
                                { id: "soft", label: t("jobs.tab_soft_q") },
                              ].map((f) => (
                                <button
                                  key={f.id}
                                  type="button"
                                  onClick={() => setQuestionsFilter(f.id)}
                                  style={{
                                    all: "unset",
                                    padding: "4px 10px",
                                    fontSize: "11.5px",
                                    fontWeight: 600,
                                    borderRadius: "var(--radius-pill)",
                                    cursor: "pointer",
                                    background: questionsFilter === f.id ? "var(--primary)" : "white",
                                    color: questionsFilter === f.id ? "white" : "var(--text-secondary)",
                                    border: `1px solid ${questionsFilter === f.id ? "var(--primary)" : "var(--border)"}`,
                                    boxShadow: questionsFilter === f.id ? "var(--shadow-xs)" : "none",
                                    transition: "all 0.15s ease",
                                  }}
                                >
                                  {f.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {loadingQuestions && (
                          <div style={{ padding: "30px 20px", textAlign: "center", background: "white", borderRadius: "var(--radius-md)", border: "1px dashed #cbd5e1" }}>
                            <p style={{ fontSize: "14px", color: "var(--primary)", fontWeight: 600, margin: 0 }}>
                              {locale === "fr"
                                ? `Analyse des compétences (${item.matched_skills.join(", ") || "générales"}) et des lacunes (${item.missing_skills.join(", ") || "aucune"})...`
                                : `Analyzing matched skills (${item.matched_skills.join(", ") || "general"}) and missing skills (${item.missing_skills.join(", ") || "none"})...`}
                            </p>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                              {locale === "fr"
                                ? `Génération des 6 questions calibrées au niveau ${item.experience_level || "Intermédiaire"} avec grille d'évaluation RH.`
                                : `Generating 6 questions calibrated for level ${item.experience_level || "Intermediate"} with evaluation criteria.`}
                            </p>
                          </div>
                        )}

                        {questionsError && (
                          <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "var(--radius-md)" }}>
                            <p style={{ fontSize: "13.5px", color: "var(--danger)", margin: 0 }}>{questionsError}</p>
                          </div>
                        )}

                        {!loadingQuestions && questionsList.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {questionsList
                              .filter((q) => {
                                if (questionsFilter === "all") return true;
                                if (questionsFilter === "technique") return q.type === "technique" || q.type === "pratique";
                                if (questionsFilter === "scenario") return q.type === "scenario" || q.type === "architecture";
                                if (questionsFilter === "soft") return q.type === "comportemental" || q.type === "leadership";
                                return true;
                              })
                              .map((q, qIdx) => {
                                const typeMeta: Record<string, { label: string; bg: string; color: string }> = {
                                  technique: { label: locale === "fr" ? "Technique" : "Technical", bg: "rgba(79, 70, 229, 0.1)", color: "#4338ca" },
                                  pratique: { label: locale === "fr" ? "Pratique" : "Practice", bg: "rgba(6, 182, 212, 0.1)", color: "#0891b2" },
                                  architecture: { label: locale === "fr" ? "Architecture" : "Architecture", bg: "rgba(124, 58, 237, 0.1)", color: "#6d28d9" },
                                  scenario: { label: locale === "fr" ? "Mise en situation" : "Scenario", bg: "rgba(245, 158, 11, 0.12)", color: "#b45309" },
                                  comportemental: { label: locale === "fr" ? "Comportemental" : "Behavioral", bg: "rgba(16, 185, 129, 0.12)", color: "#047857" },
                                  leadership: { label: locale === "fr" ? "Leadership & Équipe" : "Leadership & Team", bg: "rgba(244, 63, 94, 0.12)", color: "#be123c" },
                                };
                                const meta = typeMeta[q.type.toLowerCase()] || { label: q.type, bg: "#f1f5f9", color: "#475569" };

                                const diffColor = q.difficulty <= 2 ? "#059669" : q.difficulty === 3 ? "#4f46e5" : "#7c3aed";
                                const diffBg = q.difficulty <= 2 ? "rgba(16, 185, 129, 0.1)" : q.difficulty === 3 ? "rgba(79, 70, 229, 0.1)" : "rgba(124, 58, 237, 0.1)";
                                const diffDots = "●".repeat(q.difficulty) + "○".repeat(Math.max(0, 5 - q.difficulty));

                                return (
                                  <div
                                    key={qIdx}
                                    style={{
                                      background: "white",
                                      border: "1px solid #e2e8f0",
                                      borderRadius: "var(--radius-md)",
                                      padding: "16px",
                                      boxShadow: "var(--shadow-xs)",
                                    }}
                                  >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)" }}>
                                          #{qIdx + 1}
                                        </span>
                                        <span
                                          style={{
                                            padding: "2px 8px",
                                            borderRadius: "var(--radius-pill)",
                                            fontSize: "11px",
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.04em",
                                            background: meta.bg,
                                            color: meta.color,
                                          }}
                                        >
                                          {meta.label}
                                        </span>
                                        <span
                                          style={{
                                            padding: "2px 8px",
                                            borderRadius: "var(--radius-pill)",
                                            fontSize: "11px",
                                            fontWeight: 700,
                                            background: diffBg,
                                            color: diffColor,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "4px",
                                          }}
                                          title={`Difficulté : ${q.difficulty}/5`}
                                        >
                                          <span>{diffDots}</span>
                                          <span>{locale === "fr" ? "Niveau" : "Level"} {q.difficulty}/5</span>
                                        </span>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => handleCopyQuestion(qIdx, q)}
                                        style={{
                                          all: "unset",
                                          cursor: "pointer",
                                          fontSize: "11.5px",
                                          fontWeight: 600,
                                          color: copiedQuestionIdx === qIdx ? "var(--success)" : "var(--primary)",
                                          padding: "4px 8px",
                                          borderRadius: "var(--radius-sm)",
                                          background: copiedQuestionIdx === qIdx ? "var(--success-bg)" : "rgba(79, 70, 229, 0.05)",
                                          transition: "all 0.15s ease",
                                        }}
                                      >
                                        {copiedQuestionIdx === qIdx ? `✓ ${t("common.copied")}` : t("common.copy")}
                                      </button>
                                    </div>

                                    <p
                                      style={{
                                        fontSize: "14.5px",
                                        fontWeight: 600,
                                        color: "var(--text-primary)",
                                        lineHeight: 1.5,
                                        margin: "0 0 12px 0",
                                      }}
                                    >
                                      {q.question}
                                    </p>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px", marginTop: "10px" }}>
                                      <div
                                        style={{
                                          padding: "8px 12px",
                                          background: "#f8fafc",
                                          borderLeft: "3px solid #6366f1",
                                          borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                                          fontSize: "12.5px",
                                          color: "var(--text-secondary)",
                                          lineHeight: 1.45,
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "3px",
                                        }}
                                      >
                                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--primary)", fontWeight: 700, fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                          <TargetIcon width="13" height="13" />
                                          <span>{t("jobs.evaluates_label")}</span>
                                        </div>
                                        <span>{q.evaluates}</span>
                                      </div>

                                      <div
                                        style={{
                                          padding: "8px 12px",
                                          background: "rgba(16, 185, 129, 0.06)",
                                          borderLeft: "3px solid var(--success)",
                                          borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                                          fontSize: "12.5px",
                                          color: "#065f46",
                                          lineHeight: 1.45,
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "3px",
                                        }}
                                      >
                                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--success)", fontWeight: 700, fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                          <CheckCircleIcon width="13" height="13" />
                                          <span>{t("jobs.good_answer_label")}</span>
                                        </div>
                                        <span>{q.good_answer}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {jobToDelete && (
          <div className="modal-overlay" onClick={closeDeleteModal}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-icon">!</div>
              <h3>{t("jobs.delete_title")}</h3>
              <p>
                {t("jobs.delete_confirm")}
              </p>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeDeleteModal}
                >
                  {t("common.cancel")}
                </button>

                <button
                  type="button"
                  className="delete-button"
                  onClick={confirmDeleteJob}
                  disabled={deletingJobId === jobToDelete.id}
                >
                  {deletingJobId === jobToDelete.id
                    ? t("common.loading")
                    : t("common.delete")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
