<?php

namespace Database\Seeders;

use App\Models\Candidate;
use App\Models\Job;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (!User::where('email', 'demo@talentsync.ai')->exists()) {
            User::create([
                'name' => 'Recruteur TalentSync',
                'email' => 'demo@talentsync.ai',
                'password' => Hash::make('password'),
            ]);
        }

        if (!User::where('email', 'test@example.com')->exists()) {
            User::create([
                'name' => 'Mohamed Aziz',
                'email' => 'test@example.com',
                'password' => Hash::make('password'),
            ]);
        }

        Job::truncate();
        Candidate::truncate();

        $jobFullstack = Job::create([
            'title' => 'Développeur Full Stack Senior (Laravel & React)',
            'description' => 'Recherche développeur full-stack expérimenté pour concevoir des applications SaaS performantes. Maîtrise de React, TypeScript, Laravel, REST API et Docker requise.',
            'required_skills' => ['React', 'Laravel', 'TypeScript', 'REST API', 'Docker'],
            'status' => 'open',
        ]);

        $jobPythonAi = Job::create([
            'title' => 'Ingénieur IA & Microservices Python (FastAPI)',
            'description' => 'Conception de pipelines NLP et intégration de modèles LLM au sein d’architectures microservices FastAPI, PostgreSQL et conteneurs Docker.',
            'required_skills' => ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Machine Learning'],
            'status' => 'open',
        ]);

        $jobDevops = Job::create([
            'title' => 'DevOps & Cloud Platform Engineer',
            'description' => 'Mise en place de pipelines CI/CD, orchestration de conteneurs Kubernetes, automatisation de déploiements AWS et monitoring Linux/Redis.',
            'required_skills' => ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux'],
            'status' => 'open',
        ]);

        $candidates = [
            [
                'full_name' => 'Amira Mejri',
                'email' => 'amira.mejri@example.com',
                'phone' => '+21622334455',
                'status' => 'retenu',
                'summary' => 'Lead Développeuse Full Stack avec 6 ans d’expérience sur l’écosystème Laravel, React et TypeScript. Forte expertise en architecture logicielle, CI/CD et gestion d’équipes agiles.',
                'extracted_text' => 'Amira Mejri - Lead Developer Full Stack avec 6 ans d’expérience. Compétences : Laravel, React, TypeScript, PHP, REST API, Docker, CI/CD, MySQL, Git. Leadership technique, communication claire, agilité Scrum.',
            ],
            [
                'full_name' => 'Yassine Ben Amor',
                'email' => 'yassine.benamor@example.com',
                'phone' => '+21620112233',
                'status' => 'entretien',
                'summary' => 'Développeur Full Stack Senior avec 5 ans d’expérience. Spécialisé en React, Laravel, REST API et Docker. Excellente autonomie et rigueur.',
                'extracted_text' => 'Yassine Ben Amor - Développeur Full Stack Senior avec 5 ans d’expérience. Compétences : React, Laravel, TypeScript, REST API, Docker, MySQL, Linux, Git. Esprit d’équipe, autonomie, résolution de problèmes.',
            ],
            [
                'full_name' => 'Sarra Trabelsi',
                'email' => 'sarra.trabelsi@example.com',
                'phone' => '+21698445566',
                'status' => 'entretien',
                'summary' => 'Ingénieure Logiciel spécialisée en Python, FastAPI et bases de données PostgreSQL. 4 ans d’expérience en développement de microservices et intégration d’APIs IA.',
                'extracted_text' => 'Sarra Trabelsi - Développeuse Backend Python avec 4 ans d’expérience. Compétences : Python, FastAPI, PostgreSQL, Docker, Machine Learning, Linux, Git. Rigueur mathématique, curiosité intellectuelle.',
            ],
            [
                'full_name' => 'Mehdi Khemir',
                'email' => 'mehdi.khemir@example.com',
                'phone' => '+21624556677',
                'status' => 'en_revue',
                'summary' => 'Ingénieur DevOps & Cloud avec 4 ans d’expérience. Spécialiste de l’automatisation CI/CD, conteneurisation Docker/Kubernetes et infrastructure AWS.',
                'extracted_text' => 'Mehdi Khemir - DevOps Engineer avec 4 ans d’expérience. Compétences : Docker, Kubernetes, CI/CD, AWS, Linux, Python, Terraform, Git. Sens de la sécurité, proactivité.',
            ],
            [
                'full_name' => 'Ines Bouaziz',
                'email' => 'ines.bouaziz@example.com',
                'phone' => '+21650114477',
                'status' => 'retenu',
                'summary' => 'Data Scientist & Développeuse IA Python avec 3 ans d’expérience en conception de modèles prédictifs et services FastAPI performants.',
                'extracted_text' => 'Ines Bouaziz - Data & AI Engineer avec 3 ans d’expérience. Compétences : Python, FastAPI, Machine Learning, PostgreSQL, Docker, Pandas, Scikit-learn, Git. Esprit analytique, capacité de synthèse.',
            ],
            [
                'full_name' => 'Karim Gharbi',
                'email' => 'karim.gharbi@example.com',
                'phone' => '+21655778899',
                'status' => 'en_revue',
                'summary' => 'Développeur Frontend React & JavaScript avec 2 ans d’expérience. Passionné par les interfaces modernes, Tailwind CSS et l’expérience utilisateur.',
                'extracted_text' => 'Karim Gharbi - Développeur Frontend Junior avec 2 ans d’expérience. Compétences : React, JavaScript, TypeScript, Tailwind CSS, HTML5, CSS3, Git. Sens du détail, adaptabilité.',
            ],
            [
                'full_name' => 'Nour El Houda Chaabane',
                'email' => 'nour.chaabane@example.com',
                'phone' => '+21692334411',
                'status' => 'nouveau',
                'summary' => 'Développeuse Full Stack Junior avec 1 an d’expérience sur React et Laravel. Forte motivation pour monter en compétences sur le cloud et TypeScript.',
                'extracted_text' => 'Nour El Houda Chaabane - Développeuse Junior avec 1 an d’expérience. Compétences : React, Laravel, PHP, JavaScript, MySQL, Git. Rigueur, enthousiasme, apprentissage rapide.',
            ],
            [
                'full_name' => 'Firas Zaier',
                'email' => 'firas.zaier@example.com',
                'phone' => '+21652667788',
                'status' => 'nouveau',
                'summary' => 'Développeur Backend Python & Django avec 3 ans d’expérience. En transition vers l’architecture asynchrone FastAPI et les environnements conteneurisés.',
                'extracted_text' => 'Firas Zaier - Backend Developer avec 3 ans d’expérience. Compétences : Python, Django, REST API, PostgreSQL, Docker, Git. Polyvalence, pragmatisme.',
            ],
            [
                'full_name' => 'Hiba Mansour',
                'email' => 'hiba.mansour@example.com',
                'phone' => '+21629881122',
                'status' => 'entretien',
                'summary' => 'Ingénieure Cloud & Systèmes Linux avec 5 ans d’expérience. Maîtrise avancée des clusters Kubernetes, de Docker et de l’intégration continue.',
                'extracted_text' => 'Hiba Mansour - Cloud Systems Engineer avec 5 ans d’expérience. Compétences : Linux, Docker, Kubernetes, CI/CD, AWS, Bash, Git. Gestion du stress, réactivité en astreinte.',
            ],
            [
                'full_name' => 'Bilel Dridi',
                'email' => 'bilel.dridi@example.com',
                'phone' => '+21654123987',
                'status' => 'en_revue',
                'summary' => 'Développeur Full Stack React & Node.js avec 3 ans d’expérience. Compétences complémentaires en TypeScript, GraphQL et conteneurisation Docker.',
                'extracted_text' => 'Bilel Dridi - Full Stack Developer avec 3 ans d’expérience. Compétences : React, Node.js, TypeScript, REST API, Docker, MongoDB, Git. Esprit d’équipe, communication.',
            ],
            [
                'full_name' => 'Rania Jaziri',
                'email' => 'rania.jaziri@example.com',
                'phone' => '+21696554433',
                'status' => 'rejete',
                'summary' => 'Développeuse Mobile Flutter & Android avec 2 ans d’expérience. Profil orienté applications mobiles natives et multiplateformes.',
                'extracted_text' => 'Rania Jaziri - Mobile App Developer avec 2 ans d’expérience. Compétences : Flutter, Dart, Android, Java, SQLite, Git. Autonomie, sens de l’ergonomie mobile.',
            ],
            [
                'full_name' => 'Tarek Ben Salem',
                'email' => 'tarek.bensalem@example.com',
                'phone' => '+21626332211',
                'status' => 'nouveau',
                'summary' => 'Architecte Logiciel Senior avec 8 ans d’expérience sur les écosystèmes PHP/Laravel, Python et infrastructures conteneurisées.',
                'extracted_text' => 'Tarek Ben Salem - Software Architect avec 8 ans d’expérience. Compétences : Laravel, Python, React, TypeScript, Docker, Kubernetes, AWS, PostgreSQL, CI/CD. Vision stratégique, mentorat.',
            ],
        ];

        foreach ($candidates as $candData) {
            Candidate::create($candData);
        }
    }
}
