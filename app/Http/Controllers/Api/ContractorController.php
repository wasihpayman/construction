<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contractor;
use Illuminate\Http\Request;

class ContractorController extends Controller
{
    public function index()
    {
        return Contractor::with('workers')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'company_name' => 'nullable',
            'phone_number' => 'nullable',
            'email' => 'nullable',
        ]);

        return Contractor::create($request->all());
    }

    public function show($id)
    {
        return Contractor::with('workers')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $contractor = Contractor::findOrFail($id);
        $contractor->update($request->all());

        return $contractor;
    }

    public function destroy($id)
    {
        return Contractor::destroy($id);
    }
}