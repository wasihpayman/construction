<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectManagementController extends Controller
{
    public function index()
    {
        try {
            \Log::info('ProjectManagement@index called');
            
            if (!Auth::check()) {
                \Log::error('User not authenticated in ProjectManagement@index');
                return response()->json(['error' => 'User not authenticated'], 401);
            }
            
            $projects = Project::with('creator')
                ->where('created_by', Auth::user()->id)
                ->orderBy('created_at', 'desc')
                ->get();
            
            \Log::info('Found ' . $projects->count() . ' projects for user ' . Auth::user()->id);
        
            return response()->json($projects);
            
        } catch (\Exception $e) {
            \Log::error('Error in ProjectManagement@index: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'error' => 'Failed to fetch projects: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            \Log::info('ProjectManagement@store called');
            \Log::info('Request data: ' . json_encode($request->all()));
            
            // Check if user is authenticated
            if (!Auth::check()) {
                \Log::error('User not authenticated in ProjectManagement@store');
                return response()->json(['error' => 'User not authenticated'], 401);
            }
            
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'location' => 'required|string|max:255',
                'start_date' => 'required|date',
                'finish_at' => 'nullable|date|after_or_equal:start_date',
                'description' => 'nullable|string',
            ]);

            $validated['created_by'] = Auth::user()->id;

            \Log::info('Creating project with data: ' . json_encode($validated));

            $project = Project::create($validated);

            \Log::info('Project created successfully with ID: ' . $project->id);

            return response()->json($project, 201);
            
        } catch (\Exception $e) {
            \Log::error('Error in ProjectManagement@store: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'error' => 'Failed to create project: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $project = Project::where('created_by', Auth::user()->id)->with('creator')->findOrFail($id);
        return response()->json($project);
    }

    public function update(Request $request, $id)
    {
        $project = Project::where('created_by', Auth::user()->id)->findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'start_date' => 'required|date',
            'finish_at' => 'nullable|date|after_or_equal:start_date',
            'description' => 'nullable|string',
        ]);

        $project->update($validated);

        return response()->json($project);
    }

    public function destroy($id)
    {
        $project = Project::where('created_by', Auth::user()->id)->findOrFail($id);
        $project->delete();
        return response()->json(['message' => 'Project deleted successfully']);
    }

    public function getActiveProjects()
    {
        try {
            \Log::info('getActiveProjects called');
            
            if (!Auth::check()) {
                \Log::error('User not authenticated in getActiveProjects');
                return response()->json(['error' => 'User not authenticated'], 401);
            }
            
            $projects = Project::where('created_by', Auth::user()->id)
                ->orderBy('name')
                ->select('id', 'name', 'location')
                ->get();
            
            \Log::info('Found ' . $projects->count() . ' active projects for user ' . Auth::user()->id);
            
            return response()->json($projects);
            
        } catch (\Exception $e) {
            \Log::error('Error in getActiveProjects: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'error' => 'Failed to fetch active projects: ' . $e->getMessage()
            ], 500);
        }
    }
}
