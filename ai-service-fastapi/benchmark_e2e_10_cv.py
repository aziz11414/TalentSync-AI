import time
import statistics
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

RESUMES = [
    """Mohamed Aziz - Développeur Full Stack Senior
Expérience : 6 ans d'expérience en développement web.
Compétences : React, TypeScript, Laravel, Docker, REST API, MySQL, Git, CI/CD.
Soft skills : leadership, gestion de projet, autonomie.
Postes précédents : Tech Lead chez TechCorp (3 ans), Ingénieur Full Stack (3 ans).
Langues : Français, Anglais, Arabe.""",
    """Sarra Ben Amor - Ingénieure IA & Microservices Python
Expérience : 4 ans d'expérience en ingénierie logicielle.
Compétences : Python, FastAPI, PostgreSQL, Docker, Machine Learning, Pandas, Scikit-learn.
Qualités : rigueur analytique, curiosité, communication.
Langues : Français, Anglais.""",
    """Karim Trabelsi - Développeur Frontend Junior
Expérience : 1 an et demi d'expérience en agence digitale.
Compétences : React, JavaScript, HTML5, CSS3, Tailwind CSS, Git.
Points forts : sensibilité ergonomique, apprentissage rapide.""",
    """Ines Khemir - Ingénieure DevOps & Cloud
Expérience : 5 ans d'expérience en infrastructure et automatisation.
Compétences : Docker, Kubernetes, CI/CD, AWS, Linux, Terraform, Python.
Qualités : gestion des incidents, proactivité.""",
    """Firas Chaabane - Développeur Backend PHP / Laravel
Expérience : 3 ans d'expérience.
Compétences : Laravel, PHP, REST API, MySQL, Docker, Git.
Atouts : résolution de bugs, rigueur.""",
    """Hiba Mejri - Data Scientist & Ingénieure ML
Expérience : 3 ans d'expérience dans la finance.
Compétences : Python, FastAPI, Machine Learning, SQL, PostgreSQL, Docker.
Atouts : esprit d'équipe, esprit critique.""",
    """Yassine Gharbi - Architecte Logiciel Senior
Expérience : 8 ans d'expérience en systèmes distribués.
Compétences : React, TypeScript, Laravel, Python, Docker, Kubernetes, AWS, PostgreSQL, REST API.
Atouts : vision stratégique, mentorat technique.""",
    """Nour Bouaziz - Développeuse Web Full Stack
Expérience : 2 ans d'expérience.
Compétences : React, Laravel, JavaScript, MySQL, Git.
Atouts : polyvalence, motivation.""",
    """Bilel Dridi - Développeur Backend FastAPI & Python
Expérience : 2 ans d'expérience en startup.
Compétences : Python, FastAPI, Docker, PostgreSQL, REST API, Git.
Atouts : autonomie, adaptabilité.""",
    """Amira Zaier - Ingénieure Systèmes & Cloud
Expérience : 4 ans d'expérience.
Compétences : Linux, Docker, AWS, Kubernetes, CI/CD, Bash.
Atouts : réactivité, sens du service."""
]

JOB = {
    "job_title": "Développeur Full Stack Senior (Laravel & React)",
    "job_description": "Poste Senior requérant React, Laravel, TypeScript, REST API et Docker.",
    "required_skills": ["React", "Laravel", "TypeScript", "REST API", "Docker"]
}

def benchmark_e2e():
    print("=" * 65)
    print("TALENTSYNC AI - BENCHMARK BOUT-EN-BOUT SUR 10 CV RÉELS")
    print("=" * 65)
    
    times = []
    
    t_start = time.perf_counter()
    for idx, cv_text in enumerate(RESUMES):
        t0 = time.perf_counter()
        
        # 1. Parsing complet du CV (extraction des compétences et soft skills)
        parse_resp = client.post("/parse-cv", json={"text": cv_text})
        assert parse_resp.status_code == 200
        
        # 2. Matching et scoring explicable XAI
        match_resp = client.post("/match-candidate-job", json={
            "candidate_text": cv_text,
            "job_title": JOB["job_title"],
            "job_description": JOB["job_description"],
            "required_skills": JOB["required_skills"]
        })
        assert match_resp.status_code == 200
        
        # 3. Génération des questions d'entretien ciblées
        data = match_resp.json()
        q_resp = client.post("/generate-interview-questions", json={
            "job_title": JOB["job_title"],
            "matched_skills": data.get("matched_skills", []),
            "missing_skills": data.get("missing_skills", []),
            "experience_level": data.get("experience_level", "Intermédiaire")
        })
        assert q_resp.status_code == 200
        
        t1 = time.perf_counter()
        elapsed_ms = (t1 - t0) * 1000
        times.append(elapsed_ms)
        print(f"  CV #{idx+1:02d} : {elapsed_ms:.1f} ms | Score : {data['score']:.1f}% ({data['experience_level']})")

    t_total = time.perf_counter() - t_start
    avg_ms = statistics.mean(times)
    
    print("-" * 65)
    print(f"Temps total d'exécution (10 CV) : {t_total:.2f} s")
    print(f"Temps moyen par CV (E2E)        : {avg_ms:.1f} ms (~{avg_ms/1000:.3f} s)")
    print(f"Débit effectif                  : {len(RESUMES)/t_total:.1f} CV/seconde")
    print("=" * 65)

if __name__ == "__main__":
    benchmark_e2e()
