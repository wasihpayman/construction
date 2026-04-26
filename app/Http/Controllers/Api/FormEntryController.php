<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormEntry;
use Illuminate\Http\Request;

class FormEntryController extends Controller
{
    public function storeEntry(Request $request, $categoryId)
    {
        try {
            $validated = $request->validate([
                'data' => 'required|array',
            ]);

            $entry = FormEntry::create([
                'category_id' => $categoryId,
                'data' => $validated['data'],
                'created_by' => auth()->id(),
            ]);

            return response()->json([
                'message' => 'Saved successfully',
                'entry' => $entry
            ]);
        } catch (\Exception $e) {
            \Log::error('Error storing form entry: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to save entry'
            ], 500);
        }
    }

    public function history($categoryId)
    {
        try {
            $entries = FormEntry::where('category_id', $categoryId)
                ->with(['creator'])
                ->latest()
                ->get();

            return response()->json($entries);
        } catch (\Exception $e) {
            \Log::error('Error getting form history: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to get history'
            ], 500);
        }
    }

    public function updateEntry(Request $request, $entryId)
    {
        try {
            $validated = $request->validate([
                'data' => 'required|array',
            ]);

            $entry = FormEntry::findOrFail($entryId);
            $entry->data = $validated['data'];
            $entry->save();

            return response()->json([
                'message' => 'Entry updated successfully',
                'entry' => $entry
            ]);
        } catch (\Exception $e) {
            \Log::error('Error updating form entry: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to update entry'
            ], 500);
        }
    }
}
