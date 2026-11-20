import time
import statistics
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

SAMPLE_PROFILES = [
    ("Amine Mansour", "Développeur Full Stack Senior avec 6 ans d'expérience. Expert React, Laravel, TypeScript, REST API, Docker et MySQL. Leadership technique et agilité."),
    ("Sonia Ben Salem", "Ingénieure Backend Python avec 4 ans d'expérience en microservices FastAPI, PostgreSQL, Docker et intégration de modèles d'IA."),
    ("Karim Dridi", "Développeur Frontend Junior avec 1 an d'expérience sur React, HTML5, CSS3, Tailwind CSS et JavaScript."),
    ("Ines Chaabane", "DevOps & Cloud Engineer avec 5 ans d'expérience. Maîtrise de Docker, Kubernetes, CI/CD, AWS et Linux."),
    ("Tarek Mejri", "Développeur PHP & Laravel avec 3 ans d'expérience, REST API, MySQL, Git et bases de Docker."),
    ("Rania Khemir", "Data Scientist Python avec 2 ans d'expérience en Machine Learning, Pandas, FastAPI et SQL."),
    ("Youssef Gharbi", "Lead Architecte Full Stack avec 8 ans d'expérience en React, Node.js, Python, Docker, Kubernetes et PostgreSQL."),
    ("Meriem Trabelsi", "Développeuse Mobile & Web avec 2 ans d'expérience sur Flutter, React et REST API."),
    ("Firas Bouaziz", "Ingénieur Systèmes Linux et Cloud AWS avec 4 ans d'expérience en scripting Bash, Python et Docker."),
    ("Nour Zaier", "Développeur Full Stack avec 3 ans d'expérience sur Laravel, Vue.js, MySQL et REST API.")
]

JOB = {
    "job_title": "Développeur Full Stack Senior (Laravel & React)",
    "job_description": "Poste Senior requérant React, Laravel, TypeScript, REST API et Docker.",
    "required_skills": ["React", "Laravel", "TypeScript", "REST API", "Docker"]
}

def run_benchmark():
    latencies = []
    scores = []
    
    print("=" * 60)
    print("TALENTSYNC AI - BENCHMARK DE PERFORMANCE SUR 100 CV")
    print("=" * 60)
    
    start_total = time.perf_counter()
    
    for i in range(100):
        name, text = SAMPLE_PROFILES[i % len(SAMPLE_PROFILES)]
        payload = {
            "candidate_text": f"{name} #{i+1} - {text}",
            "job_title": JOB["job_title"],
            "job_description": JOB["job_description"],
            "required_skills": JOB["required_skills"]
        }
        
        t0 = time.perf_counter()
        resp = client.post("/match-candidate-job", json=payload)
        t1 = time.perf_counter()
        
        assert resp.status_code == 200
        data = resp.json()
        
        duration_ms = (t1 - t0) * 1000
        latencies.append(duration_ms)
        scores.append(data["score"])
    
    total_time_s = time.perf_counter() - start_total
    
    avg_ms = statistics.mean(latencies)
    median_ms = statistics.median(latencies)
    min_ms = min(latencies)
    max_ms = max(latencies)
    p95_ms = statistics.quantiles(latencies, n=20)[18]
    
    print(f"Total CV analysés             : 100")
    print(f"Temps total d'exécution      : {total_time_s:.2f} secondes")
    print(f"Débit (Throughput)            : {100 / total_time_s:.1f} CV / seconde")
    print(f"Latence moyenne par CV        : {avg_ms:.2f} ms")
    print(f"Latence médiane (p50)         : {median_ms:.2f} ms")
    print(f"Latence 95ème percentile (p95): {p95_ms:.2f} ms")
    print(f"Min / Max latence             : {min_ms:.2f} ms / {max_ms:.2f} ms")
    print(f"Score moyen obtenu            : {statistics.mean(scores):.1f}%")
    print(f"Distribution des scores       : Min {min(scores)}% - Max {max(scores)}%")
    print("=" * 60)

if __name__ == "__main__":
    run_benchmark()
