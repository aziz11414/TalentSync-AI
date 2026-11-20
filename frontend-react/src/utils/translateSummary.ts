export function translateSummary(text?: string | null, locale: string = "fr"): string {
  if (!text) return text || "";
  if (locale !== "en") return text;

  let out = text;

  // Candidate seniority and experience
  out = out.replace(/Candidat\s+senior\s+avec\s+environ\s+(\d+)\s+ans?\s+d['’]exp[ée]rience/gi, "Senior candidate with approximately $1 years of experience");
  out = out.replace(/Candidat\s+junior\s+avec\s+environ\s+(\d+)\s+ans?\s+d['’]exp[ée]rience/gi, "Junior candidate with approximately $1 years of experience");
  out = out.replace(/Candidat\s+interm[ée]diaire\s+avec\s+environ\s+(\d+)\s+ans?\s+d['’]exp[ée]rience/gi, "Mid-level candidate with approximately $1 years of experience");
  out = out.replace(/Candidat\s+lead\s+avec\s+environ\s+(\d+)\s+ans?\s+d['’]exp[ée]rience/gi, "Lead candidate with approximately $1 years of experience");

  // Core sections
  out = out.replace(/Comp[ée]tences principales\s*:/gi, "Core skills:");
  out = out.replace(/Profil orient[ée]\s+d[ée]veloppeur\s+frontend/gi, "Profile focused on frontend development");
  out = out.replace(/Profil orient[ée]\s+d[ée]veloppeur\s+backend/gi, "Profile focused on backend development");
  out = out.replace(/Profil orient[ée]\s+d[ée]veloppeur\s+full\s*stack/gi, "Profile focused on full-stack development");
  out = out.replace(/Profil orient[ée]\s+d[ée]veloppeur\s+data\s*\/\s*api/gi, "Profile focused on data / API development");
  out = out.replace(/Profil orient[ée]\s+ing[ée]nieur\s+devops/gi, "Profile focused on DevOps engineering");
  out = out.replace(/Profil orient[ée]\s+/gi, "Profile focused on ");

  // Languages
  out = out.replace(/Langues d[ée]tect[ée]es\s*:/gi, "Detected languages:");
  out = out.replace(/\bFran[çc]ais\b/gi, "French");
  out = out.replace(/\bAnglais\b/gi, "English");
  out = out.replace(/\bArabe\b/gi, "Arabic");
  out = out.replace(/\bAllemand\b/gi, "German");
  out = out.replace(/\bEspagnol\b/gi, "Spanish");
  out = out.replace(/\bItalien\b/gi, "Italian");

  // Excerpt
  out = out.replace(/Extrait pertinent\s*:/gi, "Relevant excerpt:");
  out = out.replace(/PROFIL\s+[ÉEé]tudiant en deuxi[èe]me ann[ée]e de Master en Applications Web Intelligentes/gi, "PROFILE Second-year Master's student in Intelligent Web Applications");
  out = out.replace(/je con[çc]ois des applications full-stack/gi, "designing full-stack applications");
  out = out.replace(/\bavec\b/g, "with");

  return out;
}

export function translateRole(role: string, locale: string = "fr"): string {
  if (locale !== "en") return role;
  const map: Record<string, string> = {
    "Développeur Frontend": "Frontend Developer",
    "Développeur Backend": "Backend Developer",
    "Développeur Full Stack": "Full Stack Developer",
    "Développeur Data / API": "Data / API Developer",
    "Ingénieur DevOps": "DevOps Engineer",
    "Ingénieur IA": "AI Engineer",
  };
  return map[role] || role;
}

export function translateLanguageName(lang: string, locale: string = "fr"): string {
  if (locale !== "en") return lang;
  const map: Record<string, string> = {
    "Français": "French",
    "Anglais": "English",
    "Arabe": "Arabic",
    "Allemand": "German",
    "Espagnol": "Spanish",
    "Italien": "Italian",
  };
  return map[lang] || lang;
}

export function translateLevelString(level: string, locale: string = "fr"): string {
  if (locale !== "en") return level;
  return level
    .replace(/Junior\s*\((.*)\)/i, "Junior ($1)")
    .replace(/Senior\s*\((.*)\)/i, "Senior ($1)")
    .replace(/Intermédiaire\s*\((.*)\)/i, "Intermediate ($1)")
    .replace(/ans?\s+d['’]exp[ée]rience/gi, "yrs of exp.");
}
