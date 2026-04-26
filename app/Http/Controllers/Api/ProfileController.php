<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show()
    {
        try {
            $user = Auth::user();
            
            if ($user->profile_photo) {
                $user->profile_photo_url = asset('storage/' . $user->profile_photo);
            }
            
            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to load profile'], 500);
        }
    }

    public function update(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }

            // Validation for FormData requests
            try {
                $validated = $request->validate([
                    'name' => 'required|string|max:255',
                    'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
                    'phone' => 'nullable|string|max:20',
                    'address' => 'nullable|string|max:500',
                    'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
                ]);
            } catch (\Illuminate\Validation\ValidationException $e) {
                return response()->json(['error' => 'Validation failed', 'errors' => $e->errors()], 422);
            }

            // Handle profile photo upload
            if ($request->hasFile('profile_photo')) {
                try {
                    // Delete old photo if exists
                    if ($user->profile_photo) {
                        Storage::disk('public')->delete($user->profile_photo);
                    }

                    $photo = $request->file('profile_photo');
                    $photoPath = $photo->store('profile', 'public');
                    $validated['profile_photo'] = $photoPath;
                } catch (\Exception $e) {
                    // If photo upload fails, continue without it
                }
            }

            $user->update($validated);

            return response()->json([
                'user' => $user->fresh(),
                'message' => 'Profile updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update profile: ' . $e->getMessage()], 500);
        }
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = Auth::user();

        // Check current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['error' => 'Current password is incorrect'], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($validated['password'])
        ]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function deleteProfilePhoto()
    {
        $user = Auth::user();

        if ($user->profile_photo) {
            Storage::disk('public')->delete($user->profile_photo);
            $user->update(['profile_photo' => null]);
        }

        return response()->json(['message' => 'Profile photo deleted successfully']);
    }
}
