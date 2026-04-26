<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UnitSettingsController extends Controller
{
    public function index()
    {
        try {
            // Return default or saved unit settings
            $settings = DB::table('unit_settings')->first();
            
            if (!$settings) {
                // Return default settings if none exist
                return response()->json([
                    'totalFloors' => 5,
                    'floors' => [
                        [
                            'floorNumber' => 1,
                            'unitsPerFloor' => 8,
                            'unitNamingConvention' => 'A-{floor}-{unit}',
                            'positionLabels' => ['Front-Left', 'Front-Right', 'Back-Left', 'Back-Right', 'Center-Left', 'Center-Right', 'Side-Left', 'Side-Right'],
                            'unitPrefix' => 'A',
                            'basePrice' => 50000,
                            'priceIncrement' => 1000,
                            'baseArea' => 100
                        ],
                        [
                            'floorNumber' => 2,
                            'unitsPerFloor' => 8,
                            'unitNamingConvention' => 'B-{floor}-{unit}',
                            'positionLabels' => ['Front-Left', 'Front-Right', 'Back-Left', 'Back-Right', 'Center-Left', 'Center-Right', 'Side-Left', 'Side-Right'],
                            'unitPrefix' => 'B',
                            'basePrice' => 55000,
                            'priceIncrement' => 1200,
                            'baseArea' => 110
                        ],
                        [
                            'floorNumber' => 3,
                            'unitsPerFloor' => 6,
                            'unitNamingConvention' => 'C-{floor}-{unit}',
                            'positionLabels' => ['Front-Left', 'Front-Right', 'Back-Left', 'Back-Right', 'Center-Left', 'Center-Right'],
                            'unitPrefix' => 'C',
                            'basePrice' => 60000,
                            'priceIncrement' => 1500,
                            'baseArea' => 120
                        ],
                        [
                            'floorNumber' => 4,
                            'unitsPerFloor' => 6,
                            'unitNamingConvention' => 'D-{floor}-{unit}',
                            'positionLabels' => ['Front-Left', 'Front-Right', 'Back-Left', 'Back-Right', 'Center-Left', 'Center-Right'],
                            'unitPrefix' => 'D',
                            'basePrice' => 65000,
                            'priceIncrement' => 1800,
                            'baseArea' => 130
                        ],
                        [
                            'floorNumber' => 5,
                            'unitsPerFloor' => 4,
                            'unitNamingConvention' => 'E-{floor}-{unit}',
                            'positionLabels' => ['Front-Left', 'Front-Right', 'Back-Left', 'Back-Right'],
                            'unitPrefix' => 'E',
                            'basePrice' => 70000,
                            'priceIncrement' => 2000,
                            'baseArea' => 140
                        ]
                    ]
                ]);
            }

            return response()->json(json_decode($settings->settings, true));
        } catch (\Exception $e) {
            // If table doesn't exist or other error, return default settings
            return response()->json([
                'totalFloors' => 5,
                'floors' => [
                    [
                        'floorNumber' => 1,
                        'unitsPerFloor' => 8,
                        'unitNamingConvention' => 'A-{floor}-{unit}',
                        'positionLabels' => ['Front-Left', 'Front-Right', 'Back-Left', 'Back-Right', 'Center-Left', 'Center-Right', 'Side-Left', 'Side-Right'],
                        'unitPrefix' => 'A',
                        'basePrice' => 50000,
                        'priceIncrement' => 1000,
                        'baseArea' => 100
                    ],
                    [
                        'floorNumber' => 2,
                        'unitsPerFloor' => 8,
                        'unitNamingConvention' => 'B-{floor}-{unit}',
                        'positionLabels' => ['Front-Left', 'Front-Right', 'Back-Left', 'Back-Right', 'Center-Left', 'Center-Right', 'Side-Left', 'Side-Right'],
                        'unitPrefix' => 'B',
                        'basePrice' => 55000,
                        'priceIncrement' => 1200,
                        'baseArea' => 110
                    ],
                    [
                        'floorNumber' => 3,
                        'unitsPerFloor' => 6,
                        'unitNamingConvention' => 'C-{floor}-{unit}',
                        'positionLabels' => ['Front-Left', 'Front-Right', 'Back-Left', 'Back-Right', 'Center-Left', 'Center-Right'],
                        'unitPrefix' => 'C',
                        'basePrice' => 60000,
                        'priceIncrement' => 1500,
                        'baseArea' => 120
                    ],
                    [
                        'floorNumber' => 4,
                        'unitsPerFloor' => 6,
                        'unitNamingConvention' => 'D-{floor}-{unit}',
                        'positionLabels' => ['Front-Left', 'Front-Right', 'Back-Left', 'Back-Right', 'Center-Left', 'Center-Right'],
                        'unitPrefix' => 'D',
                        'basePrice' => 65000,
                        'priceIncrement' => 1800,
                        'baseArea' => 130
                    ],
                    [
                        'floorNumber' => 5,
                        'unitsPerFloor' => 4,
                        'unitNamingConvention' => 'E-{floor}-{unit}',
                        'positionLabels' => ['Front-Left', 'Front-Right', 'Back-Left', 'Back-Right'],
                        'unitPrefix' => 'E',
                        'basePrice' => 70000,
                        'priceIncrement' => 2000,
                        'baseArea' => 140
                    ]
                ]
            ]);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'totalFloors' => 'required|integer|min:1|max:50',
                'floors' => 'required|array',
                'floors.*.floorNumber' => 'required|integer|min:1',
                'floors.*.unitsPerFloor' => 'required|integer|min:1|max:20',
                'floors.*.unitNamingConvention' => 'required|string|max:50',
                'floors.*.positionLabels' => 'required|array',
                'floors.*.positionLabels.*' => 'required|string|max:50'
            ]);

            $settings = [
                'settings' => json_encode($request->all())
            ];

            // Save or update settings
            DB::table('unit_settings')->updateOrInsert(
                ['id' => 1],
                $settings,
                ['settings']
            );

            return response()->json([
                'message' => 'Unit settings saved successfully',
                'settings' => $request->all()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error saving unit settings: ' . $e->getMessage()
            ], 500);
        }
    }

    public function generateUnits(Request $request)
    {
        try {
            $request->validate([
                'project_id' => 'required|exists:projects,id',
                'units' => 'required|array',
                'units.*.unit_number' => 'required|string|max:50',
                'units.*.floor' => 'required|integer|min:1',
                'units.*.area' => 'nullable|numeric|min:0',
                'units.*.price' => 'nullable|numeric|min:0',
                'units.*.position' => 'nullable|string|max:50'
            ]);

            $units = $request->units;
            $projectId = $request->project_id;

            foreach ($units as &$unit) {
                $unit['project_id'] = $projectId;
                $unit['status'] = 'available';
                $unit['created_at'] = now();
                $unit['updated_at'] = now();
            }

            // Insert generated units
            DB::table('units')->insert($units);

            return response()->json([
                'message' => 'Units generated successfully',
                'units_count' => count($units),
                'project_id' => $projectId
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error generating units: ' . $e->getMessage()
            ], 500);
        }
    }
}
