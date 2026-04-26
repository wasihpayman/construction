<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProjectModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProjectModelController extends Controller
{
    public function index(Request $request)
    {
        $query = ProjectModel::with('project', 'uploader');
        
        // Filter by project_id if provided
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        
        $models = $query->get();
        return response()->json($models);
    }

    public function store(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'file' => 'required|file|mimes:glb,gltf,obj,fbx|max:50000', // 50MB max
        ]);

        try {
            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();
            $fileExtension = $file->getClientOriginalExtension();
            $fileSize = $file->getSize();
            
            // Generate unique filename
            $fileName = Str::uuid() . '.' . $fileExtension;
            
            // Store file in project_models directory
            $filePath = $file->storeAs('project_models', $fileName, 'public');
            
            $model = ProjectModel::create([
                'project_id' => $request->project_id,
                'file_path' => $filePath,
                'original_name' => $originalName,
                'file_type' => $fileExtension,
                'file_size' => $fileSize,
                'uploaded_by' => auth()->id(),
            ]);

            return response()->json($model, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to upload model: ' . $e->getMessage()], 500);
        }
    }

    public function show(ProjectModel $projectModel)
    {
        $projectModel->load('project', 'uploader');
        return response()->json($projectModel);
    }

    public function destroy(ProjectModel $projectModel)
    {
        try {
            // Delete file from storage
            if ($projectModel->file_path) {
                Storage::disk('public')->delete($projectModel->file_path);
            }
            
            // Delete database record
            $projectModel->delete();
            
            return response()->json(['message' => 'Model deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete model: ' . $e->getMessage()], 500);
        }
    }

    public function download(ProjectModel $projectModel)
    {
        try {
            $filePath = storage_path('app/public/' . $projectModel->file_path);
            
            if (!file_exists($filePath)) {
                return response()->json(['error' => 'File not found'], 404);
            }

            return response()->download($filePath, $projectModel->original_name);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to download model: ' . $e->getMessage()], 500);
        }
    }
}
