import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import api from "../api/axios";
import { SearchIcon, EditIcon, TrashIcon, ScaleIcon, ShieldCheckIcon } from "../components/Icons";
import { useLanguage } from "../context/LanguageContext";
import { translateSummary } from "../utils/translateSummary";

type Candidate = {
  id: number;
  full_name: string;
  email?: string;
  phone?: string;
  status?: string;
  summary?: string;
  cv_path?: string;
  cv_url?: string | null;
  extracted_text?: string;
};

type PaginatedCandidates = {
  data: Candidate[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

interface CandidatesPageProps {
  anonymousMode?: boolean;
}

const statusClasses: Record<string, string> = {
  nouveau: "status-pill-nouveau",
  en_revue: "status-pill-revue",
  entretien: "status-pill-entretien",
  retenu: "status-pill-retenu",
  rejete: "status-pill-rejete",
};

export default function CandidatesPage({ anonymousMode = false }: CandidatesPageProps) {
  const { t, locale } = useLanguage();

  const getStatusLabel = (key: string): string => {
    return t(`status.${key}`, key);
  };

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [q, setQ] = useState("");
  const [skill, setSkill] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 8,
    total: 0,
  });

  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);

  const [candidateToEdit, setCandidateToEdit] = useState<Candidate | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    status: "nouveau",
    summary: "",
  });
  const [newCvFile, setNewCvFile] = useState<File | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const fetchCandidates = async (targetPage = page) => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get<PaginatedCandidates>("/candidates", {
        params: {
          q: q || undefined,
          skill: skill || undefined,
          status: statusFilter || undefined,
          page: targetPage,
          per_page: 8,
        },
      });

      setCandidates(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      });
      setPage(response.data.current_page);
    } catch {
      setMessage("Impossible de charger les candidats.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleShowDetails = async (candidateId: number) => {
    try {
      setLoadingDetails(true);
      const response = await api.get(`/candidates/${candidateId}`);
      setSelectedCandidate(response.data);
    } catch {
      setMessage("Impossible de charger le détail du candidat.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const openDeleteModal = (candidate: Candidate) => {
    setCandidateToDelete(candidate);
  };

  const closeDeleteModal = () => {
    setCandidateToDelete(null);
  };

  const confirmDelete = async () => {
    if (!candidateToDelete) return;

    try {
      setDeletingId(candidateToDelete.id);
      setMessage("");

      await api.delete(`/candidates/${candidateToDelete.id}`);

      if (selectedCandidate?.id === candidateToDelete.id) {
        setSelectedCandidate(null);
      }

      closeDeleteModal();
      setMessage("Candidat supprimé avec succès.");

      const shouldGoPrevPage = candidates.length === 1 && page > 1;
      await fetchCandidates(shouldGoPrevPage ? page - 1 : page);
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ||
          "Une erreur est survenue lors de la suppression."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (candidate: Candidate) => {
    setCandidateToEdit(candidate);
    setEditForm({
      full_name: candidate.full_name || "",
      email: candidate.email || "",
      phone: candidate.phone || "",
      status: candidate.status || "nouveau",
      summary: candidate.summary || "",
    });
    setNewCvFile(null);
    setEditError("");
  };

  const closeEditModal = () => {
    setCandidateToEdit(null);
    setNewCvFile(null);
    setEditError("");
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!candidateToEdit) return;

    try {
      setSavingEdit(true);
      setEditError("");

      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("full_name", editForm.full_name);
      formData.append("email", editForm.email);
      formData.append("phone", editForm.phone);
      formData.append("status", editForm.status);
      formData.append("summary", editForm.summary);
      if (newCvFile) {
        formData.append("cv", newCvFile);
      }

      const response = await api.post(`/candidates/${candidateToEdit.id}`, formData);

      const updated = response.data.candidate;
      setMessage("Candidat mis à jour avec succès !");

      if (selectedCandidate?.id === candidateToEdit.id) {
        setSelectedCandidate(updated);
      }

      closeEditModal();
      await fetchCandidates(page);
    } catch (err: any) {
      setEditError(
        err?.response?.data?.message || "Erreur lors de la mise à jour du candidat."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleQuickStatusChange = async (newStatus: string) => {
    if (!selectedCandidate) return;
    try {
      const response = await api.put(`/candidates/${selectedCandidate.id}`, {
        full_name: selectedCandidate.full_name,
        email: selectedCandidate.email,
        phone: selectedCandidate.phone,
        status: newStatus,
        summary: selectedCandidate.summary,
      });
      setSelectedCandidate(response.data.candidate);
      setCandidates((prev) =>
        prev.map((c) => (c.id === selectedCandidate.id ? response.data.candidate : c))
      );
    } catch {
      setMessage("Erreur lors de la modification du statut.");
    }
  };

  const toggleCompare = (id: number) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const comparedCandidates = candidates.filter((c) => compareIds.includes(c.id));

  const canPrev = pagination.current_page > 1;
  const canNext = pagination.current_page < pagination.last_page;

  return (
    <div className="page-shell">
      <div className="list-page">
        <div className="list-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h1>{t("candidates.title")}</h1>
              <p>{t("candidates.subtitle")}</p>
            </div>

            {compareIds.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  {compareIds.length}/2 {locale === "fr" ? "profil(s) sélectionné(s)" : "profile(s) selected"}
                </span>
                <button
                  type="button"
                  className="primary-button compact-button"
                  disabled={compareIds.length < 2}
                  onClick={() => setShowCompareModal(true)}
                  style={{ height: "40px", display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <ScaleIcon width="16" height="16" />
                  {t("candidates.compare_selected")}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setCompareIds([])}
                  style={{ height: "40px" }}
                >
                  {t("common.cancel")}
                </button>
              </div>
            )}
          </div>
        </div>

        {anonymousMode && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 18px",
              borderRadius: "var(--radius-md)",
              background: "rgba(124, 58, 237, 0.08)",
              border: "1px solid rgba(124, 58, 237, 0.25)",
              color: "#6d28d9",
              fontSize: "13.5px",
              fontWeight: 600,
              marginTop: "16px",
              marginBottom: "4px",
            }}
          >
            <ShieldCheckIcon width="18" height="18" />
            <span>{t("candidates.anti_bias_banner")}</span>
          </div>
        )}

        <div className="toolbar">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("candidates.search_placeholder")}
          />
          <input
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder={t("candidates.skill_placeholder")}
          />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{t("status.all_statuses")}</option>
            <option value="nouveau">{t("status.nouveau")}</option>
            <option value="en_revue">{t("status.en_revue")}</option>
            <option value="entretien">{t("status.entretien")}</option>
            <option value="retenu">{t("status.retenu")}</option>
            <option value="rejete">{t("status.rejete")}</option>
          </select>
          <button
            className="primary-button compact-button"
            onClick={() => fetchCandidates(1)}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", justifyContent: "center" }}
          >
            <SearchIcon width="16" height="16" />
            {loading ? t("common.loading") : t("common.filter")}
          </button>
        </div>

        {message && <div className="alert alert-info">{message}</div>}

        <div className="entity-card table-card">
          <div className="table-card-header">
            <div>
              <h2>{t("candidates.title")} ({pagination.total})</h2>
              <p className="table-subtitle">
                {t("candidates.select_two_hint")}
              </p>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>Comp.</th>
                  <th>{t("candidates.candidate_col")}</th>
                  <th>{t("common.status")}</th>
                  <th>Email</th>
                  <th>{t("create_candidate.phone")}</th>
                  <th>{t("create_candidate.summary")}</th>
                  <th>CV</th>
                  <th>{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => {
                  const sLabel = getStatusLabel(candidate.status || "nouveau");
                  const sClass = statusClasses[candidate.status || "nouveau"] || statusClasses.nouveau;
                  const isCompared = compareIds.includes(candidate.id);
                  const displayName = anonymousMode ? (locale === "fr" ? `Candidat #C${candidate.id}` : `Candidate #C${candidate.id}`) : candidate.full_name;
                  const displayEmail = anonymousMode ? "•••••••@anonyme.fr" : (candidate.email || "-");
                  const displayPhone = anonymousMode ? "+216 •••• ••••" : (candidate.phone || "-");

                  return (
                    <tr key={candidate.id} style={{ background: isCompared ? "rgba(79, 70, 229, 0.04)" : undefined }}>
                      <td>
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={() => toggleCompare(candidate.id)}
                          title="Sélectionner pour comparer"
                          style={{ cursor: "pointer", width: "16px", height: "16px" }}
                        />
                      </td>
                      <td>
                        <strong>{displayName}</strong>
                        {anonymousMode && (
                          <span style={{ fontSize: "11px", color: "var(--primary)", display: "block" }}>
                            {t("common.anti_bias_mode")}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`status-pill ${sClass}`}>{sLabel}</span>
                      </td>
                      <td>{displayEmail}</td>
                      <td>{displayPhone}</td>
                      <td className="summary-cell">
                        {translateSummary(candidate.summary, locale) || "-"}
                      </td>
                      <td>
                        {candidate.cv_url ? (
                          <a
                            href={candidate.cv_url}
                            target="_blank"
                            rel="noreferrer"
                            className="table-link"
                          >
                            {t("candidates.view_cv")}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => handleShowDetails(candidate.id)}
                          >
                            {loadingDetails && selectedCandidate?.id === candidate.id
                              ? "..."
                              : t("common.details")}
                          </button>

                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => openEditModal(candidate)}
                          >
                            <EditIcon width="13" height="13" /> {t("common.edit")}
                          </button>

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() => openDeleteModal(candidate)}
                            disabled={deletingId === candidate.id}
                          >
                            <TrashIcon width="13" height="13" />
                            {deletingId === candidate.id ? "..." : t("common.delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!loading && candidates.length === 0 && (
                  <tr>
                    <td colSpan={8} className="table-empty-cell">
                      {t("candidates.no_candidates")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-bar">
            <div className="pagination-info">
              {t("candidates.page")} {pagination.current_page} {t("candidates.of")} {pagination.last_page}
            </div>

            <div className="pagination-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => canPrev && fetchCandidates(page - 1)}
                disabled={!canPrev || loading}
              >
                {t("candidates.previous")}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => canNext && fetchCandidates(page + 1)}
                disabled={!canNext || loading}
              >
                {t("candidates.next")}
              </button>
            </div>
          </div>
        </div>

        <aside className="entity-card candidate-detail-card candidate-detail-full">
          <div className="detail-top-bar">
            <h2>{t("common.details")}</h2>
            {selectedCandidate && (
              <button
                type="button"
                className="primary-button compact-button"
                onClick={() => openEditModal(selectedCandidate)}
              >
                <EditIcon width="14" height="14" /> {t("candidates.edit_title")}
              </button>
            )}
          </div>

          {!selectedCandidate && (
            <p className="empty-state">
              {locale === "fr"
                ? "Sélectionnez un candidat dans le tableau ci-dessus pour inspecter son profil complet."
                : "Select a candidate in the table above to view their full profile."}
            </p>
          )}

          {selectedCandidate && (
            <div className="candidate-detail-content">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="result-label">ID</span>
                  <p>#{selectedCandidate.id}</p>
                </div>

                <div className="detail-item">
                  <span className="result-label">{t("common.status")}</span>
                  <div className="status-selector-row">
                    <select
                      className="filter-select"
                      value={selectedCandidate.status || "nouveau"}
                      onChange={(e) => handleQuickStatusChange(e.target.value)}
                    >
                      <option value="nouveau">{t("status.nouveau")}</option>
                      <option value="en_revue">{t("status.en_revue")}</option>
                      <option value="entretien">{t("status.entretien")}</option>
                      <option value="retenu">{t("status.retenu")}</option>
                      <option value="rejete">{t("status.rejete")}</option>
                    </select>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="result-label">{t("create_candidate.fullname")}</span>
                  <p>{anonymousMode ? (locale === "fr" ? `Candidat #C${selectedCandidate.id} (Masqué)` : `Candidate #C${selectedCandidate.id} (Hidden)`) : selectedCandidate.full_name}</p>
                </div>

                <div className="detail-item">
                  <span className="result-label">Email</span>
                  <p>{anonymousMode ? "•••••••@anonyme.fr" : (selectedCandidate.email || "-")}</p>
                </div>

                <div className="detail-item">
                  <span className="result-label">{t("create_candidate.phone")}</span>
                  <p>{anonymousMode ? "+216 •••• ••••" : (selectedCandidate.phone || "-")}</p>
                </div>

                <div className="detail-item">
                  <span className="result-label">{t("create_candidate.cv_file")}</span>
                  {selectedCandidate.cv_url ? (
                    <a
                      href={selectedCandidate.cv_url}
                      target="_blank"
                      rel="noreferrer"
                      className="table-link"
                    >
                      {t("candidates.view_cv")}
                    </a>
                  ) : (
                    <p>-</p>
                  )}
                </div>
              </div>

              <div className="detail-item">
                <span className="result-label">{t("create_candidate.summary")}</span>
                <p className="detail-summary-box">{translateSummary(selectedCandidate.summary, locale) || "-"}</p>
              </div>

              <div className="detail-item">
                <span className="result-label">{locale === "fr" ? "Texte extrait du document" : "Document extracted text"}</span>
                <p className="detail-text">
                  {selectedCandidate.extracted_text || (locale === "fr" ? "Aucun texte extrait disponible." : "No extracted text available.")}
                </p>
              </div>
            </div>
          )}
        </aside>

        {showCompareModal && comparedCandidates.length === 2 && (
          <div className="modal-overlay" onClick={() => setShowCompareModal(false)}>
            <div className="modal-card" style={{ maxWidth: "860px", width: "95%" }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-clean">
                <div>
                  <h3 style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <ScaleIcon width="20" height="20" style={{ color: "var(--primary)" }} />
                    {t("candidates.compare_title")}
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "2px 0 0" }}>
                    {t("candidates.compare_subtitle")}
                  </p>
                </div>
                <button type="button" className="modal-close-btn" onClick={() => setShowCompareModal(false)}>
                  ✕
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {comparedCandidates.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-lg)",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                    }}
                  >
                    <div>
                      <span className={`status-pill ${statusClasses[c.status || "nouveau"] || "status-pill-nouveau"}`}>
                        {getStatusLabel(c.status || "nouveau")}
                      </span>
                      <h4 style={{ fontSize: "18px", fontWeight: 700, margin: "8px 0 2px" }}>
                        {anonymousMode ? (locale === "fr" ? `Candidat #C${c.id}` : `Candidate #C${c.id}`) : c.full_name}
                      </h4>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                        {anonymousMode ? "anonyme@recrutement.fr" : (c.email || "Email non renseigné")}
                      </p>
                    </div>

                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
                      <span className="result-label">{t("create_candidate.summary")}</span>
                      <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "var(--text-primary)", marginTop: "4px" }}>
                        {c.summary || "-"}
                      </p>
                    </div>

                    {c.cv_url && (
                      <a href={c.cv_url} target="_blank" rel="noreferrer" className="table-link" style={{ alignSelf: "flex-start" }}>
                        {t("candidates.view_cv")}
                      </a>
                    )}
                  </div>
                ))}
              </div>

              <div className="modal-actions" style={{ marginTop: "24px" }}>
                <button type="button" className="secondary-button" onClick={() => setShowCompareModal(false)}>
                  {t("common.close")}
                </button>
              </div>
            </div>
          </div>
        )}

        {candidateToEdit && (
          <div className="modal-overlay" onClick={closeEditModal}>
            <div className="modal-card modal-card-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-clean">
                <h3>{t("candidates.edit_title")} #{candidateToEdit.id}</h3>
                <button type="button" className="modal-close-btn" onClick={closeEditModal}>
                  ✕
                </button>
              </div>

              {editError && <div className="alert alert-danger">{editError}</div>}

              <form onSubmit={handleEditSubmit} className="edit-form-grid">
                <div className="form-group">
                  <label>{t("create_candidate.fullname")} *</label>
                  <input
                    type="text"
                    required
                    value={editForm.full_name}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, full_name: e.target.value }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label>{t("common.status")}</label>
                  <select
                    className="filter-select"
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, status: e.target.value }))
                    }
                  >
                    <option value="nouveau">{t("status.nouveau")}</option>
                    <option value="en_revue">{t("status.en_revue")}</option>
                    <option value="entretien">{t("status.entretien")}</option>
                    <option value="retenu">{t("status.retenu")}</option>
                    <option value="rejete">{t("status.rejete")}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label>{t("create_candidate.phone")}</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                </div>

                <div className="form-group full-width">
                  <label>{t("create_candidate.summary")}</label>
                  <textarea
                    rows={4}
                    value={editForm.summary}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, summary: e.target.value }))
                    }
                  />
                </div>

                <div className="form-group full-width">
                  <label>{locale === "fr" ? "Remplacer le fichier CV (Optionnel)" : "Replace resume file (Optional)"}</label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setNewCvFile(e.target.files?.[0] || null)
                    }
                  />
                  <small style={{ color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                    {locale === "fr"
                      ? "Formats acceptés : PDF, DOCX, TXT. L'IA ré-analysera automatiquement le nouveau fichier."
                      : "Accepted formats: PDF, DOCX, TXT. The AI will automatically re-analyze the new document."}
                  </small>
                </div>

                <div className="modal-actions full-width">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={closeEditModal}
                    disabled={savingEdit}
                  >
                    {t("common.cancel")}
                  </button>
                  <button type="submit" className="primary-button" disabled={savingEdit}>
                    {savingEdit ? t("common.loading") : t("common.save")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {candidateToDelete && (
          <div className="modal-overlay" onClick={closeDeleteModal}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-icon">!</div>
              <h3>{t("candidates.confirm_delete_title")}</h3>
              <p>
                {t("candidates.confirm_delete_msg")}
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
                  onClick={confirmDelete}
                  disabled={deletingId === candidateToDelete.id}
                >
                  {deletingId === candidateToDelete.id ? t("common.loading") : t("common.delete")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

