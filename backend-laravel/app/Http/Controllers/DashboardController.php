<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\Job;
use App\Models\MatchScore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $totalCandidates = Candidate::count();
        $totalJobs = Job::count();
        $openJobs = Job::where('status', 'open')->count();

        $candidatesByStatus = [
            'nouveau' => Candidate::where('status', 'nouveau')->count(),
            'en_revue' => Candidate::where('status', 'en_revue')->count(),
            'entretien' => Candidate::where('status', 'entretien')->count(),
            'retenu' => Candidate::where('status', 'retenu')->count(),
            'rejete' => Candidate::where('status', 'rejete')->count(),
        ];

        $avgScore = round((float) MatchScore::avg('score'), 1);
        $topScore = round((float) MatchScore::max('score'), 1);
        $totalEvaluations = MatchScore::count();

        $recentCandidates = Candidate::latest()->take(5)->get(['id', 'full_name', 'email', 'status', 'created_at']);
        $recentJobs = Job::latest()->take(5)->get(['id', 'title', 'status', 'created_at']);

        $isAnonymous = $request->boolean('anonymous') || $request->header('X-Anonymous-Mode') === '1';

        if ($isAnonymous) {
            $recentCandidates->transform(function ($c) {
                $c->full_name = "Candidat #C{$c->id}";
                $c->email = "candidat.{$c->id}@anonyme.fr";
                return $c;
            });
        }

        return response()->json([
            'total_candidates' => $totalCandidates,
            'total_jobs' => $totalJobs,
            'open_jobs' => $openJobs,
            'candidates_by_status' => $candidatesByStatus,
            'avg_score' => $avgScore,
            'top_score' => $topScore,
            'total_evaluations' => $totalEvaluations,
            'recent_candidates' => $recentCandidates,
            'recent_jobs' => $recentJobs,
        ]);
    }
}
